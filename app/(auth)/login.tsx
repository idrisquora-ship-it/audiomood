import { Ionicons } from "@expo/vector-icons";
import { Link, useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, StyleSheet, TextInput, View } from "react-native";
import { AppText } from "@/components/ui/AppText";
import { Screen } from "@/components/ui/Screen";
import { getMyProfile, signIn } from "@/features/auth/authService";
import { colors } from "@/theme/colors";

export default function LoginScreen() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const onLogin = async () => {
    try {
      setLoading(true);
      await signIn(identifier, password);
      const profile = await getMyProfile();
      if (profile?.account_type === "artist" || profile?.account_type === "both") {
        router.replace("/(artist)/(tabs)/dashboard");
        return;
      }
      router.replace("/(listener)/(tabs)/home");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Login failed";
      Alert.alert("Login failed", message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <View style={styles.root}>
        <View style={styles.card}>
          <AppText style={styles.title}>Login</AppText>
          <TextInput
            placeholder="Email or username"
            placeholderTextColor={colors.textMuted}
            style={styles.input}
            value={identifier}
            onChangeText={setIdentifier}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <View style={styles.passwordWrap}>
            <TextInput
              placeholder="Password"
              placeholderTextColor={colors.textMuted}
              style={styles.passwordInput}
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
              autoCapitalize="none"
            />
            <Pressable
              accessibilityLabel={showPassword ? "Hide password" : "Show password"}
              style={styles.eyeHit}
              onPress={() => setShowPassword((v) => !v)}
            >
              <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={22} color={colors.textMuted} />
            </Pressable>
          </View>
          <Pressable style={styles.button} onPress={onLogin} disabled={loading}>
            <AppText style={styles.buttonText}>{loading ? "Signing in..." : "Continue"}</AppText>
          </Pressable>
          <Link href="/(auth)/forgot-password">
            <AppText muted>Forgot password?</AppText>
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
  root: { flex: 1, justifyContent: "center", alignItems: "center" },
  card: { width: "100%", maxWidth: 420, gap: 12 },
  title: { fontSize: 28, fontWeight: "800" },
  input: { backgroundColor: colors.card, borderRadius: 12, color: colors.text, padding: 12 },
  passwordWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    borderRadius: 12,
    paddingRight: 4
  },
  passwordInput: { flex: 1, color: colors.text, padding: 12, paddingVertical: 12 },
  eyeHit: { padding: 8 },
  button: { backgroundColor: colors.primary, borderRadius: 12, padding: 12 },
  altButton: { backgroundColor: colors.card },
  buttonText: { textAlign: "center", fontWeight: "700" }
});
