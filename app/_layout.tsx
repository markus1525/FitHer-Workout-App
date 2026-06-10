import "@/global.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import Head from "expo-router/head";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useMemo, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-reanimated";
import { Platform, View, Text, TouchableOpacity, Linking } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import "@/lib/_core/nativewind-pressable";
import { ThemeProvider } from "@/lib/theme-provider";
import { useColors } from "@/hooks/use-colors";
import {
  SafeAreaFrameContext,
  SafeAreaInsetsContext,
  SafeAreaProvider,
  initialWindowMetrics,
} from "react-native-safe-area-context";
import type { EdgeInsets, Metrics, Rect } from "react-native-safe-area-context";
import {
  registerServiceWorker,
  scheduleDailyWorkoutReminder,
  scheduleDailyWaterReminder,
} from "@/lib/web-notifications";

import { trpc, createTRPCClient } from "@/lib/trpc";
import { initManusRuntime, subscribeSafeAreaInsets } from "@/lib/_core/manus-runtime";
import { AppProvider } from "@/lib/app-context";

const DEFAULT_WEB_INSETS: EdgeInsets = { top: 0, right: 0, bottom: 0, left: 0 };
const DEFAULT_WEB_FRAME: Rect = { x: 0, y: 0, width: 0, height: 0 };

export const unstable_settings = {
  initialRouteName: "(tabs)",
};

function ThemedRoot({ children }: { children: React.ReactNode }) {
  const colors = useColors();
  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.background }}>
      {children}
    </GestureHandlerRootView>
  );
}

export default function RootLayout() {
  const initialInsets = initialWindowMetrics?.insets ?? DEFAULT_WEB_INSETS;
  const initialFrame = initialWindowMetrics?.frame ?? DEFAULT_WEB_FRAME;

  const [insets, setInsets] = useState<EdgeInsets>(initialInsets);
  const [frame, setFrame] = useState<Rect>(initialFrame);
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    initManusRuntime();
  }, []);

  const handleSafeAreaUpdate = useCallback((metrics: Metrics) => {
    setInsets(metrics.insets);
    setFrame(metrics.frame);
  }, []);

  useEffect(() => {
    if (Platform.OS !== "web") return;
    const unsubscribe = subscribeSafeAreaInsets(handleSafeAreaUpdate);
    return () => unsubscribe();
  }, [handleSafeAreaUpdate]);

  // ── Service worker + offline detection + daily reminders (web only) ──────
  useEffect(() => {
    if (Platform.OS !== "web" || typeof window === "undefined") return;

    // Register service worker
    registerServiceWorker();

    // Offline detection
    const handleOffline = () => setIsOffline(true);
    const handleOnline = () => setIsOffline(false);
    setIsOffline(!navigator.onLine);
    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);

    // Schedule daily reminders if permission already granted
    if (typeof Notification !== "undefined" && Notification.permission === "granted") {
      scheduleDailyWorkoutReminder(8);   // 8:00 AM
      scheduleDailyWaterReminder(12);    // 12:00 PM
    }

    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      }),
  );
  const [trpcClient] = useState(() => createTRPCClient());

  const providerInitialMetrics = useMemo(() => {
    const metrics = initialWindowMetrics ?? { insets: initialInsets, frame: initialFrame };
    return {
      ...metrics,
      insets: {
        ...metrics.insets,
        top: Math.max(metrics.insets.top, 16),
        bottom: Math.max(metrics.insets.bottom, 12),
      },
    };
  }, [initialInsets, initialFrame]);

  const ICON_URL = "https://d2xsxph8kpxj0f.cloudfront.net/310519663523605261/3PvwNR8VybWQnjqXPU9foG/fither-icon-79aubkohDz4ENMLsKWHnyj.png";

  const content = (
    <ThemedRoot>
      {/* Offline banner */}
      {isOffline && (
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            zIndex: 9999,
            backgroundColor: "#1A1A2E",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: 16,
            paddingVertical: 10,
            paddingTop: Platform.OS === "web" ? 10 : 44,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8, flex: 1 }}>
            <MaterialIcons name="wifi-off" size={16} color="#E91E63" />
            <Text style={{ color: "#fff", fontSize: 13, fontWeight: "600" }}>
              You're offline
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => Linking.openURL("https://discord.gg/dWPwCy4GEG")}
            style={{
              backgroundColor: "#5865F2",
              borderRadius: 12,
              paddingHorizontal: 10,
              paddingVertical: 5,
            }}
            activeOpacity={0.8}
          >
            <Text style={{ color: "#fff", fontSize: 11, fontWeight: "700" }}>
              💬 Discord
            </Text>
          </TouchableOpacity>
        </View>
      )}
      <Head>
        <title>FitHer</title>
        <meta name="description" content="Your personal home workout app designed for women." />
        <meta name="theme-color" content="#E91E63" />
        {/* PWA / Add to Home Screen */}
        <meta name="application-name" content="FitHer" />
        <meta name="apple-mobile-web-app-title" content="FitHer" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <link rel="apple-touch-icon" sizes="180x180" href={ICON_URL} />
        <link rel="icon" type="image/png" sizes="192x192" href={ICON_URL} />
        <link rel="icon" type="image/png" sizes="512x512" href={ICON_URL} />
      </Head>
      <trpc.Provider client={trpcClient} queryClient={queryClient}>
        <QueryClientProvider client={queryClient}>
          <AppProvider>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="onboarding" options={{ presentation: "fullScreenModal" }} />
              <Stack.Screen name="workout-detail" />
              <Stack.Screen name="exercise-player" />
              <Stack.Screen name="create-plan" />
              <Stack.Screen name="bmi-calculator" />
              <Stack.Screen name="oauth/callback" />
            </Stack>
            <StatusBar style="auto" />
          </AppProvider>
        </QueryClientProvider>
      </trpc.Provider>
    </ThemedRoot>
  );

  const shouldOverrideSafeArea = Platform.OS === "web";

  if (shouldOverrideSafeArea) {
    return (
      <ThemeProvider>
        <SafeAreaProvider initialMetrics={providerInitialMetrics}>
          <SafeAreaFrameContext.Provider value={frame}>
            <SafeAreaInsetsContext.Provider value={insets}>
              {content}
            </SafeAreaInsetsContext.Provider>
          </SafeAreaFrameContext.Provider>
        </SafeAreaProvider>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <SafeAreaProvider initialMetrics={providerInitialMetrics}>{content}</SafeAreaProvider>
    </ThemeProvider>
  );
}
