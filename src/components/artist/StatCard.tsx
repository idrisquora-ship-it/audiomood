import type { ComponentProps } from "react";
import { StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AppText } from "@/components/ui/AppText";
import { colors } from "@/theme/colors";

type Ion = ComponentProps<typeof Ionicons>["name"];

type Props = {
  icon: Ion;
  label: string;
  value: string;
  delta?: string;
};

export function StatCard({ icon, label, value, delta = "+0 this week" }: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.iconWrap}>
        <Ionicons name={icon} size={20} color={colors.primary} />
      </View>
      <AppText secondary variant="caption" numberOfLines={2}>
        {label}
      </AppText>
      <AppText variant="section" style={styles.value} numberOfLines={1}>
        {value}
      </AppText>
      <AppText variant="caption" style={styles.delta} numberOfLines={1}>
        {delta}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "48%",
    flexGrow: 1,
    borderRadius: 22,
    padding: 14,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 6
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.surfaceElevated,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 2
  },
  value: { fontSize: 22, marginTop: 2 },
  delta: { color: colors.textMuted, marginTop: 2 }
});
