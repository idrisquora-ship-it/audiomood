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

export function MusicCard({ title, subtitle, gradient, onPress, width = 140 }: Props) {
  const body = (
    <>
      <LinearGradient colors={gradient} style={styles.cover} />
      <View style={styles.meta}>
        <AppText numberOfLines={1} variant="body" style={styles.title}>
          {title}
        </AppText>
        <AppText numberOfLines={1} variant="caption" secondary>
          {subtitle}
        </AppText>
      </View>
    </>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} style={[styles.card, { width }]} accessibilityRole="button">
        {body}
      </Pressable>
    );
  }

  return <View style={[styles.card, { width }]}>{body}</View>;
}

const styles = StyleSheet.create({
  card: { marginRight: 12 },
  cover: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 14,
    marginBottom: 8
  },
  meta: { gap: 2 },
  title: { fontWeight: "700", fontFamily: undefined }
});
