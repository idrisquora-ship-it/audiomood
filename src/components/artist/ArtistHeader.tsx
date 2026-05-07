import { Pressable, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AppText } from "@/components/ui/AppText";
import { colors } from "@/theme/colors";
import { FONT } from "@/theme/typography";
import { spacing } from "@/theme/spacing";

type Props = {
  title: string;
  subtitle: string;
  /** Initials or short label if no image */
  avatarFallback?: string;
  onPressNotification?: () => void;
  notificationDot?: boolean;
};

export function ArtistHeader({ title, subtitle, avatarFallback = "A", onPressNotification, notificationDot }: Props) {
  const initial = avatarFallback.trim().slice(0, 2).toUpperCase() || "?";
  return (
    <View style={styles.row}>
      <View style={styles.lead}>
        <AppText variant="screenTitle" numberOfLines={1} style={styles.title}>
          {title}
        </AppText>
        <AppText secondary variant="body" numberOfLines={2} style={styles.sub}>
          {subtitle}
        </AppText>
      </View>
      <View style={styles.tail}>
        <Pressable
          accessibilityRole="button"
          onPress={onPressNotification ?? (() => {})}
          style={({ pressed }) => [styles.notify, pressed && styles.pressed]}
          hitSlop={10}
        >
          <Ionicons name="notifications-outline" size={22} color={colors.text} />
          {notificationDot ? <View style={styles.dot} /> : null}
        </Pressable>
        <View style={styles.avatar}>
          <AppText variant="caption" style={styles.avatarText}>
            {initial.slice(0, 1)}
          </AppText>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: spacing.sectionGap,
    gap: 12
  },
  lead: { flex: 1, minWidth: 0 },
  title: { fontSize: 26, lineHeight: 32 },
  sub: { marginTop: 8, lineHeight: 21 },
  tail: { flexDirection: "row", alignItems: "center", gap: 10 },
  notify: {
    width: 42,
    height: 42,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceElevated,
    alignItems: "center",
    justifyContent: "center"
  },
  pressed: { opacity: 0.88 },
  dot: {
    position: "absolute",
    top: 8,
    right: 9,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.primary
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 2,
    borderColor: colors.primaryDark,
    backgroundColor: colors.surfaceElevated,
    alignItems: "center",
    justifyContent: "center"
  },
  avatarText: { color: colors.primary, fontFamily: FONT.bold }
});
