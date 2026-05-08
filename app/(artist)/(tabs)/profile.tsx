import type { ReactNode } from "react";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, Share, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { ArtistScreen } from "@/components/artist/ArtistScreen";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { AppText } from "@/components/ui/AppText";
import { SettingsRow } from "@/components/ui/SettingsRow";
import { getMyProfile } from "@/features/auth/authService";
import { supabase } from "@/lib/supabase";
import { useAppStore } from "@/store/appStore";
import { useUiStore } from "@/store/uiStore";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";

export default function ArtistProfileScreen() {
  const router = useRouter();
  const setAccountView = useAppStore((s) => s.setAccountView);
  const pushToast = useUiStore((s) => s.pushToast);
  const [displayName, setDisplayName] = useState("Artist");
  const [handle, setHandle] = useState("you");
  const [followers, setFollowers] = useState(0);
  const [monthly, setMonthly] = useState(0);

  useEffect(() => {
    void (async () => {
      const authUser = (await supabase.auth.getUser()).data.user;
      const profile = await getMyProfile();
      if (!profile || !authUser) return;

      setDisplayName(profile.display_name ?? profile.username ?? "Artist");
      setHandle(profile.username ?? "you");

      const artistRow = await supabase.from("artist_profiles").select("id, monthly_listeners").eq("user_id", authUser.id).maybeSingle();
      const artistData = artistRow.data;
      if (!artistData) return;

      const followersRes = await supabase.from("follows").select("id").eq("artist_id", artistData.id);

      setFollowers((followersRes.data ?? []).length);
      setMonthly(artistData.monthly_listeners ?? 0);
    })();
  }, []);

  const bio = `Audiomood artist crafting premium releases for global fans.`;

  const completion = [
    { done: displayName !== "Artist", label: "Display name" },
    { done: true, label: "Profile photo" },
    { done: bio.length > 40, label: "Bio refinement" },
    { done: followers > 0, label: "Audience growth" },
    { done: monthly > 0, label: "First upload celebrated" }
  ];
  const doneCount = completion.filter((c) => c.done).length;

  const openProfileEditor = () => router.push("/settings");

  return (
    <ArtistScreen edges={["top", "left", "right"]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.banner}>
          <LinearGradient colors={["#331200", "#111"]} style={StyleSheet.absoluteFillObject} />
          <Pressable accessibilityRole="button" onPress={openProfileEditor}>
            <Ionicons name="camera-outline" size={22} color="#fff" style={{ opacity: 0.9 }} />
          </Pressable>
        </View>

        <View style={styles.identity}>
          <View style={styles.avatarRing}>
            <View style={styles.avatar}>
              <AppText variant="section" style={{ color: colors.primary }}>
                {(displayName || "?").slice(0, 1).toUpperCase()}
              </AppText>
            </View>
            <Pressable accessibilityLabel="verification" style={styles.verifiedBadge} onPress={() => router.push("/settings")}>
              <Ionicons name="checkmark-circle" size={18} color={colors.primary} />
            </Pressable>
          </View>
          <AppText variant="screenTitle" style={styles.identityName}>{displayName}</AppText>
          <AppText variant="caption" secondary>@{handle}</AppText>
          <AppText variant="caption" secondary style={{ marginTop: spacing.itemGap }}>
            {bio}
          </AppText>
          <View style={styles.followRow}>
            <View>
              <AppText variant="section">{followers}</AppText>
              <AppText variant="caption" secondary>followers</AppText>
            </View>
            <View>
              <AppText variant="section">{monthly}</AppText>
              <AppText variant="caption" secondary>monthly listeners</AppText>
            </View>
          </View>
          <View style={styles.heroActions}>
            <PrimaryButton title="Edit profile" style={styles.heroBtn} onPress={openProfileEditor} />
            <PrimaryButton variant="outline" title="Share" style={styles.heroBtn} onPress={() => void Share.share({ message: `${displayName} on Audiomood — @${handle}` })} />
          </View>
        </View>

        <Section title="Artist profile completeness">
          <View style={styles.progressCard}>
            <AppText variant="body">
              {doneCount}/{completion.length} checkpoints
            </AppText>
            <View style={styles.trackBg}>
              <View style={[styles.trackFill, { width: `${Math.max((doneCount / completion.length) * 100, 6)}%` }]} />
            </View>
            {completion.map((c) => (
              <View key={c.label} style={styles.checkLine}>
                <Ionicons name={c.done ? "checkmark-circle" : "ellipse-outline"} color={c.done ? colors.success : colors.textMuted} size={18} />
                <AppText variant="caption" secondary style={{ flex: 1 }}>
                  {c.label}
                </AppText>
              </View>
            ))}
          </View>
        </Section>

        <Section title="Shortcuts">
          <SettingsRow icon="albums-outline" title="Upload defaults" subtitle="Audio + metadata presets" onPress={() => router.push("/settings")} />
          <SettingsRow icon="document-text-outline" title="Lyrics settings" subtitle="Auto drafts + manual edits" onPress={() => router.push("/settings")} />
          <SettingsRow icon="stats-chart-outline" title="Analytics reports" onPress={() => router.push("/(artist)/(tabs)/analytics")} />
          <SettingsRow icon="ribbon-outline" title="Verification status" subtitle="Open Settings for real verification status" onPress={() => router.push("/settings")} />
        </Section>

        <Section title="Go live">
          <SettingsRow icon="settings-outline" title="Open settings" subtitle="Payments, moderation, playback" onPress={() => router.push("/settings")} />
          <SettingsRow icon="mic-outline" title="Create podcast show" onPress={() => router.push("/podcasts/create")} />
          <SettingsRow icon="radio-outline" title="Manage podcast episodes" onPress={() => router.push("/podcasts")} />
          <SettingsRow icon="notifications-outline" title="Notifications" onPress={() => router.push("/notifications")} />
          <SettingsRow icon="musical-notes-outline" title="Jump to uploads" subtitle="Draft new singles instantly" onPress={() => router.push("/(artist)/(tabs)/upload")} />
          <SettingsRow icon="albums-outline" title="Browse catalog" subtitle="Reorder albums / singles" onPress={() => router.push("/(artist)/(tabs)/music")} />
        </Section>

        <Section title="Audience">
          <SettingsRow
            icon="headset-outline"
            title="Switch to listener experience"
            subtitle="Preview storefront as a fan"
            onPress={() => {
              setAccountView("listener");
              router.replace("/(listener)/(tabs)/home");
            }}
          />
        </Section>
      </ScrollView>
    </ArtistScreen>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={styles.section}>
      <AppText variant="section" style={styles.sectionTitle}>
        {title}
      </AppText>
      <View style={styles.sectionInner}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: spacing.artistScrollBottomPadding },
  banner: {
    height: 120,
    borderRadius: 20,
    overflow: "hidden",
    alignItems: "flex-end",
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border
  },
  identity: {
    marginTop: -36,
    marginHorizontal: 4,
    padding: spacing.sectionGap,
    borderRadius: 24,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border
  },
  avatarRing: { alignSelf: "center", marginBottom: spacing.itemGap },
  avatar: {
    width: 78,
    height: 78,
    borderRadius: 39,
    backgroundColor: colors.surfaceElevated,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: colors.primary
  },
  verifiedBadge: { position: "absolute", bottom: -2, right: -2 },
  identityName: { textAlign: "center", alignSelf: "center" },
  followRow: { flexDirection: "row", gap: spacing.sectionGap * 3, justifyContent: "center", marginTop: spacing.sectionGap },
  heroActions: { flexDirection: "row", gap: 10, marginTop: spacing.sectionGap },
  heroBtn: { flex: 1 },
  progressCard: { gap: 10 },
  trackBg: {
    height: 6,
    borderRadius: 999,
    backgroundColor: colors.backgroundAlt,
    overflow: "hidden",
    marginTop: 8
  },
  trackFill: { height: "100%", backgroundColor: colors.primary },
  checkLine: { flexDirection: "row", alignItems: "center", gap: 10 },
  section: { marginTop: spacing.sectionGap * 2 },
  sectionTitle: { marginHorizontal: spacing.sectionGap },
  sectionInner: {
    marginTop: spacing.itemGap,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
    backgroundColor: colors.surface
  }
});
