import { supabase } from "@/lib/supabase";
import { getSettings } from "@/features/settings/settingsService";
import { resolvePlayableSongUri } from "@/features/music/downloadService";
import { PLAYABLE_SONG_STATUSES } from "@/features/music/playableSongs";
import { playFromPlaylist, playSingleAndAutofill } from "@/features/music/queueService";
import { usePlayerStore } from "@/store/playerStore";

const CARD_GRADIENTS: [string, string][] = [
  ["#FF6A00", "#5C1A7A"],
  ["#FF8A1C", "#2A1A5C"],
  ["#3D2B6B", "#FF6A00"],
  ["#1E3A5F", "#FF6A00"],
  ["#4A1824", "#FF8A1C"],
  ["#0D3D2E", "#FF8A1C"],
  ["#1A1035", "#FF6A00"]
];

export function gradientForSongId(id: string): [string, string] {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return CARD_GRADIENTS[h % CARD_GRADIENTS.length];
}

export type SongCardRow = {
  id: string;
  title: string;
  artist: string;
  gradient: [string, string];
  audio_path?: string | null;
};

export async function getArtistNameMap(artistIds: string[]): Promise<Record<string, string>> {
  const uniq = [...new Set(artistIds.filter(Boolean))];
  if (uniq.length === 0) return {};
  const { data } = await supabase.from("artist_profiles").select("id,artist_name").in("id", uniq);
  return Object.fromEntries((data ?? []).map((a) => [a.id, a.artist_name])) as Record<string, string>;
}

async function artistNameMap(artistIds: string[]) {
  const o = await getArtistNameMap(artistIds);
  return new Map(Object.entries(o));
}

export async function getApprovedSongsWithArtists(limit = 30, moodId?: string | null): Promise<SongCardRow[]> {
  const rows = await getApprovedSongs(limit, moodId);
  const map = await artistNameMap(rows.map((r) => r.artist_id));
  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    artist: map.get(r.artist_id) ?? "Artist",
    gradient: gradientForSongId(r.id),
    audio_path: r.audio_path
  }));
}

export async function getContinueListeningCards(profileId: string, limit = 12): Promise<SongCardRow[]> {
  const { data: hist } = await supabase
    .from("listening_history")
    .select("song_id, created_at")
    .eq("user_id", profileId)
    .order("created_at", { ascending: false })
    .limit(40);
  const seen = new Set<string>();
  const idsOrdered: string[] = [];
  for (const row of hist ?? []) {
    if (!row.song_id || seen.has(row.song_id)) continue;
    seen.add(row.song_id);
    idsOrdered.push(row.song_id);
    if (idsOrdered.length >= limit) break;
  }
  if (idsOrdered.length === 0) return [];
  const { data: songs } = await supabase
    .from("songs")
    .select("id,title,artist_id,audio_path")
    .in("id", idsOrdered)
    .in("status", [...PLAYABLE_SONG_STATUSES]);
  const byId = new Map((songs ?? []).map((s) => [s.id, s]));
  const map = await artistNameMap((songs ?? []).map((s) => s.artist_id));
  const out: SongCardRow[] = [];
  for (const id of idsOrdered) {
    const s = byId.get(id);
    if (!s) continue;
    out.push({
      id: s.id,
      title: s.title,
      artist: map.get(s.artist_id) ?? "Artist",
      gradient: gradientForSongId(s.id),
      audio_path: s.audio_path ?? undefined
    });
  }
  return out;
}

export async function getTrendingSongCards(limit = 8, moodId?: string | null): Promise<SongCardRow[]> {
  const rows = await getApprovedSongs(limit, moodId);
  const map = await artistNameMap(rows.map((r) => r.artist_id));
  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    artist: map.get(r.artist_id) ?? "Artist",
    gradient: gradientForSongId(r.id),
    audio_path: r.audio_path
  }));
}

export async function getNewReleaseSongCards(limit = 14): Promise<SongCardRow[]> {
  const { data, error } = await supabase
    .from("songs")
    .select("id,title,artist_id,audio_path,created_at")
    .in("status", [...PLAYABLE_SONG_STATUSES])
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  const rows = data ?? [];
  const map = await artistNameMap(rows.map((r) => r.artist_id));
  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    artist: map.get(r.artist_id) ?? "Artist",
    gradient: gradientForSongId(r.id),
    audio_path: r.audio_path
  }));
}

export async function getFeaturedArtistCircles(limit = 16) {
  const { data, error } = await supabase
    .from("artist_profiles")
    .select("id,artist_name")
    .in("status", [...PLAYABLE_SONG_STATUSES])
    .order("monthly_listeners", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []).map((a) => ({
    id: a.id,
    name: a.artist_name,
    initial: (a.artist_name?.trim().slice(0, 1) || "?").toUpperCase(),
    gradient: gradientForSongId(a.id)
  }));
}

