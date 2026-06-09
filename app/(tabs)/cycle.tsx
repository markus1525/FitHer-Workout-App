import { ScrollView, Text, View, TouchableOpacity, TextInput } from "react-native";
import { useState } from "react";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { ScreenContainer } from "@/components/screen-container";
import { useApp } from "@/lib/app-context";
import { CYCLE_PHASES, DEFAULT_WORKOUT_PLANS } from "@/data/exercises";
import { useColors } from "@/hooks/use-colors";
import { CycleEntry } from "@/lib/storage";
import { useRouter } from "expo-router";

function getCycleInfo(cycleData: CycleEntry[]) {
  if (!cycleData || cycleData.length === 0) return null;
  const lastCycle = cycleData[cycleData.length - 1];
  const startDate = new Date(lastCycle.startDate);
  const today = new Date();
  const daysSinceStart = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const cycleLength = lastCycle.cycleLength || 28;
  const periodLength = lastCycle.periodLength || 5;
  const dayInCycle = daysSinceStart % cycleLength;
  const daysUntilNext = cycleLength - dayInCycle;

  let phase: string;
  if (dayInCycle < periodLength) phase = "menstrual";
  else if (dayInCycle < 13) phase = "follicular";
  else if (dayInCycle < 16) phase = "ovulation";
  else phase = "luteal";

  return { phase, dayInCycle, daysUntilNext, cycleLength, periodLength, startDate };
}

