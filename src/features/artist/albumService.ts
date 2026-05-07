import { supabase } from "@/lib/supabase";

export async function getArtistAlbums(artistId: string) {
  const { data, error } = await supabase
    .from("albums")
    .select("id,title,cover_path,release_date,created_at")
    .eq("artist_id", artistId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function deleteAlbum(albumId: string) {
  const { error } = await supabase.from("albums").delete().eq("id", albumId);
  if (error) throw error;
}

export async function assignSongToAlbum(songId: string, albumId: string | null) {
  const { error } = await supabase.from("songs").update({ album_id: albumId }).eq("id", songId);
  if (error) throw error;
}

export async function assignSongsToAlbum(songIds: string[], albumId: string) {
  if (songIds.length === 0) return;
  const { error } = await supabase.from("songs").update({ album_id: albumId }).in("id", songIds);
  if (error) throw error;
}

export async function getAlbumSongs(albumId: string) {
  const { data, error } = await supabase
    .from("songs")
    .select("id,title,status,album_track_number,created_at")
    .eq("album_id", albumId)
    .order("album_track_number", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function setAlbumTrackNumber(songId: string, trackNumber: number) {
  const { error } = await supabase.from("songs").update({ album_track_number: trackNumber }).eq("id", songId);
  if (error) throw error;
}

export async function getAlbumById(albumId: string) {
  const { data, error } = await supabase.from("albums").select("id,title,cover_path,release_date").eq("id", albumId).single();
  if (error) throw error;
  return data;
}
