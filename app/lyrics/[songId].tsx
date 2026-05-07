import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { AppText } from "@/components/ui/AppText";
import { EmptyStateCard } from "@/components/ui/EmptyStateCard";
import { Screen } from "@/components/ui/Screen";
import { SkeletonBlock } from "@/components/ui/SkeletonBlock";
import { getSongLyrics, type SyncedLyricLine } from "@/features/music/lyricsService";
import { usePlayerStore } from "@/store/playerStore";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";
import { FONT } from "@/theme/typography";

export default function LyricsScreen() {
  const { songId } = useLocalSearchParams<{ songId: string }>();
  const router = useRouter();
  const currentSongTitle = usePlayerStore((s) => s.currentSongTitle);
  const playbackSeconds = usePlayerStore((s) => s.playbackSeconds);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const setPlaybackSeconds = usePlayerStore((s) => s.setPlaybackSeconds);
  const [status, setStatus] = useState("pending");
  const [lines, setLines] = useState<SyncedLyricLine[]>([]);
  const [booting, setBooting] = useState(true);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (!songId) return;
    void (async () => {
      setBooting(true);
      const lyrics = await getSongLyrics(songId);
      setStatus(lyrics.status);
      setLines(lyrics.lines);
      setBooting(false);
    })();
  }, [songId]);

  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(() => {
      setPlaybackSeconds(usePlayerStore.getState().playbackSeconds + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [isPlaying, setPlaybackSeconds]);

  const activeLineIndex = useMemo(
    () => lines.findIndex((line) => playbackSeconds >= line.start && playbackSeconds < line.end),
    [lines, playbackSeconds]
  );

  useEffect(() => {
    if (activeLineIndex < 0) return;
    scrollRef.current?.scrollTo({ y: Math.max(0, activeLineIndex * 44 - 120), animated: true });
  }, [activeLineIndex]);

  if (!songId) {
    return (
      <Screen>
        <EmptyStateCard title="Missing song" description="Navigate from the player so we know which lyric sheet to unlock." />
      </Screen>
    );
  }

  return (
    <Screen contentTopGap={spacing.artistScreenTopGap}>
      <LinearGradient colors={["#150800", "#050505"]} style={styles.hero}>
        <View style={styles.heroTop}>
          <Pressable accessibilityRole="button" onPress={() => router.back()} hitSlop={14} style={styles.iconBtn}>
            <Ionicons name="chevron-down" color={colors.text} size={24} />
          </Pressable>
          <Pressable accessibilityRole="button" onPress={() => router.push(`/song/${songId}`)} hitSlop={12} style={styles.iconBtn}>
            <Ionicons name="information-circle-outline" color={colors.text} size={22} />
          </Pressable>
        </View>
        <AppText variant="caption" secondary numberOfLines={1}>
          Now singing
        </AppText>
        <AppText variant="section" style={styles.heroTitle} numberOfLines={2}>
          {currentSongTitle || "Lyrics studio"}
        </AppText>
        <View style={styles.chip}>
          <Ionicons name="radio-outline" color={colors.primary} size={16} />
          <AppText variant="caption">Synced • {Math.floor(playbackSeconds / 60)}:{String(Math.floor(playbackSeconds % 60)).padStart(2, "0")}</AppText>
        </View>
      </LinearGradient>

      {booting ? (
        <View style={{ paddingTop: spacing.sectionGap, gap: 10 }}>
          <SkeletonBlock style={{ height: 18 }} />
          <SkeletonBlock style={{ height: 18 }} />
          <SkeletonBlock style={{ height: 18 }} />
        </View>
      ) : status === "processing" || status === "pending" ? (
        <EmptyStateCard
          icon="musical-notes-outline"
          title="Lyrics processing"
          description="Hang tight—we’re aligning words to your waveform in the lyric lab."
        />
      ) : status === "failed" || lines.length === 0 ? (
        <EmptyStateCard
          icon="alert-circle-outline"
          title="Lyrics not synced yet"
          description="Editors are either reviewing transcripts or awaiting a mastering pass."
        />
      ) : (
        <ScrollView ref={scrollRef} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: spacing.artistScrollBottomPadding, paddingTop: 12 }}>
          {lines.map((line, idx) => {
            const active = idx === activeLineIndex;
            return (
              <View key={`${line.start}-${idx}`} style={[styles.block, active && styles.blockActive]}>
                <AppText style={[styles.lineBase, active && styles.lineAccent]} muted={!active}>
                  {line.text}
                </AppText>
              </View>
            );
          })}
        </ScrollView>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    paddingHorizontal: spacing.screenHorizontal,
    paddingBottom: spacing.sectionGap * 2,
    borderWidth: 1,
    borderColor: colors.border
  },
  heroTop: { flexDirection: "row", justifyContent: "space-between", marginBottom: spacing.itemGap },
  iconBtn: { padding: 4 },
  heroTitle: { fontSize: 24, marginTop: 12 },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: colors.border,
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,106,0,0.06)"
  },
  block: {
    paddingVertical: 10,
    paddingHorizontal: spacing.screenHorizontal - 8,
    borderRadius: 16,
    marginBottom: 4
  },
  blockActive: { backgroundColor: "rgba(255,106,0,0.12)" },
  lineBase: { fontFamily: FONT.regular, fontSize: 17, lineHeight: 26, color: colors.textMuted },
  lineAccent: {
    fontFamily: FONT.bold,
    fontSize: 20,
    lineHeight: 30,
    color: colors.primary
  }
});
