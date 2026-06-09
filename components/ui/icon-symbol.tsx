// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { SymbolWeight, SymbolViewProps } from "expo-symbols";
import { ComponentProps } from "react";
import { OpaqueColorValue, type StyleProp, type TextStyle } from "react-native";

type IconMapping = Record<SymbolViewProps["name"], ComponentProps<typeof MaterialIcons>["name"]>;
type IconSymbolName = keyof typeof MAPPING;

const MAPPING = {
  "house.fill": "home",
  "figure.run": "fitness-center",
  "target": "track-changes",
  "drop.fill": "water-drop",
  "person.fill": "person",
  "calendar": "event",
  "chevron.right": "chevron-right",
  "chevron.left": "chevron-left",
  "plus": "add",
  "play.fill": "play-arrow",
  "pause.fill": "pause",
  "xmark": "close",
  "checkmark": "check",
  "heart.fill": "favorite",
  "star.fill": "star",
  "flame.fill": "local-fire-department",
  "bolt.fill": "bolt",
  "moon.fill": "nightlight",
  "sun.max.fill": "wb-sunny",
  "bell.fill": "notifications",
  "gearshape.fill": "settings",
  "pencil": "edit",
  "trash.fill": "delete",
  "arrow.left": "arrow-back",
  "clock.fill": "schedule",
  "chart.bar.fill": "bar-chart",
  "paperplane.fill": "send",
  "chevron.left.forwardslash.chevron.right": "code",
} as IconMapping;

export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  return <MaterialIcons color={color} size={size} name={MAPPING[name]} style={style} />;
}
