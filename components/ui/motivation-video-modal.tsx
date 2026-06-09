import { View, Text, TouchableOpacity, Modal, StyleSheet } from "react-native";
import { useEffect, useState } from "react";
import { VideoView, useVideoPlayer } from "expo-video";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

// Served from public/video/ — copied to dist root by expo export.
// The baseUrl /FitHer-Workout-App is set in experiments.baseUrl in app.config.ts.
const VIDEO_SOURCE = "/FitHer-Workout-App/video/motivational.mp4";

interface Props {
  visible: boolean;
  onClose: () => void;
  onDontShowAgain: () => void;
}

export function MotivationVideoModal({ visible, onClose, onDontShowAgain }: Props) {
  const [muted, setMuted] = useState(true);

  const player = useVideoPlayer(VIDEO_SOURCE, (p) => {
    p.loop = true;
    p.muted = true;
  });

  useEffect(() => {
    if (visible) {
      player.muted = true;
      player.play();
      setMuted(true);
    } else {
      player.pause();
      player.muted = true;
      setMuted(true);
    }
  }, [visible]);

  const toggleMute = () => {
    const next = !muted;
    player.muted = next;
    setMuted(next);
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      statusBarTranslucent
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        {/* Full-screen video */}
        <VideoView
          player={player}
          style={StyleSheet.absoluteFillObject}
          contentFit="cover"
          nativeControls={false}
        />

        {/* Dark overlay at bottom so text is readable */}
        <View style={styles.bottomOverlay} pointerEvents="none" />

        {/* Sound toggle */}
        <TouchableOpacity onPress={toggleMute} style={styles.muteBtn} activeOpacity={0.8}>
          <MaterialIcons name={muted ? "volume-off" : "volume-up"} size={18} color="#fff" />
          <Text style={styles.muteBtnText}>{muted ? "Tap for Sound" : "Sound On"}</Text>
        </TouchableOpacity>

        {/* Bottom CTA */}
        <View style={styles.bottomArea}>
          <Text style={styles.headline}>YOU GOT THIS 💪</Text>
          <Text style={styles.subtitle}>Every rep brings you closer to your goal.</Text>

          <TouchableOpacity onPress={onClose} style={styles.ctaBtn} activeOpacity={0.85}>
            <Text style={styles.ctaBtnText}>LET'S TRAIN! 🔥</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={onDontShowAgain} style={styles.dontShowBtn} activeOpacity={0.7}>
            <Text style={styles.dontShowText}>Don't show again</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "#111",
  },
  bottomOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 360,
    backgroundColor: "rgba(0,0,0,0.65)",
  },
  muteBtn: {
    position: "absolute",
    top: 52,
    right: 20,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 7,
    gap: 6,
  },
  muteBtnText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  bottomArea: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 28,
    paddingBottom: 52,
    paddingTop: 28,
    alignItems: "center",
  },
  headline: {
    fontSize: 26,
    fontWeight: "800",
    color: "#fff",
    textAlign: "center",
    letterSpacing: 1,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.75)",
    textAlign: "center",
    marginBottom: 28,
    lineHeight: 20,
  },
  ctaBtn: {
    backgroundColor: "#E91E63",
    borderRadius: 30,
    paddingVertical: 16,
    paddingHorizontal: 48,
    alignItems: "center",
    width: "100%",
    shadowColor: "#E91E63",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  ctaBtnText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: 1,
  },
  dontShowBtn: {
    marginTop: 14,
  },
  dontShowText: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 13,
    textDecorationLine: "underline",
  },
});
