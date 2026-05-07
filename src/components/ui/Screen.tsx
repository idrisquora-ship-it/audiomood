import { PropsWithChildren, useMemo } from "react";
import { StyleSheet, View } from "react-native";
import type { Edge } from "react-native-safe-area-context";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";

/** When bottom edge applied, inset + this gap above gesture bar. */
const DEFAULT_BOTTOM_GAP = spacing.screenBottomGap;

export type ScreenProps = PropsWithChildren<{
  edges?: Edge[];
  /** Applied after `insets.top` when `edges` includes `top` (defaults to theme `screenTopGap`). */
  contentTopGap?: number;
}>;

export function Screen({
  children,
  edges = ["top", "left", "right", "bottom"],
  contentTopGap = spacing.screenTopGap
}: ScreenProps) {
  const insets = useSafeAreaInsets();

  const paddingStyle = useMemo(() => {
    const top = edges.includes("top") ? insets.top + contentTopGap : 0;
    const bottom = edges.includes("bottom") ? insets.bottom + DEFAULT_BOTTOM_GAP : 0;
    const left = (edges.includes("left") ? insets.left : 0) + spacing.screenHorizontal;
    const right = (edges.includes("right") ? insets.right : 0) + spacing.screenHorizontal;
    return { paddingTop: top, paddingBottom: bottom, paddingLeft: left, paddingRight: right };
  }, [contentTopGap, edges, insets.bottom, insets.left, insets.right, insets.top]);

  return (
    <View style={styles.root}>
      <View style={[styles.inner, paddingStyle]}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  inner: { flex: 1, backgroundColor: colors.background }
});
