import { ScrollView, Text, View, TouchableOpacity, Platform } from "react-native";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
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
  const [reminderDismissed, setReminderDismissed] = useState(false);

  const today = new Date().toISOString().split("T")[0];
  const REMINDER_KEY = `fither_reminder_dismissed_${today}`;

  useEffect(() => {
    const idx = Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length);
    setQuote(MOTIVATIONAL_QUOTES[idx]);
  }, []);

  useEffect(() => {
    AsyncStorage.getItem(REMINDER_KEY).then((val) => {
      if (val === "true") setReminderDismissed(true);
    });
  }, [REMINDER_KEY]);

  const handleDismissReminder = async () => {
    await AsyncStorage.setItem(REMINDER_KEY, "true");
    setReminderDismissed(true);
  };

  useEffect(() => {
    if (!state.isLoading && !state.onboardingDone) {
      router.replace("/onboarding");
    }
  }, [state.isLoading, state.onboardingDone]);

  if (state.isLoading) {
    return (
      <ScreenContainer className="items-center justify-center">
        <Text style={{ fontSize: 18, color: colors.muted }}>Loading...</Text>
      </ScreenContainer>
    );
  }

  const currentPhase = getCyclePhase(state.cycleData);
  const phaseInfo = currentPhase ? CYCLE_PHASES[currentPhase as keyof typeof CYCLE_PHASES] : null;
  const todayDay = new Date().getDay();
  const isRestDay = state.schedule[todayDay]?.isRestDay ?? false;

  const workedOutToday = state.history.some((h) => h.date === today);
  const showReminder = state.onboardingDone && !workedOutToday && !isRestDay && !reminderDismissed;
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
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
        {/* Greeting */}
        <View style={{ marginBottom: 16 }}>
          <Text style={{ fontSize: 24, fontWeight: "700", color: colors.foreground }}>
            Hey, {state.profile?.name || "Beautiful"} 👋
          </Text>
          <Text style={{ fontSize: 13, color: colors.muted, marginTop: 4, fontStyle: "italic" }}>"{quote}"</Text>
        </View>

        {/* Daily Workout Reminder */}
        {showReminder && (
          <View
            style={{
              backgroundColor: colors.primary + "18",
              borderWidth: 1,
              borderColor: colors.primary + "50",
              borderRadius: 16,
              padding: 14,
              marginBottom: 16,
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <Text style={{ fontSize: 24, marginRight: 10 }}>🏋️‍♀️</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 14, fontWeight: "700", color: colors.primary }}>
                No workout yet today!
              </Text>
              <Text style={{ fontSize: 12, color: colors.muted, marginTop: 2 }}>
                Even 10 minutes makes a difference. Let's go!
              </Text>
              <TouchableOpacity
                onPress={() => router.push("/(tabs)/workouts")}
                style={{
                  marginTop: 8,
                  backgroundColor: colors.primary,
                  borderRadius: 10,
                  paddingVertical: 6,
                  paddingHorizontal: 14,
                  alignSelf: "flex-start",
                }}
                activeOpacity={0.8}
              >
                <Text style={{ color: "#FFF", fontSize: 12, fontWeight: "700" }}>Start Now</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              onPress={handleDismissReminder}
              style={{ padding: 4, marginLeft: 4 }}
              activeOpacity={0.7}
            >
              <MaterialIcons name="close" size={18} color={colors.muted} />
            </TouchableOpacity>
          </View>
        )}

        {/* Cycle Phase Banner */}
        {phaseInfo && (
          <TouchableOpacity
            onPress={() => router.push("/(tabs)/cycle")}
            style={{
              backgroundColor: phaseInfo.color + "20",
              borderColor: phaseInfo.color,
              borderWidth: 1,
              borderRadius: 16,
              padding: 12,
              marginBottom: 16,
              flexDirection: "row",
              alignItems: "center",
            }}
            activeOpacity={0.7}
          >
            <Text style={{ fontSize: 24, marginRight: 8 }}>{phaseInfo.icon}</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ color: phaseInfo.color, fontWeight: "600", fontSize: 14 }}>
                {phaseInfo.name} Phase
              </Text>
              <Text style={{ fontSize: 12, color: colors.muted }}>{phaseInfo.description}</Text>
            </View>
            <MaterialIcons name="chevron-right" size={20} color={colors.muted} />
          </TouchableOpacity>
        )}

        {/* Today's Status */}
        <View style={{ backgroundColor: colors.surface, borderRadius: 16, padding: 16, marginBottom: 16 }}>
          <Text style={{ fontSize: 16, fontWeight: "600", color: colors.foreground, marginBottom: 12 }}>Today's Plan</Text>
          {isRestDay ? (
            <View style={{ alignItems: "center", paddingVertical: 16 }}>
              <Text style={{ fontSize: 40 }}>🧘‍♀️</Text>
              <Text style={{ fontSize: 18, fontWeight: "600", color: colors.foreground, marginTop: 8 }}>Rest Day</Text>
              <Text style={{ fontSize: 14, color: colors.muted, textAlign: "center", marginTop: 4 }}>
                Take it easy! Stretch, hydrate, and recover.
              </Text>
            </View>
          ) : (
            <TouchableOpacity
              onPress={() => router.push("/(tabs)/workouts")}
              style={{ backgroundColor: colors.primary, borderRadius: 12, padding: 16, alignItems: "center" }}
              activeOpacity={0.8}
            >
              <MaterialIcons name="play-arrow" size={32} color="#FFF" />
              <Text style={{ color: "#FFF", fontWeight: "700", fontSize: 16, marginTop: 4 }}>Start Workout</Text>
              <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: 12, marginTop: 2 }}>Tap to choose a plan</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Quick Stats */}
        <View style={{ flexDirection: "row", gap: 12, marginBottom: 16 }}>
          <View style={{ flex: 1, backgroundColor: colors.surface, borderRadius: 16, padding: 12, alignItems: "center" }}>
            <MaterialIcons name="local-fire-department" size={24} color={colors.warning} />
            <Text style={{ fontSize: 18, fontWeight: "700", color: colors.foreground, marginTop: 4 }}>{state.goals.currentStreak}</Text>
            <Text style={{ fontSize: 11, color: colors.muted }}>Day Streak</Text>
          </View>
          <View style={{ flex: 1, backgroundColor: colors.surface, borderRadius: 16, padding: 12, alignItems: "center" }}>
            <MaterialIcons name="fitness-center" size={24} color={colors.primary} />
            <Text style={{ fontSize: 18, fontWeight: "700", color: colors.foreground, marginTop: 4 }}>{thisWeekWorkouts}/{state.goals.weeklyWorkouts}</Text>
            <Text style={{ fontSize: 11, color: colors.muted }}>This Week</Text>
          </View>
          <View style={{ flex: 1, backgroundColor: colors.surface, borderRadius: 16, padding: 12, alignItems: "center" }}>
            <MaterialIcons name="bolt" size={24} color={colors.success} />
            <Text style={{ fontSize: 18, fontWeight: "700", color: colors.foreground, marginTop: 4 }}>{state.goals.totalCalories}</Text>
            <Text style={{ fontSize: 11, color: colors.muted }}>Calories</Text>
          </View>
        </View>

        {/* Water Intake */}
        <View style={{ backgroundColor: colors.surface, borderRadius: 16, padding: 16, marginBottom: 16 }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <MaterialIcons name="water-drop" size={20} color="#2196F3" />
              <Text style={{ fontSize: 16, fontWeight: "600", color: colors.foreground, marginLeft: 8 }}>Water Intake</Text>
            </View>
            <Text style={{ fontSize: 13, color: colors.muted }}>{state.todayWater}/{state.goals.dailyWater} glasses</Text>
          </View>
          {/* Progress bar */}
          <View style={{ height: 12, backgroundColor: colors.border, borderRadius: 6, overflow: "hidden", marginBottom: 12 }}>
            <View
              style={{ width: `${waterProgress * 100}%`, backgroundColor: "#2196F3", height: "100%", borderRadius: 6 }}
            />
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 16 }}>
            <TouchableOpacity
              onPress={removeWater}
              style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: colors.border, alignItems: "center", justifyContent: "center" }}
              activeOpacity={0.7}
            >
              <MaterialIcons name="remove" size={20} color={colors.foreground} />
            </TouchableOpacity>
            <Text style={{ fontSize: 24 }}>💧</Text>
            <TouchableOpacity
              onPress={addWater}
              style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center" }}
              activeOpacity={0.7}
            >
              <MaterialIcons name="add" size={20} color="#FFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Suggested Workouts */}
        <View style={{ marginBottom: 16 }}>
          <Text style={{ fontSize: 16, fontWeight: "600", color: colors.foreground, marginBottom: 12 }}>Suggested For You</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {DEFAULT_WORKOUT_PLANS.slice(0, 4).map((plan) => (
              <TouchableOpacity
                key={plan.id}
                onPress={() => router.push({ pathname: "/workout-detail", params: { planId: plan.id } })}
                style={{
                  backgroundColor: colors.surface,
                  borderRadius: 16,
                  padding: 16,
                  marginRight: 12,
                  borderWidth: 1,
                  borderColor: colors.border,
                  width: 180,
                }}
                activeOpacity={0.7}
              >
                <Text style={{ fontSize: 24, marginBottom: 8 }}>
                  {plan.difficulty === "beginner" ? "🌱" : plan.difficulty === "intermediate" ? "🔥" : "⚡"}
                </Text>
                <Text style={{ fontSize: 14, fontWeight: "600", color: colors.foreground }} numberOfLines={1}>{plan.name}</Text>
                <Text style={{ fontSize: 12, color: colors.muted, marginTop: 4 }}>{plan.duration} min • {plan.difficulty}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Footer */}
        <View style={{ alignItems: "center", marginTop: 16, marginBottom: 32 }}>
          <Text style={{ fontSize: 12, color: colors.muted }}>Developed by Markus with ❤️</Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
