import { View, Platform, type ViewProps } from "react-native";
import { SafeAreaView, type Edge } from "react-native-safe-area-context";

import { useColors } from "@/hooks/use-colors";
import { cn } from "@/lib/utils";

export interface ScreenContainerProps extends ViewProps {
  /**
   * SafeArea edges to apply. Defaults to ["top", "left", "right"].
   * Bottom is typically handled by Tab Bar.
   */
  edges?: Edge[];
  /**
   * Tailwind className for the content area.
   */
  className?: string;
  /**
   * Additional className for the outer container (background layer).
   */
  containerClassName?: string;
  /**
   * Additional className for the SafeAreaView (content layer).
   */
  safeAreaClassName?: string;
}

/**
 * A container component that properly handles SafeArea and background colors.
 *
 * The outer View extends to full screen (including status bar area) with the background color,
 * while the inner SafeAreaView ensures content is within safe bounds.
 *
 * Usage:
 * ```tsx
 * <ScreenContainer className="p-4">
 *   <Text className="text-2xl font-bold text-foreground">
 *     Welcome
 *   </Text>
 * </ScreenContainer>
 * ```
 */
export function ScreenContainer({
  children,
  edges = ["top", "left", "right"],
  className,
  containerClassName,
  safeAreaClassName,
  style,
  ...props
}: ScreenContainerProps) {
  const colors = useColors();

  // Web: apply safe-area padding with CSS env() directly instead of the
  // measured insets from react-native-safe-area-context. The JS-measured
  // insets are unreliable in an iOS PWA (bottom often reads 0, and adding
  // a fixed extra padding on top double-counts the notch). CSS env() is
  // always accurate thanks to viewport-fit=cover, and the max() fallback
  // keeps a small gap in desktop browsers where env() is 0.
  if (Platform.OS === "web") {
    const has = (edge: Edge) => edges.includes(edge);
    const webSafeArea = {
      paddingTop: has("top") ? ("max(16px, env(safe-area-inset-top, 0px))" as any) : 0,
      paddingBottom: has("bottom") ? ("max(12px, env(safe-area-inset-bottom, 0px))" as any) : 0,
      paddingLeft: has("left") ? ("env(safe-area-inset-left, 0px)" as any) : 0,
      paddingRight: has("right") ? ("env(safe-area-inset-right, 0px)" as any) : 0,
    };

    return (
      <View
        className={cn("flex-1", containerClassName)}
        style={[{ backgroundColor: colors.background }]}
        {...props}
      >
        <View className={cn("flex-1", safeAreaClassName)} style={[style, webSafeArea]}>
          <View className={cn("flex-1", className)}>{children}</View>
        </View>
      </View>
    );
  }

  return (
    <View
      className={cn(
        "flex-1",
        containerClassName
      )}
      style={[{ backgroundColor: colors.background }]}
      {...props}
    >
      <SafeAreaView
        edges={edges}
        className={cn("flex-1", safeAreaClassName)}
        style={style}
      >
        <View className={cn("flex-1", className)}>{children}</View>
      </SafeAreaView>
    </View>
  );
}
