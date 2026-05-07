import { supabase } from "@/lib/supabase";
import { getSettings } from "@/features/settings/settingsService";
import { resolvePlayableSongUri } from "@/features/music/downloadService";
import { playFromPlaylist, playSingleAndAutofill } from "@/features/music/queueService";
import { usePlayerStore } from "@/store/playerStore";

export async function getApprovedSongs(limit = 30) {
  const { data, error } = await supabase
    .from("songs")
    .select("id,title,artist_id,audio_path,cover_path,genre_id,mood_id,play_count,like_count")
    .eq("status", "approved")
    .order("play_count", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}

export async function playSongFromHome(profileId: string, songId: string) {
  const recommendations = await supabase
    .from("recommendation_scores")
    .select("song_id")
    .order("score", { ascending: false })
    .limit(20);
  const recommendedSongIds = (recommendations.data ?? []).map((row) => row.song_id).filter((id) => id !== songId);
  playSingleAndAutofill(songId, recommendedSongIds);
  const [songRes, settings] = await Promise.all([
    supabase.from("songs").select("title,artist_id,audio_path").eq("id", songId).single(),
    getSettings(profileId)
  ]);
  let artistName = "Unknown Artist";
  if (songRes.data?.artist_id) {
    const artistRes = await supabase
      .from("artist_profiles")
      .select("artist_name")
      .eq("id", songRes.data.artist_id)
      .single();
    artistName = artistRes.data?.artist_name ?? "Unknown Artist";
  }
  const sourceUri = songRes.data?.audio_path
    ? await resolvePlayableSongUri(profileId, songId, songRes.data.audio_path, settings.offline_mode_enabled)
    : null;

  if (!sourceUri) {
    return { ok: false, reason: "offline_not_downloaded" as const };
  }

  usePlayerStore
    .getState()
    .setNowPlaying(songId, songRes.data?.title ?? "Selected Song", artistName, sourceUri);
  usePlayerStore.getState().setIsPlaying(true);
  return { ok: true as const };
}

export function playPlaylistFromSong(playlistSongIds: string[], selectedSongId: string) {
  playFromPlaylist(playlistSongIds, selectedSongId);
  usePlayerStore.getState().setNowPlaying(selectedSongId, "Playlist Song", "Unknown Artist", "");
  usePlayerStore.getState().setIsPlaying(true);
}
