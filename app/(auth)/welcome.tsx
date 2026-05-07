import { Link } from "expo-router";
import { Pressable, StyleSheet, View } from "react-native";
import { AppText } from "@/components/ui/AppText";
import { Screen } from "@/components/ui/Screen";
import { colors } from "@/theme/colors";

export default function WelcomeScreen() {
  return (
    <Screen>
      <View style={styles.container}>
        <View style={styles.card}>
        <AppText style={styles.title}>Audiomood</AppText>
        <AppText muted>Stream the Sound of Your Mood</AppText>
        <Link href="/(auth)/login" asChild>
          <Pressable style={styles.button}>
            <AppText style={styles.buttonText}>Login</AppText>
          </Pressable>
        </Link>
        <Link href="/(auth)/signup" asChild>
          <Pressable style={[styles.button, styles.altButton]}>
            <AppText style={styles.buttonText}>Sign Up</AppText>
          </Pressable>
        </Link>
        <Link href="/(onboarding)/choose-account-type" asChild>
          <Pressable style={[styles.button, styles.altButton]}>
            <AppText style={styles.buttonText}>Change account type</AppText>
          </Pressable>
        </Link>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  card: { width: "100%", maxWidth: 420, gap: 16 },
  title: { fontSize: 40, fontWeight: "800", color: colors.primary },
  button: { backgroundColor: colors.primary, borderRadius: 14, padding: 14, marginTop: 8 },
  altButton: { backgroundColor: colors.card },
  buttonText: { textAlign: "center", fontWeight: "700" }
});
