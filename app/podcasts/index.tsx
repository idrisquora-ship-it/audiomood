import { Link } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SectionCard } from "@/components/cards/SectionCard";
import { AppText } from "@/components/ui/AppText";
import { EmptyState } from "@/components/ui/EmptyState";
import { Screen } from "@/components/ui/Screen";
import { getPodcasts, type PodcastShow } from "@/features/podcasts/podcastService";
import { colors } from "@/theme/colors";

const tabs = ["For You", "Trending", "Categories", "New Episodes"];

export default function PodcastsHomeScreen() {
  const [activeTab, setActiveTab] = useState(tabs[0]);
  const [podcasts, setPodcasts] = useState<PodcastShow[]>([]);

  useEffect(() => {
    void getPodcasts(40).then(setPodcasts);
  }, []);

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ gap: 10, paddingBottom: 30 }}>
        <AppText style={styles.title}>Podcasts</AppText>
        <AppText muted>Browse shows, continue listening, and discover fresh episodes.</AppText>

        <View style={styles.tabRow}>
          {tabs.map((tab) => (
            <Pressable key={tab} style={[styles.tab, activeTab === tab && styles.tabActive]} onPress={() => setActiveTab(tab)}>
              <AppText muted>{tab}</AppText>
            </Pressable>
          ))}
        </View>

        <SectionCard title="Continue Listening">
          <AppText muted>Resumes from your last playback timestamp automatically.</AppText>
        </SectionCard>

        {podcasts.length === 0 ? <EmptyState title="No podcasts yet" subtitle="Creators will appear here." /> : null}
        {podcasts.map((podcast) => (
          <Link key={podcast.id} href={`/podcasts/${podcast.id}`} asChild>
            <Pressable style={styles.card}>
              <AppText>{podcast.title}</AppText>
              <AppText muted numberOfLines={2}>{podcast.description ?? "No description yet."}</AppText>
            </Pressable>
          </Link>
        ))}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 26, fontWeight: "800" },
  tabRow: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  tab: { backgroundColor: colors.card, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8 },
  tabActive: { backgroundColor: colors.primaryDark },
  card: { backgroundColor: colors.card, borderRadius: 14, padding: 12, gap: 6 }
});
