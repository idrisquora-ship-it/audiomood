import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import { colors } from "@/theme/colors";

export function SkeletonBlock({ style }: { style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.base, style]} />;
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.cardAlt,
    borderRadius: 10
  }
});
