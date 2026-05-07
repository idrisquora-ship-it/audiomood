import { Link, router } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { AppText } from "@/components/ui/AppText";
import { Screen } from "@/components/ui/Screen";
import { getMyProfile } from "@/features/auth/authService";
import { moodOptions, startMoodRadio } from "@/features/radio/moodRadioService";
import { useUiStore } from "@/store/uiStore";
import { colors } from "@/theme/colors";

const genres = ["Afrobeats", "Hip Hop", "R&B", "Gospel", "Pop", "Amapiano"] as const;

export default function MoodRadioScreen() {
  const [selectedMood, setSelectedMood] = useState<(typeof moodOptions)[number]>("Chill");
  const [selectedGenre, setSelectedGenre] = useState<(typeof genres)[number]>("Afrobeats");
  const pushToast = useUiStore((s) => s.pushToast);

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ gap: 12, paddingBottom: 24 }}>
        <AppText style={styles.title}>AI Mood Radio</AppText>
        <AppText muted>Endless smart station based on your mood, genre, likes, skips, and follows.</AppText>

        <View style={styles.row}>
          {moodOptions.map((mood) => (
            <Pressable
              key={mood}
              onPress={() => setSelectedMood(mood)}
              style={[styles.chip, selectedMood === mood && styles.active]}
            >
              <AppText muted>{mood}</AppText>
            </Pressable>
          ))}
        </View>

        <View style={styles.row}>
          {genres.map((genre) => (
            <Pressable
              key={genre}
              onPress={() => setSelectedGenre(genre)}
              style={[styles.chip, selectedGenre === genre && styles.active]}
            >
              <AppText muted>{genre}</AppText>
            </Pressable>
          ))}
        </View>

        <Pressable
          style={styles.button}
          onPress={() => {
            void (async () => {
              const profile = await getMyProfile();
              if (!profile?.id) return;
              const session = await startMoodRadio({
                userId: profile.id,
                mood: selectedMood,
                genre: selectedGenre
              });
              pushToast("Mood radio started", "success");
              router.push(`/mood-radio/player?sessionId=${session.id}`);
            })();
          }}
        >
          <AppText>Start Mood Radio</AppText>
        </Pressable>

        <Link href="/mood-radio/settings" asChild>
          <Pressable style={styles.secondary}>
            <AppText>Mood Radio Settings</AppText>
          </Pressable>
        </Link>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 26, fontWeight: "800" },
  row: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { backgroundColor: colors.card, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8 },
  active: { backgroundColor: colors.primaryDark },
  button: { backgroundColor: colors.primary, borderRadius: 12, padding: 12, alignItems: "center" },
  secondary: { backgroundColor: colors.card, borderRadius: 12, padding: 12, alignItems: "center" }
});
