import { PropsWithChildren } from "react";
import { StyleSheet, View } from "react-native";
import { AppText } from "@/components/ui/AppText";
import { colors } from "@/theme/colors";

export function SectionCard({ children, title }: PropsWithChildren<{ title: string }>) {
  return (
    <View style={styles.card}>
      <AppText variant="section" style={styles.title}>
        {title}
      </AppText>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    gap: 10,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 4
  },
  title: { fontSize: 18 }
});
