import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { AppText } from "@/components/ui/AppText";
import { Screen } from "@/components/ui/Screen";
import { getMyProfile, saveListenerPreferences } from "@/features/auth/authService";
import { supabase } from "@/lib/supabase";
import { colors } from "@/theme/colors";

export default function ListenerOnboardingScreen() {
  const router = useRouter();
  const [genres, setGenres] = useState<Array<{ id: string; name: string }>>([]);
  const [moods, setMoods] = useState<Array<{ id: string; name: string }>>([]);
  const [genreSelection, setGenreSelection] = useState<string[]>([]);
  const [moodSelection, setMoodSelection] = useState<string[]>([]);
  const [loadingPrefs, setLoadingPrefs] = useState(false);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [catalogError, setCatalogError] = useState<string | null>(null);

  const fetchCatalog = useCallback(async () => {
    try {
      setCatalogLoading(true);
      setCatalogError(null);
      const [genreRes, moodRes] = await Promise.all([
        supabase.from("genres").select("id,name").order("name"),
        supabase.from("moods").select("id,name").order("name")
      ]);
      if (genreRes.error) throw genreRes.error;
      if (moodRes.error) throw moodRes.error;
      setGenres((genreRes.data ?? []) as Array<{ id: string; name: string }>);
      setMoods((moodRes.data ?? []) as Array<{ id: string; name: string }>);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Could not load genres and moods.";
      setCatalogError(msg);
    } finally {
      setCatalogLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchCatalog();
  }, [fetchCatalog]);

  const hasSelections = useMemo(() => genreSelection.length > 0 || moodSelection.length > 0, [genreSelection, moodSelection]);

  const toggle = (ids: string[], id: string, setter: (v: string[]) => void) =>
    setter(ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]);

  const onContinue = async () => {
    try {
      setLoadingPrefs(true);
      const profile = await getMyProfile();
      if (!profile?.id) throw new Error("Could not load user profile.");
      await saveListenerPreferences(profile.id, genreSelection, moodSelection);
      router.replace("/(listener)/(tabs)/home");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to save preferences.";
      Alert.alert("Onboarding", message);
    } finally {
      setLoadingPrefs(false);
    }
  };

  return (
    <Screen>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <AppText style={styles.title}>Choose your genres and moods</AppText>
        <AppText muted style={styles.subtitle}>
          This helps Audiomood personalize your recommendations.
        </AppText>

        {catalogLoading ? (
          <View style={styles.centerBlock}>
            <ActivityIndicator color={colors.primary} />
            <AppText muted style={{ marginTop: 12 }}>
              Loading options…
            </AppText>
          </View>
        ) : catalogError ? (
          <View style={styles.centerBlock}>
            <AppText style={styles.errorText}>{catalogError}</AppText>
            <Pressable style={[styles.retryBtn, styles.buttonGhost]} onPress={() => void fetchCatalog()}>
              <AppText style={styles.retryLabel}>Tap to retry</AppText>
            </Pressable>
          </View>
        ) : (
          <>
            <AppText style={styles.section}>Genres</AppText>
            <View style={styles.wrap}>
              {genres.length === 0 ? (
                <AppText muted>No genres yet. Pull to refresh or contact support.</AppText>
              ) : (
                genres.map((g) => {
                  const active = genreSelection.includes(g.id);
                  return (
                    <Pressable
                      key={g.id}
                      style={[styles.pill, active && styles.active]}
                      onPress={() => toggle(genreSelection, g.id, setGenreSelection)}
                    >
                      <AppText style={[styles.pillLabel, active && styles.pillLabelActive]}>{g.name}</AppText>
                    </Pressable>
                  );
                })
              )}
            </View>

            <AppText style={styles.section}>Moods</AppText>
            <View style={styles.wrap}>
              {moods.length === 0 ? (
                <AppText muted>No moods in the catalog yet.</AppText>
              ) : (
                moods.map((m) => {
                  const active = moodSelection.includes(m.id);
                  return (
                    <Pressable
                      key={m.id}
                      style={[styles.pill, active && styles.active]}
                      onPress={() => toggle(moodSelection, m.id, setMoodSelection)}
                    >
                      <AppText style={[styles.pillLabel, active && styles.pillLabelActive]}>{m.name}</AppText>
                    </Pressable>
                  );
                })
              )}
            </View>
          </>
        )}

        <Pressable
          style={[styles.button, !hasSelections && styles.disabled]}
          onPress={onContinue}
          disabled={!hasSelections || loadingPrefs || catalogLoading || !!catalogError}
        >
          <AppText style={styles.buttonText}>{loadingPrefs ? "Saving..." : "Continue"}</AppText>
        </Pressable>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    gap: 12,
    paddingBottom: 24,
    flexGrow: 1
  },
  title: { fontSize: 26, fontWeight: "800", paddingTop: 4 },
  subtitle: { marginBottom: 4 },
  section: { fontWeight: "700", marginTop: 8 },
  wrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  pill: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 100, backgroundColor: colors.card },
  active: { backgroundColor: colors.primary },
  pillLabel: { fontSize: 15 },
  pillLabelActive: { fontWeight: "700", color: colors.background },
  button: { backgroundColor: colors.primary, borderRadius: 12, padding: 14, marginTop: 24 },
  buttonGhost: { backgroundColor: colors.card, alignSelf: "flex-start", paddingHorizontal: 16 },
  retryBtn: { borderRadius: 12, paddingVertical: 10, marginTop: 8 },
  retryLabel: { fontWeight: "700", color: colors.primary },
  disabled: { opacity: 0.5 },
  buttonText: { textAlign: "center", fontWeight: "700", color: colors.text },
  centerBlock: { paddingVertical: 24, gap: 8 },
  errorText: { color: colors.danger, lineHeight: 22 }
});
