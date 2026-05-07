import { Tabs } from "expo-router";
import { listenerTabIcons, premiumTabBarOptions } from "@/navigation/tabBar";

export default function ListenerTabsLayout() {
  return (
    <Tabs
      screenOptions={({
        route
      }: {
        route: { name: keyof typeof listenerTabIcons };
      }) => ({
        ...premiumTabBarOptions,
        tabBarIcon: ({ focused, color, size }: { focused: boolean; color: string; size: number }) => {
          const Cmp = listenerTabIcons[route.name];
          return Cmp ? Cmp({ focused, color, size }) : null;
        }
      })}
    >
      <Tabs.Screen name="home" options={{ title: "Home" }} />
      <Tabs.Screen name="search" options={{ title: "Search" }} />
      <Tabs.Screen name="library" options={{ title: "Library" }} />
      <Tabs.Screen name="discover" options={{ title: "Discover" }} />
      <Tabs.Screen name="profile" options={{ title: "Profile" }} />
    </Tabs>
  );
}
