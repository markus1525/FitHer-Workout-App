import { View, Text, TouchableOpacity, Modal, Platform, StyleSheet } from "react-native";
import { useEffect, useRef, useState } from "react";
import { VideoView, useVideoPlayer } from "expo-video";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

const getAssetUrl = (path: string) => {
  if (Platform.OS !== "web") {
    return path;
  }
  if (typeof window !== "undefined") {
    const pathname = window.location.pathname;
    if (pathname.includes("/FitHer-Workout-App")) {
      return `/FitHer-Workout-App${path}`;
    }
  }
  return path;
};

const VIDEO_URL = "https://markus1525.github.io/FitHer-Workout-App/video/motivational.mp4";

interface Props {
  visible: boolean;
  onClose: () => void;
  onDontShowAgain: () => void;
  /** First and second show: false (plays with sound). Third time onwards: true (muted). */
  startMuted?: boolean;
}

export function MotivationVideoModal({ visible, onClose, onDontShowAgain, startMuted = false }: Props) {
  const [muted, setMuted] = useState(true);

  // Web: control via HTML video ref
  const videoRef = useRef<any>(null);

  // Native: expo-video player (null source on web to satisfy hook rules)
  const player = useVideoPlayer(Platform.OS !== "web" ? VIDEO_URL : null, (p) => {
    p.loop = true;
    p.muted = true;
    p.play();
  });

  // Web autoplay handling: try to play with sound if permitted, fall back to muted if blocked.
  useEffect(() => {
    if (Platform.OS !== "web") return;
    if (!visible) {
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
      }
      setMuted(true);
      return;
    }

    const tryPlay = () => {
      const vid = videoRef.current;
      if (!vid) return;

      if (startMuted) {
        vid.muted = true;
        setMuted(true);
        vid.play().catch((err: any) => {
          console.log("Muted autoplay failed:", err);
        });
      } else {
        // Try playing with sound directly (which is allowed if the user had a recent interaction)
        vid.muted = false;
        setMuted(false);
        vid.play()
          .catch((err: any) => {
            console.log("Autoplay with sound failed, falling back to muted:", err);
            // Fall back to muted play, which is guaranteed to be allowed
            vid.muted = true;
            setMuted(true);
            vid.play().catch((err2: any) => {
              console.log("Muted fallback play failed:", err2);
            });
          });
      }
    };

    // Short delay so the Modal has time to render the video element
    const t = setTimeout(tryPlay, 80);
    return () => clearTimeout(t);
  }, [visible, startMuted]);

  // Native: play/pause with visibility
  useEffect(() => {
    if (Platform.OS === "web") return;
    if (visible) {
      player.muted = startMuted;
      player.play();
      setMuted(startMuted);
    } else {
      player.pause();
      setMuted(true);
    }
  }, [visible, startMuted]);

  const toggleMute = () => {
    const next = !muted;
    if (Platform.OS === "web" && videoRef.current) {
      videoRef.current.muted = next;
    } else {
      player.muted = next;
    }
    setMuted(next);
  };

  return (
    <Modal visible={visible} animationType="fade" statusBarTranslucent transparent onRequestClose={onClose}>
      <View style={styles.overlay}>

        {/* Full-screen video */}
        {Platform.OS === "web" ? (
          <View style={StyleSheet.absoluteFillObject}>
            {/* @ts-ignore - web-only HTML element */}
            <video
              ref={videoRef}
              src={VIDEO_URL}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
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
        ) : (
          <VideoView
            player={player}
            style={StyleSheet.absoluteFillObject}
            contentFit="cover"
            nativeControls={false}
          />
        )}

        {/* Gradient overlay — CSS gradient on web, stepped Views on native */}
        {Platform.OS === "web" ? (
          <View
            pointerEvents="none"
            style={[
              styles.gradientOverlay,
              { backgroundImage: "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.95) 65%)" } as any,
            ]}
          />
        ) : (
          <View pointerEvents="none" style={styles.gradientOverlay}>
            <View style={{ flex: 1, backgroundColor: "transparent" }} />
            <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.2)" }} />
            <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.45)" }} />
            <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.7)" }} />
            <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.9)" }} />
          </View>
        )}

        {/* Sound toggle — shown when muted so user can tap to unmute */}
        {muted && (
          <TouchableOpacity onPress={toggleMute} style={styles.muteBtn} activeOpacity={0.8}>
            <MaterialIcons name="volume-off" size={18} color="#fff" />
            <Text style={styles.muteBtnText}>Tap for Sound</Text>
          </TouchableOpacity>
        )}

        {/* CTA */}
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
    backgroundColor: "#000",
  },
  gradientOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 500,
  },
  muteBtn: {
    position: "absolute",
    top: 52,
    right: 20,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.55)",
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
