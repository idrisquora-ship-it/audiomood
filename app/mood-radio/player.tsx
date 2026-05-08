import { useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { AppText } from "@/components/ui/AppText";
import { EmptyState } from "@/components/ui/EmptyState";
import { Screen } from "@/components/ui/Screen";
import { getMyProfile } from "@/features/auth/authService";
import {
  endMoodRadio,
  getRadioQueue,
  improveStation,
  markQueueItemPlayed,
  playRadioSong,
  submitRadioFeedback,
  type RadioQueueItem
} from "@/features/radio/moodRadioService";
import { useUiStore } from "@/store/uiStore";
import { colors } from "@/theme/colors";

export default function MoodRadioPlayerScreen() {
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>();
  const [profileId, setProfileId] = useState("");
  const [queue, setQueue] = useState<RadioQueueItem[]>([]);
  const [index, setIndex] = useState(0);
  const pushToast = useUiStore((s) => s.pushToast);

  useEffect(() => {
    if (!sessionId) return;
    void (async () => {
      const profile = await getMyProfile();
      if (profile?.id) setProfileId(profile.id);
      const rows = await getRadioQueue(sessionId);
      setQueue(rows);
    })();
  }, [sessionId]);

  const current = useMemo(() => queue[index] ?? null, [queue, index]);

  const feedback = async (type: "like" | "dislike" | "skip" | "save" | "hide_artist" | "replay") => {
    if (!sessionId || !profileId || !current) return;
    await submitRadioFeedback(sessionId, profileId, current.song_id, type);
    if (type === "skip") {
      setIndex((prev) => Math.min(prev + 1, queue.length - 1));
    }
    if (type === "like" || type === "replay") {
      await improveStation(sessionId, profileId);
      const rows = await getRadioQueue(sessionId);
      setQueue(rows);
    }
    pushToast(`Feedback sent: ${type}`, "success");
  };

  if (!current) {
    return (
      <Screen>
        <EmptyState title="No radio queue yet" subtitle="Start a station to generate your endless queue." />
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ gap: 10, paddingBottom: 24 }}>
        <AppText style={styles.title}>Mood Radio Player</AppText>
        <AppText muted>Session queue position: {index + 1} / {queue.length}</AppText>
        <AppText muted>Current song ID: {current.song_id.slice(0, 8)}...</AppText>

        <View style={styles.row}>
          <Pressable
            style={styles.btn}
            onPress={() => {
              if (!profileId) return;
              void markQueueItemPlayed(current.id);
              void playRadioSong(profileId, current.song_id);
              pushToast("Playing mood radio song", "success");
            }}
          >
            <AppText>Play</AppText>
          </Pressable>
          <Pressable style={styles.btn} onPress={() => void feedback("skip")}>
            <AppText>Skip</AppText>
          </Pressable>
          <Pressable style={styles.btn} onPress={() => void feedback("replay")}>
            <AppText>Replay</AppText>
          </Pressable>
        </View>

        <View style={styles.row}>
          <Pressable style={styles.btn} onPress={() => void feedback("like")}><AppText>Like</AppText></Pressable>
          <Pressable style={styles.btn} onPress={() => void feedback("dislike")}><AppText>Dislike</AppText></Pressable>
          <Pressable style={styles.btn} onPress={() => void feedback("save")}><AppText>Save</AppText></Pressable>
          <Pressable style={styles.btn} onPress={() => void feedback("hide_artist")}><AppText>Hide Artist</AppText></Pressable>
        </View>

        <Pressable
          style={styles.secondary}
          onPress={() => {
            if (!sessionId || !profileId) return;
            void improveStation(sessionId, profileId).then(async () => {
              const rows = await getRadioQueue(sessionId);
              setQueue(rows);
              pushToast("Station improved with fresh songs", "success");
            });
          }}
        >
          <AppText>Improve Station</AppText>
        </Pressable>

        <Pressable
          style={[styles.secondary, { borderColor: colors.danger }]}
          onPress={() => {
            if (!sessionId) return;
            void endMoodRadio(sessionId).then(() => pushToast("Mood radio session ended", "info"));
          }}
        >
          <AppText>End Session</AppText>
        </Pressable>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 24, fontWeight: "800" },
  row: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  btn: { backgroundColor: colors.primary, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10 },
  secondary: {
    backgroundColor: colors.card,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    paddingVertical: 10,
    alignItems: "center"
  }
});
