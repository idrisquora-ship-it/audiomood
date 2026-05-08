import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_800ExtraBold
} from "@expo-google-fonts/inter";
import { QueryClientProvider } from "@tanstack/react-query";
import { useFonts } from "expo-font";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { ActivityIndicator, Platform, StatusBar as RNStatusBar, View } from "react-native";
import { SafeAreaProvider, initialWindowMetrics } from "react-native-safe-area-context";
import type { User } from "@supabase/supabase-js";
import { PlaybackBootstrap } from "@/components/player/PlaybackBootstrap";
import { ToastHost } from "@/components/ui/ToastHost";
import { registerPushTokenForCurrentUser } from "@/features/notifications/pushService";
import { queryClient } from "@/lib/queryClient";
import { supabase } from "@/lib/supabase";
import { colors } from "@/theme/colors";

SplashScreen.preventAutoHideAsync().catch(() => undefined);

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();
  const [bootstrapped, setBootstrapped] = useState(false);

  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold
  });

  const fontsReady = fontsLoaded || fontError != null;

  useEffect(() => {
    if (fontsReady) {
      void SplashScreen.hideAsync();
    }
  }, [fontsReady]);

  useEffect(() => {
    if (Platform.OS === "android") {
      RNStatusBar.setBackgroundColor(colors.background);
      RNStatusBar.setBarStyle("light-content");
    }
  }, []);

  useEffect(() => {
    void registerPushTokenForCurrentUser();
  }, []);

  useEffect(() => {
    let mounted = true;

    const enforceRouting = async (user: User | null) => {
      const inAuthGroup = segments[0] === "(auth)" || segments[0] === undefined;
      const inOnboarding = segments[0] === "(onboarding)";

      if (user && inAuthGroup) {
        const profile = await supabase.from("profiles").select("account_type").eq("user_id", user.id).single();
        const type = profile.data?.account_type;
        if (type === "artist" || type === "both") router.replace("/(artist)/(tabs)/dashboard");
        else router.replace("/(listener)/(tabs)/home");
      }

      if (!user && !inAuthGroup && !inOnboarding) {
        router.replace("/(auth)/welcome");
      }
    };

    void (async () => {
      const {
        data: { session }
      } = await supabase.auth.getSession();
      await enforceRouting(session?.user ?? null);
      if (mounted) setBootstrapped(true);
    })();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      void enforceRouting(session?.user ?? null);
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, [router, segments]);

  const showSplash = !bootstrapped || !fontsReady;

  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      {showSplash ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background }}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : (
        <QueryClientProvider client={queryClient}>
          <PlaybackBootstrap />
          <StatusBar style="light" backgroundColor={colors.background} />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { flex: 1, backgroundColor: colors.background }
            }}
          />
          <ToastHost />
        </QueryClientProvider>
      )}
    </SafeAreaProvider>
  );
}
