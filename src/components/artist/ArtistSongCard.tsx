import { Pressable, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SongStatusBadge, type UiSongStatus } from "@/components/artist/SongStatusBadge";
import { AppText } from "@/components/ui/AppText";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";

type Props = {
  title: string;
  status: UiSongStatus;
  plays: number;
  likes: number;
  accentSeed?: number;
  onMenuPress?: () => void;
};

const COVER_FALLBACK_COLORS = ["#2A2419", "#1E2419", "#241A26", "#1A2230"];

export function ArtistSongCard({ title, status, plays, likes, accentSeed = 0, onMenuPress }: Props) {
  const tint = COVER_FALLBACK_COLORS[Math.abs(accentSeed) % COVER_FALLBACK_COLORS.length] ?? colors.surfaceElevated;
  return (
    <View style={styles.row}>
      <View style={[styles.cover, { backgroundColor: tint }]}>
        <Ionicons name="musical-note" size={22} color={colors.primary} />
      </View>
      <View style={styles.body}>
        <AppText variant="body" numberOfLines={2} style={styles.title}>
          {title}
        </AppText>
        <View style={styles.meta}>
          <SongStatusBadge status={status} />
        </View>
        <AppText variant="caption" style={styles.statLine}>
          {plays.toLocaleString()} plays · {likes.toLocaleString()} likes
        </AppText>
      </View>
      <Pressable onPress={onMenuPress ?? (() => {})} hitSlop={12} style={styles.menu}>
        <Ionicons name="ellipsis-horizontal" size={22} color={colors.textMuted} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 20,
    padding: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border
  },
  cover: {
    width: 56,
    height: 56,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden"
  },
  body: { flex: 1, gap: 4, minWidth: 0 },
  title: { fontWeight: "600" },
  meta: { alignSelf: "flex-start" },
  statLine: { color: colors.textMuted, marginTop: 2 },
  menu: { padding: 8 }
});
