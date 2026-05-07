import Constants from "expo-constants";
import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, TextInput, View } from "react-native";
import { SectionCard } from "@/components/cards/SectionCard";
import { AppHeader } from "@/components/ui/AppHeader";
import { AppText } from "@/components/ui/AppText";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { Screen } from "@/components/ui/Screen";
import { SettingsRow } from "@/components/ui/SettingsRow";
import { SettingsToggleRow } from "@/components/ui/SettingsToggleRow";
import { SkeletonBlock } from "@/components/ui/SkeletonBlock";
import { getMyProfile } from "@/features/auth/authService";
import {
  buildDefaultFullSettings,
  type AppSettings,
  type ArtistSettings,
  type FullSettingsBundle,
  getFullSettings,
  createSupportTicket,
  getDownloadedSongs,
  updateArtistSettings,
  updateLiveRoomSettings,
  updateMoodRadioSettings,
  updateNotificationSettings,
  updatePartySettings,
  updatePlaybackSettings,
  updatePodcastSettings,
  updatePrivacySettings,
  updateSettings
} from "@/features/settings/settingsService";
import { supabase } from "@/lib/supabase";
import { useAppStore } from "@/store/appStore";
import { usePlayerStore } from "@/store/playerStore";
import { useUiStore } from "@/store/uiStore";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";

const style = StyleSheet.create({
  profileRow: { flexDirection: "row", alignItems: "center", gap: 14 },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.surfaceElevated,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.border
  },
  badgeCapsule: {
    alignSelf: "flex-start",
    marginTop: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 100,
    backgroundColor: colors.backgroundAlt,
    borderWidth: 1,
    borderColor: colors.border
  },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 8, marginVertical: 4 },
  rowWrap: { gap: 6, flex: 1, marginRight: 8 },
  input: { backgroundColor: colors.surface, borderRadius: 10, color: colors.text, padding: 10, marginTop: 8 },
  badge: { backgroundColor: colors.surfaceElevated, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 }
});

