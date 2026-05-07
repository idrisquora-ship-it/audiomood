import { ComponentProps } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AppText } from "@/components/ui/AppText";
import { colors } from "@/theme/colors";

type Ion = ComponentProps<typeof Ionicons>["name"];

type Props = {
  icon: Ion;
  title: string;
  subtitle?: string;
  onPress: () => void;
  danger?: boolean;
  showChevron?: boolean;
};

export function SettingsRow({ icon, title, subtitle, onPress, danger, showChevron = true }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <View style={[styles.iconWrap, danger && styles.iconDanger]}>
        <Ionicons name={icon} size={20} color={danger ? colors.danger : colors.primary} />
      </View>
      <View style={styles.text}>
        <AppText variant="body" style={danger ? styles.dangerText : undefined}>
          {title}
        </AppText>
        {subtitle ? (
          <AppText variant="caption" secondary>
            {subtitle}
          </AppText>
        ) : null}
      </View>
      {showChevron ? <Ionicons name="chevron-forward" size={18} color={colors.textMuted} /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 4,
    gap: 12
  },
  pressed: { opacity: 0.85 },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: colors.surfaceElevated,
    alignItems: "center",
    justifyContent: "center"
  },
  iconDanger: { backgroundColor: "rgba(240,68,56,0.12)" },
  text: { flex: 1, gap: 2 },
  dangerText: { color: colors.danger }
});
