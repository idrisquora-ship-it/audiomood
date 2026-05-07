import { supabase } from "@/lib/supabase";
import { upsertRecommendationScore } from "@/features/recommendations/recommendationService";

type NotifyInput = {
  userProfileId: string;
  title: string;
  body: string;
  type: string;
  data?: Record<string, unknown>;
  push?: boolean;
};

export async function createNotification(input: NotifyInput) {
  await supabase.from("notifications").insert({
    user_id: input.userProfileId,
    title: input.title,
    body: input.body,
    type: input.type,
    read: false
  });

  if (!input.push) return;
  await supabase.functions.invoke("send-push-notification", {
    body: {
      user_profile_id: input.userProfileId,
      title: input.title,
      body: input.body,
      data: input.data ?? {}
    }
  });
}

export async function createBulkNotifications(
  userProfileIds: string[],
  payload: Omit<NotifyInput, "userProfileId">
) {
  await Promise.all(
    userProfileIds.map((id) =>
      createNotification({
        userProfileId: id,
        ...payload
      })
    )
  );
}

export async function applyRadioRecommendationSignal(
  userId: string,
  songId: string,
  feedback: "like" | "dislike" | "skip" | "save" | "hide_artist" | "replay"
) {
  const signalMap: Record<typeof feedback, string[]> = {
    like: ["liked_same_genre", "liked_same_mood"],
    save: ["added_similar_playlist", "completed_similar"],
    replay: ["completed_similar", "liked_same_artist"],
    skip: ["skipped_quickly"],
    dislike: ["skipped_quickly"],
    hide_artist: ["blocked_reported_artist"]
  };
  await upsertRecommendationScore(userId, songId, signalMap[feedback]);
}
