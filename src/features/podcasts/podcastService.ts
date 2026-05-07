import { supabase } from "@/lib/supabase";
import { createBulkNotifications, createNotification } from "@/features/engagement/signalService";
import { usePlayerStore } from "@/store/playerStore";

export type PodcastShow = {
  id: string;
  title: string;
  description: string | null;
  cover_path: string | null;
  creator_profile_id: string;
};

export type PodcastEpisode = {
  id: string;
  podcast_id: string;
  title: string;
  description: string | null;
  cover_path: string | null;
  audio_path: string;
  duration_seconds: number | null;
  release_date: string | null;
  transcript_text: string | null;
};

export async function getPodcasts(limit = 30) {
  const { data, error } = await supabase
    .from("podcasts")
    .select("id,title,description,cover_path,creator_profile_id")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as PodcastShow[];
}

export async function getPodcastById(podcastId: string) {
  const { data, error } = await supabase
    .from("podcasts")
    .select("id,title,description,cover_path,creator_profile_id")
    .eq("id", podcastId)
    .single();
  if (error) throw error;
  return data as PodcastShow;
}

export async function canManagePodcast(podcastId: string, profileId: string) {
  const { data } = await supabase
    .from("podcasts")
    .select("id")
    .eq("id", podcastId)
    .eq("creator_profile_id", profileId)
    .maybeSingle();
  return Boolean(data?.id);
}

export async function getPodcastEpisodes(podcastId: string) {
  const { data, error } = await supabase
    .from("podcast_episodes")
    .select("id,podcast_id,title,description,cover_path,audio_path,duration_seconds,release_date,transcript_text")
    .eq("podcast_id", podcastId)
    .order("release_date", { ascending: false, nullsFirst: false });
  if (error) throw error;
  return (data ?? []) as PodcastEpisode[];
}

export async function getEpisodeById(episodeId: string) {
  const { data, error } = await supabase
    .from("podcast_episodes")
    .select("id,podcast_id,title,description,cover_path,audio_path,duration_seconds,release_date,transcript_text")
    .eq("id", episodeId)
    .single();
  if (error) throw error;
  return data as PodcastEpisode;
}

export async function followPodcast(profileId: string, podcastId: string) {
  const { error } = await supabase.from("podcast_followers").upsert(
    { user_id: profileId, podcast_id: podcastId },
    { onConflict: "podcast_id,user_id" }
  );
  if (error) throw error;

  const podcastRes = await supabase.from("podcasts").select("title").eq("id", podcastId).maybeSingle();
  await createNotification({
    userProfileId: profileId,
    title: "Podcast followed",
    body: `You are now following ${podcastRes.data?.title ?? "this podcast"}.`,
    type: "podcast_follow",
    data: { podcast_id: podcastId }
  });
}

export async function savePodcastEpisode(profileId: string, episodeId: string) {
  const { error } = await supabase.from("saved_podcast_episodes").upsert(
    { user_id: profileId, episode_id: episodeId },
    { onConflict: "user_id,episode_id" }
  );
  if (error) throw error;
}

export async function likePodcastEpisode(profileId: string, episodeId: string) {
  await savePodcastEpisode(profileId, episodeId);
}

export async function addPodcastComment(profileId: string, episodeId: string, message: string) {
  const { error } = await supabase.from("podcast_comments").insert({
    user_id: profileId,
    episode_id: episodeId,
    message
  });
  if (error) throw error;

  const episodeRes = await supabase
    .from("podcast_episodes")
    .select("title,podcast_id,podcasts(creator_profile_id)")
    .eq("id", episodeId)
    .maybeSingle();
  const creatorId = (episodeRes.data?.podcasts as { creator_profile_id?: string } | null)?.creator_profile_id;
  if (creatorId && creatorId !== profileId) {
    await createNotification({
      userProfileId: creatorId,
      title: "New podcast comment",
      body: `Someone commented on ${episodeRes.data?.title ?? "your episode"}.`,
      type: "podcast_comment",
      data: { episode_id: episodeId, podcast_id: episodeRes.data?.podcast_id },
      push: true
    });
  }
}

export async function getPodcastComments(episodeId: string) {
  const { data, error } = await supabase
    .from("podcast_comments")
    .select("id,user_id,message,created_at")
    .eq("episode_id", episodeId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getPodcastHistory(profileId: string, episodeId: string) {
  const { data } = await supabase
    .from("podcast_history")
    .select("playback_seconds,playback_speed,completed")
    .eq("user_id", profileId)
    .eq("episode_id", episodeId)
    .maybeSingle();
  return data ?? { playback_seconds: 0, playback_speed: 1, completed: false };
}

export async function updatePodcastProgress(profileId: string, episodeId: string, playbackSeconds: number, playbackSpeed: number) {
  const { error } = await supabase.from("podcast_history").upsert(
    {
      user_id: profileId,
      episode_id: episodeId,
      playback_seconds: Math.max(0, Math.floor(playbackSeconds)),
      playback_speed: playbackSpeed,
      completed: false
    },
    { onConflict: "user_id,episode_id" }
  );
  if (error) throw error;
}

export async function searchPodcasts(query: string) {
  if (!query.trim()) return [];
  const { data, error } = await supabase
    .from("podcasts")
    .select("id,title,description,cover_path,creator_profile_id")
    .ilike("title", `%${query.trim()}%`)
    .limit(20);
  if (error) throw error;
  return (data ?? []) as PodcastShow[];
}

export async function createPodcastShow(profileId: string, input: { title: string; description: string; categoryId?: string | null }) {
  const { data, error } = await supabase
    .from("podcasts")
    .insert({
      creator_profile_id: profileId,
      title: input.title,
      description: input.description,
      category_id: input.categoryId ?? null
    })
    .select("id")
    .single();
  if (error) throw error;
  return data.id as string;
}

export async function uploadPodcastEpisode(
  podcastId: string,
  input: { title: string; description: string; audioPath: string; coverPath?: string; releaseDate?: string | null }
) {
  const { data, error } = await supabase
    .from("podcast_episodes")
    .insert({
      podcast_id: podcastId,
      title: input.title,
      description: input.description,
      audio_path: input.audioPath,
      cover_path: input.coverPath ?? null,
      release_date: input.releaseDate ?? null
    })
    .select("id")
    .single();
  if (error) throw error;

  const followersRes = await supabase.from("podcast_followers").select("user_id").eq("podcast_id", podcastId);
  await createBulkNotifications(
    (followersRes.data ?? []).map((f) => f.user_id),
    {
      title: "New podcast episode",
      body: input.title,
      type: "podcast_new_episode",
      data: { podcast_id: podcastId, episode_id: data.id },
      push: true
    }
  );

  return data.id as string;
}

export function playPodcastEpisode(episodeId: string, title: string) {
  usePlayerStore.getState().setNowPlaying(episodeId, title, "Podcast", "");
  usePlayerStore.getState().setIsPlaying(true);
}
