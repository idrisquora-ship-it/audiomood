import { Pressable, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AppText } from "@/components/ui/AppText";
import { colors } from "@/theme/colors";
import { FONT } from "@/theme/typography";
import { spacing } from "@/theme/spacing";

type Props = {
  label: string;
  hint: string;
  valueLabel?: string;
  picked: boolean;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
};

export function UploadPickerCard({ label, hint, valueLabel, picked, icon, onPress }: Props) {
  return (
    <View style={{ gap: 8 }}>
      <AppText variant="caption" secondary>
        {label}
      </AppText>
      <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
        <View style={styles.circle}>
          <Ionicons name={icon as never} size={26} color={colors.primary} />
        </View>
        <View style={styles.mid}>
          <AppText variant="body" style={styles.title}>
            {picked ? (valueLabel ?? "Selected") : hint}
          </AppText>
          <AppText variant="caption" style={styles.caption}>
            {picked ? "Tap to replace" : "Tap to browse"}
          </AppText>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 20,
    padding: spacing.sectionGap,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: "dashed"
  },
  pressed: { opacity: 0.94 },
  circle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.border
  },
  mid: { flex: 1, gap: 2 },
  title: { fontFamily: FONT.semiBold },
  caption: { color: colors.textMuted }
});
