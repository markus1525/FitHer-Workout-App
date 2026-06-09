import { Text, View, TouchableOpacity } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState, useEffect, useRef } from "react";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { ScreenContainer } from "@/components/screen-container";
import { YouTubeModal } from "@/components/youtube-modal";
import { useApp } from "@/lib/app-context";
import { DEFAULT_WORKOUT_PLANS, EXERCISES, Exercise } from "@/data/exercises";
import { useColors } from "@/hooks/use-colors";
import { WorkoutHistoryEntry } from "@/lib/storage";

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
  const [isResting, setIsResting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [videoModal, setVideoModal] = useState<{ visible: boolean; videoId: string; title: string }>({
    visible: false,
    videoId: "",
    title: "",
  });
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(Date.now());

  const currentExercise = exercises[currentIndex];

  useEffect(() => {
    if (currentExercise) {
      setTimeLeft(currentExercise.duration);
    }
    startTimeRef.current = Date.now();
  }, []);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current!);
            handleExerciseComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, currentIndex, isResting]);

  const handleExerciseComplete = () => {
    if (isResting) {
      setIsResting(false);
      if (currentIndex < exercises.length - 1) {
        const nextIdx = currentIndex + 1;
        setCurrentIndex(nextIdx);
        setTimeLeft(exercises[nextIdx].duration);
        setIsRunning(true);
      }
    } else {
      if (currentIndex < exercises.length - 1) {
        setIsResting(true);
        setTimeLeft(15);
        setIsRunning(true);
      } else {
        handleWorkoutComplete();
      }
    }
  };

  const handleWorkoutComplete = () => {
    setIsRunning(false);
    setIsComplete(true);
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
    if (timeLeft === 0 && !isResting) {
      if (currentExercise) {
        setTimeLeft(currentExercise.duration);
      }
    }
    setIsRunning(!isRunning);
  };

  const skipExercise = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setIsResting(false);
    if (currentIndex < exercises.length - 1) {
      const nextIdx = currentIndex + 1;
      setCurrentIndex(nextIdx);
      setTimeLeft(exercises[nextIdx].duration);
      setIsRunning(false);
    } else {
      handleWorkoutComplete();
    }
  };

  const prevExercise = () => {
    if (currentIndex > 0) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setIsResting(false);
      const prevIdx = currentIndex - 1;
      setCurrentIndex(prevIdx);
      setTimeLeft(exercises[prevIdx].duration);
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

  return (
    <ScreenContainer edges={["top", "bottom", "left", "right"]} className="px-4">
      {/* YouTube Video Modal */}
      <YouTubeModal
        visible={videoModal.visible}
        videoId={videoModal.videoId}
        title={videoModal.title}
        onClose={closeVideoPreview}
      />

      {/* Header */}
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
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
        {isResting ? (
          <>
            <Text style={{ fontSize: 48 }}>😮‍💨</Text>
            <Text style={{ fontSize: 22, fontWeight: "700", color: colors.foreground, marginTop: 12 }}>Rest</Text>
            <Text style={{ fontSize: 14, color: colors.muted, marginTop: 4 }}>Next: {exercises[currentIndex + 1]?.name}</Text>
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
          <Text style={{ fontSize: 56, fontWeight: "700", color: colors.foreground }}>{formatTime(timeLeft)}</Text>
        </View>

        {/* Watch Preview Button - opens in-app modal */}
        {!isResting && currentExercise && (
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
          style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center" }}
          activeOpacity={0.7}
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
