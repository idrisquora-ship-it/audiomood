import { Link } from "expo-router";
import { Pressable, StyleSheet, TextInput, View } from "react-native";
import { AppText } from "@/components/ui/AppText";
import { Screen } from "@/components/ui/Screen";
import { colors } from "@/theme/colors";

export default function ForgotPasswordScreen() {
  return (
    <Screen>
      <View style={styles.root}>
        <View style={styles.card}>
        <AppText style={styles.title}>Reset password</AppText>
        <TextInput placeholder="Email" placeholderTextColor={colors.textMuted} style={styles.input} />
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
  root: { flex: 1, justifyContent: "center", alignItems: "center" },
  card: { width: "100%", maxWidth: 420, gap: 12 },
  title: { fontSize: 28, fontWeight: "800" },
  input: { backgroundColor: colors.card, borderRadius: 12, color: colors.text, padding: 12 },
  button: { backgroundColor: colors.primary, borderRadius: 12, padding: 12 },
  altButton: { backgroundColor: colors.card },
  buttonText: { textAlign: "center", fontWeight: "700" }
});