export default function CycleScreen() {
  const router = useRouter();
  const { state, updateCycleData } = useApp();
  const colors = useColors();
  const [showLogForm, setShowLogForm] = useState(false);
  const [periodLength, setPeriodLength] = useState("5");
  const [cycleLength, setCycleLength] = useState("28");

  const cycleInfo = getCycleInfo(state.cycleData);
  const currentPhase = cycleInfo ? CYCLE_PHASES[cycleInfo.phase as keyof typeof CYCLE_PHASES] : null;

  const handleLogPeriod = async () => {
    const newEntry: CycleEntry = {
      startDate: new Date().toISOString().split("T")[0],
      cycleLength: parseInt(cycleLength) || 28,
      periodLength: parseInt(periodLength) || 5,
    };
    const updated = [...state.cycleData, newEntry];
    await updateCycleData(updated);
    setShowLogForm(false);
  };

  const phases = Object.entries(CYCLE_PHASES);

  return (
    <ScreenContainer className="px-4 pt-2">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        <Text className="text-2xl font-bold text-foreground mb-4">Cycle Tracker</Text>

        {/* Current Phase Card */}
        {currentPhase && cycleInfo ? (
          <View style={{ backgroundColor: currentPhase.color + "15", borderColor: currentPhase.color, borderWidth: 1 }} className="rounded-2xl p-5 mb-4">
            <View className="items-center">
              <Text className="text-4xl mb-2">{currentPhase.icon}</Text>
              <Text style={{ color: currentPhase.color }} className="text-xl font-bold">{currentPhase.name} Phase</Text>
              <Text className="text-sm text-muted mt-1">Day {cycleInfo.dayInCycle + 1} of {cycleInfo.cycleLength}</Text>
              <View className="flex-row items-center mt-3 gap-4">
                <View className="items-center">
                  <Text className="text-lg font-bold text-foreground">{cycleInfo.daysUntilNext}</Text>
                  <Text className="text-xs text-muted">Days until next</Text>
                </View>
                <View className="w-px h-8 bg-border" />
                <View className="items-center">
                  <Text className="text-lg font-bold text-foreground">{cycleInfo.periodLength}</Text>
                  <Text className="text-xs text-muted">Period days</Text>
                </View>
              </View>
            </View>
            {/* Progress bar */}
            <View className="h-2 bg-white/30 rounded-full mt-4 overflow-hidden">
              <View
                style={{ width: `${((cycleInfo.dayInCycle + 1) / cycleInfo.cycleLength) * 100}%`, backgroundColor: currentPhase.color }}
                className="h-full rounded-full"
              />
            </View>
          </View>
        ) : (
          <View className="bg-surface rounded-2xl p-6 mb-4 items-center">
            <Text className="text-4xl mb-2">🌸</Text>
            <Text className="text-base font-semibold text-foreground">Start Tracking Your Cycle</Text>
            <Text className="text-sm text-muted text-center mt-1">
              Log your period to get personalized workout recommendations.
            </Text>
          </View>
        )}

        {/* Log Period Button */}
        <TouchableOpacity
          onPress={() => setShowLogForm(!showLogForm)}
          className="bg-primary rounded-xl p-3 items-center mb-4"
          activeOpacity={0.7}
        >
          <Text className="text-white font-semibold">
            {showLogForm ? "Cancel" : "Log Period Start"}
          </Text>
        </TouchableOpacity>

        {/* Log Form */}
        {showLogForm && (
          <View className="bg-surface rounded-2xl p-4 mb-4 border border-border">
            <Text className="text-sm font-semibold text-foreground mb-3">Log New Period</Text>
            <View className="flex-row items-center mb-3">
              <Text className="text-sm text-muted flex-1">Period Length (days)</Text>
              <TextInput
                value={periodLength}
                onChangeText={setPeriodLength}
                keyboardType="number-pad"
                className="bg-background border border-border rounded-lg px-3 py-2 w-16 text-center text-foreground"
              />
            </View>
            <View className="flex-row items-center mb-4">
              <Text className="text-sm text-muted flex-1">Cycle Length (days)</Text>
              <TextInput
                value={cycleLength}
                onChangeText={setCycleLength}
                keyboardType="number-pad"
                className="bg-background border border-border rounded-lg px-3 py-2 w-16 text-center text-foreground"
              />
            </View>
            <TouchableOpacity
              onPress={handleLogPeriod}
              className="bg-primary rounded-xl p-3 items-center"
              activeOpacity={0.7}
            >
              <Text className="text-white font-semibold">Save</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Workout Tips for Current Phase */}
        {currentPhase && (
          <View className="bg-surface rounded-2xl p-4 mb-4">
            <Text className="text-sm font-semibold text-foreground mb-2">
              💡 Workout Tips for {currentPhase.name} Phase
            </Text>
            <Text className="text-sm text-muted leading-5">{currentPhase.tips}</Text>
            {currentPhase.recommendedExercises.length > 0 && (
              <View className="mt-3">
                <Text className="text-xs font-semibold text-foreground mb-2">Recommended Workouts:</Text>
                {currentPhase.recommendedExercises.map((planId) => {
                  const plan = DEFAULT_WORKOUT_PLANS.find((p) => p.id === planId);
                  if (!plan) return null;
                  return (
                    <TouchableOpacity
                      key={planId}
                      onPress={() => router.push({ pathname: "/workout-detail" as any, params: { planId } })}
                      className="flex-row items-center py-2 border-b border-border"
                      activeOpacity={0.7}
                    >
                      <Text className="flex-1 text-sm text-foreground">{plan.name}</Text>
                      <Text className="text-xs text-muted mr-2">{plan.duration} min</Text>
                      <MaterialIcons name="chevron-right" size={16} color={colors.muted} />
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>
        )}

        {/* Phase Guide */}
        <Text className="text-base font-semibold text-foreground mb-3">Cycle Phases Guide</Text>
        {phases.map(([key, phase]) => (
          <View key={key} className="bg-surface rounded-xl p-3 mb-2 flex-row items-center border border-border">
            <Text className="text-2xl mr-3">{phase.icon}</Text>
            <View className="flex-1">
              <Text style={{ color: phase.color }} className="text-sm font-semibold">{phase.name}</Text>
              <Text className="text-xs text-muted mt-0.5">{phase.description}</Text>
            </View>
          </View>
        ))}

        {/* Cycle History */}
        {state.cycleData.length > 0 && (
          <View className="mt-4">
            <Text className="text-base font-semibold text-foreground mb-3">Cycle History</Text>
            {state.cycleData.slice(-5).reverse().map((entry, idx) => (
              <View key={idx} className="bg-surface rounded-xl p-3 mb-2 flex-row items-center">
                <MaterialIcons name="event" size={20} color={colors.primary} />
                <View className="ml-3 flex-1">
                  <Text className="text-sm text-foreground">Started: {entry.startDate}</Text>
                  <Text className="text-xs text-muted">Period: {entry.periodLength} days • Cycle: {entry.cycleLength} days</Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
