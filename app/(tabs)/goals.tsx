import { ScrollView, Text, View, TouchableOpacity, TextInput } from "react-native";
import { useState } from "react";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { ScreenContainer } from "@/components/screen-container";
import { useApp } from "@/lib/app-context";
import { useColors } from "@/hooks/use-colors";

export default function GoalsScreen() {
  const { state, updateGoals } = useApp();
  const colors = useColors();
  const [editingGoal, setEditingGoal] = useState<string | null>(null);
  const [tempValue, setTempValue] = useState("");

  const weeklyWorkouts = state.history.filter((h) => {
    const d = new Date(h.date);
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    return d >= startOfWeek;
  }).length;

  const weeklyProgress = state.goals.weeklyWorkouts > 0
    ? Math.min(weeklyWorkouts / state.goals.weeklyWorkouts, 1)
    : 0;

  const waterProgress = state.goals.dailyWater > 0
    ? Math.min(state.todayWater / state.goals.dailyWater, 1)
    : 0;

  const handleSaveGoal = async (field: string) => {
    const val = parseFloat(tempValue);
    if (isNaN(val) || val <= 0) {
      setEditingGoal(null);
      return;
    }
    const updated = { ...state.goals, [field]: val };
    await updateGoals(updated);
    setEditingGoal(null);
    setTempValue("");
  };

  const achievements = [
    { id: "first", icon: "star", title: "First Workout", desc: "Complete your first workout", unlocked: state.goals.totalWorkouts >= 1 },
    { id: "week", icon: "event-available", title: "Week Warrior", desc: "Work out 7 days in a row", unlocked: state.goals.longestStreak >= 7 },
    { id: "ten", icon: "emoji-events", title: "10 Workouts", desc: "Complete 10 workouts", unlocked: state.goals.totalWorkouts >= 10 },
    { id: "fifty", icon: "military-tech", title: "50 Workouts", desc: "Complete 50 workouts", unlocked: state.goals.totalWorkouts >= 50 },
    { id: "calories", icon: "local-fire-department", title: "Calorie Crusher", desc: "Burn 1000+ calories total", unlocked: state.goals.totalCalories >= 1000 },
    { id: "hydrated", icon: "water-drop", title: "Stay Hydrated", desc: "Hit water goal 7 days", unlocked: false },
  ];

  return (
    <ScreenContainer className="px-4 pt-2">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        <Text className="text-2xl font-bold text-foreground mb-4">My Goals</Text>

        {/* Stats Overview */}
        <View className="flex-row gap-3 mb-4">
          <View className="flex-1 bg-surface rounded-2xl p-3 items-center">
            <Text className="text-2xl font-bold text-primary">{state.goals.totalWorkouts}</Text>
            <Text className="text-xs text-muted">Total Workouts</Text>
          </View>
          <View className="flex-1 bg-surface rounded-2xl p-3 items-center">
            <Text className="text-2xl font-bold text-primary">{state.goals.totalMinutes}</Text>
            <Text className="text-xs text-muted">Total Minutes</Text>
          </View>
          <View className="flex-1 bg-surface rounded-2xl p-3 items-center">
            <Text className="text-2xl font-bold text-primary">{state.goals.totalCalories}</Text>
            <Text className="text-xs text-muted">Calories Burned</Text>
          </View>
        </View>

        {/* Weekly Workout Goal */}
        <View className="bg-surface rounded-2xl p-4 mb-3">
          <View className="flex-row items-center justify-between mb-2">
            <View className="flex-row items-center">
              <MaterialIcons name="fitness-center" size={20} color={colors.primary} />
              <Text className="text-sm font-semibold text-foreground ml-2">Weekly Workouts</Text>
            </View>
            {editingGoal === "weeklyWorkouts" ? (
              <View className="flex-row items-center">
                <TextInput
                  value={tempValue}
                  onChangeText={setTempValue}
                  keyboardType="number-pad"
                  className="bg-background border border-border rounded-lg px-2 py-1 w-12 text-center text-foreground"
                  autoFocus
                />
                <TouchableOpacity onPress={() => handleSaveGoal("weeklyWorkouts")} className="ml-2" activeOpacity={0.7}>
                  <MaterialIcons name="check" size={20} color={colors.success} />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                onPress={() => { setEditingGoal("weeklyWorkouts"); setTempValue(String(state.goals.weeklyWorkouts)); }}
                className="flex-row items-center"
                activeOpacity={0.7}
              >
                <Text className="text-sm text-muted">{weeklyWorkouts}/{state.goals.weeklyWorkouts}</Text>
                <MaterialIcons name="edit" size={14} color={colors.muted} className="ml-1" />
              </TouchableOpacity>
            )}
          </View>
          <View className="h-3 bg-border rounded-full overflow-hidden">
            <View style={{ width: `${weeklyProgress * 100}%`, backgroundColor: colors.primary }} className="h-full rounded-full" />
          </View>
        </View>

        {/* Water Goal */}
        <View className="bg-surface rounded-2xl p-4 mb-3">
          <View className="flex-row items-center justify-between mb-2">
            <View className="flex-row items-center">
              <MaterialIcons name="water-drop" size={20} color="#2196F3" />
              <Text className="text-sm font-semibold text-foreground ml-2">Daily Water</Text>
            </View>
            {editingGoal === "dailyWater" ? (
              <View className="flex-row items-center">
                <TextInput
                  value={tempValue}
                  onChangeText={setTempValue}
                  keyboardType="number-pad"
                  className="bg-background border border-border rounded-lg px-2 py-1 w-12 text-center text-foreground"
                  autoFocus
                />
                <TouchableOpacity onPress={() => handleSaveGoal("dailyWater")} className="ml-2" activeOpacity={0.7}>
                  <MaterialIcons name="check" size={20} color={colors.success} />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                onPress={() => { setEditingGoal("dailyWater"); setTempValue(String(state.goals.dailyWater)); }}
                className="flex-row items-center"
                activeOpacity={0.7}
              >
                <Text className="text-sm text-muted">{state.todayWater}/{state.goals.dailyWater} glasses</Text>
                <MaterialIcons name="edit" size={14} color={colors.muted} className="ml-1" />
              </TouchableOpacity>
            )}
          </View>
          <View className="h-3 bg-border rounded-full overflow-hidden">
            <View style={{ width: `${waterProgress * 100}%`, backgroundColor: "#2196F3" }} className="h-full rounded-full" />
          </View>
        </View>

        {/* Target Weight */}
        <View className="bg-surface rounded-2xl p-4 mb-4">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <MaterialIcons name="monitor-weight" size={20} color={colors.primary} />
              <Text className="text-sm font-semibold text-foreground ml-2">Target Weight</Text>
            </View>
            {editingGoal === "targetWeight" ? (
              <View className="flex-row items-center">
                <TextInput
                  value={tempValue}
                  onChangeText={setTempValue}
                  keyboardType="decimal-pad"
                  className="bg-background border border-border rounded-lg px-2 py-1 w-16 text-center text-foreground"
                  autoFocus
                />
                <Text className="text-xs text-muted ml-1">kg</Text>
                <TouchableOpacity onPress={() => handleSaveGoal("targetWeight")} className="ml-2" activeOpacity={0.7}>
                  <MaterialIcons name="check" size={20} color={colors.success} />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                onPress={() => { setEditingGoal("targetWeight"); setTempValue(String(state.goals.targetWeight || "")); }}
                className="flex-row items-center"
                activeOpacity={0.7}
              >
                <Text className="text-sm text-muted">
                  {state.goals.targetWeight > 0 ? `${state.goals.targetWeight} kg` : "Set goal"}
                </Text>
                <MaterialIcons name="edit" size={14} color={colors.muted} className="ml-1" />
              </TouchableOpacity>
            )}
          </View>
          {state.goals.targetWeight > 0 && state.profile?.weight && (
            <View className="mt-2">
              <Text className="text-xs text-muted">
                Current: {state.profile.weight} kg → Target: {state.goals.targetWeight} kg
                ({state.profile.weight > state.goals.targetWeight ? `-${(state.profile.weight - state.goals.targetWeight).toFixed(1)}` : `+${(state.goals.targetWeight - state.profile.weight).toFixed(1)}`} kg to go)
              </Text>
            </View>
          )}
        </View>

        {/* Achievements */}
        <Text className="text-base font-semibold text-foreground mb-3">Achievements</Text>
        <View className="flex-row flex-wrap gap-3 mb-6">
          {achievements.map((a) => (
            <View
              key={a.id}
              className="bg-surface rounded-2xl p-3 items-center border border-border"
              style={{ width: "30%", opacity: a.unlocked ? 1 : 0.4 }}
            >
              <MaterialIcons name={a.icon as any} size={28} color={a.unlocked ? colors.primary : colors.muted} />
              <Text className="text-xs font-semibold text-foreground mt-1 text-center" numberOfLines={1}>{a.title}</Text>
              <Text className="text-[10px] text-muted text-center mt-0.5" numberOfLines={2}>{a.desc}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
