import { ScrollView, Text, View, TouchableOpacity, Linking } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { ScreenContainer } from "@/components/screen-container";
import { useApp } from "@/lib/app-context";
import { DEFAULT_WORKOUT_PLANS, EXERCISES, WorkoutPlan } from "@/data/exercises";
import { useColors } from "@/hooks/use-colors";

export default function WorkoutDetailScreen() {
  const router = useRouter();
  const { planId, isCustom } = useLocalSearchParams<{ planId: string; isCustom?: string }>();
  const { state } = useApp();
  const colors = useColors();

  const plan: WorkoutPlan | undefined = isCustom === "1"
    ? state.customPlans.find((p) => p.id === planId)
    : DEFAULT_WORKOUT_PLANS.find((p) => p.id === planId);

  if (!plan) {
    return (
      <ScreenContainer className="items-center justify-center px-6">
        <Text className="text-lg text-foreground">Plan not found</Text>
        <TouchableOpacity onPress={() => router.back()} className="mt-4 bg-primary rounded-xl px-6 py-3" activeOpacity={0.7}>
          <Text className="text-white font-semibold">Go Back</Text>
        </TouchableOpacity>
      </ScreenContainer>
    );
  }

  const exercises = plan.exercises.map((id) => EXERCISES.find((e) => e.id === id)).filter(Boolean);
  const totalCalories = exercises.reduce((sum, e) => sum + (e?.calories || 0), 0);

  const getDifficultyColor = (d: string) => {
    if (d === "beginner") return colors.success;
    if (d === "intermediate") return colors.warning;
    return colors.error;
  };

  const openYouTube = (youtubeId: string) => {
    Linking.openURL(`https://www.youtube.com/watch?v=${youtubeId}`);
  };

  return (
    <ScreenContainer className="px-4 pt-2">
      {/* Header */}
      <View className="flex-row items-center mb-4">
        <TouchableOpacity onPress={() => router.back()} className="mr-3" activeOpacity={0.7}>
          <MaterialIcons name="arrow-back" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-foreground flex-1" numberOfLines={1}>{plan.name}</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Plan Info */}
        <View className="bg-surface rounded-2xl p-4 mb-4">
          <Text className="text-sm text-muted mb-3">{plan.description}</Text>
          <View className="flex-row items-center gap-4">
            <View className="flex-row items-center">
              <MaterialIcons name="schedule" size={16} color={colors.muted} />
              <Text className="text-sm text-muted ml-1">{plan.duration} min</Text>
            </View>
            <View className="flex-row items-center">
              <MaterialIcons name="local-fire-department" size={16} color={colors.warning} />
              <Text className="text-sm text-muted ml-1">~{totalCalories} cal</Text>
            </View>
            <View style={{ backgroundColor: getDifficultyColor(plan.difficulty) + "20" }} className="px-2 py-0.5 rounded-full">
              <Text style={{ color: getDifficultyColor(plan.difficulty) }} className="text-xs font-semibold capitalize">
                {plan.difficulty}
              </Text>
            </View>
          </View>
          <View className="flex-row flex-wrap gap-1.5 mt-3">
            {plan.bodyParts.map((part) => (
              <View key={part} className="bg-primary/10 px-2 py-0.5 rounded-full">
                <Text className="text-xs text-primary font-medium">{part}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Exercise List */}
        <Text className="text-base font-semibold text-foreground mb-3">
          Exercises ({exercises.length})
        </Text>
        {exercises.map((exercise, index) => {
          if (!exercise) return null;
          return (
            <View key={exercise.id} className="bg-surface rounded-xl p-3 mb-2 border border-border">
              <View className="flex-row items-center">
                <View className="w-10 h-10 rounded-full bg-primary/10 items-center justify-center mr-3">
                  <Text className="text-lg">{exercise.image}</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-semibold text-foreground">{exercise.name}</Text>
                  <Text className="text-xs text-muted mt-0.5">
                    {exercise.reps ? `${exercise.reps} reps` : `${exercise.duration}s`}
                    {exercise.sets ? ` × ${exercise.sets} sets` : ""}
                    {" • "}{exercise.calories} cal
                  </Text>
                </View>
                {/* YouTube Preview Button */}
                <TouchableOpacity
                  onPress={() => openYouTube(exercise.youtubeId)}
                  className="bg-red-500 rounded-full w-9 h-9 items-center justify-center"
                  style={{ backgroundColor: "#FF0000" }}
                  activeOpacity={0.7}
                >
                  <MaterialIcons name="play-arrow" size={20} color="#FFF" />
                </TouchableOpacity>
              </View>
              <Text className="text-xs text-muted mt-2 ml-13" numberOfLines={2}>{exercise.description}</Text>
            </View>
          );
        })}
      </ScrollView>

      {/* Start Workout Button */}
      <View className="absolute bottom-6 left-4 right-4">
        <TouchableOpacity
          onPress={() => router.push({ pathname: "/exercise-player" as any, params: { planId: plan.id, isCustom: isCustom || "0" } })}
          className="bg-primary rounded-2xl py-4 items-center shadow-lg flex-row justify-center"
          activeOpacity={0.8}
        >
          <MaterialIcons name="play-arrow" size={24} color="#FFF" />
          <Text className="text-white font-bold text-lg ml-2">Start Workout</Text>
        </TouchableOpacity>
      </View>
    </ScreenContainer>
  );
}
