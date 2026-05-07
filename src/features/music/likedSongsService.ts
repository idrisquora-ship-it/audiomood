import { supabase } from "@/lib/supabase";

export function getNextLikedState(current: Record<string, boolean>, songId: string) {
  return { ...current, [songId]: !current[songId] };
}

export async function likeSong(profileId: string, songId: string) {
  await supabase.from("liked_songs").upsert({ user_id: profileId, song_id: songId }, { onConflict: "user_id,song_id" });
}

export async function unlikeSong(profileId: string, songId: string) {
  await supabase.from("liked_songs").delete().eq("user_id", profileId).eq("song_id", songId);
}
