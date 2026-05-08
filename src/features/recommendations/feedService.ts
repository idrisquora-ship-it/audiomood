import { supabase } from "@/lib/supabase";
import { PLAYABLE_SONG_STATUSES } from "@/features/music/playableSongs";

export async function getRecommendationSections(profileId: string) {
  const [topScores, trending, follows] = await Promise.all([
    supabase
      .from("recommendation_scores")
      .select("song_id,score")
      .eq("user_id", profileId)
      .order("score", { ascending: false })
      .limit(20),
    supabase
      .from("songs")
      .select("id,title,play_count,like_count")
      .in("status", [...PLAYABLE_SONG_STATUSES])
      .order("play_count", { ascending: false })
      .limit(20),
    supabase
      .from("songs")
      .select("id,title,artist_id,play_count")
      .in("status", [...PLAYABLE_SONG_STATUSES])
      .order("created_at", { ascending: false })
      .limit(20)
  ]);

  return {
    recommendedForYou: topScores.data ?? [],
    trendingNow: trending.data ?? [],
    newReleasesForYou: follows.data ?? []
  };
}
