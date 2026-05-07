import { LinearGradient } from "expo-linear-gradient";
import { Pressable, StyleSheet, View } from "react-native";
import { AppText } from "@/components/ui/AppText";
import { colors } from "@/theme/colors";

type Props = {
  rank?: number;
  title: string;
  artist: string;
  gradient: [string, string];
  onPress?: () => void;
};

export function SongRow({ rank, title, artist, gradient, onPress }: Props) {
  const content = (
    <View style={styles.row}>
      {rank !== undefined ? (
        <AppText variant="caption" muted style={styles.rank}>
          {rank}
        </AppText>
      ) : null}
      <LinearGradient colors={gradient} style={styles.thumb} />
      <View style={styles.text}>
        <AppText numberOfLines={1} variant="body" style={styles.title}>
          {title}
        </AppText>
        <AppText numberOfLines={1} variant="caption" secondary>
          {artist}
        </AppText>
      </View>
    </View>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} style={styles.wrap} accessibilityRole="button">
        {content}
      </Pressable>
    );
  }
  return <View style={styles.wrap}>{content}</View>;
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border
  },
  row: { flexDirection: "row", alignItems: "center", gap: 12 },
  rank: { width: 24, textAlign: "center" },
  thumb: { width: 48, height: 48, borderRadius: 8 },
  text: { flex: 1 },
  title: { fontWeight: "700", fontFamily: undefined }
});
