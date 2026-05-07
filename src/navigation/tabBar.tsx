import type { BottomTabNavigationOptions } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import type { ComponentProps, ReactNode } from "react";
import { Platform } from "react-native";
import { colors } from "@/theme/colors";
import { FONT } from "@/theme/typography";

type TabBarIconProps = { focused: boolean; color: string; size: number };

const LISTENER_TAB_BORDER = "#222222";

type Ion = ComponentProps<typeof Ionicons>["name"];

export const premiumTabBarOptions: BottomTabNavigationOptions = {
  headerShown: false,
  tabBarStyle: {
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: LISTENER_TAB_BORDER,
    height: 78,
    paddingTop: 8,
    paddingBottom: 12
  },
  tabBarActiveTintColor: colors.primary,
  tabBarInactiveTintColor: colors.textMuted,
  tabBarLabelStyle: {
    fontSize: 11,
    fontFamily: FONT.medium,
    marginBottom: 4
  },
  tabBarIconStyle: { marginTop: 4 }
};

/** Normalize Expo Router nested route keys (e.g. `(tabs)` group) → leaf screen id. */
export function normalizeTabRouteName(routeName: string): string {
  const sanitized = routeName.replace(/[()]/g, "");
  const segments = sanitized.split("/").filter(Boolean);
  const leaf = segments[segments.length - 1];
  return leaf ?? routeName;
}

export function artistTabBarHeight(bottomInset: number): number {
  const pad = Math.max(bottomInset, Platform.OS === "ios" ? 8 : 6);
  return 56 + pad;
}

/** Dynamic tab bar tuned for thumb reach + safe home indicator. */
export function artistPremiumTabBarOptions(bottomInset: number): BottomTabNavigationOptions {
  const padBottom = Math.max(bottomInset, 10);
  return {
    headerShown: false,
    tabBarStyle: {
      backgroundColor: colors.surface,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      height: artistTabBarHeight(bottomInset),
      paddingTop: 8,
      paddingBottom: padBottom
    },
    tabBarActiveTintColor: colors.primary,
    tabBarInactiveTintColor: colors.textSecondary,
    tabBarLabelStyle: {
      fontSize: 11,
      fontFamily: FONT.semiBold,
      marginBottom: 2,
      letterSpacing: 0.2
    },
    tabBarIconStyle: { marginTop: 2 }
  };
}

function TabGlyph({ outline, solid, focused }: { outline: Ion; solid: Ion; focused: boolean }) {
  const color = focused ? colors.primary : colors.textSecondary;
  return <Ionicons name={focused ? solid : outline} size={24} color={color} />;
}

export const listenerTabIcons: Record<string, (props: TabBarIconProps) => ReactNode> = {
  home: ({ focused }) => <TabGlyph outline="home-outline" solid="home" focused={focused} />,
  search: ({ focused }) => <TabGlyph outline="search-outline" solid="search" focused={focused} />,
  library: ({ focused }) => <TabGlyph outline="musical-notes-outline" solid="musical-notes" focused={focused} />,
  discover: ({ focused }) => <TabGlyph outline="compass-outline" solid="compass" focused={focused} />,
  profile: ({ focused }) => <TabGlyph outline="person-outline" solid="person" focused={focused} />
};

export const artistTabIcons: Record<string, (props: TabBarIconProps) => ReactNode> = {
  dashboard: ({ focused }) => <TabGlyph outline="stats-chart-outline" solid="stats-chart" focused={focused} />,
  upload: ({ focused }) => <TabGlyph outline="cloud-upload-outline" solid="cloud-upload" focused={focused} />,
  music: ({ focused }) => <TabGlyph outline="musical-notes-outline" solid="musical-notes" focused={focused} />,
  analytics: ({ focused }) => <TabGlyph outline="pulse-outline" solid="pulse" focused={focused} />,
  profile: ({ focused }) => <TabGlyph outline="person-circle-outline" solid="person-circle" focused={focused} />
};

export function renderArtistTabIcon(routeName: string, props: TabBarIconProps): ReactNode {
  const key = normalizeTabRouteName(routeName);
  const Cmp = artistTabIcons[key];
  return Cmp ? Cmp(props) : artistTabIcons.dashboard(props);
}
