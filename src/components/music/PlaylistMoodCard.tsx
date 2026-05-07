import { LinearGradient } from "expo-linear-gradient";
import { Pressable, StyleSheet, View } from "react-native";
import { AppText } from "@/components/ui/AppText";
import { colors } from "@/theme/colors";

type Props = {
  title: string;
  subtitle: string;
  gradient: [string, string];
  onPress?: () => void;
  width?: number;
};

export function PlaylistMoodCard({ title, subtitle, gradient, onPress, width = 220 }: Props) {
  const inner = (
    <LinearGradient colors={gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.card, { width }]}>
      <AppText variant="section" style={styles.title}>
        {title}
      </AppText>
      <AppText variant="caption" style={styles.sub}>
        {subtitle}
      </AppText>
    </LinearGradient>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} style={styles.margin} accessibilityRole="button">
        {inner}
      </Pressable>
    );
  }
  return <View style={styles.margin}>{inner}</View>;
}

const styles = StyleSheet.create({
  margin: { marginRight: 12 },
  card: {
    borderRadius: 18,
    padding: 18,
    minHeight: 120,
    justifyContent: "flex-end",
    overflow: "hidden"
  },
  title: {
    color: colors.text,
    fontSize: 20,
    lineHeight: 26,
    textShadowColor: "rgba(0,0,0,0.45)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4
  },
  sub: {
    color: "rgba(255,255,255,0.88)",
    marginTop: 4
  }
});
