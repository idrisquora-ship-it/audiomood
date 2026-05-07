import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  try {
    const logsRes = await supabase
      .from("push_delivery_logs")
      .select("ticket_id,expo_push_token,user_id")
      .not("ticket_id", "is", null)
      .order("created_at", { ascending: false })
      .limit(100);

    const ticketIds = Array.from(new Set((logsRes.data ?? []).map((r) => r.ticket_id).filter(Boolean)));
    if (ticketIds.length === 0) {
      return new Response(JSON.stringify({ ok: true, checked: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200
      });
    }

    const expoRes = await fetch("https://exp.host/--/api/v2/push/getReceipts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      body: JSON.stringify({ ids: ticketIds })
    });
    const expoJson = await expoRes.json();
    if (!expoRes.ok) {
      throw new Error(`Expo receipt API error: ${JSON.stringify(expoJson)}`);
    }

    const receipts = expoJson?.data ?? {};
    const rows = ticketIds.map((ticketId: string) => {
      const r = receipts[ticketId] ?? {};
      return {
        ticket_id: ticketId,
        receipt_status: r.status ?? "unknown",
        receipt_message: r.message ?? null,
        receipt_details: r.details ?? null
      };
    });
    if (rows.length > 0) {
      await supabase.from("push_receipts").upsert(rows, { onConflict: "ticket_id" });
    }

    const deviceNotRegisteredTickets = rows
      .filter((r) => (r.receipt_details as { error?: string } | null)?.error === "DeviceNotRegistered")
      .map((r) => r.ticket_id);

    if (deviceNotRegisteredTickets.length > 0) {
      const badTokens = (logsRes.data ?? [])
        .filter((log) => deviceNotRegisteredTickets.includes(log.ticket_id))
        .map((log) => log.expo_push_token);
      if (badTokens.length > 0) {
        await supabase
          .from("push_tokens")
          .update({ is_active: false })
          .in("expo_push_token", badTokens);
      }
    }

    return new Response(JSON.stringify({ ok: true, checked: rows.length }), {
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
