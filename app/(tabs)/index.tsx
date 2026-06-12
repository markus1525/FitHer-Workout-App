import { ScrollView, Text, View, TouchableOpacity, Platform } from "react-native";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ScreenContainer } from "@/components/screen-container";
import { useApp } from "@/lib/app-context";
import { MOTIVATIONAL_QUOTES, DEFAULT_WORKOUT_PLANS, CYCLE_PHASES, EXERCISES } from "@/data/exercises";
import { useColors } from "@/hooks/use-colors";
import { MotivationVideoModal } from "@/components/ui/motivation-video-modal";
import { videoSession } from "@/lib/video-session";

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
  const [showVideo, setShowVideo] = useState(false);
  const [videoStartMuted, setVideoStartMuted] = useState(false);

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

  useEffect(() => {
    // Only show on subsequent opens — first-time is handled by onboarding.tsx.
    // Mark synchronously BEFORE the async read to prevent a race with onboarding.tsx.
    if (!state.isLoading && state.onboardingDone && !videoSession.shown) {
      videoSession.markShown();
      Promise.all([
        AsyncStorage.getItem("fither_welcome_video_enabled"),
        AsyncStorage.getItem("fither_welcome_video_count"),
      ]).then(([enabled, countStr]) => {
        if (enabled !== "false") {
          const count = parseInt(countStr || "0");
          // Only the very first play (from onboarding) is with sound;
          // every later auto-play starts muted
          setVideoStartMuted(count >= 1);
          AsyncStorage.setItem("fither_welcome_video_count", String(count + 1));
          setShowVideo(true);
        }
      });
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

  // Plan assigned to today (if any)
  const todayPlanId = state.schedule[todayDay]?.planId;
  const todayPlan = todayPlanId
    ? [...DEFAULT_WORKOUT_PLANS, ...state.customPlans].find((p) => p.id === todayPlanId)
    : undefined;
  const todayIsCustom = todayPlan ? !todayPlan.isDefault : false;
  const todayExercises = todayPlan
    ? todayPlan.exercises.map((id) => EXERCISES.find((e) => e.id === id)).filter(Boolean)
    : [];

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
      <MotivationVideoModal
        visible={showVideo}
        onClose={() => setShowVideo(false)}
        onDontShowAgain={() => {
          AsyncStorage.setItem("fither_welcome_video_enabled", "false");
          setShowVideo(false);
        }}
        startMuted={videoStartMuted}
      />
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
            <View style={{ paddingVertical: 8 }}>
              <View style={{ alignItems: "center" }}>
                <Text style={{ fontSize: 40 }}>🧘‍♀️</Text>
                <Text style={{ fontSize: 18, fontWeight: "600", color: colors.foreground, marginTop: 8 }}>Rest Day</Text>
                <Text style={{ fontSize: 14, color: colors.muted, textAlign: "center", marginTop: 4 }}>
                  Recovery is part of the plan. Try a little of this today:
                </Text>
              </View>
              <View style={{ marginTop: 12, gap: 8 }}>
                {[
                  { icon: "self-improvement", text: "5–10 min light stretching" },
                  { icon: "directions-walk", text: "An easy walk to stay active" },
                  { icon: "water-drop", text: "Drink your water goal" },
                  { icon: "bedtime", text: "Aim for good sleep tonight" },
                ].map((tip) => (
                  <View key={tip.text} style={{ flexDirection: "row", alignItems: "center" }}>
                    <MaterialIcons name={tip.icon as any} size={18} color={colors.primary} />
                    <Text style={{ fontSize: 13, color: colors.foreground, marginLeft: 10 }}>{tip.text}</Text>
                  </View>
                ))}
              </View>
            </View>
          ) : todayPlan ? (
            <View>
              {/* Assigned plan summary */}
              <View style={{ marginBottom: 12 }}>
                <Text style={{ fontSize: 18, fontWeight: "700", color: colors.foreground }}>{todayPlan.name}</Text>
                <Text style={{ fontSize: 12, color: colors.muted, marginTop: 2 }}>
                  {todayPlan.duration} min • {todayExercises.length} exercises • {todayPlan.difficulty}
                </Text>
              </View>

              {/* Exercise preview list */}
              <View style={{ marginBottom: 12 }}>
                {todayExercises.slice(0, 5).map((ex, i) => (
                  <View key={ex!.id} style={{ flexDirection: "row", alignItems: "center", paddingVertical: 4 }}>
                    <Text style={{ fontSize: 16, marginRight: 8 }}>{ex!.image}</Text>
                    <Text style={{ fontSize: 13, color: colors.foreground, flex: 1 }} numberOfLines={1}>{ex!.name}</Text>
                    <Text style={{ fontSize: 12, color: colors.muted }}>
                      {ex!.reps ? `${ex!.reps} reps` : `${ex!.duration}s`}
                    </Text>
                  </View>
                ))}
                {todayExercises.length > 5 && (
                  <Text style={{ fontSize: 12, color: colors.muted, marginTop: 4 }}>
                    +{todayExercises.length - 5} more
                  </Text>
                )}
              </View>

              <TouchableOpacity
                onPress={() => router.push({ pathname: "/workout-detail" as any, params: { planId: todayPlan.id, isCustom: todayIsCustom ? "1" : "0" } })}
                style={{ backgroundColor: colors.primary, borderRadius: 12, padding: 16, alignItems: "center", flexDirection: "row", justifyContent: "center" }}
                activeOpacity={0.8}
              >
                <MaterialIcons name="play-arrow" size={24} color="#FFF" />
                <Text style={{ color: "#FFF", fontWeight: "700", fontSize: 16, marginLeft: 6 }}>Start Workout</Text>
              </TouchableOpacity>
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
            {DEFAULT_WORKOUT_PLANS.filter((plan) => {
              const workoutsMode = state.profile?.workoutsMode || "both";
              const planMode = plan.mode || "home";
              if (workoutsMode === "both") return true;
              return planMode === workoutsMode;
            })
            .slice(0, 4)
            .map((plan) => (
              <TouchableOpacity
                key={plan.id}
                onPress={() => router.push({ pathname: "/workout-detail" as any, params: { planId: plan.id, isCustom: "0" } })}
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
