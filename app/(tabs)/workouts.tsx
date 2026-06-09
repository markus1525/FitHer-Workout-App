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
      style={{
        backgroundColor: colors.surface,
        borderRadius: 16,
        padding: 16,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: colors.border,
      }}
      activeOpacity={0.7}
    >
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 15, fontWeight: "700", color: colors.foreground }}>{item.name}</Text>
          <Text style={{ fontSize: 12, color: colors.muted, marginTop: 4 }} numberOfLines={2}>{item.description}</Text>
          <View style={{ flexDirection: "row", alignItems: "center", marginTop: 8, gap: 12 }}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <MaterialIcons name="schedule" size={14} color={colors.muted} />
              <Text style={{ fontSize: 11, color: colors.muted, marginLeft: 4 }}>{item.duration} min</Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <MaterialIcons name="fitness-center" size={14} color={colors.muted} />
              <Text style={{ fontSize: 11, color: colors.muted, marginLeft: 4 }}>{item.exercises.length} exercises</Text>
            </View>
            <View style={{ backgroundColor: getDifficultyColor(item.difficulty) + "20", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 }}>
              <Text style={{ color: getDifficultyColor(item.difficulty), fontSize: 10, fontWeight: "600", textTransform: "capitalize" }}>
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
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <Text style={{ fontSize: 24, fontWeight: "700", color: colors.foreground }}>Workouts</Text>
        <TouchableOpacity
          onPress={() => router.push("/create-plan" as any)}
          style={{
            backgroundColor: colors.primary,
            borderRadius: 20,
            paddingHorizontal: 14,
            paddingVertical: 8,
            flexDirection: "row",
            alignItems: "center",
          }}
          activeOpacity={0.7}
        >
          <MaterialIcons name="add" size={16} color="#FFF" />
          <Text style={{ color: "#FFF", fontWeight: "600", fontSize: 13, marginLeft: 4 }}>Create</Text>
        </TouchableOpacity>
      </View>

      {/* Tab Toggle */}
      <View style={{ flexDirection: "row", backgroundColor: colors.surface, borderRadius: 12, padding: 4, marginBottom: 16 }}>
        <TouchableOpacity
          onPress={() => setActiveTab("default")}
          style={{
            flex: 1,
            paddingVertical: 10,
            borderRadius: 8,
            alignItems: "center",
            backgroundColor: activeTab === "default" ? colors.primary : "transparent",
          }}
          activeOpacity={0.7}
        >
          <Text style={{ fontWeight: "600", fontSize: 14, color: activeTab === "default" ? "#FFF" : colors.muted }}>
            Suggested Plans
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveTab("custom")}
          style={{
            flex: 1,
            paddingVertical: 10,
            borderRadius: 8,
            alignItems: "center",
            backgroundColor: activeTab === "custom" ? colors.primary : "transparent",
          }}
          activeOpacity={0.7}
        >
          <Text style={{ fontWeight: "600", fontSize: 14, color: activeTab === "custom" ? "#FFF" : colors.muted }}>
            My Plans
          </Text>
        </TouchableOpacity>
      </View>

      {/* Filters */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16, maxHeight: 36 }}>
        {["All", ...BODY_PARTS].map((filter) => (
          <TouchableOpacity
            key={filter}
            onPress={() => setSelectedFilter(filter)}
            style={{
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 20,
              marginRight: 8,
              backgroundColor: selectedFilter === filter ? colors.primary : colors.surface,
              borderWidth: selectedFilter === filter ? 0 : 1,
              borderColor: colors.border,
            }}
            activeOpacity={0.7}
          >
            <Text style={{ fontSize: 12, fontWeight: "600", color: selectedFilter === filter ? "#FFF" : colors.foreground }}>
              {filter}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Plans List */}
      {filteredPlans.length === 0 ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingVertical: 48 }}>
          <Text style={{ fontSize: 40 }}>🏋️‍♀️</Text>
          <Text style={{ fontSize: 16, fontWeight: "600", color: colors.foreground, marginTop: 12 }}>
            {activeTab === "custom" ? "No Custom Plans Yet" : "No Plans Found"}
          </Text>
          <Text style={{ fontSize: 14, color: colors.muted, textAlign: "center", marginTop: 4, paddingHorizontal: 32 }}>
            {activeTab === "custom"
              ? "Create your first custom workout plan!"
              : "Try a different filter."}
          </Text>
          {activeTab === "custom" && (
            <TouchableOpacity
              onPress={() => router.push("/create-plan" as any)}
              style={{ backgroundColor: colors.primary, borderRadius: 20, paddingHorizontal: 24, paddingVertical: 12, marginTop: 16 }}
              activeOpacity={0.7}
            >
              <Text style={{ color: "#FFF", fontWeight: "600" }}>Create Plan</Text>
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
