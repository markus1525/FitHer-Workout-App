import { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Platform } from "react-native";
import { useColors } from "@/hooks/use-colors";

export default function TabLayout() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";

  // Native: use the real safe-area inset (34 on devices with a home indicator,
  // small on older phones), with a minimum for breathing room.
  // Web: use the CSS env() value directly, which is accurate per device thanks
  // to viewport-fit=cover. The bar dips 6px into the inset zone (still well
  // above the home indicator pill) so the white strip stays small, and the
  // content row keeps a fixed 48px so icon + label never get clipped.
  const nativeBottom = Math.max(insets.bottom, 10);
  const webBottom = "max(6px, calc(env(safe-area-inset-bottom, 0px) - 6px))";

  const tabBarStyle: any = {
    paddingTop: isWeb ? 6 : 8,
    paddingBottom: isWeb ? webBottom : nativeBottom,
    height: isWeb ? `calc(54px + ${webBottom})` : 56 + nativeBottom,
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
