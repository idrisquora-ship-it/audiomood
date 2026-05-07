import { Pressable, StyleSheet } from "react-native";
import { AppText } from "@/components/ui/AppText";
import { colors } from "@/theme/colors";

type Props = {
  label: string;
  active?: boolean;
  onPress?: () => void;
};

export function MoodChip({ label, active, onPress }: Props) {
  return (
    <Pressable onPress={onPress} disabled={!onPress} style={[styles.chip, active && styles.active]} accessibilityRole={onPress ? "button" : undefined}>
      <AppText variant="caption" style={[styles.text, active && styles.textActive]}>
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 100,
    backgroundColor: colors.surfaceElevated,
    marginRight: 8
  },
  active: {
    backgroundColor: colors.primary
  },
  text: { color: colors.textSecondary, fontFamily: undefined },
  textActive: { color: colors.text, fontWeight: "700" }
});
