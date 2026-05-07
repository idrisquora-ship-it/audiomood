import { supabase } from "@/lib/supabase";

export async function getMyPlaylists(profileId: string) {
  const { data, error } = await supabase
    .from("playlists")
    .select("id,title,visibility,is_liked_songs,created_at")
    .eq("owner_id", profileId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function createPlaylist(profileId: string, title: string, visibility: "public" | "private" = "private") {
  const { data, error } = await supabase
    .from("playlists")
    .insert({ owner_id: profileId, title, visibility, is_liked_songs: false })
    .select("id,title,visibility")
    .single();
  if (error) throw error;
  return data;
}

export async function renamePlaylist(playlistId: string, title: string) {
  const { error } = await supabase.from("playlists").update({ title }).eq("id", playlistId);
  if (error) throw error;
}

export async function deletePlaylist(playlistId: string) {
  const { error } = await supabase.from("playlists").delete().eq("id", playlistId).eq("is_liked_songs", false);
  if (error) throw error;
}

export async function addSongToPlaylist(playlistId: string, songId: string, position: number) {
  const { error } = await supabase
    .from("playlist_songs")
    .upsert({ playlist_id: playlistId, song_id: songId, position }, { onConflict: "playlist_id,song_id" });
  if (error) throw error;
}

export async function likePublicPlaylist(playlistId: string, profileId: string) {
  const { error } = await supabase
    .from("playlist_likes")
    .upsert({ playlist_id: playlistId, user_id: profileId }, { onConflict: "playlist_id,user_id" });
  if (error) throw error;
}

export async function unlikePublicPlaylist(playlistId: string, profileId: string) {
  const { error } = await supabase
    .from("playlist_likes")
    .delete()
    .eq("playlist_id", playlistId)
    .eq("user_id", profileId);
  if (error) throw error;
}

export async function reorderPlaylistSong(playlistSongId: string, position: number) {
  const { error } = await supabase.from("playlist_songs").update({ position }).eq("id", playlistSongId);
  if (error) throw error;
}

export async function getPlaylistSongs(playlistId: string) {
  const { data, error } = await supabase
    .from("playlist_songs")
    .select("id,position,song_id,songs(id,title,artist_id,status)")
    .eq("playlist_id", playlistId)
    .order("position", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function removeSongFromPlaylist(playlistId: string, songId: string) {
  const { error } = await supabase.from("playlist_songs").delete().eq("playlist_id", playlistId).eq("song_id", songId);
  if (error) throw error;
}
