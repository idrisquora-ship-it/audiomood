import { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { AppText } from "@/components/ui/AppText";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";

type Props = {
  title: string;
  subtitle?: string;
  right?: ReactNode;
};

export function AppHeader({ title, subtitle, right }: Props) {
  return (
    <View style={styles.row}>
      <View style={styles.textBlock}>
        <AppText variant="screenTitle" numberOfLines={2} style={styles.title}>
          {title}
        </AppText>
        {subtitle ? (
          <AppText secondary variant="body" numberOfLines={2} style={styles.sub}>
            {subtitle}
          </AppText>
        ) : null}
      </View>
      {right ? <View style={styles.actions}>{right}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: spacing.sectionGap
  },
  textBlock: { flex: 1, paddingRight: 12 },
  title: { fontSize: 28, lineHeight: 34 },
  sub: { marginTop: 6 },
  actions: { flexDirection: "row", alignItems: "center", gap: 8 }
});
