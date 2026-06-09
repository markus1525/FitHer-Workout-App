import { ScrollView, Text, View, TouchableOpacity, FlatList } from "react-native";
import { useRouter } from "expo-router";
import { useState } from "react";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { ScreenContainer } from "@/components/screen-container";
import { useApp } from "@/lib/app-context";
import { DEFAULT_WORKOUT_PLANS, BODY_PARTS, WorkoutPlan } from "@/data/exercises";
import { useColors } from "@/hooks/use-colors";

export default function WorkoutsScreen() {
  const router = useRouter();
  const { state } = useApp();
  const colors = useColors();
  const [activeTab, setActiveTab] = useState<"default" | "custom">("default");
  const [selectedFilter, setSelectedFilter] = useState<string>("All");

  const allPlans = activeTab === "default" ? DEFAULT_WORKOUT_PLANS : state.customPlans;
  const filteredPlans = selectedFilter === "All"
    ? allPlans
    : allPlans.filter((p) => p.bodyParts.includes(selectedFilter) || p.difficulty === selectedFilter.toLowerCase());

  const getDifficultyColor = (d: string) => {
    if (d === "beginner") return colors.success;
    if (d === "intermediate") return colors.warning;
    return colors.error;
  };

  const renderPlanCard = ({ item }: { item: WorkoutPlan }) => (
    <TouchableOpacity
      onPress={() => router.push({ pathname: "/workout-detail" as any, params: { planId: item.id, isCustom: activeTab === "custom" ? "1" : "0" } })}
      className="bg-surface rounded-2xl p-4 mb-3 border border-border"
      activeOpacity={0.7}
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-1">
          <Text className="text-base font-bold text-foreground">{item.name}</Text>
          <Text className="text-xs text-muted mt-1" numberOfLines={2}>{item.description}</Text>
          <View className="flex-row items-center mt-2 gap-3">
            <View className="flex-row items-center">
              <MaterialIcons name="schedule" size={14} color={colors.muted} />
              <Text className="text-xs text-muted ml-1">{item.duration} min</Text>
            </View>
            <View className="flex-row items-center">
              <MaterialIcons name="fitness-center" size={14} color={colors.muted} />
              <Text className="text-xs text-muted ml-1">{item.exercises.length} exercises</Text>
            </View>
            <View style={{ backgroundColor: getDifficultyColor(item.difficulty) + "20" }} className="px-2 py-0.5 rounded-full">
              <Text style={{ color: getDifficultyColor(item.difficulty) }} className="text-xs font-semibold capitalize">
                {item.difficulty}
              </Text>
            </View>
          </View>
        </View>
        <MaterialIcons name="chevron-right" size={24} color={colors.muted} />
      </View>
    </TouchableOpacity>
  );

  return (
    <ScreenContainer className="px-4 pt-2">
      {/* Header */}
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-2xl font-bold text-foreground">Workouts</Text>
        <TouchableOpacity
          onPress={() => router.push("/create-plan" as any)}
          className="bg-primary rounded-full px-4 py-2 flex-row items-center"
          activeOpacity={0.7}
        >
          <MaterialIcons name="add" size={18} color="#FFF" />
          <Text className="text-white font-semibold text-sm ml-1">Create</Text>
        </TouchableOpacity>
      </View>

      {/* Tab Toggle */}
      <View className="flex-row bg-surface rounded-xl p-1 mb-4">
        <TouchableOpacity
          onPress={() => setActiveTab("default")}
          className={`flex-1 py-2 rounded-lg items-center ${activeTab === "default" ? "bg-primary" : ""}`}
          activeOpacity={0.7}
        >
          <Text className={`font-semibold text-sm ${activeTab === "default" ? "text-white" : "text-muted"}`}>
            Suggested Plans
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveTab("custom")}
          className={`flex-1 py-2 rounded-lg items-center ${activeTab === "custom" ? "bg-primary" : ""}`}
          activeOpacity={0.7}
        >
          <Text className={`font-semibold text-sm ${activeTab === "custom" ? "text-white" : "text-muted"}`}>
            My Plans
          </Text>
        </TouchableOpacity>
      </View>

      {/* Filters */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4" style={{ maxHeight: 36 }}>
        {["All", ...BODY_PARTS].map((filter) => (
          <TouchableOpacity
            key={filter}
            onPress={() => setSelectedFilter(filter)}
            style={selectedFilter === filter ? { backgroundColor: colors.primary } : { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }}
            className="px-3 py-1.5 rounded-full mr-2"
            activeOpacity={0.7}
          >
            <Text className={`text-xs font-semibold ${selectedFilter === filter ? "text-white" : "text-foreground"}`}>
              {filter}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Plans List */}
      {filteredPlans.length === 0 ? (
        <View className="flex-1 items-center justify-center py-12">
          <Text className="text-4xl mb-3">🏋️‍♀️</Text>
          <Text className="text-base font-semibold text-foreground">
            {activeTab === "custom" ? "No Custom Plans Yet" : "No Plans Found"}
          </Text>
          <Text className="text-sm text-muted text-center mt-1 px-8">
            {activeTab === "custom"
              ? "Create your first custom workout plan!"
              : "Try a different filter."}
          </Text>
          {activeTab === "custom" && (
            <TouchableOpacity
              onPress={() => router.push("/create-plan" as any)}
              className="bg-primary rounded-full px-6 py-3 mt-4"
              activeOpacity={0.7}
            >
              <Text className="text-white font-semibold">Create Plan</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <FlatList
          data={filteredPlans}
          renderItem={renderPlanCard}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
        />
      )}
    </ScreenContainer>
  );
}
