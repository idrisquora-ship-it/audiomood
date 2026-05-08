import { supabase } from "@/lib/supabase";
import { createBulkNotifications, createNotification } from "@/features/engagement/signalService";
import { usePlayerStore } from "@/store/playerStore";

export type PodcastShow = {
  id: string;
  title: string;
  description: string | null;
  cover_path: string | null;
  creator_profile_id: string;
  status?: string;
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
  status?: string;
};

const LISTENER_VISIBLE_PODCAST_STATUSES = ["published", "processing_transcript"];

async function uploadArrayBuffer(bucket: string, storagePath: string, uri: string, contentType: string) {
  const res = await fetch(uri);
  const buf = await res.arrayBuffer();
  const { error } = await supabase.storage.from(bucket).upload(storagePath, buf, { contentType, upsert: true });
  if (error) throw error;
  return storagePath;
}

function audioExtFromMime(mime?: string | null): string {
  if (!mime) return "mp3";
  if (mime.includes("mpeg")) return "mp3";
  if (mime.includes("wav")) return "wav";
  if (mime.includes("aac") || mime.includes("mp4") || mime.includes("m4a")) return "m4a";
  return "mp3";
}

export async function getPodcasts(limit = 30) {
  const { data, error } = await supabase
    .from("podcasts")
    .select("id,title,description,cover_path,creator_profile_id,status")
    .in("status", LISTENER_VISIBLE_PODCAST_STATUSES)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as PodcastShow[];
}

export async function getPodcastById(podcastId: string) {
  const { data, error } = await supabase
    .from("podcasts")
    .select("id,title,description,cover_path,creator_profile_id,status")
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
    .select("id,podcast_id,title,description,cover_path,audio_path,duration_seconds,release_date,transcript_text,status")
    .eq("podcast_id", podcastId)
    .in("status", LISTENER_VISIBLE_PODCAST_STATUSES)
    .order("release_date", { ascending: false, nullsFirst: false });
  if (error) throw error;
  return (data ?? []) as PodcastEpisode[];
}

export async function getEpisodeById(episodeId: string) {
  const { data, error } = await supabase
    .from("podcast_episodes")
    .select("id,podcast_id,title,description,cover_path,audio_path,duration_seconds,release_date,transcript_text,status")
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
    .select("id,title,description,cover_path,creator_profile_id,status")
    .in("status", LISTENER_VISIBLE_PODCAST_STATUSES)
    .ilike("title", `%${query.trim()}%`)
    .limit(20);
  if (error) throw error;
  return (data ?? []) as PodcastShow[];
}

export async function createPodcastShow(
  profileId: string,
  input: { title: string; description: string; categoryId?: string | null; coverUri?: string | null }
) {
  let coverPath: string | null = null;
  if (input.coverUri) {
    const cp = `${profileId}/${Date.now()}-show-cover.jpg`;
    await uploadArrayBuffer("podcast-covers", cp, input.coverUri, "image/jpeg");
    coverPath = cp;
  }

  const { data, error } = await supabase
    .from("podcasts")
    .insert({
      creator_profile_id: profileId,
      title: input.title,
      description: input.description,
      category_id: input.categoryId ?? null,
      cover_path: coverPath,
      status: "published"
    })
    .select("id")
    .single();
  if (error) throw error;
  return data.id as string;
}

export async function uploadPodcastEpisode(
  podcastId: string,
  input: {
    title: string;
    description: string;
    audioPath?: string;
    audioUri?: string;
    audioMime?: string | null;
    coverPath?: string;
    coverUri?: string | null;
    releaseDate?: string | null;
    processTranscript?: boolean;
  }
) {
  let audioPath = input.audioPath ?? "";
  if (!audioPath && input.audioUri) {
    const ext = audioExtFromMime(input.audioMime);
    const audioMime = input.audioMime ?? (ext === "wav" ? "audio/wav" : ext === "m4a" ? "audio/mp4" : "audio/mpeg");
    audioPath = `${podcastId}/${Date.now()}.${ext}`;
    await uploadArrayBuffer("podcast-audio", audioPath, input.audioUri, audioMime);
  }
  if (!audioPath) throw new Error("Audio file is required.");

  let coverPath = input.coverPath ?? null;
  if (!coverPath && input.coverUri) {
    const cp = `${podcastId}/${Date.now()}-episode-cover.jpg`;
    await uploadArrayBuffer("podcast-covers", cp, input.coverUri, "image/jpeg");
    coverPath = cp;
  }
  const status = input.processTranscript ? "processing_transcript" : "published";

  const { data, error } = await supabase
    .from("podcast_episodes")
    .insert({
      podcast_id: podcastId,
      title: input.title,
      description: input.description,
      audio_path: audioPath,
      cover_path: coverPath,
      release_date: input.releaseDate ?? null,
      status
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
