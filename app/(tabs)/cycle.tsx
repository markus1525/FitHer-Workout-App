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
        <Text style={{ fontSize: 24, fontWeight: "700", color: colors.foreground, marginBottom: 16 }}>Cycle Tracker</Text>

        {/* Current Phase Card */}
        {currentPhase && cycleInfo ? (
          <View style={{ backgroundColor: currentPhase.color + "15", borderColor: currentPhase.color, borderWidth: 1, borderRadius: 16, padding: 20, marginBottom: 16 }}>
            <View style={{ alignItems: "center" }}>
              <Text style={{ fontSize: 40 }}>{currentPhase.icon}</Text>
              <Text style={{ color: currentPhase.color, fontSize: 20, fontWeight: "700", marginTop: 8 }}>{currentPhase.name} Phase</Text>
              <Text style={{ fontSize: 14, color: colors.muted, marginTop: 4 }}>Day {cycleInfo.dayInCycle + 1} of {cycleInfo.cycleLength}</Text>
              <View style={{ flexDirection: "row", alignItems: "center", marginTop: 12, gap: 16 }}>
                <View style={{ alignItems: "center" }}>
                  <Text style={{ fontSize: 18, fontWeight: "700", color: colors.foreground }}>{cycleInfo.daysUntilNext}</Text>
                  <Text style={{ fontSize: 11, color: colors.muted }}>Days until next</Text>
                </View>
                <View style={{ width: 1, height: 32, backgroundColor: colors.border }} />
                <View style={{ alignItems: "center" }}>
                  <Text style={{ fontSize: 18, fontWeight: "700", color: colors.foreground }}>{cycleInfo.periodLength}</Text>
                  <Text style={{ fontSize: 11, color: colors.muted }}>Period days</Text>
                </View>
              </View>
            </View>
            {/* Progress bar */}
            <View style={{ height: 8, backgroundColor: "rgba(255,255,255,0.3)", borderRadius: 4, marginTop: 16, overflow: "hidden" }}>
              <View
                style={{ width: `${((cycleInfo.dayInCycle + 1) / cycleInfo.cycleLength) * 100}%`, backgroundColor: currentPhase.color, height: "100%", borderRadius: 4 }}
              />
            </View>
          </View>
        ) : (
          <View style={{ backgroundColor: colors.surface, borderRadius: 16, padding: 24, marginBottom: 16, alignItems: "center" }}>
            <Text style={{ fontSize: 40 }}>🌸</Text>
            <Text style={{ fontSize: 16, fontWeight: "600", color: colors.foreground, marginTop: 8 }}>Start Tracking Your Cycle</Text>
            <Text style={{ fontSize: 14, color: colors.muted, textAlign: "center", marginTop: 4 }}>
              Log your period to get personalized workout recommendations.
            </Text>
          </View>
        )}

        {/* Log Period Button */}
        <TouchableOpacity
          onPress={() => setShowLogForm(!showLogForm)}
          style={{ backgroundColor: colors.primary, borderRadius: 12, padding: 14, alignItems: "center", marginBottom: 16 }}
          activeOpacity={0.7}
        >
          <Text style={{ color: "#FFF", fontWeight: "600", fontSize: 15 }}>
            {showLogForm ? "Cancel" : "Log Period Start"}
          </Text>
        </TouchableOpacity>

        {/* Log Form */}
        {showLogForm && (
          <View style={{ backgroundColor: colors.surface, borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: colors.border }}>
            <Text style={{ fontSize: 14, fontWeight: "600", color: colors.foreground, marginBottom: 12 }}>Log New Period</Text>
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
              <Text style={{ fontSize: 14, color: colors.muted, flex: 1 }}>Period Length (days)</Text>
              <TextInput
                value={periodLength}
                onChangeText={setPeriodLength}
                keyboardType="number-pad"
                returnKeyType="done"
                style={{
                  backgroundColor: colors.background,
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: 8,
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                  width: 64,
                  textAlign: "center",
                  fontSize: 15,
                  color: colors.foreground,
                  textAlignVertical: "center",
                }}
              />
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 16 }}>
              <Text style={{ fontSize: 14, color: colors.muted, flex: 1 }}>Cycle Length (days)</Text>
              <TextInput
                value={cycleLength}
                onChangeText={setCycleLength}
                keyboardType="number-pad"
                returnKeyType="done"
                style={{
                  backgroundColor: colors.background,
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: 8,
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                  width: 64,
                  textAlign: "center",
                  fontSize: 15,
                  color: colors.foreground,
                  textAlignVertical: "center",
                }}
              />
            </View>
            <TouchableOpacity
              onPress={handleLogPeriod}
              style={{ backgroundColor: colors.primary, borderRadius: 12, padding: 14, alignItems: "center" }}
              activeOpacity={0.7}
            >
              <Text style={{ color: "#FFF", fontWeight: "600" }}>Save</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Workout Tips for Current Phase */}
        {currentPhase && (
          <View style={{ backgroundColor: colors.surface, borderRadius: 16, padding: 16, marginBottom: 16 }}>
            <Text style={{ fontSize: 14, fontWeight: "600", color: colors.foreground, marginBottom: 8 }}>
              Workout Tips for {currentPhase.name} Phase
            </Text>
            <Text style={{ fontSize: 14, color: colors.muted, lineHeight: 20 }}>{currentPhase.tips}</Text>
            {currentPhase.recommendedExercises.length > 0 && (
              <View style={{ marginTop: 12 }}>
                <Text style={{ fontSize: 12, fontWeight: "600", color: colors.foreground, marginBottom: 8 }}>Recommended Workouts:</Text>
                {currentPhase.recommendedExercises.map((planId) => {
                  const plan = DEFAULT_WORKOUT_PLANS.find((p) => p.id === planId);
                  if (!plan) return null;
                  return (
                    <TouchableOpacity
                      key={planId}
                      onPress={() => router.push({ pathname: "/workout-detail" as any, params: { planId } })}
                      style={{ flexDirection: "row", alignItems: "center", paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border }}
                      activeOpacity={0.7}
                    >
                      <Text style={{ flex: 1, fontSize: 14, color: colors.foreground }}>{plan.name}</Text>
                      <Text style={{ fontSize: 12, color: colors.muted, marginRight: 8 }}>{plan.duration} min</Text>
                      <MaterialIcons name="chevron-right" size={16} color={colors.muted} />
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>
        )}

        {/* Phase Guide */}
        <Text style={{ fontSize: 16, fontWeight: "600", color: colors.foreground, marginBottom: 12 }}>Cycle Phases Guide</Text>
        {phases.map(([key, phase]) => (
          <View key={key} style={{ backgroundColor: colors.surface, borderRadius: 12, padding: 12, marginBottom: 8, flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: colors.border }}>
            <Text style={{ fontSize: 24, marginRight: 12 }}>{phase.icon}</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ color: phase.color, fontSize: 14, fontWeight: "600" }}>{phase.name}</Text>
              <Text style={{ fontSize: 12, color: colors.muted, marginTop: 2 }}>{phase.description}</Text>
            </View>
          </View>
        ))}

        {/* Cycle History */}
        {state.cycleData.length > 0 && (
          <View style={{ marginTop: 16 }}>
            <Text style={{ fontSize: 16, fontWeight: "600", color: colors.foreground, marginBottom: 12 }}>Cycle History</Text>
            {state.cycleData.slice(-5).reverse().map((entry, idx) => (
              <View key={idx} style={{ backgroundColor: colors.surface, borderRadius: 12, padding: 12, marginBottom: 8, flexDirection: "row", alignItems: "center" }}>
                <MaterialIcons name="event" size={20} color={colors.primary} />
                <View style={{ marginLeft: 12, flex: 1 }}>
                  <Text style={{ fontSize: 14, color: colors.foreground }}>Started: {entry.startDate}</Text>
                  <Text style={{ fontSize: 12, color: colors.muted }}>Period: {entry.periodLength} days • Cycle: {entry.cycleLength} days</Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
