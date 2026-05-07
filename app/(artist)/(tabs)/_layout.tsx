import { Tabs } from "expo-router";
import type { BottomTabNavigationOptions } from "@react-navigation/bottom-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { artistPremiumTabBarOptions, renderArtistTabIcon } from "@/navigation/tabBar";

export default function ArtistTabsLayout() {
  const { bottom } = useSafeAreaInsets();
  return (
    <Tabs
      screenOptions={(props: { route: { name: string } }): BottomTabNavigationOptions => ({
        ...artistPremiumTabBarOptions(bottom),
        tabBarIcon: (iconProps: { focused: boolean; color: string; size: number }) =>
          renderArtistTabIcon(props.route.name, iconProps)
      })}
    >
      <Tabs.Screen name="dashboard" options={{ title: "Dashboard" }} />
      <Tabs.Screen name="upload" options={{ title: "Upload" }} />
      <Tabs.Screen name="music" options={{ title: "Music" }} />
      <Tabs.Screen name="analytics" options={{ title: "Analytics" }} />
      <Tabs.Screen name="profile" options={{ title: "Profile" }} />
    </Tabs>
  );
}
