import { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Platform } from "react-native";
import { useColors } from "@/hooks/use-colors";

export default function TabLayout() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";

  // Tab bar sizing = a fixed content row (icon + label) + the bottom safe-area
  // inset, the same structure native iOS/Android tab bars use.
  // The content row needs ~54px so the 11px labels keep their full baseline —
  // anything under ~50px clips the text descenders.
  // Native: real inset from react-native-safe-area-context (with a minimum).
  // Web: CSS env() directly, since the JS-measured inset is unreliable in a
  // PWA. env() is exact per device thanks to viewport-fit=cover.
  const CONTENT = 54;
  const PAD_TOP = 4;
  const nativeBottom = Math.max(insets.bottom, 8);
  const webBottom = "max(8px, env(safe-area-inset-bottom, 0px))";

  const tabBarStyle: any = {
    paddingTop: PAD_TOP,
    paddingBottom: isWeb ? webBottom : nativeBottom,
    height: isWeb ? `calc(${CONTENT + PAD_TOP}px + ${webBottom})` : CONTENT + PAD_TOP + nativeBottom,
    backgroundColor: colors.background,
    borderTopColor: colors.border,
    borderTopWidth: 0.5,
  };

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        headerShown: false,
        tabBarStyle,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
          // Explicit line height so the label box always fits the text
          // baseline and descenders (g, y, p) instead of clipping them.
          lineHeight: 14,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => <MaterialIcons name="home" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="workouts"
        options={{
          title: "Workouts",
          tabBarIcon: ({ color, size }) => <MaterialIcons name="fitness-center" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="goals"
        options={{
          title: "Goals",
          tabBarIcon: ({ color, size }) => <MaterialIcons name="track-changes" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="cycle"
        options={{
          title: "Cycle",
          tabBarIcon: ({ color, size }) => <MaterialIcons name="favorite" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => <MaterialIcons name="person" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
