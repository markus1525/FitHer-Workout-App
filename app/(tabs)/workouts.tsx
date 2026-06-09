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
  const { state, toggleFavoritePlan } = useApp();
  const colors = useColors();
  const [activeTab, setActiveTab] = useState<"default" | "custom">("default");
  const [selectedFilter, setSelectedFilter] = useState<string>("All");

  const workoutsMode = state.profile?.workoutsMode || "both";

  // Filter Suggested Plans by active Workouts Mode
  const suggestedPlans = DEFAULT_WORKOUT_PLANS.filter((plan) => {
    const planMode = plan.mode || "home";
    if (workoutsMode === "both") return true;
    return planMode === workoutsMode;
  });

  const filteredSuggested = selectedFilter === "All"
    ? suggestedPlans
    : suggestedPlans.filter((p) => p.bodyParts.includes(selectedFilter) || p.difficulty === selectedFilter.toLowerCase());

  // Filter My Plans
  const favoritedSuggestedPlans = DEFAULT_WORKOUT_PLANS.filter((p) => state.favorites?.includes(p.id));

  const filteredCustomPlans = selectedFilter === "All"
    ? state.customPlans
    : state.customPlans.filter((p) => p.bodyParts.includes(selectedFilter) || p.difficulty === selectedFilter.toLowerCase());

  const filteredFavoritedPlans = selectedFilter === "All"
    ? favoritedSuggestedPlans
    : favoritedSuggestedPlans.filter((p) => p.bodyParts.includes(selectedFilter) || p.difficulty === selectedFilter.toLowerCase());

  const getDifficultyColor = (d: string) => {
    if (d === "beginner") return colors.success;
    if (d === "intermediate") return colors.warning;
    return colors.error;
  };

  const renderPlanCard = ({ item }: { item: WorkoutPlan }) => {
    const isDefaultPlan = item.isDefault;
    const isFav = state.favorites?.includes(item.id) || false;

    return (
      <TouchableOpacity
        onPress={() => router.push({ pathname: "/workout-detail" as any, params: { planId: item.id, isCustom: isDefaultPlan ? "0" : "1" } })}
        style={{
          backgroundColor: colors.surface,
          borderRadius: 16,
          padding: 16,
          marginBottom: 10,
          borderWidth: 1,
          borderColor: colors.border,
          position: "relative",
        }}
        activeOpacity={0.7}
      >
        <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
          <View style={{ flex: 1, paddingRight: 32 }}>
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
              {isDefaultPlan && item.mode && (
                <View style={{ backgroundColor: colors.primary + "15", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 }}>
                  <Text style={{ color: colors.primary, fontSize: 10, fontWeight: "600", textTransform: "capitalize" }}>
                    {item.mode === "gym" ? "Gym" : "Home"}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>

        <MaterialIcons
          name="chevron-right"
          size={24}
          color={colors.muted}
          style={{
            position: "absolute",
            right: 12,
            bottom: 12,
          }}
        />

        {isDefaultPlan && (
          <TouchableOpacity
            onPress={(e) => {
              if (e && e.stopPropagation) {
                e.stopPropagation();
              }
              toggleFavoritePlan(item.id);
            }}
            style={{
              padding: 8,
              position: "absolute",
              right: 8,
              top: 8,
              zIndex: 10,
            }}
            activeOpacity={0.7}
          >
            <MaterialIcons
              name={isFav ? "favorite" : "favorite-border"}
              size={22}
              color={isFav ? "#E91E63" : colors.muted}
            />
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  };

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
            justifyContent: "center",
            backgroundColor: activeTab === "default" ? colors.primary : "transparent",
          }}
          activeOpacity={0.7}
        >
          <Text style={{ fontWeight: "600", fontSize: 14, color: activeTab === "default" ? "#FFF" : colors.muted, lineHeight: 20 }}>
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
            justifyContent: "center",
            backgroundColor: activeTab === "custom" ? colors.primary : "transparent",
          }}
          activeOpacity={0.7}
        >
          <Text style={{ fontWeight: "600", fontSize: 14, color: activeTab === "custom" ? "#FFF" : colors.muted, lineHeight: 20 }}>
            My Plans
          </Text>
        </TouchableOpacity>
      </View>

      {/* Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ marginBottom: 16, height: 44, flexGrow: 0, flexShrink: 0 }}
        contentContainerStyle={{ alignItems: "center" }}
      >
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
      {activeTab === "custom" ? (
        filteredCustomPlans.length === 0 && filteredFavoritedPlans.length === 0 ? (
          <View
            style={{
              backgroundColor: colors.surface,
              borderRadius: 16,
              padding: 24,
              borderWidth: 1,
              borderColor: colors.border,
              alignItems: "center",
              justifyContent: "center",
              marginTop: 8,
            }}
          >
            <Text style={{ fontSize: 40 }}>🏋️‍♀️</Text>
            <Text style={{ fontSize: 16, fontWeight: "600", color: colors.foreground, marginTop: 12 }}>
              No Plans Yet
            </Text>
            <Text style={{ fontSize: 14, color: colors.muted, textAlign: "center", marginTop: 4, paddingHorizontal: 16 }}>
              Create a custom workout plan or favorite a suggested plan to see it here!
            </Text>
            <TouchableOpacity
              onPress={() => router.push("/create-plan" as any)}
              style={{
                backgroundColor: colors.primary,
                borderRadius: 20,
                paddingHorizontal: 24,
                paddingVertical: 12,
                marginTop: 16,
                alignItems: "center",
                justifyContent: "center",
              }}
              activeOpacity={0.7}
            >
              <Text style={{ color: "#FFF", fontWeight: "600", fontSize: 14 }}>Create Plan</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
            {/* Section 1: My Custom Plans */}
            <Text style={{ fontSize: 15, fontWeight: "700", color: colors.foreground, marginTop: 8, marginBottom: 12 }}>
              My Custom Plans ({filteredCustomPlans.length})
            </Text>
            {filteredCustomPlans.length === 0 ? (
              <View style={{ padding: 16, backgroundColor: colors.surface + "50", borderRadius: 12, borderWidth: 1, borderColor: colors.border, borderStyle: "dashed", alignItems: "center", marginBottom: 20 }}>
                <Text style={{ fontSize: 13, color: colors.muted }}>No custom plans match your search.</Text>
                <TouchableOpacity onPress={() => router.push("/create-plan" as any)} style={{ marginTop: 8 }}>
                  <Text style={{ fontSize: 13, color: colors.primary, fontWeight: "600" }}>+ Create a custom plan</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={{ marginBottom: 16 }}>
                {filteredCustomPlans.map((item) => (
                  <View key={item.id}>
                    {renderPlanCard({ item })}
                  </View>
                ))}
              </View>
            )}

            {/* Section 2: Favorited Suggested Plans */}
            <Text style={{ fontSize: 15, fontWeight: "700", color: colors.foreground, marginTop: 12, marginBottom: 12 }}>
              Favorited Suggested Plans ({filteredFavoritedPlans.length})
            </Text>
            {filteredFavoritedPlans.length === 0 ? (
              <View style={{ padding: 16, backgroundColor: colors.surface + "50", borderRadius: 12, borderWidth: 1, borderColor: colors.border, borderStyle: "dashed", alignItems: "center", marginBottom: 20 }}>
                <Text style={{ fontSize: 13, color: colors.muted }}>No favorited plans match your search.</Text>
                <TouchableOpacity onPress={() => setActiveTab("default")} style={{ marginTop: 8 }}>
                  <Text style={{ fontSize: 13, color: colors.primary, fontWeight: "600" }}>Browse suggested plans</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={{ marginBottom: 16 }}>
                {filteredFavoritedPlans.map((item) => (
                  <View key={item.id}>
                    {renderPlanCard({ item })}
                  </View>
                ))}
              </View>
            )}
          </ScrollView>
        )
      ) : (
        filteredSuggested.length === 0 ? (
          <View
            style={{
              backgroundColor: colors.surface,
              borderRadius: 16,
              padding: 24,
              borderWidth: 1,
              borderColor: colors.border,
              alignItems: "center",
              justifyContent: "center",
              marginTop: 8,
            }}
          >
            <Text style={{ fontSize: 40 }}>🏋️‍♀️</Text>
            <Text style={{ fontSize: 16, fontWeight: "600", color: colors.foreground, marginTop: 12 }}>
              No Plans Found
            </Text>
            <Text style={{ fontSize: 14, color: colors.muted, textAlign: "center", marginTop: 4, paddingHorizontal: 16 }}>
              Try a different filter or check your Workouts Mode in settings.
            </Text>
          </View>
        ) : (
          <FlatList
            data={filteredSuggested}
            renderItem={renderPlanCard}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 24 }}
          />
        )
      )}
    </ScreenContainer>
  );
}
