import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { AppText } from "@/components/ui/AppText";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";

type Props = {
  title: string;
  description?: string;
  children?: ReactNode;
};

export function AnalyticsChartCard({ title, description, children }: Props) {
  return (
    <View style={styles.card}>
      <AppText variant="section">{title}</AppText>
      {description ? (
        <AppText variant="caption" secondary>
          {description}
        </AppText>
      ) : null}
      <View style={styles.chartShell}>{children ?? <BarsPlaceholder />}</View>
    </View>
  );
}

function BarsPlaceholder() {
  const heights = [40, 64, 36, 80, 52, 92, 48];
  return (
    <View style={bars.row}>
      {heights.map((h, i) => (
        <View key={String(i)} style={[bars.bar, { height: h }]} />
      ))}
    </View>
  );
}

const bars = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 6,
    height: 108,
    justifyContent: "space-between",
    paddingHorizontal: 4
  },
  bar: {
    flex: 1,
    borderRadius: 8,
    backgroundColor: colors.surfaceElevated,
    opacity: 0.85,
    borderWidth: 1,
    borderColor: colors.border
  }
});

const styles = StyleSheet.create({
  card: {
    borderRadius: 22,
    padding: spacing.sectionGap,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 10
  },
  chartShell: {
    marginTop: 10,
    minHeight: 120,
    borderRadius: 16,
    backgroundColor: colors.backgroundAlt,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
    alignItems: "stretch",
    justifyContent: "center",
    padding: 12
  }
});
