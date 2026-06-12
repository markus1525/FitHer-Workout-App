import { View, Text, TouchableOpacity, Pressable, Modal, Platform, StyleSheet } from "react-native";
import { useEffect, useRef, useState } from "react";
import { VideoView, useVideoPlayer } from "expo-video";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

const VIDEO_URL = "https://markus1525.github.io/FitHer-Workout-App/video/motivational.mp4";
const LOCAL_VIDEO = require("../../assets/video/motivational.mp4");

interface Props {
  visible: boolean;
  onClose: () => void;
  onDontShowAgain: () => void;
  /** First show only: false (plays with sound). Every later show: true (muted). */
  startMuted?: boolean;
  /**
   * True only when the modal opens from a user tap (onboarding Complete). On
   * web that gesture lets the video autoplay with sound. When false (the app
   * auto-opens on launch), the video must start muted or the browser blocks it
   * and iOS can show a black frame.
   */
  allowSoundAutoplay?: boolean;
}

export function MotivationVideoModal({ visible, onClose, onDontShowAgain, startMuted = false, allowSoundAutoplay = false }: Props) {
  const [muted, setMuted] = useState(true);
  // Web: true when the browser refused autoplay entirely (e.g. iOS Low Power
  // Mode blocks ALL autoplay, even muted). We then wait for a tap to play.
  const [needsTap, setNeedsTap] = useState(false);

  // Web: control via HTML video ref
  const videoRef = useRef<any>(null);

  // pendingPlay: true when visible=true but player isn't ready yet (native only)
  const pendingPlay = useRef(false);

  // Native: expo-video player (null source on web to satisfy hook rules)
  const player = useVideoPlayer(Platform.OS !== "web" ? LOCAL_VIDEO : null, (p) => {
    p.loop = true;
    p.muted = true;
  });

  // Native only: listen for statusChange using player.addListener directly.
  // useEvent(null, ...) crashes on web so we use useEffect + addListener instead.
  useEffect(() => {
    if (Platform.OS === "web") return;
    const sub = player.addListener("statusChange", (payload: any) => {
      if (payload?.status === "readyToPlay" && pendingPlay.current) {
        pendingPlay.current = false;
        setTimeout(() => {
          player.muted = startMuted;
          player.play();
          setMuted(startMuted);
        }, 80);
      }
    });
    return () => sub.remove();
  }, [player, startMuted]);

  // Web: shared play helper used by both onCanPlay and the visibility effect.
  const webPlay = (vid: HTMLVideoElement) => {
    if (allowSoundAutoplay) {
      // Opened from a user tap (onboarding): try with sound, fall back to muted.
      vid.muted = startMuted;
      setMuted(startMuted);
      vid.play().then(() => setNeedsTap(false)).catch(() => {
        vid.muted = true;
        setMuted(true);
        vid.play().then(() => setNeedsTap(false)).catch(() => setNeedsTap(true));
      });
    } else {
      // Auto-opened on app launch: always start muted so the frame renders.
      // The "Tap for Sound" button lets the user unmute.
      vid.muted = true;
      setMuted(true);
      vid.play().then(() => setNeedsTap(false)).catch(() => {
        // Autoplay refused (iOS Low Power Mode blocks even muted autoplay).
        // Do NOT retry or reload in a loop — that causes a visible flicker.
        // Instead wait for a tap anywhere on the video to start playback.
        setNeedsTap(true);
      });
    }
  };

  // Web: a tap anywhere on the video counts as a user gesture, which is
  // always allowed to start playback (covers Low Power Mode).
  const handleVideoTap = () => {
    const vid = videoRef.current;
    if (Platform.OS !== "web" || !vid) return;
    vid.play().then(() => setNeedsTap(false)).catch(() => {});
  };

  // Web: fires when the video element is ready to play (first mount or src change).
  // This is more reliable than a fixed setTimeout because it waits for the actual
  // video metadata + buffer to be ready, not just the DOM element to exist.
  const handleWebCanPlay = () => {
    if (Platform.OS !== "web") return;
    const vid = videoRef.current;
    if (vid && visible) webPlay(vid);
  };

  // Web: when the modal becomes visible, attempt playback right away. Do NOT
  // wait for readyState/canplay here — iOS Safari does not buffer video data
  // until play() is requested, so waiting for canplay before calling play()
  // deadlocks and leaves a black frame. Calling play() on a still-loading
  // video is safe (the promise resolves once playback starts) and it forces
  // iOS to begin loading. onCanPlay stays as a backup trigger.
  useEffect(() => {
    if (Platform.OS !== "web") return;
    const vid = videoRef.current;
    if (!visible) {
      if (vid) { vid.pause(); vid.currentTime = 0; }
      setMuted(true);
      setNeedsTap(false);
      return;
    }
    if (vid) webPlay(vid);
  }, [visible, startMuted]);

  // Native: play/pause based on visibility
  // If already readyToPlay → play immediately (with small surface-attach delay)
  // If still loading → set pendingPlay so statusChange handler triggers play later
  useEffect(() => {
    if (Platform.OS === "web") return;
    if (visible) {
      const tryPlay = () => {
        if (player.status === "readyToPlay") {
          pendingPlay.current = false;
          player.muted = startMuted;
          player.play();
          setMuted(startMuted);
        }
      };
      // statusChange handler will start playback if the player is still loading
      pendingPlay.current = true;
      const t0 = setTimeout(tryPlay, 80);
      // Retry fallbacks: cover the race where readyToPlay fired before this
      // effect set pendingPlay (so the statusChange listener never plays) and
      // any case where the surface attached late and the frame stayed black.
      const t1 = setTimeout(() => { if (!player.playing) tryPlay(); }, 700);
      const t2 = setTimeout(() => { if (!player.playing) tryPlay(); }, 2000);
      return () => { clearTimeout(t0); clearTimeout(t1); clearTimeout(t2); };
    } else {
      pendingPlay.current = false;
      player.pause();
      setMuted(true);
    }
  }, [visible, startMuted]);

  const toggleMute = () => {
    const next = !muted;
    if (Platform.OS === "web" && videoRef.current) {
      videoRef.current.muted = next;
      // If autoplay was blocked, this tap is a gesture — start playback too.
      if (videoRef.current.paused) {
        videoRef.current.play().then(() => setNeedsTap(false)).catch(() => {});
      }
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
              loop
              muted
              playsInline
              preload="auto"
              // Declarative muted autoplay is the path iOS Safari honors most
              // reliably without a user gesture, and it forces the source to
              // start loading. Only skipped when the modal opens from a tap
              // (onboarding Complete), where we instead play with sound inside
              // the gesture context.
              autoPlay={!allowSoundAutoplay}
              onCanPlay={handleWebCanPlay}
            />
          </View>
        ) : (
          <VideoView
            player={player}
            style={StyleSheet.absoluteFillObject}
            contentFit="cover"
            nativeControls={false}
            allowsFullscreen={false}
            allowsPictureInPicture={false}
            // TextureView renders inside the view tree, so it attaches its
            // surface reliably inside a Modal. SurfaceView (the default) often
            // shows a black frame on first open and tears on reopen.
            surfaceType="textureView"
            // Once a real frame is on screen the surface is attached, so clear
            // any pending-play flag. If playback somehow has not started yet,
            // start it now.
            onFirstFrameRender={() => {
              pendingPlay.current = false;
              if (visible && player.status === "readyToPlay" && !player.playing) {
                player.play();
              }
            }}
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

        {/* Tap-to-play layer — only when the browser refused autoplay. Sits
            over the video (under the buttons) so tapping the dimmed iOS play
            icon, or anywhere else, starts playback with a real gesture. */}
        {Platform.OS === "web" && needsTap && (
          <Pressable style={StyleSheet.absoluteFillObject} onPress={handleVideoTap} />
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
