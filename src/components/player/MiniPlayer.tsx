import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Pressable, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AppText } from "@/components/ui/AppText";
import { PlayerState, usePlayerStore } from "@/store/playerStore";
import { colors } from "@/theme/colors";
import { FONT } from "@/theme/typography";

export function MiniPlayer() {
  const router = useRouter();
  const currentSongId = usePlayerStore((s: PlayerState) => s.currentSongId);
  const songTitle = usePlayerStore((s: PlayerState) => s.currentSongTitle);
  const artistName = usePlayerStore((s: PlayerState) => s.currentArtistName);
  const isPlaying = usePlayerStore((s: PlayerState) => s.isPlaying);
  const setIsPlaying = usePlayerStore((s: PlayerState) => s.setIsPlaying);
  const hasTrack = !!currentSongId;

  const openPlayer = () => router.push("/player");

  const togglePlayback = () => {
    if (!hasTrack) return;
    setIsPlaying(!isPlaying);
  };

  return (
    <Pressable style={styles.shell} onPress={openPlayer} accessibilityRole="button" accessibilityLabel="Open full player">
      <View style={styles.row}>
        {hasTrack ? (
          <LinearGradient colors={["#FF6A00", "#3A1748"]} style={styles.art}>
            <Ionicons name="musical-note" size={20} color={colors.text} />
          </LinearGradient>
        ) : (
          <View style={styles.artMuted}>
            <Ionicons name="musical-notes-outline" size={22} color={colors.textMuted} />
          </View>
        )}
        <View style={styles.meta}>
          <AppText numberOfLines={1} variant="body" style={styles.title}>
            {hasTrack ? songTitle : "Nothing playing"}
          </AppText>
          <AppText numberOfLines={1} variant="caption" secondary>
            {hasTrack ? artistName : "Pick a song to start your session"}
          </AppText>
        </View>
        <Pressable
          accessibilityLabel={hasTrack ? (isPlaying ? "Pause" : "Play") : "Browse music"}
          onPress={(e) => {
            e.stopPropagation();
            if (!hasTrack) {
              router.push("/(listener)/(tabs)/discover");
              return;
            }
            togglePlayback();
          }}
          hitSlop={12}
          style={styles.playBtn}
        >
          <Ionicons name={hasTrack ? (isPlaying ? "pause" : "play") : "compass-outline"} size={26} color={colors.text} />
        </Pressable>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  shell: {
    marginHorizontal: 4,
    marginTop: 8,
    marginBottom: 10,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceElevated,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 8
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    gap: 12
  },
  art: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center"
  },
  artMuted: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.border
  },
  meta: { flex: 1, gap: 2 },
  title: { fontFamily: FONT.semiBold, fontWeight: "600" },
  playBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center"
  }
});
