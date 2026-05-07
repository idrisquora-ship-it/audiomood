import { Pressable, StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { AppText } from "@/components/ui/AppText";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";

type Props = {
  title: string;
  subtitle: string;
  ctaLabel: string;
  onCtaPress: () => void;
};

export function DashboardActionCard({ title, subtitle, ctaLabel, onCtaPress }: Props) {
  return (
    <LinearGradient
      colors={[colors.primaryDark, colors.primary]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.grad}
    >
      <View style={styles.row}>
        <View style={styles.wrap}>
          <AppText variant="section" style={styles.heroTitle}>
            {title}
          </AppText>
          <AppText variant="caption" style={styles.heroSub}>
            {subtitle}
          </AppText>
        </View>
        <Ionicons name="sparkles-outline" size={28} color="rgba(255,255,255,0.9)" />
      </View>
      <Pressable
        accessibilityRole="button"
        onPress={onCtaPress}
        style={({ pressed }) => [styles.cta, pressed && styles.pressed]}
      >
        <AppText variant="caption" style={styles.ctaText}>
          {ctaLabel}
        </AppText>
        <Ionicons name="arrow-forward" size={16} color={colors.text} />
      </Pressable>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  grad: {
    borderRadius: 22,
    padding: spacing.sectionGap,
    gap: 14,
    marginBottom: spacing.itemGap,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10
  },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  wrap: { flex: 1, paddingRight: 12 },
  heroTitle: { color: "#fff", fontSize: 21, lineHeight: 26 },
  heroSub: { color: "rgba(255,255,255,0.92)", marginTop: 10, fontSize: 14, lineHeight: 20 },
  cta: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(0,0,0,0.28)",
    borderRadius: 100,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)"
  },
  pressed: { opacity: 0.9 },
  ctaText: { color: colors.text, fontWeight: "700" }
});
