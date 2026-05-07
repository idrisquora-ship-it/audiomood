import { supabase } from "@/lib/supabase";

type SignalInput = {
  userId: string;
  songId: string;
  eventType: string;
  sourceType?: string;
  sourceId?: string;
  listenedSeconds?: number;
};

const weights: Record<string, number> = {
  liked_same_artist: 10,
  liked_same_genre: 8,
  liked_same_mood: 8,
  added_similar_playlist: 7,
  completed_similar: 6,
  trending_fav_genre: 5,
  followed_artist: 4,
  skipped_quickly: -8,
  blocked_reported_artist: -10
};

export function calculateRecommendationScore(appliedSignals: string[]) {
  return appliedSignals.reduce((sum, key) => sum + (weights[key] ?? 0), 0);
}

export async function recordPlaySignal(input: SignalInput) {
  await supabase.from("play_events").insert({
    user_id: input.userId,
    song_id: input.songId,
    event_type: input.eventType,
    source_type: input.sourceType ?? null,
    source_id: input.sourceId ?? null,
    listened_seconds: input.listenedSeconds ?? 0
  });
}

export async function upsertRecommendationScore(userId: string, songId: string, appliedSignals: string[]) {
  const score = calculateRecommendationScore(appliedSignals);
  await supabase.from("recommendation_scores").upsert(
    { user_id: userId, song_id: songId, score, signals: { appliedSignals } },
    { onConflict: "user_id,song_id" }
  );
}
