import { supabase } from "@/lib/supabase";
import * as FileSystem from "expo-file-system";

export type AppSettings = {
  autoplay_recommendations: boolean;
  notifications_enabled: boolean;
  explicit_content_filter: boolean;
  crossfade_seconds: number;
  normalize_volume: boolean;
  private_session: boolean;
  two_factor_enabled: boolean;
  downloads_on_wifi_only: boolean;
  offline_mode_enabled: boolean;
  improve_recommendations: boolean;
  theme: string;
};

const defaultSettings: AppSettings = {
  autoplay_recommendations: true,
  notifications_enabled: true,
  explicit_content_filter: true,
  crossfade_seconds: 0,
  normalize_volume: true,
  private_session: false,
  two_factor_enabled: false,
  downloads_on_wifi_only: false,
  offline_mode_enabled: false,
  improve_recommendations: true,
  theme: "dark"
};

export type NotificationSettings = {
  all_notifications: boolean;
  new_song_release: boolean;
  podcast_new_episode: boolean;
  playlist_likes: boolean;
  new_followers: boolean;
  comments_replies: boolean;
  party_invites: boolean;
  live_room_invites: boolean;
  lyrics_generated: boolean;
  email_notifications: boolean;
};

export type PrivacySettings = {
  private_account: boolean;
  show_listening_activity: boolean;
  show_public_playlists: boolean;
  blocked_users: string[];
  content_filters: Record<string, unknown>;
};

export type PlaybackSettings = {
  autoplay_recommendations: boolean;
  crossfade_seconds: number;
  gapless_playback: boolean;
  audio_quality: "low" | "normal" | "high" | "very_high";
  normalize_volume: boolean;
  explicit_content_filter: boolean;
  auto_play_on_bluetooth: boolean;
};

export type PodcastSettings = {
  auto_download_followed: boolean;
  default_playback_speed: number;
  save_progress: boolean;
  new_episode_notifications: boolean;
  transcript_language: string;
};

export type MoodRadioSettings = {
  default_mood: string | null;
  default_genre: string | null;
  use_listening_history: boolean;
  hide_repeated_songs: boolean;
};

export type PartySettings = {
  allow_friend_invites: boolean;
  allow_follower_join_public: boolean;
  party_notifications: boolean;
  auto_sync_playback: boolean;
  allow_song_suggestions: boolean;
};

export type LiveRoomSettings = {
  allow_room_invites: boolean;
  allow_microphone_requests: boolean;
  room_notifications: boolean;
  show_active_status: boolean;
  blocked_room_users: string[];
};

export type ArtistSettings = {
  upload_defaults: Record<string, unknown>;
  lyrics_auto_generate: boolean;
  allow_fan_lyric_suggestions: boolean;
  analytics_email_reports: boolean;
  fan_messaging: boolean;
  promotion_settings: Record<string, unknown>;
  payout_settings: Record<string, unknown>;
};

export type FullSettingsBundle = {
  app: AppSettings;
  notification: NotificationSettings;
  privacy: PrivacySettings;
  playback: PlaybackSettings;
  podcast: PodcastSettings;
  moodRadio: MoodRadioSettings;
  party: PartySettings;
  liveRoom: LiveRoomSettings;
  artist: ArtistSettings;
};

const defaultNotificationSettings: NotificationSettings = {
  all_notifications: true,
  new_song_release: true,
  podcast_new_episode: true,
  playlist_likes: true,
  new_followers: true,
  comments_replies: true,
  party_invites: true,
  live_room_invites: true,
  lyrics_generated: true,
  email_notifications: false
};

const defaultPrivacySettings: PrivacySettings = {
  private_account: false,
  show_listening_activity: true,
  show_public_playlists: true,
  blocked_users: [],
  content_filters: {}
};

const defaultPlaybackSettings: PlaybackSettings = {
  autoplay_recommendations: true,
  crossfade_seconds: 0,
  gapless_playback: false,
  audio_quality: "normal",
  normalize_volume: true,
  explicit_content_filter: true,
  auto_play_on_bluetooth: false
};

const defaultPodcastSettings: PodcastSettings = {
  auto_download_followed: false,
  default_playback_speed: 1,
  save_progress: true,
  new_episode_notifications: true,
  transcript_language: "en"
};

const defaultMoodRadioSettings: MoodRadioSettings = {
  default_mood: null,
  default_genre: null,
  use_listening_history: true,
  hide_repeated_songs: true
};

