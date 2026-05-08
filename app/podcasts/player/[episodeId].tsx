import { useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { AppText } from "@/components/ui/AppText";
import { Screen } from "@/components/ui/Screen";
import { getMyProfile } from "@/features/auth/authService";
import {
  getEpisodeById,
  getPodcastHistory,
  updatePodcastProgress,
  type PodcastEpisode
} from "@/features/podcasts/podcastService";
import { colors } from "@/theme/colors";

const speeds = [0.5, 1, 1.25, 1.5, 2] as const;

export default function PodcastPlayerScreen() {
  const { episodeId } = useLocalSearchParams<{ episodeId: string }>();
  const [profileId, setProfileId] = useState("");
  const [episode, setEpisode] = useState<PodcastEpisode | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [speed, setSpeed] = useState<(typeof speeds)[number]>(1);
  const [sleepMinutes, setSleepMinutes] = useState<number | null>(null);

  useEffect(() => {
    if (!episodeId) return;
    void (async () => {
      const profile = await getMyProfile();
      if (profile?.id) setProfileId(profile.id);
      const loaded = await getEpisodeById(episodeId);
      setEpisode(loaded);
      if (profile?.id) {
        const history = await getPodcastHistory(profile.id, episodeId);
        setSeconds(history.playback_seconds ?? 0);
        const candidate = history.playback_speed as (typeof speeds)[number];
        if (speeds.includes(candidate)) setSpeed(candidate);
      }
    })();
  }, [episodeId]);

  useEffect(() => {
    if (!isPlaying) return;
    const t = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(t);
  }, [isPlaying]);

  useEffect(() => {
    if (!isPlaying || !sleepMinutes) return;
    const timer = setTimeout(() => setIsPlaying(false), sleepMinutes * 60_000);
    return () => clearTimeout(timer);
  }, [isPlaying, sleepMinutes]);

  useEffect(() => {
    if (!profileId || !episodeId) return;
    const timeout = setTimeout(() => {
      void updatePodcastProgress(profileId, episodeId, seconds, speed);
    }, 300);
    return () => clearTimeout(timeout);
  }, [profileId, episodeId, seconds, speed]);

  const timeLabel = useMemo(() => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }, [seconds]);

  if (!episode) {
    return (
      <Screen>
        <AppText>Loading podcast player...</AppText>
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={styles.root}>
        <AppText style={styles.title}>{episode.title}</AppText>
        <AppText muted>Resume supported: progress is saved at {timeLabel}</AppText>
        <AppText muted>Playback speed: {speed}x</AppText>

        <View style={styles.row}>
          <Pressable style={styles.btn} onPress={() => setSeconds((s) => Math.max(0, s - 15))}>
            <AppText>-15s</AppText>
          </Pressable>
          <Pressable style={styles.btn} onPress={() => setIsPlaying((v) => !v)}>
            <AppText>{isPlaying ? "Pause" : "Play"}</AppText>
          </Pressable>
          <Pressable style={styles.btn} onPress={() => setSeconds((s) => s + 30)}>
            <AppText>+30s</AppText>
          </Pressable>
        </View>

        <View style={styles.row}>
          <Pressable
            style={styles.chip}
            onPress={() => {
              const idx = speeds.indexOf(speed);
              setSpeed(speeds[(idx + 1) % speeds.length]);
            }}
          >
            <AppText muted>Speed</AppText>
          </Pressable>
          <Pressable style={styles.chip} onPress={() => setSleepMinutes(10)}>
            <AppText muted>Sleep 10m</AppText>
          </Pressable>
          <Pressable style={styles.chip} onPress={() => setSleepMinutes(30)}>
            <AppText muted>Sleep 30m</AppText>
          </Pressable>
          <Pressable style={styles.chip} onPress={() => setSleepMinutes(null)}>
            <AppText muted>Sleep Off</AppText>
          </Pressable>
        </View>

        <View style={styles.placeholder}>
          <AppText muted>
            Episode progress is synced to your profile automatically.
          </AppText>
          <AppText muted>
            Transcript: {episode.transcript_text ? "available" : "not available yet"}
          </AppText>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, gap: 12, justifyContent: "center" },
  title: { fontSize: 24, fontWeight: "800" },
  row: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  btn: { backgroundColor: colors.primary, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10 },
  chip: { backgroundColor: colors.card, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8 },
  placeholder: { backgroundColor: colors.card, borderRadius: 12, padding: 12, gap: 6 }
});
