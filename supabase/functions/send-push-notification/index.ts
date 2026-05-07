import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
};

type PushBody = {
  user_profile_id: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  try {
    const payload = (await req.json()) as PushBody;
    if (!payload.user_profile_id || !payload.title || !payload.body) {
      throw new Error("user_profile_id, title and body are required");
    }

    const tokenRes = await supabase
      .from("push_tokens")
      .select("expo_push_token")
      .eq("user_id", payload.user_profile_id)
      .eq("is_active", true);

    const tokens = (tokenRes.data ?? []).map((row) => row.expo_push_token).filter(Boolean);
    if (tokens.length === 0) {
      return new Response(JSON.stringify({ ok: true, sent: 0, reason: "no_active_tokens" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200
      });
    }

    const messages = tokens.map((token) => ({
      to: token,
      sound: "default",
      title: payload.title,
      body: payload.body,
      data: payload.data ?? {}
    }));

    const expoRes = await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      body: JSON.stringify(messages)
    });

    const expoJson = await expoRes.json();
    if (!expoRes.ok) {
      throw new Error(`Expo push error: ${JSON.stringify(expoJson)}`);
    }

    const ticketRows = (expoJson?.data ?? []).map((ticket: { id?: string; status?: string; message?: string }, index: number) => ({
      user_id: payload.user_profile_id,
      expo_push_token: tokens[index] ?? null,
      title: payload.title,
      body: payload.body,
      ticket_id: ticket.id ?? null,
      ticket_status: ticket.status ?? "unknown",
      ticket_message: ticket.message ?? null,
      payload: payload.data ?? {}
    }));
    if (ticketRows.length > 0) {
      await supabase.from("push_delivery_logs").insert(ticketRows);
    }

    return new Response(JSON.stringify({ ok: true, sent: messages.length, response: expoJson }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ ok: false, error: message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500
    });
  }
});
