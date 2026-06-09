import { Text, View, TouchableOpacity, Linking } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState, useEffect, useRef } from "react";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { ScreenContainer } from "@/components/screen-container";
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
  const [totalTime, setTotalTime] = useState(0);
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
        setTimeLeft(15); // 15 second rest
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

  if (!plan || exercises.length === 0) {
    return (
      <ScreenContainer className="items-center justify-center px-6">
        <Text className="text-lg text-foreground">Workout not found</Text>
        <TouchableOpacity onPress={() => router.back()} className="mt-4 bg-primary rounded-xl px-6 py-3" activeOpacity={0.7}>
          <Text className="text-white font-semibold">Go Back</Text>
        </TouchableOpacity>
      </ScreenContainer>
    );
  }

  if (isComplete) {
    const totalCalories = exercises.reduce((sum, e) => sum + e.calories, 0);
    const duration = Math.round((Date.now() - startTimeRef.current) / 60000);
    return (
      <ScreenContainer edges={["top", "bottom", "left", "right"]} className="items-center justify-center px-6">
        <Text className="text-6xl mb-4">🎉</Text>
        <Text className="text-2xl font-bold text-foreground text-center">Workout Complete!</Text>
        <Text className="text-base text-muted text-center mt-2">Amazing job! You crushed it!</Text>

        <View className="flex-row gap-6 mt-8 mb-8">
          <View className="items-center">
            <Text className="text-2xl font-bold text-primary">{Math.max(duration, 1)}</Text>
            <Text className="text-xs text-muted">Minutes</Text>
          </View>
          <View className="items-center">
            <Text className="text-2xl font-bold text-primary">{totalCalories}</Text>
            <Text className="text-xs text-muted">Calories</Text>
          </View>
          <View className="items-center">
            <Text className="text-2xl font-bold text-primary">{exercises.length}</Text>
            <Text className="text-xs text-muted">Exercises</Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={() => router.replace("/")}
          className="bg-primary rounded-2xl px-8 py-4 w-full items-center"
          activeOpacity={0.7}
        >
          <Text className="text-white font-bold text-lg">Done</Text>
        </TouchableOpacity>
      </ScreenContainer>
    );
  }

  const progress = (currentIndex + 1) / exercises.length;

  return (
    <ScreenContainer edges={["top", "bottom", "left", "right"]} className="px-4">
      {/* Header */}
      <View className="flex-row items-center justify-between mb-2">
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
          <MaterialIcons name="close" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <Text className="text-sm font-semibold text-muted">
          {currentIndex + 1} / {exercises.length}
        </Text>
        <TouchableOpacity onPress={skipExercise} activeOpacity={0.7}>
          <MaterialIcons name="skip-next" size={24} color={colors.foreground} />
        </TouchableOpacity>
      </View>

      {/* Progress Bar */}
      <View className="h-1.5 bg-border rounded-full overflow-hidden mb-6">
        <View style={{ width: `${progress * 100}%`, backgroundColor: colors.primary }} className="h-full rounded-full" />
      </View>

      {/* Main Content */}
      <View className="flex-1 items-center justify-center">
        {isResting ? (
          <>
            <Text className="text-4xl mb-4">😮‍💨</Text>
            <Text className="text-xl font-bold text-foreground">Rest</Text>
            <Text className="text-sm text-muted mt-1">Next: {exercises[currentIndex + 1]?.name}</Text>
          </>
        ) : (
          <>
            <Text className="text-5xl mb-4">{currentExercise.image}</Text>
            <Text className="text-xl font-bold text-foreground text-center">{currentExercise.name}</Text>
            <Text className="text-sm text-muted text-center mt-2 px-4">{currentExercise.description}</Text>
            {currentExercise.reps && (
              <Text className="text-sm text-primary font-semibold mt-2">
                {currentExercise.reps} reps {currentExercise.sets ? `× ${currentExercise.sets} sets` : ""}
              </Text>
            )}
          </>
        )}

        {/* Timer */}
        <View className="mt-8 items-center">
          <Text className="text-6xl font-bold text-foreground">{formatTime(timeLeft)}</Text>
        </View>

        {/* YouTube Preview */}
        {!isResting && currentExercise && (
          <TouchableOpacity
            onPress={() => Linking.openURL(`https://www.youtube.com/watch?v=${currentExercise.youtubeId}`)}
            className="flex-row items-center mt-6 bg-surface rounded-xl px-4 py-2.5 border border-border"
            activeOpacity={0.7}
          >
            <MaterialIcons name="play-circle-filled" size={24} color="#FF0000" />
            <Text className="text-sm text-foreground font-medium ml-2">Watch on YouTube</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Controls */}
      <View className="flex-row items-center justify-center gap-8 mb-8">
        <TouchableOpacity onPress={prevExercise} style={{ opacity: currentIndex === 0 ? 0.3 : 1 }} activeOpacity={0.7}>
          <MaterialIcons name="skip-previous" size={36} color={colors.foreground} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={togglePlayPause}
          className="w-16 h-16 rounded-full bg-primary items-center justify-center"
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
