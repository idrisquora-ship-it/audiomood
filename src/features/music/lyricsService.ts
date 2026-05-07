import { supabase } from "@/lib/supabase";

export type SyncedLyricLine = {
  text: string;
  start: number;
  end: number;
};

export async function getSongLyrics(songId: string) {
  const { data, error } = await supabase
    .from("lyrics")
    .select("lyrics_text,lyrics_json,status")
    .eq("song_id", songId)
    .single();
  if (error || !data) return { status: "pending", lines: [] as SyncedLyricLine[], rawText: "" };

  const jsonLines = Array.isArray((data.lyrics_json as { lines?: unknown } | null)?.lines)
    ? ((data.lyrics_json as { lines: SyncedLyricLine[] }).lines ?? [])
    : [];

  if (jsonLines.length > 0) {
    return {
      status: data.status as string,
      lines: jsonLines,
      rawText: data.lyrics_text ?? ""
    };
  }

  const fallbackLines = (data.lyrics_text ?? "")
    .split("\n")
    .map((line: string) => line.trim())
    .filter(Boolean)
    .map((text: string, index: number, arr: string[]) => ({
      text,
      start: index * 4,
      end: index === arr.length - 1 ? (index + 1) * 4 + 2 : (index + 1) * 4
    }));

  return {
    status: data.status as string,
    lines: fallbackLines,
    rawText: data.lyrics_text ?? ""
  };
}
