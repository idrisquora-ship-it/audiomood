import { ComponentProps } from "react";
import { StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AppText } from "@/components/ui/AppText";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { colors } from "@/theme/colors";

type Ion = ComponentProps<typeof Ionicons>["name"];

type Props = {
  icon?: Ion;
  title: string;
  description: string;
  ctaLabel?: string;
  onCtaPress?: () => void;
};

export function EmptyStateCard({ icon = "musical-notes-outline", title, description, ctaLabel, onCtaPress }: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.iconCircle}>
        <Ionicons name={icon} size={28} color={colors.primary} />
      </View>
      <AppText variant="section" style={styles.title}>
        {title}
      </AppText>
      <AppText secondary variant="body" style={styles.desc}>
        {description}
      </AppText>
      {ctaLabel && onCtaPress ? (
        <PrimaryButton title={ctaLabel} onPress={onCtaPress} style={styles.cta} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "flex-start",
    gap: 10
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.surfaceElevated,
    alignItems: "center",
    justifyContent: "center"
  },
  title: { fontSize: 18 },
  desc: { lineHeight: 22 },
  cta: { alignSelf: "stretch", marginTop: 4 }
});
