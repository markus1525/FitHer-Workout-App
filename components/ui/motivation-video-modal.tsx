import { View, Text, TouchableOpacity, Modal, Platform, StyleSheet } from "react-native";
import { useEffect, useRef, useState } from "react";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

const VIDEO_URL =
  "https://res.cloudinary.com/dfe3oqabh/video/upload/v1771838555/NOBODY_Believes_In_You_Gym_Motivation_-_Sam_Odenbach_720p_h264_ehu93l.mp4";

interface Props {
  visible: boolean;
  onClose: () => void;
  onDontShowAgain: () => void;
}

export function MotivationVideoModal({ visible, onClose, onDontShowAgain }: Props) {
  const [muted, setMuted] = useState(true);
  const videoRef = useRef<any>(null);

  useEffect(() => {
    if (Platform.OS !== "web" || !videoRef.current) return;
    if (visible) {
      videoRef.current.muted = true;
      videoRef.current.play().catch(() => {});
    } else {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
      setMuted(true);
    }
  }, [visible]);

  const toggleMute = () => {
    if (Platform.OS === "web" && videoRef.current) {
      videoRef.current.muted = !muted;
    }
    setMuted((m) => !m);
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
        {/* Full-screen video background (web only) */}
        {Platform.OS === "web" && (
          <View style={StyleSheet.absoluteFillObject}>
            {/* @ts-ignore - web-only HTML video element */}
            <video
              ref={videoRef}
              src={VIDEO_URL}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              } as any}
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
            />
          </View>
        )}

        {/* Dark gradient overlay at the bottom so text is readable */}
        <View style={styles.bottomOverlay} pointerEvents="none" />

        {/* Mute / unmute button */}
        <TouchableOpacity onPress={toggleMute} style={styles.muteBtn} activeOpacity={0.8}>
          <MaterialIcons name={muted ? "volume-off" : "volume-up"} size={18} color="#fff" />
          <Text style={styles.muteBtnText}>{muted ? "Tap for Sound" : "Sound On"}</Text>
        </TouchableOpacity>

        {/* CTA area pinned to bottom */}
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
