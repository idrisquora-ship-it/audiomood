import { ScrollView, StyleSheet } from "react-native";
import { AppHeader } from "@/components/ui/AppHeader";
import { AppText } from "@/components/ui/AppText";
import { Screen } from "@/components/ui/Screen";
import { colors } from "@/theme/colors";

export default function CopyrightPolicyScreen() {
  return (
    <Screen>
      <AppHeader title="Copyright" subtitle="Reporting and artist obligations." />
      <ScrollView contentContainerStyle={styles.body}>
        <AppText variant="body" style={styles.p}>
          Only upload content you own or are licensed to distribute. Repeat infringers may lose upload privileges.
        </AppText>
        <AppText variant="body" style={styles.p}>
          Listeners can report suspect tracks from Discover. Reports are reviewed by moderators; repeated valid claims
          may lead to takedowns.
        </AppText>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { paddingBottom: 32, gap: 14 },
  p: { color: colors.text, lineHeight: 22 }
});