export default function SettingsScreen() {
  const [profileId, setProfileId] = useState("");
  const [displayName, setDisplayName] = useState("Audiomood User");
  const [username, setUsername] = useState("user");
  const [role, setRole] = useState("listener");
  const [accountType, setAccountType] = useState<"listener" | "artist" | "both">("listener");
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<FullSettingsBundle | null>(() => buildDefaultFullSettings());
  const [downloadedCount, setDownloadedCount] = useState(0);
  const [supportSubject, setSupportSubject] = useState("");
  const [supportMessage, setSupportMessage] = useState("");
  const pushToast = useUiStore((s) => s.pushToast);
  const clearPlayer = usePlayerStore((s) => s.clearQueue);
  const setAccountView = useAppStore((s) => s.setAccountView);
  const appVersion =
    Constants.expoConfig?.version ??
    Constants.nativeAppVersion ??
    "—";

  const comingSoon = () => pushToast("Coming soon", "info");

  useEffect(() => {
    void (async () => {
      try {
        setLoading(true);
        const profile = await getMyProfile();
        if (!profile?.id) {
          setProfileId("");
          setSettings(buildDefaultFullSettings());
          setDownloadedCount(0);
          return;
        }
        setProfileId(profile.id);
        setDisplayName(profile.display_name ?? "Audiomood User");
        setUsername(profile.username ?? "user");
        setRole(profile.role ?? "listener");
        setAccountType((profile.account_type as "listener" | "artist" | "both") ?? "listener");
        const [loadedSettings, downloads] = await Promise.all([getFullSettings(profile.id), getDownloadedSongs(profile.id)]);
        setSettings(loadedSettings);
        setDownloadedCount(downloads.length);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const updateApp = async (partial: Partial<AppSettings>) => {
    if (!settings) return;
    const next = { ...settings, app: { ...settings.app, ...partial } };
    setSettings(next);
    if (!profileId) return;
    await updateSettings(profileId, partial);
  };

  const updateSection = async <K extends keyof FullSettingsBundle>(
    section: K,
    partial: Partial<FullSettingsBundle[K]>
  ) => {
    if (!settings) return;
    const next = { ...settings, [section]: { ...settings[section], ...partial } };
    setSettings(next);
    if (!profileId) return;
    if (section === "notification") await updateNotificationSettings(profileId, partial);
    if (section === "privacy") await updatePrivacySettings(profileId, partial);
    if (section === "playback") await updatePlaybackSettings(profileId, partial);
    if (section === "podcast") await updatePodcastSettings(profileId, partial);
    if (section === "moodRadio") await updateMoodRadioSettings(profileId, partial);
    if (section === "party") await updatePartySettings(profileId, partial);
    if (section === "liveRoom") await updateLiveRoomSettings(profileId, partial);
    if (section === "artist") await updateArtistSettings(profileId, partial as Partial<ArtistSettings>);
  };

  const offlineNote = useMemo(() => {
    if (!settings?.app.offline_mode_enabled) return "Offline mode disabled. App streams online.";
    return "Offline mode enabled. You can play only downloaded songs without data.";
  }, [settings?.app.offline_mode_enabled]);

  const cycle = <T extends string>(values: readonly T[], current: T): T => {
    const index = values.indexOf(current);
    return values[(index + 1) % values.length];
  };

  const logout = async () => {
    clearPlayer();
    await supabase.auth.signOut();
    router.replace("/(auth)/welcome");
  };

  if (loading || !settings) {
    return (
      <Screen>
        <AppText variant="section" style={{ marginBottom: 12 }}>
          Syncing preferences…
        </AppText>
        <AppText secondary variant="caption" style={{ marginBottom: 16 }}>
          Pulling your Audiomood controls from the cloud.
        </AppText>
        <SkeletonBlock style={{ height: 24, marginBottom: 12 }} />
        <SkeletonBlock style={{ height: 120, marginBottom: 12 }} />
        <SkeletonBlock style={{ height: 120, marginBottom: 12 }} />
        <SkeletonBlock style={{ height: 120 }} />
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={{ gap: spacing.sectionGap, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <AppHeader
          title="Settings"
          subtitle="Playback, recommendations, artist tools, and account controls."
        />

        <SectionCard title="Profile">
          <View style={style.profileRow}>
            <View style={style.avatar}>
              <AppText variant="section">
                {displayName.trim().slice(0, 1).toUpperCase() || "?"}
              </AppText>
            </View>
            <View style={{ flex: 1 }}>
              <AppText variant="section">{displayName}</AppText>
              <AppText secondary variant="caption">
                @{username}
              </AppText>
              <View style={style.badgeCapsule}>
                <AppText variant="caption">
                  Role: {role} · {accountType}
                </AppText>
              </View>
            </View>
          </View>
          {(accountType === "artist" || accountType === "both") ? (
            <PrimaryButton
              variant="outline"
              title="Switch to listener"
              onPress={() => {
                setAccountView("listener");
                router.replace("/(listener)/(tabs)/home");
              }}
              style={{ marginTop: 8 }}
            />
          ) : null}
          <PrimaryButton variant="outline" title="Edit profile" onPress={comingSoon} style={{ marginTop: 8 }} />
        </SectionCard>

        <SectionCard title="Account">
          <SettingsRow icon="person-outline" title="Edit profile" onPress={comingSoon} />
          <SettingsRow icon="key-outline" title="Change password" onPress={comingSoon} />
          <SettingsRow icon="mail-outline" title="Email & login method" onPress={comingSoon} />
          <SettingsRow icon="link-outline" title="Connected accounts" onPress={comingSoon} />
          <SettingsRow icon="mic-outline" title="Apply to become artist" onPress={comingSoon} />
          <SettingsRow icon="language-outline" title="Language" onPress={comingSoon} />
          <SettingsRow icon="trash-outline" title="Delete account" danger onPress={comingSoon} />
        </SectionCard>

        <SectionCard title="Playback">
          <SettingsToggleRow
            label="Autoplay recommendations"
            value={settings.playback.autoplay_recommendations}
            onValueChange={(v) => void updateSection("playback", { autoplay_recommendations: v })}
          />
          <SettingsToggleRow
            label="Gapless playback"
            value={settings.playback.gapless_playback}
            onValueChange={(v) => void updateSection("playback", { gapless_playback: v })}
          />
          <SettingsToggleRow
            label="Normalize volume"
            value={settings.playback.normalize_volume}
            onValueChange={(v) => void updateSection("playback", { normalize_volume: v })}
          />
          <SettingsToggleRow
            label="Auto play on bluetooth"
            value={settings.playback.auto_play_on_bluetooth}
            onValueChange={(v) => void updateSection("playback", { auto_play_on_bluetooth: v })}
          />
          <View style={style.row}>
            <AppText variant="body">Crossfade ({settings.playback.crossfade_seconds}s)</AppText>
            <Pressable
              style={style.badge}
              onPress={() =>
                void updateSection("playback", { crossfade_seconds: (settings.playback.crossfade_seconds + 2) % 14 })
              }
            >
              <AppText>Adjust</AppText>
            </Pressable>
          </View>
          <View style={style.row}>
            <AppText variant="body">Audio quality · {settings.playback.audio_quality}</AppText>
            <Pressable
              style={style.badge}
              onPress={() =>
                void updateSection("playback", {
                  audio_quality: cycle(["low", "normal", "high", "very_high"] as const, settings.playback.audio_quality)
                })
              }
            >
              <AppText>Change</AppText>
            </Pressable>
          </View>
          <SettingsToggleRow
            label="Explicit content filter"
            value={settings.playback.explicit_content_filter}
            onValueChange={(v) => void updateSection("playback", { explicit_content_filter: v })}
          />
          <SettingsRow icon="moon-outline" title="Sleep timer" onPress={comingSoon} />
        </SectionCard>

        <SectionCard title="Music & recommendations">
          <SettingsRow icon="musical-notes-outline" title="Favorite genres" onPress={comingSoon} />
          <SettingsRow icon="heart-outline" title="Favorite moods" onPress={comingSoon} />
          <SettingsRow icon="volume-mute-outline" title="Muted artists" onPress={comingSoon} />
          <SettingsRow icon="eye-off-outline" title="Hidden genres" onPress={comingSoon} />
          <SettingsToggleRow
            label="Improve recommendations"
            value={settings.app.improve_recommendations}
            onValueChange={(v) => void updateApp({ improve_recommendations: v })}
          />
          <SettingsToggleRow
            label="Private session"
            value={settings.app.private_session}
            onValueChange={(v) => void updateApp({ private_session: v })}
          />
          <SettingsRow icon="time-outline" title="Clear listening history" onPress={comingSoon} />
          <SettingsRow icon="search-outline" title="Clear search history" onPress={comingSoon} />
        </SectionCard>

        <SectionCard title="Podcast">
          <SettingsToggleRow
            label="Auto-download followed episodes"
            value={settings.podcast.auto_download_followed}
            onValueChange={(v) => void updateSection("podcast", { auto_download_followed: v })}
          />
          <SettingsToggleRow
            label="Save podcast progress"
            value={settings.podcast.save_progress}
            onValueChange={(v) => void updateSection("podcast", { save_progress: v })}
          />
          <SettingsToggleRow
            label="New episode notifications"
            value={settings.podcast.new_episode_notifications}
            onValueChange={(v) => void updateSection("podcast", { new_episode_notifications: v })}
          />
          <View style={style.row}>
            <AppText variant="body">Default speed · {settings.podcast.default_playback_speed}x</AppText>
            <Pressable
              style={style.badge}
              onPress={() => {
                const speeds = [0.5, 1, 1.25, 1.5, 2] as const;
                const current = speeds.indexOf(settings.podcast.default_playback_speed as (typeof speeds)[number]);
                const next = speeds[(current + 1) % speeds.length];
                void updateSection("podcast", { default_playback_speed: next });
              }}
            >
              <AppText>Change</AppText>
            </Pressable>
          </View>
          <SettingsRow
            icon="document-text-outline"
            title={`Transcript language · ${settings.podcast.transcript_language}`}
            onPress={comingSoon}
          />
          <SettingsRow icon="trash-outline" title="Clear podcast history" onPress={comingSoon} />
        </SectionCard>

        <SectionCard title="Mood radio">
          <View style={style.row}>
            <View style={style.rowWrap}>
              <AppText secondary variant="caption">
                Default mood: {settings.moodRadio.default_mood ?? "none"}
              </AppText>
              <AppText secondary variant="caption">
                Default genre: {settings.moodRadio.default_genre ?? "none"}
              </AppText>
            </View>
            <Pressable
              style={style.badge}
              onPress={() => {
                const moods = ["Chill", "Sad", "Romantic", "Workout", "Prayer", "Party", "Focus", "Late Night", "Motivation"] as const;
                const genres = ["Afrobeats", "Hip Hop", "R&B", "Gospel", "Pop", "Amapiano"] as const;
                const nextMood = cycle(moods, (settings.moodRadio.default_mood ?? "Chill") as (typeof moods)[number]);
                const nextGenre = cycle(genres, (settings.moodRadio.default_genre ?? "Afrobeats") as (typeof genres)[number]);
                void updateSection("moodRadio", { default_mood: nextMood, default_genre: nextGenre });
              }}
            >
              <AppText>Cycle</AppText>
            </Pressable>
          </View>
          <SettingsToggleRow
            label="Use listening history"
            value={settings.moodRadio.use_listening_history}
            onValueChange={(v) => void updateSection("moodRadio", { use_listening_history: v })}
          />
          <SettingsToggleRow
            label="Hide repeated songs"
            value={settings.moodRadio.hide_repeated_songs}
            onValueChange={(v) => void updateSection("moodRadio", { hide_repeated_songs: v })}
          />
          <SettingsRow icon="refresh-outline" title="Reset radio preferences" onPress={comingSoon} />
        </SectionCard>

        <SectionCard title="Listening parties">
          <SettingsToggleRow
            label="Allow friend invites"
            value={settings.party.allow_friend_invites}
            onValueChange={(v) => void updateSection("party", { allow_friend_invites: v })}
          />
          <SettingsToggleRow
            label="Allow followers to join public parties"
            value={settings.party.allow_follower_join_public}
            onValueChange={(v) => void updateSection("party", { allow_follower_join_public: v })}
          />
          <SettingsToggleRow
            label="Party notifications"
            value={settings.party.party_notifications}
            onValueChange={(v) => void updateSection("party", { party_notifications: v })}
          />
          <SettingsToggleRow
            label="Auto-sync playback"
            value={settings.party.auto_sync_playback}
            onValueChange={(v) => void updateSection("party", { auto_sync_playback: v })}
          />
          <SettingsToggleRow
            label="Allow song suggestions"
            value={settings.party.allow_song_suggestions}
            onValueChange={(v) => void updateSection("party", { allow_song_suggestions: v })}
          />
        </SectionCard>

        <SectionCard title="Live rooms">
          <SettingsToggleRow
            label="Allow room invites"
            value={settings.liveRoom.allow_room_invites}
            onValueChange={(v) => void updateSection("liveRoom", { allow_room_invites: v })}
          />
          <SettingsToggleRow
            label="Allow microphone requests"
            value={settings.liveRoom.allow_microphone_requests}
            onValueChange={(v) => void updateSection("liveRoom", { allow_microphone_requests: v })}
          />
          <SettingsToggleRow
            label="Room notifications"
            value={settings.liveRoom.room_notifications}
            onValueChange={(v) => void updateSection("liveRoom", { room_notifications: v })}
          />
          <SettingsToggleRow
            label="Show active status in rooms"
            value={settings.liveRoom.show_active_status}
            onValueChange={(v) => void updateSection("liveRoom", { show_active_status: v })}
          />
          <SettingsRow icon="hand-left-outline" title="Blocked room users" onPress={comingSoon} />
        </SectionCard>

        <SectionCard title="Notifications">
          <SettingsToggleRow
            label="All notifications"
            value={settings.notification.all_notifications}
            onValueChange={(v) => void updateSection("notification", { all_notifications: v })}
          />
          <SettingsToggleRow
            label="New songs from followed artists"
            value={settings.notification.new_song_release}
            onValueChange={(v) => void updateSection("notification", { new_song_release: v })}
          />
          <SettingsToggleRow
            label="Podcast new episodes"
            value={settings.notification.podcast_new_episode}
            onValueChange={(v) => void updateSection("notification", { podcast_new_episode: v })}
          />
          <SettingsToggleRow
            label="Playlist likes"
            value={settings.notification.playlist_likes}
            onValueChange={(v) => void updateSection("notification", { playlist_likes: v })}
          />
          <SettingsToggleRow
            label="New followers"
            value={settings.notification.new_followers}
            onValueChange={(v) => void updateSection("notification", { new_followers: v })}
          />
          <SettingsToggleRow
            label="Comments & replies"
            value={settings.notification.comments_replies}
            onValueChange={(v) => void updateSection("notification", { comments_replies: v })}
          />
          <SettingsToggleRow
            label="Listening party invites"
            value={settings.notification.party_invites}
            onValueChange={(v) => void updateSection("notification", { party_invites: v })}
          />
          <SettingsToggleRow
            label="Live room invites"
            value={settings.notification.live_room_invites}
            onValueChange={(v) => void updateSection("notification", { live_room_invites: v })}
          />
          <SettingsToggleRow
            label="Lyrics generated"
            value={settings.notification.lyrics_generated}
            onValueChange={(v) => void updateSection("notification", { lyrics_generated: v })}
          />
          <SettingsToggleRow
            label="Email notifications"
            value={settings.notification.email_notifications}
            onValueChange={(v) => void updateSection("notification", { email_notifications: v })}
          />
        </SectionCard>

        <SectionCard title="Privacy & safety">
          <SettingsToggleRow
            label="Private account"
            value={settings.privacy.private_account}
            onValueChange={(v) => void updateSection("privacy", { private_account: v })}
          />
          <SettingsToggleRow
            label="Show listening activity"
            value={settings.privacy.show_listening_activity}
            onValueChange={(v) => void updateSection("privacy", { show_listening_activity: v })}
          />
          <SettingsToggleRow
            label="Show public playlists"
            value={settings.privacy.show_public_playlists}
            onValueChange={(v) => void updateSection("privacy", { show_public_playlists: v })}
          />
          <SettingsRow icon="hand-left-outline" title="Blocked users" onPress={comingSoon} />
          <SettingsRow icon="flag-outline" title="Report a problem" onPress={comingSoon} />
          <SettingsRow icon="ribbon-outline" title="Copyright report" onPress={comingSoon} />
          <SettingsRow icon="shield-checkmark-outline" title="Two-factor authentication" subtitle="Coming later" onPress={comingSoon} />
        </SectionCard>

        <SectionCard title="Downloads">
          <SettingsToggleRow
            label="Offline mode"
            value={settings.app.offline_mode_enabled}
            onValueChange={(v) => void updateApp({ offline_mode_enabled: v })}
          />
          <SettingsToggleRow
            label="Download on Wi‑Fi only"
            value={settings.app.downloads_on_wifi_only}
            onValueChange={(v) => void updateApp({ downloads_on_wifi_only: v })}
          />
          <AppText secondary variant="caption">
            {offlineNote}
          </AppText>
          <AppText secondary variant="caption">
            {downloadedCount} downloaded songs
          </AppText>
          <SettingsRow icon="cloud-download-outline" title="Smart downloads" subtitle="Coming later" onPress={comingSoon} />
          <SettingsRow icon="trash-outline" title="Clear cache" onPress={comingSoon} />
          <SettingsRow icon="albums-outline" title="Delete downloads" onPress={comingSoon} />
        </SectionCard>

        {(accountType === "artist" || accountType === "both") ? (
          <SectionCard title="Artist tools">
            <SettingsRow icon="person-outline" title="Artist profile management" onPress={comingSoon} />
            <SettingsRow icon="cloud-upload-outline" title="Upload defaults" onPress={comingSoon} />
            <SettingsRow icon="checkmark-circle-outline" title="Verification status" onPress={comingSoon} />
            <SettingsToggleRow
              label="Lyrics auto-generation"
              value={settings.artist.lyrics_auto_generate}
              onValueChange={(v) => void updateSection("artist", { lyrics_auto_generate: v })}
            />
            <SettingsToggleRow
              label="Allow fan lyric suggestions"
              value={settings.artist.allow_fan_lyric_suggestions}
              onValueChange={(v) => void updateSection("artist", { allow_fan_lyric_suggestions: v })}
            />
            <SettingsToggleRow
              label="Analytics email reports"
              value={settings.artist.analytics_email_reports}
              onValueChange={(v) => void updateSection("artist", { analytics_email_reports: v })}
            />
            <SettingsToggleRow
              label="Fan messaging"
              value={settings.artist.fan_messaging}
              onValueChange={(v) => void updateSection("artist", { fan_messaging: v })}
            />
            <SettingsRow icon="megaphone-outline" title="Promotion settings" subtitle="Coming later" onPress={comingSoon} />
            <SettingsRow icon="wallet-outline" title="Payout settings" subtitle="Coming later" onPress={comingSoon} />
          </SectionCard>
        ) : null}

        <SectionCard title="Subscription">
          <SettingsRow icon="card-outline" title="Current plan" onPress={comingSoon} />
          <SettingsRow icon="star-outline" title="Upgrade to Premium" onPress={comingSoon} />
          <SettingsRow icon="mic-outline" title="Upgrade to Artist Pro" onPress={comingSoon} />
          <SettingsRow icon="receipt-outline" title="Billing history" subtitle="Coming later" onPress={comingSoon} />
          <SettingsRow icon="close-circle-outline" title="Cancel subscription" subtitle="Coming later" onPress={comingSoon} />
        </SectionCard>

        <SectionCard title="Support">
          <SettingsRow icon="help-circle-outline" title="Help center" onPress={comingSoon} />
          <SettingsRow icon="chatbubble-ellipses-outline" title="Contact support" onPress={comingSoon} />
          <SettingsRow icon="bug-outline" title="Report a bug" onPress={comingSoon} />
          <SettingsRow icon="bulb-outline" title="Request a feature" onPress={comingSoon} />
          <SettingsRow icon="people-outline" title="Community guidelines" onPress={comingSoon} />
          <TextInput
            style={style.input}
            placeholder="Support subject"
            placeholderTextColor={colors.textMuted}
            value={supportSubject}
            onChangeText={setSupportSubject}
          />
          <TextInput
            style={style.input}
            placeholder="Describe your issue"
            placeholderTextColor={colors.textMuted}
            value={supportMessage}
            onChangeText={setSupportMessage}
            multiline
          />
          <PrimaryButton
            title="Send to admin"
            onPress={() => {
              if (!profileId || !supportSubject.trim() || !supportMessage.trim()) return;
              void createSupportTicket(profileId, supportSubject.trim(), supportMessage.trim()).then(() => {
                setSupportSubject("");
                setSupportMessage("");
                pushToast("Support ticket sent to admin", "success");
              });
            }}
          />
        </SectionCard>

        <SectionCard title="About">
          <AppText variant="body">Version {appVersion}</AppText>
          <SettingsRow icon="document-text-outline" title="Terms of service" onPress={comingSoon} />
          <SettingsRow icon="lock-closed-outline" title="Privacy policy" onPress={comingSoon} />
          <SettingsRow icon="albums-outline" title="Copyright policy" onPress={comingSoon} />
          <SettingsRow icon="library-outline" title="Open source licenses" onPress={comingSoon} />
        </SectionCard>

        <SectionCard title="Sign out">
          <AppText secondary variant="caption">
            Stops playback and signs you out of this device.
          </AppText>
          <PrimaryButton
            variant="danger"
            title="Log out"
            onPress={() => {
              void logout().then(() => {
                pushToast("Logged out successfully", "success");
              });
            }}
          />
        </SectionCard>
      </ScrollView>
    </Screen>
  );
}
