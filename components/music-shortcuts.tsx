import { View, Text, TouchableOpacity, Platform, Linking } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useColors } from "@/hooks/use-colors";

type MusicApp = {
  key: string;
  label: string;
  color: string;
  appUrl: string;
  webUrl: string;
};

// All apps are shown equally. Flow is the Myanmar music app.
const MUSIC_APPS: MusicApp[] = [
  { key: "spotify", label: "Spotify", color: "#1DB954", appUrl: "spotify://", webUrl: "https://open.spotify.com/search/workout" },
  { key: "apple", label: "Apple Music", color: "#FA243C", appUrl: "music://", webUrl: "https://music.apple.com/us/search?term=workout" },
  { key: "ytmusic", label: "YouTube Music", color: "#FF0000", appUrl: "https://music.youtube.com/search?q=workout", webUrl: "https://music.youtube.com/search?q=workout" },
  { key: "flow", label: "Flow", color: "#8B2FC9", appUrl: "https://www.flow.com.mm/", webUrl: "https://www.flow.com.mm/" },
];

const FLOW_ANDROID_PACKAGE = "com.legacymusicnetwork.flow";
const FLOW_PLAY_STORE = `https://play.google.com/store/apps/details?id=${FLOW_ANDROID_PACKAGE}`;
const FLOW_APP_STORE = "https://apps.apple.com/my/app/flow-music-for-myanmar/id6451472259";

function openMusic(app: MusicApp) {
  if (Platform.OS === "web") {
    if (typeof window !== "undefined") window.open(app.webUrl, "_blank");
    return;
  }

  // Flow has no public URL scheme, so open it by package on Android (falls back
  // to the Play Store), or the App Store on iOS.
  if (app.key === "flow") {
    if (Platform.OS === "android") {
      Linking.openURL(`intent://#Intent;package=${FLOW_ANDROID_PACKAGE};end`).catch(() => {
        Linking.openURL(FLOW_PLAY_STORE).catch(() => {});
      });
    } else {
      Linking.openURL(FLOW_APP_STORE).catch(() => {});
    }
    return;
  }

  Linking.canOpenURL(app.appUrl)
    .then((supported) => (supported ? Linking.openURL(app.appUrl) : Linking.openURL(app.webUrl)))
    .catch(() => Linking.openURL(app.webUrl).catch(() => {}));
}

/**
 * Quick links to open the user's music app so they can start a playlist
 * before or during a workout. The app's own sounds are set to duck/mix
 * (see setAudioModeAsync in app/_layout.tsx), so music keeps playing.
 */
export function MusicShortcuts({ compact = false }: { compact?: boolean }) {
  const colors = useColors();

  if (compact) {
    return (
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", flexWrap: "wrap", gap: 6 }}>
        <MaterialIcons name="headphones" size={16} color={colors.muted} />
        {MUSIC_APPS.map((app) => (
          <TouchableOpacity
            key={app.key}
            onPress={() => openMusic(app)}
            style={{
              paddingHorizontal: 10,
              paddingVertical: 6,
              borderRadius: 16,
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: colors.border,
              flexDirection: "row",
              alignItems: "center",
              gap: 4,
            }}
            activeOpacity={0.7}
            accessibilityLabel={`Open ${app.label}`}
          >
            <MaterialIcons name="music-note" size={13} color={app.color} />
            <Text style={{ fontSize: 12, fontWeight: "600", color: colors.foreground }}>{app.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  }

  return (
    <View style={{ backgroundColor: colors.surface, borderRadius: 16, padding: 16, marginBottom: 16 }}>
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
        <MaterialIcons name="headphones" size={18} color={colors.primary} />
        <Text style={{ fontSize: 14, fontWeight: "600", color: colors.foreground, marginLeft: 8 }}>Music for your workout</Text>
      </View>
      {/* 2 x 2 grid, all apps equal */}
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        {MUSIC_APPS.map((app) => (
          <TouchableOpacity
            key={app.key}
            onPress={() => openMusic(app)}
            style={{
              width: "48%",
              paddingVertical: 12,
              borderRadius: 12,
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "row",
              gap: 6,
              backgroundColor: colors.background,
              borderWidth: 1,
              borderColor: colors.border,
            }}
            activeOpacity={0.8}
            accessibilityLabel={`Open ${app.label}`}
          >
            <MaterialIcons name="music-note" size={16} color={app.color} />
            <Text style={{ fontSize: 13, fontWeight: "700", color: colors.foreground }} numberOfLines={1}>
              {app.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <Text style={{ fontSize: 11, color: colors.muted, marginTop: 10, lineHeight: 16 }}>
        Opens your music app. It keeps playing in the background while you train.
      </Text>
    </View>
  );
}
