import { ScrollView, StyleSheet } from "react-native";
import { AppHeader } from "@/components/ui/AppHeader";
import { AppText } from "@/components/ui/AppText";
import { Screen } from "@/components/ui/Screen";
import { colors } from "@/theme/colors";

export default function TermsScreen() {
  return (
    <Screen>
      <AppHeader title="Terms of service" subtitle="Audiomood listener & artist terms." />
      <ScrollView contentContainerStyle={styles.body}>
        <AppText variant="body" style={styles.p}>
          Audiomood lets you stream approved music, podcasts, and interactive social features. By using the app you agree
          to follow community guidelines, respect copyrights, and avoid harassment or abuse on live features.
        </AppText>
        <AppText variant="body" style={styles.p}>
          Artists retain ownership of uploads. You grant Audiomood a license to host, transcode, deliver, and promote
          tracks you publish through the platform according to your distribution settings.
        </AppText>
        <AppText variant="body" style={styles.p}>
          We may suspend accounts that violate policies, distribute malware, or tamper with playback or recommendation
          systems. For questions, submit a support ticket from Settings.
        </AppText>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { paddingBottom: 32, gap: 14 },
  p: { color: colors.text, lineHeight: 22 }
});
