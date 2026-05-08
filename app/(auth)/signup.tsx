import { Ionicons } from "@expo/vector-icons";
import { Link, useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, StyleSheet, TextInput, View } from "react-native";
import { AppText } from "@/components/ui/AppText";
import { Screen } from "@/components/ui/Screen";
import { bootstrapNewUser, signUp } from "@/features/auth/authService";
import { colors } from "@/theme/colors";

export default function SignupScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ accountType?: string }>();
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const accountType = params.accountType === "artist" ? "artist" : "listener";

  const onSubmit = async () => {
    try {
      setLoading(true);
      const res = await signUp({
        email,
        username,
        displayName: displayName.trim() || username.trim(),
        password,
        accountType
      });
      if (!res.user?.id) throw new Error("Signup did not return a user id.");
      await bootstrapNewUser(res.user.id, accountType, username, displayName.trim() || username.trim());
      router.replace(accountType === "artist" ? "/(onboarding)/artist" : "/(onboarding)/listener");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to signup.";
      Alert.alert("Signup failed", message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <View style={styles.root}>
        <View style={styles.card}>
        <AppText style={styles.title}>Create account</AppText>
        <AppText muted>Account type: {accountType}</AppText>
        <TextInput placeholder="Email" placeholderTextColor={colors.textMuted} style={styles.input} value={email} onChangeText={setEmail} autoCapitalize="none" />
        <TextInput
          placeholder="Display name"
          placeholderTextColor={colors.textMuted}
          style={styles.input}
          value={displayName}
          onChangeText={setDisplayName}
        />
        <TextInput placeholder="Username" placeholderTextColor={colors.textMuted} style={styles.input} value={username} onChangeText={setUsername} autoCapitalize="none" />
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
        <Pressable style={styles.button} onPress={onSubmit} disabled={loading}>
          <AppText style={styles.buttonText}>{loading ? "Creating..." : "Sign Up"}</AppText>
        </Pressable>
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