const defaultPartySettings: PartySettings = {
  allow_friend_invites: true,
  allow_follower_join_public: true,
  party_notifications: true,
  auto_sync_playback: true,
  allow_song_suggestions: true
};

const defaultLiveRoomSettings: LiveRoomSettings = {
  allow_room_invites: true,
  allow_microphone_requests: true,
  room_notifications: true,
  show_active_status: true,
  blocked_room_users: []
};

const defaultArtistSettings: ArtistSettings = {
  upload_defaults: {},
  lyrics_auto_generate: true,
  allow_fan_lyric_suggestions: false,
  analytics_email_reports: false,
  fan_messaging: true,
  promotion_settings: {},
  payout_settings: {}
};

export async function getSettings(profileId: string) {
  const { data, error } = await supabase
    .from("user_settings")
    .select(
      "autoplay_recommendations,notifications_enabled,explicit_content_filter,crossfade_seconds,normalize_volume,private_session,two_factor_enabled,downloads_on_wifi_only,offline_mode_enabled,improve_recommendations,theme"
    )
    .eq("user_id", profileId)
    .single();
  if (error || !data) return defaultSettings;
  return data as AppSettings;
}

export async function updateSettings(profileId: string, partial: Partial<AppSettings>) {
  const { error } = await supabase
    .from("user_settings")
    .upsert({ user_id: profileId, ...partial }, { onConflict: "user_id" });
  if (error) throw error;
}

async function getRowOrDefault<T extends Record<string, unknown>>(table: string, profileId: string, fallback: T) {
  const { data } = await supabase.from(table).select("*").eq("user_id", profileId).maybeSingle();
  if (!data) return fallback;
  const row = data as Record<string, unknown>;
  const picked: Record<string, unknown> = {};
  for (const key of Object.keys(fallback)) {
    picked[key] = row[key] ?? fallback[key as keyof T];
  }
  return picked as T;
}

async function upsertRow<T extends Record<string, unknown>>(table: string, profileId: string, partial: Partial<T>) {
  const { error } = await supabase.from(table).upsert({ user_id: profileId, ...partial }, { onConflict: "user_id" });
  if (error) throw error;
}

export async function getFullSettings(profileId: string): Promise<FullSettingsBundle> {
  const [app, notification, privacy, playback, podcast, moodRadio, party, liveRoom, artist] = await Promise.all([
    getSettings(profileId),
    getRowOrDefault<NotificationSettings>("notification_settings", profileId, defaultNotificationSettings),
    getRowOrDefault<PrivacySettings>("privacy_settings", profileId, defaultPrivacySettings),
    getRowOrDefault<PlaybackSettings>("playback_settings", profileId, defaultPlaybackSettings),
    getRowOrDefault<PodcastSettings>("podcast_settings", profileId, defaultPodcastSettings),
    getRowOrDefault<MoodRadioSettings>("mood_radio_settings", profileId, defaultMoodRadioSettings),
    getRowOrDefault<PartySettings>("party_settings", profileId, defaultPartySettings),
    getRowOrDefault<LiveRoomSettings>("live_room_settings", profileId, defaultLiveRoomSettings),
    getRowOrDefault<ArtistSettings>("artist_settings", profileId, defaultArtistSettings)
  ]);

  return { app, notification, privacy, playback, podcast, moodRadio, party, liveRoom, artist };
}

/** When profile is not ready yet — keeps Settings from hanging on a lone loading card. */
export function buildDefaultFullSettings(): FullSettingsBundle {
  return {
    app: { ...defaultSettings },
    notification: { ...defaultNotificationSettings },
    privacy: { ...defaultPrivacySettings },
    playback: { ...defaultPlaybackSettings },
    podcast: { ...defaultPodcastSettings },
    moodRadio: { ...defaultMoodRadioSettings },
    party: { ...defaultPartySettings },
    liveRoom: { ...defaultLiveRoomSettings },
    artist: { ...defaultArtistSettings }
  };
}

export function updateNotificationSettings(profileId: string, partial: Partial<NotificationSettings>) {
  return upsertRow<NotificationSettings>("notification_settings", profileId, partial);
}

export function updatePrivacySettings(profileId: string, partial: Partial<PrivacySettings>) {
  return upsertRow<PrivacySettings>("privacy_settings", profileId, partial);
}

export function updatePlaybackSettings(profileId: string, partial: Partial<PlaybackSettings>) {
  return upsertRow<PlaybackSettings>("playback_settings", profileId, partial);
}

