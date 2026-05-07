import { useEffect, useState } from "react";
import { router } from "expo-router";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LibraryRow } from "@/components/library/LibraryRow";
import { EmptyStateCard } from "@/components/ui/EmptyStateCard";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { Screen } from "@/components/ui/Screen";
import { AppHeader } from "@/components/ui/AppHeader";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { getMyProfile } from "@/features/auth/authService";
import { getMyPlaylists } from "@/features/playlists/playlistService";
import { supabase } from "@/lib/supabase";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";

export default function ListenerLibraryScreen() {
  const [likedPlaylistId, setLikedPlaylistId] = useState<string>("");
  const [counts, setCounts] = useState({
    liked: 0,
    playlists: 0,
    follows: 0,
    history: 0,
    podcasts: 0
  });

  useEffect(() => {
    void (async () => {
      const profile = await getMyProfile();
      if (!profile?.id) return;
      const playlists = await getMyPlaylists(profile.id);
      const likedPl = playlists.find((p) => p.is_liked_songs);
      setLikedPlaylistId(likedPl?.id ?? "");

      const [{ data: likedRows }, { data: followRows }, { data: historyRows }, podcastRes] = await Promise.all([
        supabase.from("liked_songs").select("id").eq("user_id", profile.id),
        supabase.from("follows").select("id").eq("follower_id", profile.id),
        supabase.from("listening_history").select("id").eq("user_id", profile.id),
        supabase.from("podcast_subscriptions").select("id").eq("user_id", profile.id)
      ]);

      const podcastCount = podcastRes.error ? 0 : (podcastRes.data ?? []).length;

      setCounts({
        liked: (likedRows ?? []).length,
        playlists: playlists.filter((p) => !p.is_liked_songs).length,
        follows: (followRows ?? []).length,
        history: (historyRows ?? []).length,
        podcasts: podcastCount
      });
    })();
  }, []);

  return (
    <Screen edges={["top", "left", "right"]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: spacing.sectionGap * 3 }}>
        <AppHeader
          title="Your Library"
          subtitle="Saves, crates, listening trail, and podcasts in one place."
          right={
            <View style={styles.actions}>
              <Pressable accessibilityLabel="Filter" style={styles.iconGhost}>
                <Ionicons name="options-outline" size={22} color={colors.text} />
              </Pressable>
              <Pressable
                accessibilityLabel="Create playlist"
                style={styles.iconGhost}
                onPress={() => router.push("/(listener)/(tabs)/profile")}
              >
                <Ionicons name="add" size={24} color={colors.primary} />
              </Pressable>
            </View>
          }
        />

        <LibraryRow
          icon="heart"
          title="Liked Songs"
          subtitle={`${counts.liked} saved tracks`}
          onPress={() => {
            if (likedPlaylistId) router.push(`/playlist/${likedPlaylistId}`);
            else router.push("/(listener)/(tabs)/discover");
          }}
        />
        <LibraryRow
          icon="musical-notes"
          title="My Playlists"
          subtitle={`${counts.playlists} playlists`}
          onPress={() => router.push("/(listener)/(tabs)/profile")}
        />
        <LibraryRow
          icon="people"
          title="Followed Artists"
          subtitle={`${counts.follows} creators`}
          onPress={() => router.push("/(listener)/(tabs)/discover")}
        />
        <LibraryRow
          icon="time-outline"
          title="Recently Played"
          subtitle={`${counts.history} taps`}
          onPress={() => router.push("/(listener)/(tabs)/home")}
        />
        <LibraryRow icon="mic-outline" title="Saved podcasts" subtitle={`${counts.podcasts} feeds`} onPress={() => router.push("/podcasts")} />
        <LibraryRow icon="download-outline" title="Downloads" subtitle="Offline locker" onPress={() => router.push("/settings")} />

        <SectionHeader title="Downloads" />
        <EmptyStateCard
          icon="download-outline"
          title="Downloads coming later"
          description="We are finishing the offline locker — stream everything free while we polish it."
        />

        <SectionHeader title="Playlists" />
        {counts.playlists === 0 ? (
          <EmptyStateCard
            icon="add-circle-outline"
            title="No playlists yet"
            description="Create your first playlist and start stacking your soundtracks."
            ctaLabel="Create playlist"
            onCtaPress={() => router.push("/(listener)/(tabs)/profile")}
          />
        ) : (
          <PrimaryButton variant="outline" title="Manage playlists" onPress={() => router.push("/(listener)/(tabs)/profile")} />
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  actions: { flexDirection: "row", gap: 8 },
  iconGhost: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center"
  }
});
