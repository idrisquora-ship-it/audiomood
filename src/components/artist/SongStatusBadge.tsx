import { StyleSheet, View } from "react-native";
import { AppText } from "@/components/ui/AppText";
import { colors } from "@/theme/colors";
import { FONT } from "@/theme/typography";

export type UiSongStatus =
  | "draft"
  | "processing_lyrics"
  | "pending_review"
  | "approved"
  | "rejected"
  | "hidden";

const LABELS: Record<UiSongStatus, string> = {
  draft: "Draft",
  processing_lyrics: "Lyrics",
  pending_review: "Review",
  approved: "Live",
  rejected: "Rejected",
  hidden: "Hidden"
};

/** Map DB song.status to condensed UI vocabulary */
export function mapDbSongStatus(db: string): UiSongStatus {
  if (db === "uploading") return "processing_lyrics";
  const allowed: UiSongStatus[] = ["draft", "processing_lyrics", "pending_review", "approved", "rejected", "hidden"];
  return (allowed.includes(db as UiSongStatus) ? db : "pending_review") as UiSongStatus;
}

export function SongStatusBadge({ status }: { status: UiSongStatus }) {
  const palette = PALETTE[status];
  return (
    <View style={[styles.wrap, { backgroundColor: palette.bg, borderColor: palette.border }]}>
      <AppText variant="caption" style={[styles.txt, { color: palette.color }]}>
        {LABELS[status]}
      </AppText>
    </View>
  );
}

const PALETTE: Record<UiSongStatus, { bg: string; border: string; color: string }> = {
  draft: { bg: "rgba(184,184,184,0.12)", border: colors.border, color: colors.textSecondary },
  processing_lyrics: { bg: "rgba(99,102,241,0.15)", border: "rgba(99,102,241,0.35)", color: "#A5B4FC" },
  pending_review: { bg: "rgba(255,106,0,0.14)", border: "rgba(255,106,0,0.35)", color: colors.primary },
  approved: { bg: "rgba(50,213,131,0.14)", border: "rgba(50,213,131,0.35)", color: colors.success },
  rejected: { bg: "rgba(240,68,56,0.14)", border: "rgba(240,68,56,0.35)", color: colors.danger },
  hidden: { bg: "rgba(184,184,184,0.1)", border: colors.border, color: colors.textMuted }
};

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 100,
    borderWidth: 1,
    alignSelf: "flex-start"
  },
  txt: { fontFamily: FONT.semiBold }
});
