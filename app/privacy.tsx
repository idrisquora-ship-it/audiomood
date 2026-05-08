import { ScrollView, StyleSheet } from "react-native";
import { AppHeader } from "@/components/ui/AppHeader";
import { AppText } from "@/components/ui/AppText";
import { Screen } from "@/components/ui/Screen";
import { colors } from "@/theme/colors";

export default function PrivacyScreen() {
  return (
    <Screen>
      <AppHeader title="Privacy policy" subtitle="How Audiomood handles your data." />
      <ScrollView contentContainerStyle={styles.body}>
        <AppText variant="body" style={styles.p}>
          We store account details (email, profile, listening history where enabled) securely in Supabase. Playback and
          recommendations use aggregated signals; you can pause activity sharing in Privacy settings.
        </AppText>
        <AppText variant="body" style={styles.p}>
          Push notifications are optional. Offline downloads stay on-device until you remove them from Downloads in
          settings.
        </AppText>
        <AppText variant="body" style={styles.p}>
          Contact support anytime to export or delete eligible personal data tied to your account, subject to legal
          retention requirements.
        </AppText>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { paddingBottom: 32, gap: 14 },
  p: { color: colors.text, lineHeight: 22 }
});
