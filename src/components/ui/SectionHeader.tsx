import { ReactNode } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { AppText } from "@/components/ui/AppText";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";

type Props = {
  title: string;
  actionLabel?: string;
  onActionPress?: () => void;
  right?: ReactNode;
};

export function SectionHeader({ title, actionLabel, onActionPress, right }: Props) {
  return (
    <View style={styles.row}>
      <AppText variant="section" numberOfLines={1} style={styles.title}>
        {title}
      </AppText>
      {right ? right : null}
      {actionLabel && onActionPress ? (
        <Pressable onPress={onActionPress} hitSlop={8}>
          <AppText variant="caption" style={styles.action}>
            {actionLabel}
          </AppText>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.itemGap,
    marginTop: spacing.itemGap
  },
  title: { flex: 1, fontSize: 20 },
  action: { color: colors.primary }
});
