import { ScrollView, Text, View, TouchableOpacity, TextInput } from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { ScreenContainer } from "@/components/screen-container";
import { useApp } from "@/lib/app-context";
import { EXERCISES, BODY_PARTS, Exercise, WorkoutPlan } from "@/data/exercises";
import { useColors } from "@/hooks/use-colors";

export default function CreatePlanScreen() {
  const router = useRouter();
  const { state, updateCustomPlans } = useApp();
  const colors = useColors();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [difficulty, setDifficulty] = useState<"beginner" | "intermediate" | "advanced">("beginner");
  const [selectedExercises, setSelectedExercises] = useState<string[]>([]);
  const [filterBodyPart, setFilterBodyPart] = useState("All");

  const filteredExercises = filterBodyPart === "All"
    ? EXERCISES
    : EXERCISES.filter((e) => e.bodyPart === filterBodyPart);

  const toggleExercise = (id: string) => {
    setSelectedExercises((prev) =>
      prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]
    );
  };

  const handleSave = async () => {
    if (!name.trim() || selectedExercises.length === 0) return;

    const selectedExData = selectedExercises.map((id) => EXERCISES.find((e) => e.id === id)).filter(Boolean) as Exercise[];
    const bodyParts = [...new Set(selectedExData.map((e) => e.bodyPart))];
    const totalDuration = Math.round(selectedExData.reduce((sum, e) => sum + e.duration, 0) / 60);

    const newPlan: WorkoutPlan = {
      id: `custom-${Date.now()}`,
      name: name.trim(),
      description: description.trim() || `Custom plan with ${selectedExercises.length} exercises`,
      difficulty,
      duration: Math.max(totalDuration, 5),
      exercises: selectedExercises,
      bodyParts,
      isDefault: false,
    };

    const updated = [...state.customPlans, newPlan];
    await updateCustomPlans(updated);
    router.back();
  };

  return (
    <ScreenContainer className="px-4 pt-2">
      {/* Header */}
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 12 }} activeOpacity={0.7}>
            <MaterialIcons name="arrow-back" size={24} color={colors.foreground} />
          </TouchableOpacity>
          <Text style={{ fontSize: 20, fontWeight: "700", color: colors.foreground }}>Create Plan</Text>
        </View>
        <TouchableOpacity
          onPress={handleSave}
          style={{
            opacity: name.trim() && selectedExercises.length > 0 ? 1 : 0.4,
            backgroundColor: colors.primary,
            borderRadius: 20,
            paddingHorizontal: 16,
            paddingVertical: 8,
          }}
          activeOpacity={0.7}
          disabled={!name.trim() || selectedExercises.length === 0}
        >
          <Text style={{ color: "#FFF", fontWeight: "600", fontSize: 14 }}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Plan Details */}
        <View style={{ backgroundColor: colors.surface, borderRadius: 16, padding: 16, marginBottom: 16 }}>
          <View style={{ marginBottom: 12 }}>
            <Text style={{ fontSize: 12, color: colors.muted, marginBottom: 6 }}>Plan Name *</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="e.g., Morning Burn"
              placeholderTextColor={colors.muted}
              returnKeyType="done"
              style={{
                backgroundColor: colors.background,
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: 12,
                paddingHorizontal: 14,
                paddingVertical: 12,
                fontSize: 15,
                color: colors.foreground,
                textAlign: "left",
                textAlignVertical: "center",
              }}
            />
          </View>
          <View style={{ marginBottom: 12 }}>
            <Text style={{ fontSize: 12, color: colors.muted, marginBottom: 6 }}>Description</Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Optional description"
              placeholderTextColor={colors.muted}
              multiline
              style={{
                backgroundColor: colors.background,
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: 12,
                paddingHorizontal: 14,
                paddingVertical: 12,
                fontSize: 15,
                color: colors.foreground,
                textAlign: "left",
                textAlignVertical: "top",
                minHeight: 60,
              }}
            />
          </View>
          <View>
            <Text style={{ fontSize: 12, color: colors.muted, marginBottom: 8 }}>Difficulty</Text>
            <View style={{ flexDirection: "row", gap: 8 }}>
              {(["beginner", "intermediate", "advanced"] as const).map((d) => (
                <TouchableOpacity
                  key={d}
                  onPress={() => setDifficulty(d)}
                  style={{
                    flex: 1,
                    paddingVertical: 8,
                    borderRadius: 8,
                    alignItems: "center",
                    backgroundColor: difficulty === d ? colors.primary : colors.background,
                    borderWidth: difficulty === d ? 0 : 1,
                    borderColor: colors.border,
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={{ fontSize: 12, fontWeight: "600", color: difficulty === d ? "#FFF" : colors.foreground, textTransform: "capitalize" }}>
                    {d}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Selected Count */}
        <Text style={{ fontSize: 14, fontWeight: "600", color: colors.foreground, marginBottom: 8 }}>
          Select Exercises ({selectedExercises.length} selected)
        </Text>

        {/* Body Part Filter */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12, maxHeight: 36 }}>
          {["All", ...BODY_PARTS].map((part) => (
            <TouchableOpacity
              key={part}
              onPress={() => setFilterBodyPart(part)}
              style={{
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 20,
                marginRight: 8,
                backgroundColor: filterBodyPart === part ? colors.primary : colors.surface,
                borderWidth: filterBodyPart === part ? 0 : 1,
                borderColor: colors.border,
              }}
              activeOpacity={0.7}
            >
              <Text style={{ fontSize: 12, fontWeight: "600", color: filterBodyPart === part ? "#FFF" : colors.foreground }}>
                {part}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Exercise List */}
        {filteredExercises.map((exercise) => {
          const isSelected = selectedExercises.includes(exercise.id);
          return (
            <TouchableOpacity
              key={exercise.id}
              onPress={() => toggleExercise(exercise.id)}
              style={{
                borderRadius: 12,
                padding: 12,
                marginBottom: 8,
                borderWidth: 1,
                borderColor: isSelected ? colors.primary : colors.border,
                backgroundColor: isSelected ? colors.primary + "10" : "transparent",
                flexDirection: "row",
                alignItems: "center",
              }}
              activeOpacity={0.7}
            >
              <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: colors.surface, alignItems: "center", justifyContent: "center", marginRight: 12 }}>
                <Text style={{ fontSize: 16 }}>{exercise.image}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontWeight: "600", color: colors.foreground }}>{exercise.name}</Text>
                <Text style={{ fontSize: 12, color: colors.muted }}>
                  {exercise.bodyPart} • {exercise.reps ? `${exercise.reps} reps` : `${exercise.duration}s`}
                </Text>
              </View>
              <MaterialIcons
                name={isSelected ? "check-circle" : "radio-button-unchecked"}
                size={22}
                color={isSelected ? colors.primary : colors.muted}
              />
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </ScreenContainer>
  );
}
