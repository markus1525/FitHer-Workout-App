import { Text, View, TouchableOpacity, Platform } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState, useEffect, useRef } from "react";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAudioPlayer } from "expo-audio";
import { ScreenContainer } from "@/components/screen-container";
import { AppDialog, DialogButton } from "@/components/ui/app-dialog";
import { YouTubeModal } from "@/components/youtube-modal";
import { useApp } from "@/lib/app-context";
import { DEFAULT_WORKOUT_PLANS, EXERCISES, Exercise } from "@/data/exercises";
import { useColors } from "@/hooks/use-colors";
import { WorkoutHistoryEntry } from "@/lib/storage";

const beepSource = require("@/assets/sounds/beep.wav");

export default function ExercisePlayerScreen() {
  const router = useRouter();
  const { planId, isCustom } = useLocalSearchParams<{ planId: string; isCustom?: string }>();
  const { state, logWorkout } = useApp();
  const colors = useColors();

  const plan = isCustom === "1"
    ? state.customPlans.find((p) => p.id === planId)
    : DEFAULT_WORKOUT_PLANS.find((p) => p.id === planId);

  const exercises = plan?.exercises.map((id) => EXERCISES.find((e) => e.id === id)).filter(Boolean) as Exercise[] || [];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [finished, setFinished] = useState(false); // current exercise timer hit 0, waiting for user to confirm next
  const [isComplete, setIsComplete] = useState(false);
  const [videoModal, setVideoModal] = useState<{ visible: boolean; videoId: string; title: string }>({
    visible: false,
    videoId: "",
    title: "",
  });

  // Settings (loaded from AsyncStorage)
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [defaultTimer, setDefaultTimer] = useState(0); // 0 = use the exercise's own duration

  // Resume prompt dialog
  const [dialog, setDialog] = useState<{ title: string; message?: string; buttons: DialogButton[] } | null>(null);
  const SESSION_KEY = "fither_active_session";

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(Date.now());
  const soundEnabledRef = useRef(true);
  const defaultTimerRef = useRef(0);
  const settingsLoadedRef = useRef(false);

  const beepPlayer = useAudioPlayer(beepSource);

  const currentExercise = exercises[currentIndex];

  // How long this exercise should run for, honoring the user's default timer setting
  const durationFor = (ex?: Exercise) => {
    if (!ex) return 0;
    return defaultTimerRef.current > 0 ? defaultTimerRef.current : ex.duration;
  };

  // Load settings once, then set the starting time for the first exercise
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [snd, def] = await Promise.all([
          AsyncStorage.getItem("fither_exercise_sound_enabled"),
          AsyncStorage.getItem("fither_default_timer"),
        ]);
        if (!active) return;
        const sndOn = snd !== "false";
        const defVal = def ? parseInt(def) || 0 : 0;
        setSoundEnabled(sndOn);
        setDefaultTimer(defVal);
        soundEnabledRef.current = sndOn;
        defaultTimerRef.current = defVal;
      } catch {
        // keep defaults
      } finally {
        settingsLoadedRef.current = true;
        if (active && exercises[0]) {
          setTimeLeft(durationFor(exercises[0]));
        }
      }

      // Offer to resume an interrupted session for this same plan today
      try {
        const raw = await AsyncStorage.getItem(SESSION_KEY);
        if (active && raw && plan) {
          const saved = JSON.parse(raw);
          const todayStr = new Date().toISOString().split("T")[0];
          if (
            saved &&
            saved.planId === plan.id &&
            saved.date === todayStr &&
            typeof saved.currentIndex === "number" &&
            saved.currentIndex > 0 &&
            saved.currentIndex < exercises.length
          ) {
            setDialog({
              title: "Resume workout?",
              message: `You stopped at exercise ${saved.currentIndex + 1} of ${exercises.length}.`,
              buttons: [
                {
                  label: "Start over",
                  style: "cancel",
                  onPress: () => {
                    setCurrentIndex(0);
                    setTimeLeft(durationFor(exercises[0]));
                    setDialog(null);
                  },
                },
                {
                  label: "Resume",
                  onPress: () => {
                    setCurrentIndex(saved.currentIndex);
                    setTimeLeft(durationFor(exercises[saved.currentIndex]));
                    setDialog(null);
                  },
                },
              ],
            });
          }
        }
      } catch {
        // ignore resume read errors
      }
    })();
    startTimeRef.current = Date.now();
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const playAlarm = () => {
    if (!soundEnabledRef.current) return;
    if (Platform.OS !== "web") {
      try {
        const Haptics = require("expo-haptics");
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch {
        // haptics optional
      }
    }
    try {
      beepPlayer.seekTo(0);
      beepPlayer.play();
    } catch {
      // sound is best effort, never block the workout
    }
  };

  // Countdown
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            if (intervalRef.current) clearInterval(intervalRef.current);
            handleTimerEnd();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRunning, currentIndex]);

  // Persist progress so an interrupted workout can be resumed later today
  useEffect(() => {
    if (isComplete || !plan) return;
    AsyncStorage.setItem(
      SESSION_KEY,
      JSON.stringify({
        planId: plan.id,
        isCustom: isCustom || "0",
        currentIndex,
        date: new Date().toISOString().split("T")[0],
      })
    ).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, isComplete]);

  const clearSession = () => {
    AsyncStorage.removeItem(SESSION_KEY).catch(() => {});
  };

  // The exercise timer reached 0. Stop, sound the alarm, and wait for the user.
  const handleTimerEnd = () => {
    setIsRunning(false);
    setFinished(true);
    playAlarm();
  };

  // User confirms moving on (no auto-advance)
  const goToNext = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (currentIndex < exercises.length - 1) {
      const nextIdx = currentIndex + 1;
      setFinished(false);
      setCurrentIndex(nextIdx);
      setTimeLeft(durationFor(exercises[nextIdx]));
      setIsRunning(true); // they confirmed, so start the next exercise
    } else {
      handleWorkoutComplete();
    }
  };

  const handleWorkoutComplete = () => {
    setIsRunning(false);
    setIsComplete(true);
    clearSession();
    const duration = Math.round((Date.now() - startTimeRef.current) / 60000);
    const totalCalories = exercises.reduce((sum, e) => sum + e.calories, 0);

    const entry: WorkoutHistoryEntry = {
      id: Date.now().toString(),
      date: new Date().toISOString().split("T")[0],
      planId: plan?.id || "",
      planName: plan?.name || "",
      duration: Math.max(duration, 1),
      caloriesBurned: totalCalories,
      exercisesCompleted: exercises.length,
    };
    logWorkout(entry);
  };

  const togglePlayPause = () => {
    if (finished) return; // use the Next button when an exercise has finished
    if (timeLeft === 0) {
      setTimeLeft(durationFor(currentExercise));
    }
    setIsRunning((r) => !r);
  };

  // Adjust the current exercise time on the fly
  const adjustTime = (delta: number) => {
    setTimeLeft((prev) => Math.min(3600, Math.max(5, prev + delta)));
  };

  const skipExercise = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setFinished(false);
    if (currentIndex < exercises.length - 1) {
      const nextIdx = currentIndex + 1;
      setCurrentIndex(nextIdx);
      setTimeLeft(durationFor(exercises[nextIdx]));
      setIsRunning(false);
    } else {
      handleWorkoutComplete();
    }
  };

  const prevExercise = () => {
    if (currentIndex > 0) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setFinished(false);
      const prevIdx = currentIndex - 1;
      setCurrentIndex(prevIdx);
      setTimeLeft(durationFor(exercises[prevIdx]));
      setIsRunning(false);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const openVideoPreview = (youtubeId: string, exerciseName: string) => {
    // Pause the timer when watching video
    setIsRunning(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
    setVideoModal({ visible: true, videoId: youtubeId, title: exerciseName });
  };

  const closeVideoPreview = () => {
    setVideoModal({ visible: false, videoId: "", title: "" });
  };

  if (!plan || exercises.length === 0) {
    return (
      <ScreenContainer className="items-center justify-center px-6">
        <Text style={{ fontSize: 18, color: colors.foreground }}>Workout not found</Text>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 16, backgroundColor: colors.primary, borderRadius: 12, paddingHorizontal: 24, paddingVertical: 12 }} activeOpacity={0.7}>
          <Text style={{ color: "#FFF", fontWeight: "600" }}>Go Back</Text>
        </TouchableOpacity>
      </ScreenContainer>
    );
  }

  if (isComplete) {
    const totalCalories = exercises.reduce((sum, e) => sum + e.calories, 0);
    const duration = Math.round((Date.now() - startTimeRef.current) / 60000);
    return (
      <ScreenContainer edges={["top", "bottom", "left", "right"]} className="items-center justify-center px-6">
        <Text style={{ fontSize: 56 }}>🎉</Text>
        <Text style={{ fontSize: 24, fontWeight: "700", color: colors.foreground, textAlign: "center", marginTop: 16 }}>Workout Complete!</Text>
        <Text style={{ fontSize: 16, color: colors.muted, textAlign: "center", marginTop: 8 }}>Amazing job! You crushed it!</Text>

        <View style={{ flexDirection: "row", gap: 24, marginTop: 32, marginBottom: 32 }}>
          <View style={{ alignItems: "center" }}>
            <Text style={{ fontSize: 24, fontWeight: "700", color: colors.primary }}>{Math.max(duration, 1)}</Text>
            <Text style={{ fontSize: 12, color: colors.muted }}>Minutes</Text>
          </View>
          <View style={{ alignItems: "center" }}>
            <Text style={{ fontSize: 24, fontWeight: "700", color: colors.primary }}>{totalCalories}</Text>
            <Text style={{ fontSize: 12, color: colors.muted }}>Calories</Text>
          </View>
          <View style={{ alignItems: "center" }}>
            <Text style={{ fontSize: 24, fontWeight: "700", color: colors.primary }}>{exercises.length}</Text>
            <Text style={{ fontSize: 12, color: colors.muted }}>Exercises</Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={() => router.replace("/")}
          style={{ backgroundColor: colors.primary, borderRadius: 16, paddingHorizontal: 32, paddingVertical: 16, width: "100%", alignItems: "center" }}
          activeOpacity={0.7}
        >
          <Text style={{ color: "#FFF", fontWeight: "700", fontSize: 18 }}>Done</Text>
        </TouchableOpacity>
      </ScreenContainer>
    );
  }

  const progress = (currentIndex + 1) / exercises.length;
  const isLast = currentIndex === exercises.length - 1;

  return (
    <ScreenContainer edges={["top", "bottom", "left", "right"]} className="px-4">
      {/* YouTube Video Modal */}
      <YouTubeModal
        visible={videoModal.visible}
        videoId={videoModal.videoId}
        title={videoModal.title}
        onClose={closeVideoPreview}
      />

      <AppDialog
        visible={dialog !== null}
        title={dialog?.title || ""}
        message={dialog?.message}
        buttons={dialog?.buttons || []}
        onDismiss={() => setDialog(null)}
      />

      {/* Header */}
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <TouchableOpacity onPress={() => { clearSession(); router.back(); }} activeOpacity={0.7}>
          <MaterialIcons name="close" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={{ fontSize: 14, fontWeight: "600", color: colors.muted }}>
          {currentIndex + 1} / {exercises.length}
        </Text>
        <TouchableOpacity onPress={skipExercise} activeOpacity={0.7}>
          <MaterialIcons name="skip-next" size={24} color={colors.foreground} />
        </TouchableOpacity>
      </View>

      {/* Progress Bar */}
      <View style={{ height: 6, backgroundColor: colors.border, borderRadius: 3, overflow: "hidden", marginBottom: 24 }}>
        <View style={{ width: `${progress * 100}%`, backgroundColor: colors.primary, height: "100%", borderRadius: 3 }} />
      </View>

      {/* Main Content */}
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        {finished ? (
          <>
            <Text style={{ fontSize: 48 }}>✅</Text>
            <Text style={{ fontSize: 22, fontWeight: "700", color: colors.foreground, marginTop: 12 }}>
              {currentExercise.name} done!
            </Text>
            <Text style={{ fontSize: 14, color: colors.muted, marginTop: 4, textAlign: "center" }}>
              {isLast ? "That was the last one." : `Take a breather, then continue. Next: ${exercises[currentIndex + 1]?.name}`}
            </Text>
          </>
        ) : (
          <>
            <Text style={{ fontSize: 56 }}>{currentExercise.image}</Text>
            <Text style={{ fontSize: 22, fontWeight: "700", color: colors.foreground, textAlign: "center", marginTop: 12 }}>{currentExercise.name}</Text>
            <Text style={{ fontSize: 14, color: colors.muted, textAlign: "center", marginTop: 8, paddingHorizontal: 16 }}>{currentExercise.description}</Text>
            {currentExercise.reps && (
              <Text style={{ fontSize: 14, color: colors.primary, fontWeight: "600", marginTop: 8 }}>
                {currentExercise.reps} reps {currentExercise.sets ? `× ${currentExercise.sets} sets` : ""}
              </Text>
            )}
          </>
        )}

        {/* Timer */}
        <View style={{ marginTop: 32, alignItems: "center" }}>
          <Text style={{ fontSize: 56, fontWeight: "700", color: finished ? colors.success : colors.foreground }}>{formatTime(timeLeft)}</Text>
        </View>

        {/* Time adjust controls (hidden once the exercise has finished) */}
        {!finished && (
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 16 }}>
            {[-15, -5, 5, 15].map((delta) => (
              <TouchableOpacity
                key={delta}
                onPress={() => adjustTime(delta)}
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  borderRadius: 10,
                  backgroundColor: colors.surface,
                  borderWidth: 1,
                  borderColor: colors.border,
                }}
                activeOpacity={0.7}
              >
                <Text style={{ fontSize: 13, fontWeight: "600", color: colors.foreground }}>
                  {delta > 0 ? `+${delta}` : delta}s
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Confirm to proceed (only when finished) */}
        {finished && (
          <TouchableOpacity
            onPress={goToNext}
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginTop: 24,
              backgroundColor: colors.primary,
              borderRadius: 14,
              paddingHorizontal: 28,
              paddingVertical: 14,
            }}
            activeOpacity={0.8}
          >
            <MaterialIcons name={isLast ? "check" : "arrow-forward"} size={22} color="#FFF" />
            <Text style={{ fontSize: 16, color: "#FFF", fontWeight: "700", marginLeft: 8 }}>
              {isLast ? "Finish Workout" : "Next Exercise"}
            </Text>
          </TouchableOpacity>
        )}

        {/* Watch Preview Button - opens in-app modal */}
        {!finished && currentExercise && (
          <TouchableOpacity
            onPress={() => openVideoPreview(currentExercise.youtubeId, currentExercise.name)}
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginTop: 24,
              backgroundColor: colors.surface,
              borderRadius: 12,
              paddingHorizontal: 16,
              paddingVertical: 10,
              borderWidth: 1,
              borderColor: colors.border,
            }}
            activeOpacity={0.7}
          >
            <MaterialIcons name="play-circle-filled" size={24} color="#FF0000" />
            <Text style={{ fontSize: 14, color: colors.foreground, fontWeight: "500", marginLeft: 8 }}>Watch Preview</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Controls */}
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 32, marginBottom: 32 }}>
        <TouchableOpacity onPress={prevExercise} style={{ opacity: currentIndex === 0 ? 0.3 : 1 }} activeOpacity={0.7}>
          <MaterialIcons name="skip-previous" size={36} color={colors.foreground} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={togglePlayPause}
          style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: finished ? colors.border : colors.primary, alignItems: "center", justifyContent: "center", opacity: finished ? 0.5 : 1 }}
          activeOpacity={0.7}
          disabled={finished}
        >
          <MaterialIcons name={isRunning ? "pause" : "play-arrow"} size={36} color="#FFF" />
        </TouchableOpacity>
        <TouchableOpacity onPress={skipExercise} activeOpacity={0.7}>
          <MaterialIcons name="skip-next" size={36} color={colors.foreground} />
        </TouchableOpacity>
      </View>
    </ScreenContainer>
  );
}
