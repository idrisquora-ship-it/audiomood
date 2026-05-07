import { Pressable, StyleSheet, ViewStyle } from "react-native";
import { AppText } from "@/components/ui/AppText";
import { colors } from "@/theme/colors";
import { FONT } from "@/theme/typography";

type Props = {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: "primary" | "outline" | "danger";
  style?: ViewStyle;
};

export function PrimaryButton({ title, onPress, disabled, variant = "primary", style }: Props) {
  const isOutline = variant === "outline";
  const isDanger = variant === "danger";
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        isDanger ? styles.danger : isOutline ? styles.outline : styles.solid,
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
        style
      ]}
    >
      <AppText variant="body" style={[styles.label, (isOutline || isDanger) && styles.onDarkSurface]}>
        {title}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center"
  },
  solid: { backgroundColor: colors.primary },
  danger: { backgroundColor: colors.danger, borderWidth: 0 },
  outline: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: colors.border
  },
  label: { color: colors.text, fontWeight: "700", fontFamily: FONT.bold },
  onDarkSurface: { color: colors.text },
  disabled: { opacity: 0.45 },
  pressed: { opacity: 0.92 }
});
