import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Switch, View } from "react-native";
import { AppText } from "@/components/ui/AppText";
import { Screen } from "@/components/ui/Screen";
import { getMyProfile } from "@/features/auth/authService";
import { getFullSettings, updateMoodRadioSettings } from "@/features/settings/settingsService";
import { useUiStore } from "@/store/uiStore";
import { colors } from "@/theme/colors";

export default function MoodRadioSettingsScreen() {
  const [profileId, setProfileId] = useState("");
  const [defaultMood, setDefaultMood] = useState("Chill");
  const [defaultGenre, setDefaultGenre] = useState("Afrobeats");
  const [useHistory, setUseHistory] = useState(true);
  const [hideRepeats, setHideRepeats] = useState(true);
  const pushToast = useUiStore((s) => s.pushToast);

  useEffect(() => {
    void (async () => {
      const profile = await getMyProfile();
      if (!profile?.id) return;
      setProfileId(profile.id);
      const settings = await getFullSettings(profile.id);
      setDefaultMood(settings.moodRadio.default_mood ?? "Chill");
      setDefaultGenre(settings.moodRadio.default_genre ?? "Afrobeats");
      setUseHistory(settings.moodRadio.use_listening_history);
      setHideRepeats(settings.moodRadio.hide_repeated_songs);
    })();
  }, []);

  const persist = async (partial: {
    default_mood?: string;
    default_genre?: string;
    use_listening_history?: boolean;
    hide_repeated_songs?: boolean;
  }) => {
    if (!profileId) return;
    await updateMoodRadioSettings(profileId, partial);
  };

  return (
    <Screen>
      <View style={styles.root}>
        <AppText style={styles.title}>Mood Radio Settings</AppText>
        <AppText muted>Tune how AI Mood Radio builds and adapts your endless station.</AppText>

        <Pressable
          style={styles.rowButton}
          onPress={() => {
            const moods = ["Chill", "Sad", "Romantic", "Workout", "Prayer", "Party", "Focus", "Late Night", "Motivation"];
            const next = moods[(moods.indexOf(defaultMood) + 1) % moods.length];
            setDefaultMood(next);
            void persist({ default_mood: next });
          }}
        >
          <AppText>Default Mood: {defaultMood}</AppText>
        </Pressable>

        <Pressable
          style={styles.rowButton}
          onPress={() => {
            const genres = ["Afrobeats", "Hip Hop", "R&B", "Gospel", "Pop", "Amapiano"];
            const next = genres[(genres.indexOf(defaultGenre) + 1) % genres.length];
            setDefaultGenre(next);
            void persist({ default_genre: next });
          }}
        >
          <AppText>Default Genre: {defaultGenre}</AppText>
        </Pressable>

        <View style={styles.toggleRow}>
          <AppText muted>Use listening history</AppText>
          <Switch
            value={useHistory}
            onValueChange={(v) => {
              setUseHistory(v);
              void persist({ use_listening_history: v });
            }}
          />
        </View>

        <View style={styles.toggleRow}>
          <AppText muted>Hide repeated songs</AppText>
          <Switch
            value={hideRepeats}
            onValueChange={(v) => {
              setHideRepeats(v);
              void persist({ hide_repeated_songs: v });
            }}
          />
        </View>

        <Pressable
          style={styles.reset}
          onPress={() => {
            setUseHistory(true);
            setHideRepeats(true);
            setDefaultMood("Chill");
            setDefaultGenre("Afrobeats");
            void persist({
              use_listening_history: true,
              hide_repeated_songs: true,
              default_mood: "Chill",
              default_genre: "Afrobeats"
            }).then(() => pushToast("Mood radio preferences reset", "success"));
          }}
        >
          <AppText>Reset Radio Preferences</AppText>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, gap: 10 },
  title: { fontSize: 24, fontWeight: "800" },
  rowButton: { backgroundColor: colors.card, borderRadius: 12, padding: 12 },
  toggleRow: {
    backgroundColor: colors.card,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  reset: { backgroundColor: colors.primary, borderRadius: 12, padding: 12, alignItems: "center" }
});
