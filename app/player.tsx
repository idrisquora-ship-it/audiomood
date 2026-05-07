import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { AppText } from "@/components/ui/AppText";
import { Screen } from "@/components/ui/Screen";
import { getSongLyrics, type SyncedLyricLine } from "@/features/music/lyricsService";
import { usePlayerStore } from "@/store/playerStore";
import { colors } from "@/theme/colors";

export default function FullPlayerScreen() {
  const router = useRouter();
  const songTitle = usePlayerStore((s) => s.currentSongTitle) || "No song selected";
  const artistName = usePlayerStore((s) => s.currentArtistName) || "Unknown artist";
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const setIsPlaying = usePlayerStore((s) => s.setIsPlaying);
  const nextInQueue = usePlayerStore((s) => s.nextInQueue);
  const prevInQueue = usePlayerStore((s) => s.prevInQueue);
  const setNowPlaying = usePlayerStore((s) => s.setNowPlaying);
  const currentSongId = usePlayerStore((s) => s.currentSongId);
  const playbackSeconds = usePlayerStore((s) => s.playbackSeconds);
  const setPlaybackSeconds = usePlayerStore((s) => s.setPlaybackSeconds);
  const queue = usePlayerStore((s) => s.queueSongIds);
  const [repeat, setRepeat] = useState(false);
  const [shuffle, setShuffle] = useState(false);
  const [lyricsStatus, setLyricsStatus] = useState("pending");
  const [lyricsLines, setLyricsLines] = useState<SyncedLyricLine[]>([]);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(() => {
      setPlaybackSeconds(usePlayerStore.getState().playbackSeconds + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [isPlaying, setPlaybackSeconds]);

  useEffect(() => {
    if (!currentSongId) return;
    void (async () => {
      const result = await getSongLyrics(currentSongId);
      setLyricsStatus(result.status);
      setLyricsLines(result.lines);
    })();
  }, [currentSongId]);

  const activeLineIndex = useMemo(() => {
    return lyricsLines.findIndex((line) => playbackSeconds >= line.start && playbackSeconds < line.end);
  }, [lyricsLines, playbackSeconds]);

  useEffect(() => {
    if (activeLineIndex < 0) return;
    scrollRef.current?.scrollTo({ y: Math.max(0, activeLineIndex * 36 - 60), animated: true });
  }, [activeLineIndex]);

  return (
    <Screen>
      <View style={styles.root}>
        <View style={styles.cover} />
        <AppText style={styles.title}>{songTitle}</AppText>
        <AppText muted>{artistName}</AppText>
        <View style={styles.controls}>
          <Pressable
            style={styles.control}
            onPress={() => {
              const prev = prevInQueue();
              if (prev) setNowPlaying(prev, `Song ${prev.slice(0, 6)}`, "Queue Artist");
            }}
          >
            <AppText>Prev</AppText>
          </Pressable>
          <Pressable style={styles.control} onPress={() => setIsPlaying(!isPlaying)}>
            <AppText>{isPlaying ? "Pause" : "Play"}</AppText>
          </Pressable>
          <Pressable
            style={styles.control}
            onPress={() => {
              const next = nextInQueue();
              if (next) setNowPlaying(next, `Song ${next.slice(0, 6)}`, "Queue Artist");
            }}
          >
            <AppText>Next</AppText>
          </Pressable>
        </View>
        <View style={styles.controls}>
          <Pressable style={styles.tag} onPress={() => setShuffle(!shuffle)}>
            <AppText muted>{shuffle ? "Shuffle On" : "Shuffle Off"}</AppText>
          </Pressable>
          <Pressable style={styles.tag} onPress={() => setRepeat(!repeat)}>
            <AppText muted>{repeat ? "Repeat On" : "Repeat Off"}</AppText>
          </Pressable>
          <Pressable
            style={styles.tag}
            onPress={() => {
              if (!currentSongId) return;
              router.push(`/lyrics/${currentSongId}`);
            }}
          >
            <AppText muted>Lyrics</AppText>
          </Pressable>
          <Pressable style={styles.tag}>
            <AppText muted>Queue ({queue.length})</AppText>
          </Pressable>
          <View style={styles.tag}>
            <AppText muted>Current: {currentSongId ? currentSongId.slice(0, 8) : "-"}</AppText>
          </View>
          <View style={styles.tag}>
            <AppText muted>Time: {playbackSeconds}s</AppText>
          </View>
        </View>

        <View style={styles.lyricsCard}>
          <AppText style={styles.lyricsTitle}>Lyrics</AppText>
          {lyricsStatus === "processing" ? <AppText muted>Lyrics are being generated</AppText> : null}
          {lyricsStatus === "failed" ? <AppText muted>Lyrics not available yet</AppText> : null}
          <ScrollView ref={scrollRef} style={{ maxHeight: 180 }}>
            {lyricsLines.map((line, index) => (
              <AppText
                key={`${line.start}-${index}`}
                muted={index !== activeLineIndex}
                style={index === activeLineIndex ? styles.activeLine : undefined}
              >
                {line.text}
              </AppText>
            ))}
          </ScrollView>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, alignItems: "center", justifyContent: "center", gap: 14 },
  cover: { width: 260, height: 260, borderRadius: 18, backgroundColor: colors.cardAlt },
  title: { fontSize: 24, fontWeight: "700" },
  controls: { flexDirection: "row", gap: 8, flexWrap: "wrap", justifyContent: "center" },
  control: { backgroundColor: colors.primary, borderRadius: 12, paddingHorizontal: 18, paddingVertical: 10 },
  tag: { backgroundColor: colors.card, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8 },
  lyricsCard: {
    alignSelf: "stretch",
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 10,
    gap: 6
  },
  lyricsTitle: { fontWeight: "800" },
  activeLine: { color: colors.primary, fontWeight: "700" }
});
