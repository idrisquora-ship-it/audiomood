import { Link, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SectionCard } from "@/components/cards/SectionCard";
import { AppText } from "@/components/ui/AppText";
import { EmptyState } from "@/components/ui/EmptyState";
import { Screen } from "@/components/ui/Screen";
import { getMyProfile } from "@/features/auth/authService";
import {
  followPodcast,
  getPodcastById,
  getPodcastEpisodes,
  type PodcastEpisode,
  type PodcastShow
} from "@/features/podcasts/podcastService";
import { useUiStore } from "@/store/uiStore";
import { colors } from "@/theme/colors";

export default function PodcastDetailsScreen() {
  const { podcastId } = useLocalSearchParams<{ podcastId: string }>();
  const [profileId, setProfileId] = useState("");
  const [show, setShow] = useState<PodcastShow | null>(null);
  const [episodes, setEpisodes] = useState<PodcastEpisode[]>([]);
  const pushToast = useUiStore((s) => s.pushToast);

  useEffect(() => {
    if (!podcastId) return;
    void (async () => {
      const profile = await getMyProfile();
      if (profile?.id) setProfileId(profile.id);
      const [loadedShow, loadedEpisodes] = await Promise.all([getPodcastById(podcastId), getPodcastEpisodes(podcastId)]);
      setShow(loadedShow);
      setEpisodes(loadedEpisodes);
    })();
  }, [podcastId]);

  if (!show) {
    return (
      <Screen>
        <EmptyState title="Loading podcast..." subtitle="Fetching podcast details." />
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ gap: 10, paddingBottom: 24 }}>
        <AppText style={styles.title}>{show.title}</AppText>
        <AppText muted>{show.description ?? "No show description yet."}</AppText>

        <View style={styles.row}>
          <Pressable
            style={styles.btn}
            onPress={() => {
              if (!profileId) return;
              void followPodcast(profileId, show.id).then(() => pushToast("Podcast followed", "success"));
            }}
          >
            <AppText>Follow Podcast</AppText>
          </Pressable>
          <Link href="/podcasts/create" asChild>
            <Pressable style={styles.btn}>
              <AppText>Create Show</AppText>
            </Pressable>
          </Link>
          <Link href={`/podcasts/upload-episode?podcastId=${show.id}`} asChild>
            <Pressable style={styles.btn}>
              <AppText>Upload Episode</AppText>
            </Pressable>
          </Link>
        </View>

        <SectionCard title="Episodes">
          {episodes.length === 0 ? <AppText muted>No episodes published yet.</AppText> : null}
          {episodes.map((episode) => (
            <Link key={episode.id} href={`/podcasts/episode/${episode.id}`} asChild>
              <Pressable style={styles.episodeCard}>
                <AppText>{episode.title}</AppText>
                <AppText muted numberOfLines={2}>{episode.description ?? "No description yet."}</AppText>
              </Pressable>
            </Link>
          ))}
        </SectionCard>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 24, fontWeight: "800" },
  row: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  btn: { backgroundColor: colors.primary, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10 },
  episodeCard: { backgroundColor: colors.cardAlt, borderRadius: 12, padding: 10, marginTop: 8, gap: 4 }
});
