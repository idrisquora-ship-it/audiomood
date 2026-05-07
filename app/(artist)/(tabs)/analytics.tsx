import { useCallback, useEffect, useMemo, useState } from "react";
import { Pressable, RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { AnalyticsChartCard } from "@/components/artist/AnalyticsChartCard";
import { ArtistScreen } from "@/components/artist/ArtistScreen";
import { StatCard } from "@/components/artist/StatCard";
import { MoodChip } from "@/components/music/MoodChip";
import { EmptyStateCard } from "@/components/ui/EmptyStateCard";
import { AppHeader } from "@/components/ui/AppHeader";
import { AppText } from "@/components/ui/AppText";
import { supabase } from "@/lib/supabase";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";

type Range = "7d" | "30d" | "90d" | "all";

export default function ArtistAnalyticsScreen() {
  const [range, setRange] = useState<Range>("30d");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [totals, setTotals] = useState({ plays: 0, likes: 0, skips: 0, playlistAdds: 0, followers: 0, comments: 0 });
  const [topSongs, setTopSongs] = useState<Array<{ id: string; title: string; play_count: number | null }>>([]);

  const load = useCallback(async () => {
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) return;
    const artist = await supabase.from("artist_profiles").select("id").eq("user_id", user.id).single();
    if (!artist.data?.id) return;

    const songsRes = await supabase.from("songs").select("id,title,play_count,like_count").eq("artist_id", artist.data.id);
    const songs = songsRes.data ?? [];

    const plays = songs.reduce((sum, s) => sum + (s.play_count ?? 0), 0);
    const likes = songs.reduce((sum, s) => sum + (s.like_count ?? 0), 0);

    const followerRows = await supabase.from("follows").select("id").eq("artist_id", artist.data.id);

    const songIds = songs.map((s) => s.id);
    const commentRows =
      songIds.length > 0
        ? await supabase.from("comments").select("id").in("song_id", songIds).limit(1000)
        : { data: [] as unknown[] };

    /** Skip / playlist deltas need server-side aggregates; RLS hides raw listener telemetry from artists today. */
    setTotals({
      plays,
      likes,
      skips: 0,
      playlistAdds: 0,
      followers: (followerRows.data ?? []).length,
      comments: (commentRows.data ?? []).length
    });

    const sortedHits = [...songs].sort((a, b) => (b.play_count ?? 0) - (a.play_count ?? 0)).slice(0, 5);
    setTopSongs(sortedHits.map((s) => ({ id: s.id, title: s.title, play_count: s.play_count })));
  }, []);

  useEffect(() => {
    void (async () => {
      try {
        setLoading(true);
        await load();
      } finally {
        setLoading(false);
      }
    })();
  }, [load]);

  const hasSignal = totals.plays > 0 || totals.likes > 0;

  const filterChips = useMemo(
    () => [{ id: "7d", label: "7 days" }, { id: "30d", label: "30 days" }, { id: "90d", label: "90 days" }, { id: "all", label: "All time" }] as const,
    []
  );

  if (loading) {
    return (
      <ArtistScreen edges={["top", "left", "right"]}>
        <EmptyStateCard title="Fetching analytics…" description="Collecting listens, chatter, and social proof." />
      </ArtistScreen>
    );
  }

  return (
    <ArtistScreen edges={["top", "left", "right"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.wrap}
        refreshControl={
          <RefreshControl
            tintColor={colors.primary}
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              void load().finally(() => setRefreshing(false));
            }}
          />
        }
      >
        <AppHeader title="Analytics" subtitle="Understand your audience momentum and playlist behavior." />

        <View style={styles.chips}>
          {filterChips.map((c) => (
            <MoodChip key={c.id} label={c.label} active={range === c.id} onPress={() => setRange(c.id)} />
          ))}
        </View>

        <AppText variant="caption" secondary style={{ marginTop: -4 }}>
          Detailed skip + playlist pacing unlocks alongside expanded listener analytics endpoints.
        </AppText>

        {!hasSignal ? (
          <EmptyStateCard
            icon="pulse-outline"
            title="Analytics will appear after listeners play your music."
            description="Trend lines, playlists, and skip maps appear once traction hits your catalog."
          />
        ) : null}

        <View style={styles.grid}>
          <StatCard icon="play-outline" label="Total plays" value={String(totals.plays)} />
          <StatCard icon="heart-outline" label="Total likes" value={String(totals.likes)} />
          <StatCard icon="shuffle-outline" label="Skips (soon)" value="—" delta="Coming with analytics API" />
          <StatCard icon="list-outline" label="Playlist adds (soon)" value="—" delta="Coming with analytics API" />
          <StatCard icon="people-outline" label="Followers" value={String(totals.followers)} />
          <StatCard icon="chatbubble-ellipses-outline" label="Comments" value={String(totals.comments)} />
        </View>

        <AnalyticsChartCard title="Plays over time" description="Granular timelines activate when streaming telemetry aggregates." />

        <View style={styles.listCard}>
          <AppText variant="section">Top songs ({range})</AppText>
          {topSongs.length === 0 ? (
            <AppText variant="caption" secondary>
              Momentum-heavy tracks rank here automatically once fans lock in repeats.
            </AppText>
          ) : (
            topSongs.map((s, idx) => (
              <Pressable key={s.id} style={styles.slot}>
                <AppText style={styles.rank}>#{idx + 1}</AppText>
                <View style={{ flex: 1 }}>
                  <AppText variant="body" numberOfLines={2}>{s.title}</AppText>
                  <AppText variant="caption" secondary>
                    {(s.play_count ?? 0).toLocaleString()} streams
                  </AppText>
                </View>
              </Pressable>
            ))
          )}
        </View>

        <AnalyticsChartCard title="Audience growth" description="Rolling follower deltas map here next." />
        <AnalyticsChartCard title="Engagement mix" description="Slices likes, saves, chatter, and replays once wired." />

        <View style={styles.splitRow}>
          <View style={[styles.mini, { flex: 1 }]}>
            <AnalyticsChartCard title="Geography heatmap" description="Regional demand preview." />
          </View>
          <View style={[styles.mini, { flex: 1 }]}>
            <AnalyticsChartCard title="Retention" description="Returning listener cohorts queued." />
          </View>
        </View>
      </ScrollView>
    </ArtistScreen>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.sectionGap, paddingBottom: spacing.artistScrollBottomPadding },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  listCard: {
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.sectionGap,
    backgroundColor: colors.surface,
    gap: 10
  },
  slot: { flexDirection: "row", gap: 12, paddingVertical: 10, alignItems: "center" },
  rank: { width: 28, fontSize: 16, fontWeight: "800", color: colors.primary },
  splitRow: { flexDirection: "row", gap: 10 },
  mini: { minWidth: 0 }
});
