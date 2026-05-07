import { ComponentProps } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AppText } from "@/components/ui/AppText";
import { colors } from "@/theme/colors";

type Ion = ComponentProps<typeof Ionicons>["name"];

type Props = {
  icon: Ion;
  title: string;
  subtitle: string;
  onPress: () => void;
};

export function LibraryRow({ icon, title, subtitle, onPress }: Props) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
      <View style={styles.icon}>
        <Ionicons name={icon} size={22} color={colors.primary} />
      </View>
      <View style={styles.mid}>
        <AppText variant="body" style={styles.title}>
          {title}
        </AppText>
        <AppText variant="caption" secondary numberOfLines={1}>
          {subtitle}
        </AppText>
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border
  },
  pressed: { opacity: 0.88 },
  icon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.surfaceElevated,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14
  },
  mid: { flex: 1, gap: 2 },
  title: { fontWeight: "700" }
});
