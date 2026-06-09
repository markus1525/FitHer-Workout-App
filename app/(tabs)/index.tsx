import { ScrollView, Text, View, TouchableOpacity, Platform } from "react-native";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { ScreenContainer } from "@/components/screen-container";
import { useApp } from "@/lib/app-context";
import { MOTIVATIONAL_QUOTES, DEFAULT_WORKOUT_PLANS, CYCLE_PHASES } from "@/data/exercises";
import { useColors } from "@/hooks/use-colors";

function getCyclePhase(cycleData: any[]): string | null {
  if (!cycleData || cycleData.length === 0) return null;
  const lastCycle = cycleData[cycleData.length - 1];
  const startDate = new Date(lastCycle.startDate);
  const today = new Date();
  const daysSinceStart = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const cycleLength = lastCycle.cycleLength || 28;
  const periodLength = lastCycle.periodLength || 5;
  const dayInCycle = daysSinceStart % cycleLength;

  if (dayInCycle < periodLength) return "menstrual";
  if (dayInCycle < 13) return "follicular";
  if (dayInCycle < 16) return "ovulation";
  return "luteal";
}

export default function HomeScreen() {
  const router = useRouter();
  const { state, addWater, removeWater } = useApp();
  const colors = useColors();
  const [quote, setQuote] = useState("");

  useEffect(() => {
    const idx = Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length);
    setQuote(MOTIVATIONAL_QUOTES[idx]);
  }, []);

  useEffect(() => {
    if (!state.isLoading && !state.onboardingDone) {
      router.replace("/onboarding");
    }
  }, [state.isLoading, state.onboardingDone]);

  if (state.isLoading) {
    return (
      <ScreenContainer className="items-center justify-center">
        <Text className="text-lg text-muted">Loading...</Text>
      </ScreenContainer>
    );
  }

  const currentPhase = getCyclePhase(state.cycleData);
  const phaseInfo = currentPhase ? CYCLE_PHASES[currentPhase as keyof typeof CYCLE_PHASES] : null;
  const todayDay = new Date().getDay();
  const isRestDay = state.schedule[todayDay]?.isRestDay ?? false;
  const thisWeekWorkouts = state.history.filter((h) => {
    const d = new Date(h.date);
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    return d >= startOfWeek;
  }).length;

  const waterProgress = state.goals.dailyWater > 0 ? Math.min(state.todayWater / state.goals.dailyWater, 1) : 0;

  return (
    <ScreenContainer className="px-4 pt-2">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Greeting */}
        <View className="mb-4">
          <Text className="text-2xl font-bold text-foreground">
            Hey, {state.profile?.name || "Beautiful"} 👋
          </Text>
          <Text className="text-sm text-muted mt-1 italic">"{quote}"</Text>
        </View>

        {/* Cycle Phase Banner */}
        {phaseInfo && (
          <TouchableOpacity
            onPress={() => router.push("/(tabs)/cycle")}
            style={{ backgroundColor: phaseInfo.color + "20", borderColor: phaseInfo.color, borderWidth: 1 }}
            className="rounded-2xl p-3 mb-4 flex-row items-center"
          >
            <Text className="text-2xl mr-2">{phaseInfo.icon}</Text>
            <View className="flex-1">
              <Text style={{ color: phaseInfo.color }} className="font-semibold text-sm">
                {phaseInfo.name} Phase
              </Text>
              <Text className="text-xs text-muted">{phaseInfo.description}</Text>
            </View>
            <MaterialIcons name="chevron-right" size={20} color={colors.muted} />
          </TouchableOpacity>
        )}

        {/* Today's Status */}
        <View className="bg-surface rounded-2xl p-4 mb-4">
          <Text className="text-base font-semibold text-foreground mb-3">Today's Plan</Text>
          {isRestDay ? (
            <View className="items-center py-4">
              <Text className="text-4xl mb-2">🧘‍♀️</Text>
              <Text className="text-lg font-semibold text-foreground">Rest Day</Text>
              <Text className="text-sm text-muted text-center mt-1">
                Take it easy! Stretch, hydrate, and recover.
              </Text>
            </View>
          ) : (
            <TouchableOpacity
              onPress={() => router.push("/(tabs)/workouts")}
              className="bg-primary rounded-xl p-4 items-center"
              style={{ opacity: 1 }}
              activeOpacity={0.8}
            >
              <MaterialIcons name="play-arrow" size={32} color="#FFF" />
              <Text className="text-white font-bold text-base mt-1">Start Workout</Text>
              <Text className="text-white/80 text-xs mt-0.5">Tap to choose a plan</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Quick Stats */}
        <View className="flex-row gap-3 mb-4">
          <View className="flex-1 bg-surface rounded-2xl p-3 items-center">
            <MaterialIcons name="local-fire-department" size={24} color={colors.warning} />
            <Text className="text-lg font-bold text-foreground mt-1">{state.goals.currentStreak}</Text>
            <Text className="text-xs text-muted">Day Streak</Text>
          </View>
          <View className="flex-1 bg-surface rounded-2xl p-3 items-center">
            <MaterialIcons name="fitness-center" size={24} color={colors.primary} />
            <Text className="text-lg font-bold text-foreground mt-1">{thisWeekWorkouts}/{state.goals.weeklyWorkouts}</Text>
            <Text className="text-xs text-muted">This Week</Text>
          </View>
          <View className="flex-1 bg-surface rounded-2xl p-3 items-center">
            <MaterialIcons name="bolt" size={24} color={colors.success} />
            <Text className="text-lg font-bold text-foreground mt-1">{state.goals.totalCalories}</Text>
            <Text className="text-xs text-muted">Calories</Text>
          </View>
        </View>

        {/* Water Intake */}
        <View className="bg-surface rounded-2xl p-4 mb-4">
          <View className="flex-row items-center justify-between mb-2">
            <View className="flex-row items-center">
              <MaterialIcons name="water-drop" size={20} color="#2196F3" />
              <Text className="text-base font-semibold text-foreground ml-2">Water Intake</Text>
            </View>
            <Text className="text-sm text-muted">{state.todayWater}/{state.goals.dailyWater} glasses</Text>
          </View>
          {/* Progress bar */}
          <View className="h-3 bg-border rounded-full overflow-hidden mb-3">
            <View
              style={{ width: `${waterProgress * 100}%`, backgroundColor: "#2196F3" }}
              className="h-full rounded-full"
            />
          </View>
          <View className="flex-row items-center justify-center gap-4">
            <TouchableOpacity
              onPress={removeWater}
              style={{ backgroundColor: colors.border }}
              className="w-10 h-10 rounded-full items-center justify-center"
              activeOpacity={0.7}
            >
              <MaterialIcons name="remove" size={20} color={colors.foreground} />
            </TouchableOpacity>
            <Text className="text-2xl">💧</Text>
            <TouchableOpacity
              onPress={addWater}
              className="w-10 h-10 rounded-full items-center justify-center bg-primary"
              activeOpacity={0.7}
            >
              <MaterialIcons name="add" size={20} color="#FFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Suggested Workouts */}
        <View className="mb-4">
          <Text className="text-base font-semibold text-foreground mb-3">Suggested For You</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {DEFAULT_WORKOUT_PLANS.slice(0, 4).map((plan) => (
              <TouchableOpacity
                key={plan.id}
                onPress={() => router.push({ pathname: "/workout-detail", params: { planId: plan.id } })}
                className="bg-surface rounded-2xl p-4 mr-3 border border-border"
                style={{ width: 180 }}
                activeOpacity={0.7}
              >
                <Text className="text-2xl mb-2">
                  {plan.difficulty === "beginner" ? "🌱" : plan.difficulty === "intermediate" ? "🔥" : "⚡"}
                </Text>
                <Text className="text-sm font-semibold text-foreground" numberOfLines={1}>{plan.name}</Text>
                <Text className="text-xs text-muted mt-1">{plan.duration} min • {plan.difficulty}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Footer */}
        <View className="items-center mt-4 mb-8">
          <Text className="text-xs text-muted">Developed by Markus with ❤️</Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
