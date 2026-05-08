import { useEffect, useMemo, useState } from "react";
import { Link } from "expo-router";
import { Pressable, ScrollView, StyleSheet, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { MoodChip } from "@/components/music/MoodChip";
import { Screen } from "@/components/ui/Screen";
import { AppText } from "@/components/ui/AppText";
import { AppHeader } from "@/components/ui/AppHeader";
import { SectionCard } from "@/components/cards/SectionCard";
import { supabase } from "@/lib/supabase";
import { searchPodcasts, type PodcastShow } from "@/features/podcasts/podcastService";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";
import { FONT } from "@/theme/typography";

const TABS = [
  {
    key: "songs",
    label: "Songs",
    synonyms: []
  },
  { key: "artists", label: "Artists", synonyms: [] },
  { key: "albums", label: "Albums", synonyms: [] },
  { key: "playlists", label: "Playlists", synonyms: [] },
  { key: "podcasts", label: "Podcasts", synonyms: [] },
  { key: "radio", label: "Radio", synonyms: [] },
  { key: "live", label: "Live", synonyms: [] },
  { key: "genres", label: "Genres", synonyms: [] },
  { key: "moods", label: "Moods", synonyms: [] },
  { key: "users", label: "Users", synonyms: [] }
] as const;

export default function ListenerSearchScreen() {
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<(typeof TABS)[number]["key"]>("songs");
  const [podcastResults, setPodcastResults] = useState<PodcastShow[]>([]);
  const [genreNames, setGenreNames] = useState<string[]>([]);
  const [moodNames, setMoodNames] = useState<string[]>([]);

  useEffect(() => {
    void (async () => {
      const [gRes, mRes] = await Promise.all([
        supabase.from("genres").select("name").order("name").limit(24),
        supabase.from("moods").select("name").order("name").limit(24)
      ]);
      setGenreNames((gRes.data ?? []).map((r: { name: string }) => r.name).filter(Boolean));
      setMoodNames((mRes.data ?? []).map((r: { name: string }) => r.name).filter(Boolean));
    })();
  }, []);

  useEffect(() => {
    if (tab !== "podcasts") return;
    if (!query.trim()) {
      setPodcastResults([]);
      return;
    }
    const t = setTimeout(() => void searchPodcasts(query).then(setPodcastResults), 250);
    return () => clearTimeout(t);
  }, [query, tab]);

  const recents = useMemo(() => ["Afrobeats", "Late Night", "Amapiano mix"], []);

  return (
    <Screen edges={["top", "left", "right"]}>
      <AppHeader title="Search" subtitle="Dig into moods, catalogs, creators, rooms, and podcasts." />

      <View style={styles.searchRow}>
        <Ionicons name="search-outline" size={22} color={colors.textMuted} />
        <TextInput
          placeholder="Search songs, artists, albums..."
          placeholderTextColor={colors.textMuted}
          style={styles.input}
          value={query}
          onChangeText={setQuery}
          autoCorrect={false}
        />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chips}>
        {TABS.map((t) => (
          <MoodChip
            key={t.key}
            label={t.label}
            active={tab === t.key}
            onPress={() => setTab(t.key)}
          />
        ))}
      </ScrollView>

      <ScrollView contentContainerStyle={{ gap: spacing.sectionGap, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <SectionCard title="Recent Searches">
          <View style={styles.recentWrap}>
            {recents.map((r) => (
              <Pressable key={r} style={styles.recentChip}>
                <AppText variant="caption" secondary>
                  {r}
                </AppText>
              </Pressable>
            ))}
          </View>
        </SectionCard>

        <SectionCard title="Trending searches">
          <AppText secondary variant="body">
            Top charts and moods are bubbling up globally — curated picks land here shortly.
          </AppText>
        </SectionCard>

        <SectionHeaderLocal title="Browse by mood" />
        <View style={styles.grid}>
          {(moodNames.length ? moodNames.slice(0, 12) : ["Add moods via Supabase"]).map((m) => (
            <BrowseTile key={m} title={m} tag="Mood" />
          ))}
        </View>

        <SectionHeaderLocal title="Browse by genre" />
        <View style={styles.grid}>
          {(genreNames.length ? genreNames.slice(0, 12) : ["Add genres via Supabase"]).map((g) => (
            <BrowseTile key={g} title={g} tag="Genre" />
          ))}
        </View>

        {tab === "podcasts" ? (
          <SectionCard title="Podcasts">
            <Link href="/podcasts" asChild>
              <Pressable style={styles.linkRow}>
                <AppText variant="body" style={styles.bold}>
                  Open Podcasts Hub
                </AppText>
                <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
              </Pressable>
            </Link>
            {podcastResults.length === 0 ? (
              <AppText secondary variant="caption">
                Type above to locate a show title or creator.
              </AppText>
            ) : null}
            {podcastResults.map((podcast) => (
              <Link key={podcast.id} href={`/podcasts/${podcast.id}`} asChild>
                <Pressable style={styles.podcastHit}>
                  <AppText variant="body">{podcast.title}</AppText>
                  <AppText secondary variant="caption" numberOfLines={2}>
                    {podcast.description ?? "Listen to episodes"}
                  </AppText>
                </Pressable>
              </Link>
            ))}
          </SectionCard>
        ) : null}

        {tab === "radio" ? (
          <SectionCard title="Mood Radio">
            <Link href="/mood-radio" asChild>
              <Pressable style={styles.linkRow}>
                <AppText variant="body" style={styles.bold}>
                  Jump into Mood Radio
                </AppText>
                <Ionicons name="chevron-forward" size={18} color={colors.primary} />
              </Pressable>
            </Link>
            <AppText secondary variant="caption">
              Stations adapt as you thumbs-up tracks and moods.
            </AppText>
          </SectionCard>
        ) : null}

        {tab === "live" ? (
          <SectionCard title="Live rooms">
            <Link href="/live-rooms" asChild>
              <Pressable style={styles.linkRow}>
                <AppText variant="body" style={styles.bold}>
                  Explore live experiences
                </AppText>
                <Ionicons name="mic-outline" size={20} color={colors.primary} />
              </Pressable>
            </Link>
          </SectionCard>
        ) : null}
      </ScrollView>
    </Screen>
  );
}

function SectionHeaderLocal({ title }: { title: string }) {
  return (
    <AppText variant="section" style={{ fontSize: 20, marginTop: 8 }}>
      {title}
    </AppText>
  );
}

function BrowseTile({ title, tag }: { title: string; tag: string }) {
  return (
    <View style={styles.tile}>
      <AppText variant="caption" secondary>
        {tag}
      </AppText>
      <AppText variant="body" style={styles.bold}>
        {title}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: colors.surface,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.itemGap
  },
  input: { flex: 1, fontSize: 15, fontFamily: FONT.regular, color: colors.text },
  chips: { marginBottom: spacing.sectionGap, maxHeight: 44 },
  recentWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  recentChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: colors.surfaceElevated
  },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  tile: {
    width: "48%",
    flexGrow: 1,
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border
  },
  bold: { fontWeight: "700" },
  linkRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
    gap: 8
  },
  podcastHit: {
    marginTop: 10,
    backgroundColor: colors.surfaceElevated,
    borderRadius: 12,
    padding: 12,
    gap: 4,
    borderWidth: 1,
    borderColor: colors.border
  }
});
