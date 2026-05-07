import { Link } from "expo-router";
import { Pressable, StyleSheet, View } from "react-native";
import { AppText } from "@/components/ui/AppText";
import { Screen } from "@/components/ui/Screen";
import { colors } from "@/theme/colors";

export default function ChooseAccountTypeScreen() {
  return (
    <Screen>
      <View style={styles.root}>
        <AppText style={styles.title}>Choose account type</AppText>
        <Link href="/(auth)/signup?accountType=listener" asChild>
          <Pressable style={styles.card}>
            <AppText style={styles.heading}>Listener</AppText>
          </Pressable>
        </Link>
        <Link href="/(auth)/signup?accountType=artist" asChild>
          <Pressable style={styles.card}>
            <AppText style={styles.heading}>Artist</AppText>
          </Pressable>
        </Link>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: "center", gap: 12 },
  title: { fontSize: 28, fontWeight: "800" },
  card: { backgroundColor: colors.card, borderRadius: 14, padding: 16, borderWidth: 1, borderColor: colors.border },
  heading: { fontWeight: "700" }
});
