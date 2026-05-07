import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Screen } from "@/components/ui/Screen";
import { AppText } from "@/components/ui/AppText";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { SettingsRow } from "@/components/ui/SettingsRow";
import { EmptyStateCard } from "@/components/ui/EmptyStateCard";
import { getMyProfile } from "@/features/auth/authService";
import { createPlaylist, getMyPlaylists } from "@/features/playlists/playlistService";
import { addAnnouncementComment, getAnnouncements } from "@/features/social/socialService";
import { useAppStore } from "@/store/appStore";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";
import { FONT } from "@/theme/typography";

export default function ListenerProfileScreen() {
  const router = useRouter();
  const setAccountView = useAppStore((s) => s.setAccountView);
  const [profileId, setProfileId] = useState("");
  const [displayName, setDisplayName] = useState("Listener");
  const [username, setUsername] = useState("@you");
  const [playlistName, setPlaylistName] = useState("");
  const [playlistCount, setPlaylistCount] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [announcements, setAnnouncements] = useState<Array<{ id: string; title: string; message: string }>>([]);

  useEffect(() => {
    void (async () => {
      const profile = await getMyProfile();
      if (!profile?.id) return;
      setProfileId(profile.id);
      setDisplayName(profile.display_name ?? profile.username ?? "Listener");
      setUsername(`@${profile.username ?? "you"}`);
      const playlists = await getMyPlaylists(profile.id);
      setPlaylistCount(playlists.filter((p) => !p.is_liked_songs).length);
      const rows = await getAnnouncements();
      setAnnouncements(rows as Array<{ id: string; title: string; message: string }>);
    })();
  }, []);

  const refreshPlaylists = async () => {
    if (!profileId) return;
    const playlists = await getMyPlaylists(profileId);
    setPlaylistCount(playlists.filter((p) => !p.is_liked_songs).length);
  };

  const submitPlaylist = async () => {
    if (!profileId || !playlistName.trim()) return;
    await createPlaylist(profileId, playlistName.trim(), "private");
    setPlaylistName("");
    setModalOpen(false);
    await refreshPlaylists();
  };

  return (
    <Screen edges={["top", "left", "right"]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: spacing.sectionGap * 4 }}>
        <View style={styles.hero}>
          <LinearGradientAvatar name={displayName} />
          <View style={{ flex: 1 }}>
            <AppText variant="screenTitle" style={styles.name}>
              {displayName}
            </AppText>
            <AppText secondary variant="caption">
              {username}
            </AppText>
            <View style={styles.badgeRow}>
              <View style={styles.badge}>
                <AppText variant="caption" style={styles.badgeText}>
                  Listener
                </AppText>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.heroActions}>
          <PrimaryButton title="New playlist" style={styles.heroBtn} onPress={() => setModalOpen(true)} />
          <Pressable style={styles.iconBtn} onPress={() => router.push("/settings")}>
            <Ionicons name="settings-outline" size={22} color={colors.text} />
          </Pressable>
        </View>

        <View style={styles.stats}>
          <StatPill label="Playlists" value={String(playlistCount)} />
          <StatPill label="Following" value="—" />
          <StatPill label="Fans" value="—" />
        </View>

        <SettingsRow
          icon="musical-notes-outline"
          title="My playlists"
          subtitle="Open quick creator"
          onPress={() => setModalOpen(true)}
        />
        <SettingsRow icon="time-outline" title="Recently played" onPress={() => router.push("/(listener)/(tabs)/home")} />
        <SettingsRow icon="heart-outline" title="Liked songs" onPress={() => router.push("/(listener)/(tabs)/library")} />
        <SettingsRow icon="mic-outline" title="Podcasts" onPress={() => router.push("/podcasts")} />
        <SettingsRow icon="notifications-outline" title="Notifications" onPress={() => router.push("/notifications")} />
        <SettingsRow icon="megaphone-outline" title="Announcements" subtitle="Official Audiomood news" onPress={() => router.push("/announcements")} />
        <SettingsRow icon="settings-outline" title="Settings & privacy" onPress={() => router.push("/settings")} />

        <SettingsRow
          icon="mic-circle-outline"
          title="Switch to Artist View"
          subtitle="Publish and analyze"
          onPress={() => {
            setAccountView("artist");
            router.replace("/(artist)/(tabs)/dashboard");
          }}
        />

        {announcements.length ? (
          <View style={{ marginTop: spacing.sectionGap }}>
            <AppText variant="section" style={{ marginBottom: spacing.itemGap }}>
              Admin notes
            </AppText>
            {announcements.map((a) => (
              <View key={a.id} style={styles.note}>
                <AppText variant="body">{a.title}</AppText>
                <AppText secondary variant="caption">
                  {a.message}
                </AppText>
                <Pressable
                  onPress={() => {
                    if (!profileId) return;
                    void addAnnouncementComment(a.id, profileId, "Thank you!");
                  }}
                >
                  <AppText variant="caption" style={{ color: colors.primary, marginTop: 8 }}>
                    Send quick reply
                  </AppText>
                </Pressable>
              </View>
            ))}
          </View>
        ) : (
          <EmptyStateCard icon="notifications-outline" title="No broadcasts yet" description="Admin bulletins arrive here instantly." />
        )}
      </ScrollView>

      <Modal visible={modalOpen} transparent animationType="fade" onRequestClose={() => setModalOpen(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setModalOpen(false)}>
          <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
            <AppText variant="section">New playlist</AppText>
            <AppText secondary variant="caption">
              Pick a cinematic name — you can tweak it anytime.
            </AppText>
            <TextInput
              placeholder="Midnight cardio, Afro focus..."
              placeholderTextColor={colors.textMuted}
              value={playlistName}
              onChangeText={setPlaylistName}
              style={styles.sheetInput}
            />
            <View style={{ flexDirection: "row", gap: 12 }}>
              <PrimaryButton variant="outline" title="Cancel" style={{ flex: 1 }} onPress={() => setModalOpen(false)} />
              <PrimaryButton title="Create" style={{ flex: 1 }} onPress={() => void submitPlaylist()} />
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </Screen>
  );
}

function LinearGradientAvatar({ name }: { name: string }) {
  return (
    <View style={styles.avatar}>
      <AppText variant="section" style={styles.avatarInitial}>
        {name.slice(0, 1).toUpperCase()}
      </AppText>
    </View>
  );
}

function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <AppText variant="section" style={{ fontSize: 20 }}>
        {value}
      </AppText>
      <AppText variant="caption" secondary>
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { flexDirection: "row", gap: 14, alignItems: "center" },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: colors.surfaceElevated,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: colors.border
  },
  avatarInitial: { fontSize: 32 },
  name: { fontSize: 28, marginTop: 4 },
  badgeRow: { flexDirection: "row", marginTop: 8 },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "rgba(255,106,0,0.15)"
  },
  badgeText: { color: colors.primary, fontFamily: FONT.semiBold, fontWeight: "600" },
  heroActions: { flexDirection: "row", alignItems: "center", gap: 12, marginTop: spacing.sectionGap },
  heroBtn: { flex: 1 },
  iconBtn: {
    width: 52,
    height: 52,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center"
  },
  stats: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: spacing.sectionGap,
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border
  },
  stat: { flex: 1, alignItems: "center", gap: 4 },
  note: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 10,
    gap: 6
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    padding: 24
  },
  sheet: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: 20,
    padding: 18,
    gap: 14,
    borderWidth: 1,
    borderColor: colors.border
  },
  sheetInput: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 14,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    fontFamily: FONT.regular
  }
});
