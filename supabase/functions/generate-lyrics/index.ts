import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const ELEVENLABS_API_KEY = Deno.env.get("ELEVENLABS_API_KEY");
    if (!ELEVENLABS_API_KEY) {
      throw new Error("ELEVENLABS_API_KEY is not configured");
    }

    const { songId, audioUrl, title } = await req.json();

    if (!songId || !audioUrl) {
      throw new Error("songId and audioUrl are required");
    }

    // Use ElevenLabs Speech-to-Text to transcribe the audio
    const audioResponse = await fetch(audioUrl);
    if (!audioResponse.ok) {
      throw new Error(`Failed to fetch audio: ${audioResponse.status}`);
    }
    
    const audioBlob = await audioResponse.blob();
    const formData = new FormData();
    formData.append("file", audioBlob, "audio.mp3");
    formData.append("model_id", "scribe_v2");
    formData.append("language_code", "eng");

    const transcriptionResponse = await fetch(
      "https://api.elevenlabs.io/v1/speech-to-text",
      {
        method: "POST",
        headers: {
          "xi-api-key": ELEVENLABS_API_KEY,
        },
        body: formData,
      }
    );

    if (!transcriptionResponse.ok) {
      const errorText = await transcriptionResponse.text();
      console.error("ElevenLabs transcription error:", errorText);
      throw new Error(`Transcription failed: ${transcriptionResponse.status}`);
    }

    const transcription = await transcriptionResponse.json();
    
    // Convert transcription to lyrics format with timestamps
    const lyricsLines: { time: number; text: string }[] = [];
    
    if (transcription.words && transcription.words.length > 0) {
      // Group words into lines (roughly 5-10 words per line or by natural pauses)
      let currentLine: { time: number; text: string } | null = null;
      let wordCount = 0;
      
      for (const word of transcription.words) {
        if (!currentLine) {
          currentLine = { time: word.start, text: word.text };
          wordCount = 1;
        } else {
          // Check for natural break (pause > 1 second or 8+ words)
          const pause = word.start - (transcription.words[transcription.words.indexOf(word) - 1]?.end || 0);
          if (pause > 1 || wordCount >= 8 || word.text.includes('.') || word.text.includes('?') || word.text.includes('!')) {
            lyricsLines.push(currentLine);
            currentLine = { time: word.start, text: word.text };
            wordCount = 1;
          } else {
            currentLine.text += " " + word.text;
            wordCount++;
          }
        }
      }
      
      if (currentLine) {
        lyricsLines.push(currentLine);
      }
    } else if (transcription.text) {
      // Fallback: split by sentences if no word timestamps
      const sentences = transcription.text.split(/[.!?]+/).filter((s: string) => s.trim());
      const avgDuration = 180 / sentences.length; // Assume 3 min song
      sentences.forEach((sentence: string, index: number) => {
        lyricsLines.push({
          time: index * avgDuration,
          text: sentence.trim(),
        });
      });
    }

    // Update the lyrics in Supabase
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { error: updateError } = await supabase
      .from("lyrics")
      .update({ lyrics_json: { lines: lyricsLines } })
      .eq("song_id", songId);

    if (updateError) {
      console.error("Failed to update lyrics:", updateError);
      throw new Error(`Failed to save lyrics: ${updateError.message}`);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        linesCount: lyricsLines.length,
        lyrics: { lines: lyricsLines }
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error generating lyrics:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : "Unknown error" 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
