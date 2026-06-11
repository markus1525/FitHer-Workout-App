import { Modal, View, TouchableOpacity, Text, Platform, Linking, Dimensions, StyleSheet } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useColors } from "@/hooks/use-colors";

interface YouTubeModalProps {
  visible: boolean;
  videoId: string;
  title?: string;
  onClose: () => void;
}

/**
 * Open a YouTube search for an exercise. Used when an exercise has no specific
 * video id, so the tutorial shown is always a real, current result.
 */
export function openYouTubeSearch(query: string) {
  const q = encodeURIComponent(`${query} exercise tutorial`);
  const webUrl = `https://www.youtube.com/results?search_query=${q}`;
  if (Platform.OS === "web") {
    if (typeof window !== "undefined") window.open(webUrl, "_blank");
    return;
  }
  const appUrl = `youtube://results?search_query=${q}`;
  Linking.canOpenURL(appUrl)
    .then((supported) => (supported ? Linking.openURL(appUrl) : Linking.openURL(webUrl)))
    .catch(() => Linking.openURL(webUrl).catch(() => {}));
}

function openInYouTube(videoId: string) {
  const appUrl = `youtube://watch?v=${videoId}`;
  const webUrl = `https://www.youtube.com/watch?v=${videoId}`;

  if (Platform.OS === "web") {
    window.open(webUrl, "_blank");
    return;
  }

  Linking.canOpenURL(appUrl)
    .then((supported) => {
      if (supported) return Linking.openURL(appUrl);
      return Linking.openURL(webUrl);
    })
    .catch(() => Linking.openURL(webUrl));
}

export function YouTubeModal({ visible, videoId, title, onClose }: YouTubeModalProps) {
  const colors = useColors();
  const { width } = Dimensions.get("window");
  const thumbWidth = Math.min(width - 48, 480);
  const thumbHeight = Math.round(thumbWidth * 9 / 16);

  // Web: use iframe embed (not affected by Error 152-4)
  if (Platform.OS === "web") {
    return (
      <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
        <View style={styles.backdrop}>
          <TouchableOpacity style={StyleSheet.absoluteFillObject} onPress={onClose} activeOpacity={1} />
          <View style={[styles.card, { backgroundColor: colors.surface, width: thumbWidth + 48 }]}>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
              <MaterialIcons name="close" size={22} color={colors.foreground} />
            </TouchableOpacity>
            {title && (
              <Text style={[styles.title, { color: colors.foreground, marginBottom: 12, alignSelf: "flex-start" }]} numberOfLines={2}>
                {title}
              </Text>
            )}
            {/* @ts-ignore web iframe */}
            <iframe
              width={thumbWidth}
              height={thumbHeight}
              src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              style={{ borderRadius: 12, display: "block" }}
            />
          </View>
        </View>
      </Modal>
    );
  }

  // Native: branded card that opens in YouTube app / browser
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <View style={styles.backdrop}>
        <TouchableOpacity style={StyleSheet.absoluteFillObject} onPress={onClose} activeOpacity={1} />

        <View style={[styles.card, { backgroundColor: colors.surface, width: thumbWidth + 48 }]}>
          {/* Header row */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.foreground }]} numberOfLines={2}>
              {title ?? "Watch Video"}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
              <MaterialIcons name="close" size={22} color={colors.foreground} />
            </TouchableOpacity>
          </View>

          {/* Thumbnail placeholder */}
          <View style={[styles.thumbContainer, { width: thumbWidth, height: thumbHeight }]}>
            <MaterialIcons name="play-circle-filled" size={72} color="rgba(255,255,255,0.9)" />
            <View style={styles.ytBadge}>
              <MaterialIcons name="smart-display" size={16} color="#FF0000" />
              <Text style={styles.ytBadgeText}>YouTube</Text>
            </View>
          </View>

          {/* Open button */}
          <TouchableOpacity
            onPress={() => { openInYouTube(videoId); onClose(); }}
            style={styles.openBtn}
            activeOpacity={0.85}
          >
            <MaterialIcons name="open-in-new" size={18} color="#FFF" />
            <Text style={styles.openBtnText}>Open in YouTube</Text>
          </TouchableOpacity>

          <Text style={styles.hint}>Opens in the YouTube app or browser</Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.75)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  card: {
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 12,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 14,
    width: "100%",
    gap: 8,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(128,128,128,0.15)",
    flexShrink: 0,
  },
  title: {
    fontSize: 15,
    fontWeight: "700",
    lineHeight: 21,
    flex: 1,
  },
  thumbContainer: {
    borderRadius: 12,
    backgroundColor: "#111",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  ytBadge: {
    position: "absolute",
    bottom: 10,
    left: 10,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.7)",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 4,
  },
  ytBadgeText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "700",
  },
  openBtn: {
    backgroundColor: "#FF0000",
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 32,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    width: "100%",
    justifyContent: "center",
    marginBottom: 10,
  },
  openBtnText: {
    color: "#FFF",
    fontSize: 15,
    fontWeight: "700",
  },
  hint: {
    color: "rgba(128,128,128,0.75)",
    fontSize: 12,
  },
});
