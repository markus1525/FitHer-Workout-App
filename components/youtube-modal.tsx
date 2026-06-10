import { Modal, View, TouchableOpacity, Text, Platform, Dimensions } from "react-native";
import { WebView } from "react-native-webview";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useColors } from "@/hooks/use-colors";

interface YouTubeModalProps {
  visible: boolean;
  videoId: string;
  title?: string;
  onClose: () => void;
}

function YouTubeWebPlayer({ videoId }: { videoId: string }) {
  const { width } = Dimensions.get("window");
  const playerWidth = Math.min(width - 32, 560);
  const playerHeight = Math.round(playerWidth * 9 / 16);

  if (Platform.OS === "web") {
    return (
      <iframe
        width={playerWidth}
        height={playerHeight}
        src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`}
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        style={{ borderRadius: 12 }}
      />
    );
  }

  return (
    <WebView
      source={{
        uri: `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&playsinline=1`,
        headers: {
          Referer: "https://www.youtube.com",
        },
      }}
      style={{ width: playerWidth, height: playerHeight, borderRadius: 12, overflow: "hidden", backgroundColor: "black" }}
      allowsFullscreenVideo
      mediaPlaybackRequiresUserAction={false}
      javaScriptEnabled
      domStorageEnabled
      originWhitelist={["*"]}
    />
  );
}

export function YouTubeModal({ visible, videoId, title, onClose }: YouTubeModalProps) {
  const colors = useColors();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.85)",
          justifyContent: "center",
          alignItems: "center",
          padding: 16,
        }}
      >
        {/* Close Button */}
        <TouchableOpacity
          onPress={onClose}
          style={{
            position: "absolute",
            top: 60,
            right: 20,
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: "rgba(255,255,255,0.15)",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10,
          }}
          activeOpacity={0.7}
        >
          <MaterialIcons name="close" size={24} color="#FFF" />
        </TouchableOpacity>

        {/* Video Title */}
        {title && (
          <View style={{ marginBottom: 12, paddingHorizontal: 16, width: "100%" }}>
            <Text style={{ color: "#FFF", fontSize: 16, fontWeight: "600", textAlign: "center" }} numberOfLines={2}>
              {title}
            </Text>
          </View>
        )}

        {/* Video Player */}
        <View style={{ borderRadius: 12, overflow: "hidden" }}>
          <YouTubeWebPlayer videoId={videoId} />
        </View>

        {/* Tap outside to close hint */}
        <TouchableOpacity
          onPress={onClose}
          style={{ marginTop: 20 }}
          activeOpacity={0.7}
        >
          <Text style={{ color: "rgba(255,255,255,0.6)", fontSize: 13 }}>Tap to close</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}
