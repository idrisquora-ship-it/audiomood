import { supabase } from "@/lib/supabase";
import { applyRadioRecommendationSignal, createNotification } from "@/features/engagement/signalService";
import { PLAYABLE_SONG_STATUSES } from "@/features/music/playableSongs";
import { loadSongForPlayback } from "@/features/music/songService";
import { usePlayerStore } from "@/store/playerStore";

export const moodOptions = ["Chill", "Sad", "Romantic", "Workout", "Prayer", "Party", "Focus", "Late Night", "Motivation"] as const;

export type MoodOption = (typeof moodOptions)[number];

export type RadioSession = {
  id: string;
  user_id: string;
  mood: string;
  genre: string | null;
};

export type RadioQueueItem = {
  id: string;
  session_id: string;
  song_id: string;
  position: number;
  generated_score: number | null;
  played: boolean;
};

type StartRadioInput = {
  userId: string;
  mood: MoodOption;
  genre?: string | null;
};

async function buildCandidateSongs(userId: string, mood: string, genre: string | null) {
  const [likedSongsRes, hiddenArtistRes, skippedRes] = await Promise.all([
    supabase.from("liked_songs").select("song_id").eq("user_id", userId).limit(300),
    supabase.from("radio_feedback").select("song_id").eq("user_id", userId).eq("feedback", "hide_artist").limit(300),
    supabase.from("radio_feedback").select("song_id").eq("user_id", userId).eq("feedback", "skip").limit(300)
  ]);

  const likedSongIds = new Set((likedSongsRes.data ?? []).map((r) => r.song_id));
  const hiddenSongIds = new Set((hiddenArtistRes.data ?? []).map((r) => r.song_id));
  const skippedSongIds = new Set((skippedRes.data ?? []).map((r) => r.song_id));

  let query = supabase
    .from("songs")
    .select("id,title,artist_id,genre_id,mood_id,play_count,like_count,status")
    .in("status", [...PLAYABLE_SONG_STATUSES])
    .limit(120);

  if (genre) {
    const genreRes = await supabase.from("genres").select("id").ilike("name", genre).maybeSingle();
    if (genreRes.data?.id) query = query.eq("genre_id", genreRes.data.id);
  }

  const moodRes = await supabase.from("moods").select("id").ilike("name", mood).maybeSingle();
  if (moodRes.data?.id) query = query.eq("mood_id", moodRes.data.id);

  const { data, error } = await query;
  if (error) throw error;

  return (data ?? [])
    .filter((song) => !hiddenSongIds.has(song.id))
    .map((song) => {
      const base = (song.like_count ?? 0) * 0.5 + (song.play_count ?? 0) * 0.1;
      const likedBoost = likedSongIds.has(song.id) ? 35 : 0;
      const skipPenalty = skippedSongIds.has(song.id) ? -45 : 0;
      return { ...song, generated_score: base + likedBoost + skipPenalty };
    })
    .sort((a, b) => b.generated_score - a.generated_score)
    .slice(0, 25);
}

export async function startMoodRadio(input: StartRadioInput) {
  const { data: session, error: sessionError } = await supabase
    .from("radio_sessions")
    .insert({
      user_id: input.userId,
      mood: input.mood,
      genre: input.genre ?? null
    })
    .select("id,user_id,mood,genre")
    .single();
  if (sessionError) throw sessionError;

  const candidates = await buildCandidateSongs(input.userId, input.mood, input.genre ?? null);
  const queueRows = candidates.map((song, index) => ({
    session_id: session.id,
    song_id: song.id,
    position: index,
    generated_score: song.generated_score
  }));

  if (queueRows.length > 0) {
    const { error: queueError } = await supabase.from("radio_queue").insert(queueRows);
    if (queueError) throw queueError;
  }

  await createNotification({
    userProfileId: input.userId,
    title: "Mood Radio started",
    body: `${input.mood}${input.genre ? ` • ${input.genre}` : ""} station is live.`,
    type: "mood_radio_started",
    data: { session_id: session.id, mood: input.mood, genre: input.genre ?? null }
  });

  return session as RadioSession;
}

export async function getRadioQueue(sessionId: string) {
  const { data, error } = await supabase
    .from("radio_queue")
    .select("id,session_id,song_id,position,generated_score,played")
    .eq("session_id", sessionId)
    .order("position", { ascending: true });
  if (error) throw error;
  return (data ?? []) as RadioQueueItem[];
}

export async function markQueueItemPlayed(itemId: string) {
  const { error } = await supabase.from("radio_queue").update({ played: true }).eq("id", itemId);
  if (error) throw error;
}

export async function submitRadioFeedback(
  sessionId: string,
  userId: string,
  songId: string,
  feedback: "like" | "dislike" | "skip" | "save" | "hide_artist" | "replay"
) {
  const { error } = await supabase.from("radio_feedback").insert({
    session_id: sessionId,
    user_id: userId,
    song_id: songId,
    feedback
  });
  if (error) throw error;
  await applyRadioRecommendationSignal(userId, songId, feedback);
}

export async function improveStation(sessionId: string, userId: string) {
  const sessionRes = await supabase.from("radio_sessions").select("mood,genre").eq("id", sessionId).single();
  if (!sessionRes.data) return;

  const queue = await getRadioQueue(sessionId);
  const usedSongIds = new Set(queue.map((row) => row.song_id));
  const candidates = await buildCandidateSongs(userId, sessionRes.data.mood, sessionRes.data.genre);
  const nextCandidates = candidates.filter((song) => !usedSongIds.has(song.id)).slice(0, 10);
  if (nextCandidates.length === 0) return;

  const nextPosition = queue.length;
  const payload = nextCandidates.map((song, index) => ({
    session_id: sessionId,
    song_id: song.id,
    position: nextPosition + index,
    generated_score: song.generated_score
  }));
  const { error } = await supabase.from("radio_queue").insert(payload);
  if (error) throw error;
}

export async function endMoodRadio(sessionId: string) {
  const sessionRes = await supabase.from("radio_sessions").select("user_id,mood").eq("id", sessionId).maybeSingle();
  const { error } = await supabase.from("radio_sessions").update({ ended_at: new Date().toISOString() }).eq("id", sessionId);
  if (error) throw error;
  if (sessionRes.data?.user_id) {
    await createNotification({
      userProfileId: sessionRes.data.user_id,
      title: "Mood Radio ended",
      body: `Your ${sessionRes.data.mood} session was ended.`,
      type: "mood_radio_ended",
      data: { session_id: sessionId }
    });
  }
}

export async function playRadioSong(profileId: string, songId: string) {
  usePlayerStore.getState().setQueue([songId], "single", songId);
  return loadSongForPlayback(profileId, songId, { autoplay: true });
}
