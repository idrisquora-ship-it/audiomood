import { ComponentProps } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { AppText } from "@/components/ui/AppText";
import { colors } from "@/theme/colors";

type Ion = ComponentProps<typeof Ionicons>["name"];

type Props = {
  icon: Ion;
  title: string;
  description: string;
  ctaLabel: string;
  onPress: () => void;
};

export function DiscoverFeatureCard({ icon, title, description, ctaLabel, onPress }: Props) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={styles.press}>
      <LinearGradient colors={["#331A00", "#0D0D0D"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.card}>
        <View style={styles.icon}>
          <Ionicons name={icon} size={26} color={colors.primary} />
        </View>
        <AppText variant="section" style={styles.title}>
          {title}
        </AppText>
        <AppText variant="caption" secondary style={styles.desc}>
          {description}
        </AppText>
        <View style={styles.ctaWrap}>
          <AppText variant="caption" style={styles.cta}>
            {ctaLabel}
          </AppText>
          <Ionicons name="arrow-forward-circle" size={22} color={colors.primary} />
        </View>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  press: { marginBottom: 12 },
  card: {
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border
  },
  icon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: "rgba(255,106,0,0.14)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12
  },
  title: { fontSize: 20 },
  desc: { marginTop: 6, marginBottom: 14, lineHeight: 18 },
  ctaWrap: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  cta: { color: colors.primary, fontWeight: "700" }
});
