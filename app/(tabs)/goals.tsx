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

  const unitSystem = state.profile?.unitSystem || "metric";

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
    let finalVal = val;
    if (field === "targetWeight" && unitSystem === "imperial") {
      finalVal = val / 2.20462;
    }
    const updated = { ...state.goals, [field]: Math.round(finalVal * 10) / 10 };
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
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
        <Text style={{ fontSize: 24, fontWeight: "700", color: colors.foreground, marginBottom: 16 }}>My Goals</Text>

        {/* Stats Overview */}
        <View style={{ flexDirection: "row", gap: 12, marginBottom: 16 }}>
          <View style={{ flex: 1, backgroundColor: colors.surface, borderRadius: 16, padding: 12, alignItems: "center" }}>
            <Text style={{ fontSize: 22, fontWeight: "700", color: colors.primary }}>{state.goals.totalWorkouts}</Text>
            <Text style={{ fontSize: 11, color: colors.muted }}>Total Workouts</Text>
          </View>
          <View style={{ flex: 1, backgroundColor: colors.surface, borderRadius: 16, padding: 12, alignItems: "center" }}>
            <Text style={{ fontSize: 22, fontWeight: "700", color: colors.primary }}>{state.goals.totalMinutes}</Text>
            <Text style={{ fontSize: 11, color: colors.muted }}>Total Minutes</Text>
          </View>
          <View style={{ flex: 1, backgroundColor: colors.surface, borderRadius: 16, padding: 12, alignItems: "center" }}>
            <Text style={{ fontSize: 22, fontWeight: "700", color: colors.primary }}>{state.goals.totalCalories}</Text>
            <Text style={{ fontSize: 11, color: colors.muted }}>Calories Burned</Text>
          </View>
        </View>

        {/* Weekly Workout Goal */}
        <View style={{ backgroundColor: colors.surface, borderRadius: 16, padding: 16, marginBottom: 12 }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <MaterialIcons name="fitness-center" size={20} color={colors.primary} />
              <Text style={{ fontSize: 14, fontWeight: "600", color: colors.foreground, marginLeft: 8 }}>Weekly Workouts</Text>
            </View>
            {editingGoal === "weeklyWorkouts" ? (
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <TextInput
                  value={tempValue}
                  onChangeText={setTempValue}
                  keyboardType="number-pad"
                  autoFocus
                  returnKeyType="done"
                  onSubmitEditing={() => handleSaveGoal("weeklyWorkouts")}
                  style={{
                    backgroundColor: colors.background,
                    borderWidth: 1,
                    borderColor: colors.border,
                    borderRadius: 8,
                    paddingHorizontal: 8,
                    paddingVertical: 6,
                    width: 48,
                    textAlign: "center",
                    fontSize: 14,
                    color: colors.foreground,
                    textAlignVertical: "center",
                  }}
                />
                <TouchableOpacity onPress={() => handleSaveGoal("weeklyWorkouts")} style={{ marginLeft: 8 }} activeOpacity={0.7}>
                  <MaterialIcons name="check" size={20} color={colors.success} />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                onPress={() => { setEditingGoal("weeklyWorkouts"); setTempValue(String(state.goals.weeklyWorkouts)); }}
                style={{ flexDirection: "row", alignItems: "center" }}
                activeOpacity={0.7}
              >
                <Text style={{ fontSize: 14, color: colors.muted }}>{weeklyWorkouts}/{state.goals.weeklyWorkouts}</Text>
                <MaterialIcons name="edit" size={14} color={colors.muted} style={{ marginLeft: 4 }} />
              </TouchableOpacity>
            )}
          </View>
          <View style={{ height: 12, backgroundColor: colors.border, borderRadius: 6, overflow: "hidden" }}>
            <View style={{ width: `${weeklyProgress * 100}%`, backgroundColor: colors.primary, height: "100%", borderRadius: 6 }} />
          </View>
        </View>

        {/* Water Goal */}
        <View style={{ backgroundColor: colors.surface, borderRadius: 16, padding: 16, marginBottom: 12 }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <MaterialIcons name="water-drop" size={20} color="#2196F3" />
              <Text style={{ fontSize: 14, fontWeight: "600", color: colors.foreground, marginLeft: 8 }}>Daily Water</Text>
            </View>
            {editingGoal === "dailyWater" ? (
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <TextInput
                  value={tempValue}
                  onChangeText={setTempValue}
                  keyboardType="number-pad"
                  autoFocus
                  returnKeyType="done"
                  onSubmitEditing={() => handleSaveGoal("dailyWater")}
                  style={{
                    backgroundColor: colors.background,
                    borderWidth: 1,
                    borderColor: colors.border,
                    borderRadius: 8,
                    paddingHorizontal: 8,
                    paddingVertical: 6,
                    width: 48,
                    textAlign: "center",
                    fontSize: 14,
                    color: colors.foreground,
                    textAlignVertical: "center",
                  }}
                />
                <TouchableOpacity onPress={() => handleSaveGoal("dailyWater")} style={{ marginLeft: 8 }} activeOpacity={0.7}>
                  <MaterialIcons name="check" size={20} color={colors.success} />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                onPress={() => { setEditingGoal("dailyWater"); setTempValue(String(state.goals.dailyWater)); }}
                style={{ flexDirection: "row", alignItems: "center" }}
                activeOpacity={0.7}
              >
                <Text style={{ fontSize: 14, color: colors.muted }}>{state.todayWater}/{state.goals.dailyWater} glasses</Text>
                <MaterialIcons name="edit" size={14} color={colors.muted} style={{ marginLeft: 4 }} />
              </TouchableOpacity>
            )}
          </View>
          <View style={{ height: 12, backgroundColor: colors.border, borderRadius: 6, overflow: "hidden" }}>
            <View style={{ width: `${waterProgress * 100}%`, backgroundColor: "#2196F3", height: "100%", borderRadius: 6 }} />
          </View>
        </View>

        {/* Target Weight */}
        <View style={{ backgroundColor: colors.surface, borderRadius: 16, padding: 16, marginBottom: 16 }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <MaterialIcons name="monitor-weight" size={20} color={colors.primary} />
              <Text style={{ fontSize: 14, fontWeight: "600", color: colors.foreground, marginLeft: 8 }}>Target Weight</Text>
            </View>
            {editingGoal === "targetWeight" ? (
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <TextInput
                  value={tempValue}
                  onChangeText={setTempValue}
                  keyboardType="decimal-pad"
                  autoFocus
                  returnKeyType="done"
                  onSubmitEditing={() => handleSaveGoal("targetWeight")}
                  style={{
                    backgroundColor: colors.background,
                    borderWidth: 1,
                    borderColor: colors.border,
                    borderRadius: 8,
                    paddingHorizontal: 8,
                    paddingVertical: 6,
                    width: 64,
                    textAlign: "center",
                    fontSize: 14,
                    color: colors.foreground,
                    textAlignVertical: "center",
                  }}
                />
                <Text style={{ fontSize: 12, color: colors.muted, marginLeft: 4 }}>
                  {unitSystem === "imperial" ? "lbs" : "kg"}
                </Text>
                <TouchableOpacity onPress={() => handleSaveGoal("targetWeight")} style={{ marginLeft: 8 }} activeOpacity={0.7}>
                  <MaterialIcons name="check" size={20} color={colors.success} />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                onPress={() => {
                  setEditingGoal("targetWeight");
                  setTempValue(
                    state.goals.targetWeight > 0
                      ? String(unitSystem === "imperial" ? Math.round(state.goals.targetWeight * 2.20462) : state.goals.targetWeight)
                      : ""
                  );
                }}
                style={{ flexDirection: "row", alignItems: "center" }}
                activeOpacity={0.7}
              >
                <Text style={{ fontSize: 14, color: colors.muted }}>
                  {state.goals.targetWeight > 0
                    ? `${unitSystem === "imperial" ? Math.round(state.goals.targetWeight * 2.20462) : state.goals.targetWeight} ${unitSystem === "imperial" ? "lbs" : "kg"}`
                    : "Set goal"}
                </Text>
                <MaterialIcons name="edit" size={14} color={colors.muted} style={{ marginLeft: 4 }} />
              </TouchableOpacity>
            )}
          </View>
          {state.goals.targetWeight > 0 && state.profile?.weight && (
            <View style={{ marginTop: 8 }}>
              <Text style={{ fontSize: 12, color: colors.muted }}>
                {(() => {
                  const currentW = unitSystem === "imperial" ? state.profile.weight * 2.20462 : state.profile.weight;
                  const targetW = unitSystem === "imperial" ? state.goals.targetWeight * 2.20462 : state.goals.targetWeight;
                  const diff = Math.abs(currentW - targetW);
                  const label = unitSystem === "imperial" ? "lbs" : "kg";
                  return `Current: ${Math.round(currentW)} ${label} → Target: ${Math.round(targetW)} ${label} (${currentW > targetW ? `-${diff.toFixed(1)}` : `+${diff.toFixed(1)}`} ${label} to go)`;
                })()}
              </Text>
            </View>
          )}
        </View>

        {/* Achievements */}
        <Text style={{ fontSize: 16, fontWeight: "600", color: colors.foreground, marginBottom: 12 }}>Achievements</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: 24 }}>
          {achievements.map((a) => (
            <View
              key={a.id}
              style={{
                backgroundColor: colors.surface,
                borderRadius: 16,
                padding: 12,
                alignItems: "center",
                borderWidth: 1,
                borderColor: colors.border,
                width: "30%",
                opacity: a.unlocked ? 1 : 0.4,
              }}
            >
              <MaterialIcons name={a.icon as any} size={28} color={a.unlocked ? colors.primary : colors.muted} />
              <Text style={{ fontSize: 11, fontWeight: "600", color: colors.foreground, marginTop: 4, textAlign: "center" }} numberOfLines={1}>{a.title}</Text>
              <Text style={{ fontSize: 10, color: colors.muted, textAlign: "center", marginTop: 2 }} numberOfLines={2}>{a.desc}</Text>
            </View>
          ))}
        </View>

        {/* Workout History */}
        <Text style={{ fontSize: 16, fontWeight: "600", color: colors.foreground, marginBottom: 12 }}>Workout History</Text>
        {state.history.length === 0 ? (
          <View style={{ backgroundColor: colors.surface, borderRadius: 16, padding: 20, alignItems: "center", marginBottom: 24 }}>
            <Text style={{ fontSize: 32 }}>🏁</Text>
            <Text style={{ fontSize: 14, color: colors.muted, marginTop: 8, textAlign: "center" }}>
              No workouts logged yet. Finish a workout and it will show up here.
            </Text>
          </View>
        ) : (
          <View style={{ backgroundColor: colors.surface, borderRadius: 16, padding: 8, marginBottom: 24 }}>
            {state.history.slice(0, 15).map((h, idx, arr) => {
              const d = new Date(h.date + "T00:00:00");
              const dateLabel = isNaN(d.getTime())
                ? h.date
                : d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
              return (
                <View
                  key={h.id}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    paddingVertical: 10,
                    paddingHorizontal: 8,
                    borderBottomWidth: idx < arr.length - 1 ? 1 : 0,
                    borderBottomColor: colors.border,
                  }}
                >
                  <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: colors.success + "20", alignItems: "center", justifyContent: "center", marginRight: 12 }}>
                    <MaterialIcons name="check" size={20} color={colors.success} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 14, fontWeight: "600", color: colors.foreground }} numberOfLines={1}>{h.planName || "Workout"}</Text>
                    <Text style={{ fontSize: 12, color: colors.muted, marginTop: 2 }}>{dateLabel}</Text>
                  </View>
                  <View style={{ alignItems: "flex-end" }}>
                    <Text style={{ fontSize: 12, color: colors.muted }}>{h.duration} min</Text>
                    <Text style={{ fontSize: 12, color: colors.warning, marginTop: 2 }}>{h.caloriesBurned} cal</Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
