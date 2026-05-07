import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { ArtistScreen } from "@/components/artist/ArtistScreen";
import { ArtistHeader } from "@/components/artist/ArtistHeader";
import { DashboardActionCard } from "@/components/artist/DashboardActionCard";
import { StatCard } from "@/components/artist/StatCard";
import { ArtistSongCard } from "@/components/artist/ArtistSongCard";
import { mapDbSongStatus } from "@/components/artist/SongStatusBadge";
import { EmptyStateCard } from "@/components/ui/EmptyStateCard";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { SkeletonBlock } from "@/components/ui/SkeletonBlock";
import { AppText } from "@/components/ui/AppText";
import { SectionCard } from "@/components/cards/SectionCard";
import { useUiStore } from "@/store/uiStore";
import { supabase } from "@/lib/supabase";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";

type SongRow = {
  id: string;
  title: string;
  status: string;
  play_count: number | null;
  like_count: number | null;
  created_at: string;
};

type CommentRow = { body: string; created_at: string; song_id: string };

export default function ArtistDashboardScreen() {
  const router = useRouter();
  const pushToast = useUiStore((s) => s.pushToast);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [artistName, setArtistName] = useState("Artist");
  const [artistId, setArtistId] = useState("");
  const [stats, setStats] = useState({ plays: "0", likes: "0", followers: "0", monthlyListeners: "0" });
  const [songs, setSongs] = useState<SongRow[]>([]);
  const [pending, setPending] = useState<SongRow[]>([]);
  const [comments, setComments] = useState<CommentRow[]>([]);

  const load = useCallback(async () => {
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) return;
    const artist = await supabase.from("artist_profiles").select("id, artist_name, monthly_listeners").eq("user_id", user.id).single();
    if (!artist.data?.id) return;
    const aid = artist.data.id;
    setArtistId(aid);
    setArtistName(artist.data.artist_name ?? "Artist");

    const [songsRes, followersRes] = await Promise.all([
      supabase
        .from("songs")
        .select("id,title,status,play_count,like_count,created_at")
        .eq("artist_id", aid)
        .order("created_at", { ascending: false }),
      supabase.from("follows").select("id").eq("artist_id", aid)
    ]);
    const list = (songsRes.data ?? []) as SongRow[];
    setSongs(list);
    const totalPlays = list.reduce((s, x) => s + (x.play_count ?? 0), 0);
    const totalLikes = list.reduce((s, x) => s + (x.like_count ?? 0), 0);
    setStats({
      plays: totalPlays.toLocaleString(),
      likes: totalLikes.toLocaleString(),
      followers: String((followersRes.data ?? []).length),
      monthlyListeners: String(artist.data.monthly_listeners ?? 0)
    });
    const pend = list.filter((s) =>
      ["draft", "uploading", "processing_lyrics", "pending_review"].includes(s.status)
    );
    setPending(pend);

    const songIds = list.map((s) => s.id);
    let recentComments: CommentRow[] = [];
    if (songIds.length > 0) {
      const cRes = await supabase
        .from("comments")
        .select("body,created_at,song_id")
        .in("song_id", songIds)
        .order("created_at", { ascending: false })
        .limit(6);
      recentComments = (cRes.data ?? []) as CommentRow[];
    }
    setComments(recentComments);
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

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await load();
    } finally {
      setRefreshing(false);
    }
  }, [load]);

  const sortedByPlay = [...songs].sort((a, b) => (b.play_count ?? 0) - (a.play_count ?? 0));
  const topThree = sortedByPlay.slice(0, 3);
  const latest = songs[0] ?? null;
  const followerCount = Number(stats.followers);
  const activityEmpty = followerCount === 0 && comments.length === 0;

  if (loading) {
    return (
      <ArtistScreen edges={["top", "left", "right"]}>
        <SkeletonBlock style={{ height: 36, marginBottom: 12 }} />
        <SkeletonBlock style={{ height: 120, marginBottom: 14 }} />
        <View style={styles.grid}>
          {[1, 2, 3, 4].map((i) => (
            <SkeletonBlock key={i} style={{ width: "48%", height: 120, flexGrow: 1 }} />
          ))}
        </View>
      </ArtistScreen>
    );
  }

  return (
    <ArtistScreen edges={["top", "left", "right"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void onRefresh()} tintColor={colors.primary} />}
      >
        <ArtistHeader
          title={`Welcome back, ${artistName.split(" ")[0] ?? "Artist"}`}
          subtitle="Manage your music and grow your audience."
          avatarFallback={artistName}
          onPressNotification={() => pushToast("No new alerts right now", "info")}
        />

        <DashboardActionCard
          title="Ready to release your next track?"
          subtitle="Upload music, generate lyrics where enabled, and send your release through review."
          ctaLabel="Upload song"
          onCtaPress={() => router.push("/(artist)/(tabs)/upload")}
        />

        <View style={styles.grid}>
          <StatCard icon="play-outline" label="Total plays" value={stats.plays} />
          <StatCard icon="heart-outline" label="Total likes" value={stats.likes} />
          <StatCard icon="people-outline" label="Followers" value={stats.followers} />
          <StatCard icon="trending-up-outline" label="Monthly listeners" value={stats.monthlyListeners} />
        </View>

        <SectionCard title="Latest song performance">
          {latest ? (
            <>
              <AppText variant="body">Your newest release is shaping listener habits.</AppText>
              <View style={{ marginTop: spacing.itemGap }}>
                <ArtistSongCard
                  title={latest.title}
                  status={mapDbSongStatus(latest.status)}
                  plays={latest.play_count ?? 0}
                  likes={latest.like_count ?? 0}
                  accentSeed={latest.title.length}
                />
              </View>
              <PrimaryButton
                variant="outline"
                title="View analytics"
                onPress={() => router.push("/(artist)/(tabs)/analytics")}
                style={{ marginTop: 12 }}
              />
            </>
          ) : (
            <EmptyStateCard
              icon="cloud-upload-outline"
              title="No releases yet"
              description="Fan activity starts with your first upload. Share a mastered single and we’ll help you polish lyrics."
              ctaLabel="Upload your first song"
              onCtaPress={() => router.push("/(artist)/(tabs)/upload")}
            />
          )}
        </SectionCard>

        <SectionCard title="Pending reviews">
          {pending.length === 0 ? (
            <AppText secondary variant="body">
              No uploads waiting for moderator review — you’re caught up!
            </AppText>
          ) : (
            <View style={{ gap: spacing.itemGap }}>
              {pending.slice(0, 5).map((s) => (
                <ArtistSongCard
                  key={s.id}
                  title={s.title}
                  status={mapDbSongStatus(s.status)}
                  plays={s.play_count ?? 0}
                  likes={s.like_count ?? 0}
                  accentSeed={s.title.length}
                  onMenuPress={() => router.push("/(artist)/(tabs)/music")}
                />
              ))}
            </View>
          )}
        </SectionCard>

        <SectionCard title="Top songs">
          {topThree.length === 0 ? (
            <AppText secondary variant="body">
              Once listeners stream your tracks, your best performers will appear here with live play counts.
            </AppText>
          ) : (
            <View style={{ gap: spacing.itemGap }}>
              {topThree.map((s, idx) => (
                <View key={s.id} style={styles.rankRow}>
                  <AppText variant="section" style={styles.rank}>
                    #{idx + 1}
                  </AppText>
                  <View style={{ flex: 1 }}>
                    <ArtistSongCard
                      title={s.title}
                      status={mapDbSongStatus(s.status)}
                      plays={s.play_count ?? 0}
                      likes={s.like_count ?? 0}
                      accentSeed={s.title.length + idx}
                    />
                  </View>
                </View>
              ))}
            </View>
          )}
        </SectionCard>

        <SectionCard title="Fan activity">
          {activityEmpty ? (
            <AppText secondary variant="body">
              Fan activity will appear when listeners follow your profile, drop comments, or save your playlists.
            </AppText>
          ) : (
            <AppText secondary variant="body">
              You have {followerCount} follower{followerCount === 1 ? "" : "s"} and {comments.length}{" "}
              recent interaction{comments.length === 1 ? "" : "s"} on comments.
            </AppText>
          )}
        </SectionCard>

        <SectionCard title="Recent comments">
          {comments.length === 0 ? (
            <AppText secondary variant="body">
              Comments from fans surface here as soon as someone engages with your uploads.
            </AppText>
          ) : (
            <View style={{ gap: spacing.itemGap }}>
              {comments.map((c, i) => (
                <View key={`${c.song_id}-${i}`} style={styles.commentBubble}>
                  <AppText variant="caption" style={{ color: colors.primary }}>
                    {(songs.find((x) => x.id === c.song_id)?.title ?? "Track").slice(0, 42)}
                  </AppText>
                  <AppText variant="body" style={{ marginTop: 6 }}>
                    {c.body}
                  </AppText>
                  <AppText variant="caption" secondary style={{ marginTop: 6 }}>
                    {new Date(c.created_at).toLocaleString()}
                  </AppText>
                </View>
              ))}
            </View>
          )}
        </SectionCard>

        <SectionCard title="Moderation inbox">
          <AppText secondary variant="body">
            Open user reports affecting your community are moderated by Audiomood admins alongside your uploads.
          </AppText>
        </SectionCard>

        <SectionCard title="Artist tips">
          <AppText variant="body">Share your Audiomood artist profile wherever you promo new drops.</AppText>
          <PrimaryButton variant="outline" title="Share profile soon" style={{ marginTop: 14 }} onPress={() => router.push("/(artist)/(tabs)/profile")} />
        </SectionCard>
      </ScrollView>
    </ArtistScreen>
  );
}

const styles = StyleSheet.create({
  content: { gap: spacing.sectionGap, paddingBottom: spacing.artistScrollBottomPadding },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  rankRow: { flexDirection: "row", gap: 10, alignItems: "center" },
  rank: { width: 32, fontSize: 18, color: colors.primary },
  commentBubble: {
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceElevated
  }
});