export function updatePodcastSettings(profileId: string, partial: Partial<PodcastSettings>) {
  return upsertRow<PodcastSettings>("podcast_settings", profileId, partial);
}

export function updateMoodRadioSettings(profileId: string, partial: Partial<MoodRadioSettings>) {
  return upsertRow<MoodRadioSettings>("mood_radio_settings", profileId, partial);
}

export function updatePartySettings(profileId: string, partial: Partial<PartySettings>) {
  return upsertRow<PartySettings>("party_settings", profileId, partial);
}

export function updateLiveRoomSettings(profileId: string, partial: Partial<LiveRoomSettings>) {
  return upsertRow<LiveRoomSettings>("live_room_settings", profileId, partial);
}

export function updateArtistSettings(profileId: string, partial: Partial<ArtistSettings>) {
  return upsertRow<ArtistSettings>("artist_settings", profileId, partial);
}

export async function getDownloadedSongs(profileId: string) {
  const { data, error } = await supabase
    .from("downloaded_songs")
    .select("id,song_id,local_path,downloaded_at")
    .eq("user_id", profileId)
    .order("downloaded_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function addDownloadedSong(profileId: string, songId: string, localPath: string) {
  const { error } = await supabase
    .from("downloaded_songs")
    .upsert({ user_id: profileId, song_id: songId, local_path: localPath }, { onConflict: "user_id,song_id" });
  if (error) throw error;
}

export async function createSupportTicket(profileId: string, subject: string, message: string) {
  const { error } = await supabase
    .from("support_tickets")
    .insert({ user_id: profileId, subject, message, status: "open" });
  if (error) throw error;
}

export async function clearListeningHistory(profileId: string) {
  const { error } = await supabase.from("listening_history").delete().eq("user_id", profileId);
  if (error) throw error;
}

export async function clearSearchHistory(profileId: string) {
  const { error } = await supabase.from("search_history").delete().eq("user_id", profileId);
  if (error) throw error;
}

export async function clearPodcastHistory(profileId: string) {
  const { error } = await supabase.from("podcast_history").delete().eq("user_id", profileId);
  if (error) throw error;
}

export async function getConnectedAuthProviders() {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  const identities = data.user?.identities ?? [];
  const providers = identities.map((i) => i.provider).filter(Boolean) as string[];
  if (providers.length === 0) return ["email"];
  return [...new Set(providers)];
}

export async function deleteAllDownloads(profileId: string) {
  const rows = await getDownloadedSongs(profileId);
  for (const row of rows) {
    const localPath = row.local_path as string | null;
    if (!localPath) continue;
    try {
      const info = await FileSystem.getInfoAsync(localPath);
      if (info.exists) await FileSystem.deleteAsync(localPath, { idempotent: true });
    } catch {
      // Ignore file cleanup errors; DB cleanup still continues.
    }
  }
  const { error } = await supabase.from("downloaded_songs").delete().eq("user_id", profileId);
  if (error) throw error;
}

export async function clearMediaCache() {
  if (!FileSystem.cacheDirectory) return;
  const keyDirs = ["ExponentAsset-", "ReactNative-snapshot-image", "ImagePicker"];
  const listing = await FileSystem.readDirectoryAsync(FileSystem.cacheDirectory);
  for (const entry of listing) {
    if (!keyDirs.some((k) => entry.includes(k))) continue;
    const target = `${FileSystem.cacheDirectory}${entry}`;
    try {
      await FileSystem.deleteAsync(target, { idempotent: true });
    } catch {
      // Best effort cache clear.
    }
  }
}

export async function getHiddenArtistCount(profileId: string) {
  const { data, error } = await supabase
    .from("radio_feedback")
    .select("id", { count: "exact" })
    .eq("user_id", profileId)
    .eq("feedback", "hide_artist");
  if (error) throw error;
  return data?.length ?? 0;
}

export async function clearHiddenArtists(profileId: string) {
  const { error } = await supabase
    .from("radio_feedback")
    .delete()
    .eq("user_id", profileId)
    .eq("feedback", "hide_artist");
  if (error) throw error;
}

export async function getArtistVerificationStatus(profileId: string) {
  const { data } = await supabase.from("artist_profiles").select("status,verified").eq("id", profileId).maybeSingle();
  if (!data) return null;
  return data as { status: string; verified: boolean };
}

export async function getSubscriptionSummary(profileId: string) {
  const { data } = await supabase.from("subscriptions").select("plan,status").eq("user_id", profileId).maybeSingle();
  return data as { plan: string; status: string } | null;
}