export async function getRecommendedSongCards(profileId: string, limit = 20): Promise<SongCardRow[]> {
  const { data: scores } = await supabase
    .from("recommendation_scores")
    .select("song_id")
    .eq("user_id", profileId)
    .order("score", { ascending: false })
    .limit(limit);
  const ids = (scores ?? []).map((s) => s.song_id).filter(Boolean);
  if (ids.length === 0) return [];
  const { data: songs } = await supabase
    .from("songs")
    .select("id,title,artist_id,audio_path")
    .in("id", ids)
    .in("status", [...PLAYABLE_SONG_STATUSES]);
  const byId = new Map((songs ?? []).map((s) => [s.id, s]));
  const map = await artistNameMap((songs ?? []).map((s) => s.artist_id));
  const out: SongCardRow[] = [];
  for (const id of ids) {
    const s = byId.get(id);
    if (!s) continue;
    out.push({
      id: s.id,
      title: s.title,
      artist: map.get(s.artist_id) ?? "Artist",
      gradient: gradientForSongId(s.id),
      audio_path: s.audio_path ?? undefined
    });
  }
  return out;
}

export async function getApprovedSongs(limit = 30, moodId?: string | null) {
  let q = supabase
    .from("songs")
    .select("id,title,artist_id,audio_path,cover_path,genre_id,mood_id,play_count,like_count")
    .in("status", [...PLAYABLE_SONG_STATUSES])
    .order("play_count", { ascending: false })
    .limit(limit);
  if (moodId) q = q.eq("mood_id", moodId);
  const { data, error } = await q;
  if (error) throw error;
  return data ?? [];
}

export async function loadSongForPlayback(
  profileId: string,
  songId: string,
  options?: { autoplay?: boolean }
): Promise<{ ok: true } | { ok: false; reason: "offline_not_downloaded" }> {
  const autoplay = options?.autoplay ?? true;
  usePlayerStore.getState().setPlaybackProfileId(profileId);
  const [songRes, settings] = await Promise.all([
    supabase.from("songs").select("title,artist_id,audio_path").eq("id", songId).maybeSingle(),
    getSettings(profileId)
  ]);
  const row = songRes.data;
  if (!row?.audio_path) {
    usePlayerStore.getState().setNowPlaying(songId, row?.title ?? "Song", "Unknown Artist", "");
    usePlayerStore.getState().setIsPlaying(false);
    return { ok: false, reason: "offline_not_downloaded" };
  }
  let artistName = "Unknown Artist";
  if (row.artist_id) {
    const artistRes = await supabase.from("artist_profiles").select("artist_name").eq("id", row.artist_id).maybeSingle();
    artistName = artistRes.data?.artist_name ?? "Unknown Artist";
  }
  const sourceUri = await resolvePlayableSongUri(profileId, songId, row.audio_path, settings.offline_mode_enabled);
  if (!sourceUri) {
    usePlayerStore.getState().setNowPlaying(songId, row.title, artistName, "");
    usePlayerStore.getState().setIsPlaying(false);
    return { ok: false, reason: "offline_not_downloaded" };
  }

  usePlayerStore.getState().setNowPlaying(songId, row.title, artistName, sourceUri);
  usePlayerStore.getState().setIsPlaying(autoplay);
  return { ok: true };
}

export async function playSongFromHome(profileId: string, songId: string) {
  const recommendations = await supabase
    .from("recommendation_scores")
    .select("song_id")
    .eq("user_id", profileId)
    .order("score", { ascending: false })
    .limit(20);
  const recommendedSongIds = (recommendations.data ?? []).map((row) => row.song_id).filter((id) => id !== songId);
  playSingleAndAutofill(songId, recommendedSongIds);
  return loadSongForPlayback(profileId, songId, { autoplay: true });
}

export async function playPlaylistFromSong(profileId: string, playlistSongIds: string[], selectedSongId: string) {
  playFromPlaylist(playlistSongIds, selectedSongId);
  return loadSongForPlayback(profileId, selectedSongId, { autoplay: true });
}

export async function playNextTrackFromQueue(): Promise<boolean> {
  const profileId = usePlayerStore.getState().playbackProfileId;
  if (!profileId) return false;
  const nextId = usePlayerStore.getState().nextInQueue();
  if (!nextId) return false;
  const res = await loadSongForPlayback(profileId, nextId, { autoplay: true });
  return res.ok;
}

export async function playPrevTrackFromQueue(): Promise<boolean> {
  const profileId = usePlayerStore.getState().playbackProfileId;
  if (!profileId) return false;
  const prevId = usePlayerStore.getState().prevInQueue();
  if (!prevId) return false;
  const res = await loadSongForPlayback(profileId, prevId, { autoplay: true });
  return res.ok;
}
