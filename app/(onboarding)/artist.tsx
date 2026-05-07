import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, StyleSheet, TextInput, View } from "react-native";
import { AppText } from "@/components/ui/AppText";
import { Screen } from "@/components/ui/Screen";
import { getMyProfile } from "@/features/auth/authService";
import { supabase } from "@/lib/supabase";
import { colors } from "@/theme/colors";

export default function ArtistOnboardingScreen() {
  const router = useRouter();
  const [artistName, setArtistName] = useState("");
  const [bio, setBio] = useState("");
  const [social, setSocial] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    try {
      setLoading(true);
      const profile = await getMyProfile();
      if (!profile) throw new Error("No profile found");
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error("No user session");

      await supabase.from("artist_profiles").upsert({
        user_id: user.id,
        artist_name: artistName,
        bio,
        status: "approved",
        verified: false
      });

      await supabase.from("artist_applications").insert({
        user_id: user.id,
        artist_name: artistName,
        bio,
        social_links: { primary: social },
        status: "approved"
      });

      await supabase.from("profiles").update({ account_type: "both", role: "artist" }).eq("id", profile.id);
      router.replace("/(artist)/(tabs)/dashboard");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to submit artist profile.";
      Alert.alert("Artist onboarding", message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <View style={styles.root}>
        <AppText style={styles.title}>Artist onboarding</AppText>
        <TextInput style={styles.input} placeholder="Artist Name" placeholderTextColor={colors.textMuted} value={artistName} onChangeText={setArtistName} />
        <TextInput style={styles.input} placeholder="Bio" placeholderTextColor={colors.textMuted} value={bio} onChangeText={setBio} />
        <TextInput style={styles.input} placeholder="Social Link" placeholderTextColor={colors.textMuted} value={social} onChangeText={setSocial} autoCapitalize="none" />
        <Pressable style={styles.button} onPress={onSubmit} disabled={loading || !artistName}>
          <AppText style={styles.buttonText}>{loading ? "Activating..." : "Continue as Artist"}</AppText>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: "center", gap: 12 },
  title: { fontSize: 28, fontWeight: "800" },
  input: { backgroundColor: colors.card, borderRadius: 12, color: colors.text, padding: 12 },
  button: { backgroundColor: colors.primary, borderRadius: 12, padding: 12 },
  buttonText: { textAlign: "center", fontWeight: "700" }
});
