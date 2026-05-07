import { Redirect } from "expo-router";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { AppText } from "@/components/ui/AppText";
import { Screen } from "@/components/ui/Screen";
import { colors } from "@/theme/colors";

export default function SplashScreen() {
  const isAuthenticated = false;
  if (isAuthenticated) return <Redirect href="/(listener)/(tabs)/home" />;

  return (
    <Screen>
      <View style={styles.root}>
        <ActivityIndicator color={colors.primary} />
        <AppText>Audiomood</AppText>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({ root: { flex: 1, alignItems: "center", justifyContent: "center", gap: 8 } });
