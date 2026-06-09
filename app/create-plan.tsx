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
      <View className="flex-row items-center justify-between mb-4">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} className="mr-3" activeOpacity={0.7}>
            <MaterialIcons name="arrow-back" size={24} color={colors.foreground} />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-foreground">Create Plan</Text>
        </View>
        <TouchableOpacity
          onPress={handleSave}
          style={{ opacity: name.trim() && selectedExercises.length > 0 ? 1 : 0.4 }}
          className="bg-primary rounded-full px-4 py-2"
          activeOpacity={0.7}
          disabled={!name.trim() || selectedExercises.length === 0}
        >
          <Text className="text-white font-semibold text-sm">Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Plan Details */}
        <View className="bg-surface rounded-2xl p-4 mb-4">
          <View className="mb-3">
            <Text className="text-xs text-muted mb-1">Plan Name *</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="e.g., Morning Burn"
              placeholderTextColor={colors.muted}
              className="bg-background border border-border rounded-xl px-3 py-2.5 text-foreground"
            />
          </View>
          <View className="mb-3">
            <Text className="text-xs text-muted mb-1">Description</Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Optional description"
              placeholderTextColor={colors.muted}
              className="bg-background border border-border rounded-xl px-3 py-2.5 text-foreground"
              multiline
            />
          </View>
          <View>
            <Text className="text-xs text-muted mb-2">Difficulty</Text>
            <View className="flex-row gap-2">
              {(["beginner", "intermediate", "advanced"] as const).map((d) => (
                <TouchableOpacity
                  key={d}
                  onPress={() => setDifficulty(d)}
                  style={difficulty === d ? { backgroundColor: colors.primary } : { backgroundColor: colors.background, borderColor: colors.border, borderWidth: 1 }}
                  className="flex-1 py-2 rounded-lg items-center"
                  activeOpacity={0.7}
                >
                  <Text className={`text-xs font-semibold capitalize ${difficulty === d ? "text-white" : "text-foreground"}`}>
                    {d}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Selected Count */}
        <Text className="text-sm font-semibold text-foreground mb-2">
          Select Exercises ({selectedExercises.length} selected)
        </Text>

        {/* Body Part Filter */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-3" style={{ maxHeight: 34 }}>
          {["All", ...BODY_PARTS].map((part) => (
            <TouchableOpacity
              key={part}
              onPress={() => setFilterBodyPart(part)}
              style={filterBodyPart === part ? { backgroundColor: colors.primary } : { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }}
              className="px-3 py-1.5 rounded-full mr-2"
              activeOpacity={0.7}
            >
              <Text className={`text-xs font-semibold ${filterBodyPart === part ? "text-white" : "text-foreground"}`}>
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
              style={isSelected ? { borderColor: colors.primary, backgroundColor: colors.primary + "10" } : { borderColor: colors.border }}
              className="rounded-xl p-3 mb-2 border flex-row items-center"
              activeOpacity={0.7}
            >
              <View className="w-9 h-9 rounded-full bg-surface items-center justify-center mr-3">
                <Text className="text-base">{exercise.image}</Text>
              </View>
              <View className="flex-1">
                <Text className="text-sm font-semibold text-foreground">{exercise.name}</Text>
                <Text className="text-xs text-muted">
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
