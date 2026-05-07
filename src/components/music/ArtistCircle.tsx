import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, View } from "react-native";
import { AppText } from "@/components/ui/AppText";
import { colors } from "@/theme/colors";

type Props = {
  name: string;
  initial: string;
  gradient: [string, string];
};

export function ArtistCircle({ name, initial, gradient }: Props) {
  return (
    <View style={styles.wrap} accessibilityLabel={name}>
      <LinearGradient colors={gradient} style={styles.circle}>
        <AppText variant="section" style={styles.initial}>
          {initial}
        </AppText>
      </LinearGradient>
      <AppText numberOfLines={1} variant="caption" secondary style={styles.name}>
        {name}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: 76, alignItems: "center", marginRight: 14 },
  circle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
    borderWidth: 2,
    borderColor: colors.border
  },
  initial: {
    fontSize: 22,
    color: colors.text,
    fontWeight: "800"
  },
  name: { textAlign: "center", maxWidth: 76 }
});
