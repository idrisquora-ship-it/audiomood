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
    const { song_id } = await req.json();
    if (!song_id) throw new Error("song_id is required");

    await supabase.from("lyrics_jobs").update({ status: "processing" }).eq("song_id", song_id);
    await supabase.from("lyrics").upsert({ song_id, status: "processing" }, { onConflict: "song_id" });

    const { data: song } = await supabase.from("songs").select("audio_path").eq("id", song_id).single();
    if (!song?.audio_path) throw new Error("Song audio_path not found");

    const signed = await supabase.storage.from("song-audio").createSignedUrl(song.audio_path, 60 * 5);
    if (!signed.data?.signedUrl) throw new Error("Failed to create signed URL");

    const sttRes = await fetch(Deno.env.get("ELEVENLABS_STT_URL")!, {
      method: "POST",
      headers: { "xi-api-key": Deno.env.get("ELEVENLABS_API_KEY")! },
      body: JSON.stringify({ audio_url: signed.data.signedUrl })
    });
    if (!sttRes.ok) throw new Error(`ElevenLabs STT error: ${sttRes.status}`);

    const sttData = await sttRes.json();
    const transcript = sttData.text ?? "";

    await supabase
      .from("lyrics")
      .upsert({ song_id, lyrics_text: transcript, source: "elevenlabs", status: "generated" }, { onConflict: "song_id" });
    await supabase
      .from("lyrics_jobs")
      .update({ status: "generated", completed_at: new Date().toISOString(), error_message: null })
      .eq("song_id", song_id);

    return new Response(JSON.stringify({ ok: true }), {
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
