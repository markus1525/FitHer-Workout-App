import { ScrollView, Text, View, TouchableOpacity } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { ScreenContainer } from "@/components/screen-container";
import { YouTubeModal, openYouTubeSearch } from "@/components/youtube-modal";
import { MusicShortcuts } from "@/components/music-shortcuts";
import { useApp } from "@/lib/app-context";
import { DEFAULT_WORKOUT_PLANS, EXERCISES, WorkoutPlan, Exercise, getPlanPhases } from "@/data/exercises";
import { EXERCISE_COACHING } from "@/data/exercise-coaching";
import { useColors } from "@/hooks/use-colors";

export default function WorkoutDetailScreen() {
  const router = useRouter();
  const { planId, isCustom } = useLocalSearchParams<{ planId: string; isCustom?: string }>();
  const { state } = useApp();
  const colors = useColors();
  const [videoModal, setVideoModal] = useState<{ visible: boolean; videoId: string; title: string }>({
    visible: false,
    videoId: "",
    title: "",
  });

  const plan: WorkoutPlan | undefined = isCustom === "1"
    ? state.customPlans.find((p) => p.id === planId)
    : DEFAULT_WORKOUT_PLANS.find((p) => p.id === planId);

  if (!plan) {
    return (
      <ScreenContainer className="items-center justify-center px-6">
        <Text style={{ fontSize: 18, color: colors.foreground }}>Plan not found</Text>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 16, backgroundColor: colors.primary, borderRadius: 12, paddingHorizontal: 24, paddingVertical: 12 }} activeOpacity={0.7}>
          <Text style={{ color: "#FFF", fontWeight: "600" }}>Go Back</Text>
        </TouchableOpacity>
      </ScreenContainer>
    );
  }

  const phases = getPlanPhases(plan);
  const resolve = (ids: string[]) => ids.map((id) => EXERCISES.find((e) => e.id === id)).filter(Boolean) as Exercise[];
  const warmupEx = resolve(phases.warmup);
  const mainEx = resolve(phases.main);
  const cooldownEx = resolve(phases.cooldown);
  const exercises = [...warmupEx, ...mainEx, ...cooldownEx];
  const totalCalories = exercises.reduce((sum, e) => sum + (e?.calories || 0), 0);

  const getDifficultyColor = (d: string) => {
    if (d === "beginner") return colors.success;
    if (d === "intermediate") return colors.warning;
    return colors.error;
  };

  const openVideoPreview = (youtubeId: string, exerciseName: string) => {
    setVideoModal({ visible: true, videoId: youtubeId, title: exerciseName });
  };

  const renderExerciseCard = (exercise: Exercise) => {
    const coaching = EXERCISE_COACHING[exercise.id] || {
      targetMuscles: exercise.targetMuscles,
      formTips: exercise.formTips,
      commonMistakes: exercise.commonMistakes,
    };
    return (
      <View key={exercise.id} style={{ backgroundColor: colors.surface, borderRadius: 12, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: colors.border }}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primary + "15", alignItems: "center", justifyContent: "center", marginRight: 12 }}>
            <Text style={{ fontSize: 18 }}>{exercise.image}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 14, fontWeight: "600", color: colors.foreground }}>{exercise.name}</Text>
            <Text style={{ fontSize: 12, color: colors.muted, marginTop: 2 }}>
              {exercise.reps ? `${exercise.reps} reps` : `${exercise.duration}s`}
              {exercise.sets ? ` × ${exercise.sets} sets` : ""}
              {" • "}{exercise.calories} cal
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => (exercise.youtubeId ? openVideoPreview(exercise.youtubeId, exercise.name) : openYouTubeSearch(exercise.name))}
            style={{ backgroundColor: "#FF0000", borderRadius: 18, width: 36, height: 36, alignItems: "center", justifyContent: "center" }}
            activeOpacity={0.7}
          >
            <MaterialIcons name="play-arrow" size={20} color="#FFF" style={{ lineHeight: 20, marginLeft: 2 }} />
          </TouchableOpacity>
        </View>
        <Text style={{ fontSize: 12, color: colors.muted, marginTop: 8, marginLeft: 52 }} numberOfLines={2}>{exercise.description}</Text>

        {coaching.targetMuscles && coaching.targetMuscles.length > 0 && (
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 8, marginLeft: 52 }}>
            {coaching.targetMuscles.map((muscle) => (
              <View key={muscle} style={{ backgroundColor: colors.primary + "15", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 }}>
                <Text style={{ fontSize: 11, color: colors.primary, fontWeight: "500" }}>{muscle}</Text>
              </View>
            ))}
          </View>
        )}

        {coaching.formTips && coaching.formTips.length > 0 && (
          <View style={{ marginTop: 10, marginLeft: 52 }}>
            <Text style={{ fontSize: 12, fontWeight: "600", color: colors.foreground, marginBottom: 4 }}>How to do it</Text>
            {coaching.formTips.map((tip, i) => (
              <View key={i} style={{ flexDirection: "row", marginBottom: 3 }}>
                <Text style={{ fontSize: 12, color: colors.primary, marginRight: 6, fontWeight: "700" }}>{i + 1}.</Text>
                <Text style={{ fontSize: 12, color: colors.muted, flex: 1 }}>{tip}</Text>
              </View>
            ))}
          </View>
        )}

        {coaching.commonMistakes && coaching.commonMistakes.length > 0 && (
          <View style={{ marginTop: 8, marginLeft: 52 }}>
            <Text style={{ fontSize: 12, fontWeight: "600", color: colors.error, marginBottom: 4 }}>Avoid</Text>
            {coaching.commonMistakes.map((m, i) => (
              <View key={i} style={{ flexDirection: "row", marginBottom: 3 }}>
                <Text style={{ fontSize: 12, color: colors.error, marginRight: 6 }}>✕</Text>
                <Text style={{ fontSize: 12, color: colors.muted, flex: 1 }}>{m}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    );
  };

  const PhaseHeader = ({ label }: { label: string }) => (
    <Text style={{ fontSize: 13, fontWeight: "700", color: colors.primary, marginTop: 8, marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 }}>
      {label}
    </Text>
  );

  return (
    <ScreenContainer className="px-4 pt-2">
      {/* YouTube Video Modal */}
      <YouTubeModal
        visible={videoModal.visible}
        videoId={videoModal.videoId}
        title={videoModal.title}
        onClose={() => setVideoModal({ visible: false, videoId: "", title: "" })}
      />

      {/* Header */}
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 16 }}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 12 }} activeOpacity={0.7}>
          <MaterialIcons name="arrow-back" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={{ fontSize: 20, fontWeight: "700", color: colors.foreground, flex: 1 }} numberOfLines={1}>{plan.name}</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Plan Info */}
        <View style={{ backgroundColor: colors.surface, borderRadius: 16, padding: 16, marginBottom: 16 }}>
          <Text style={{ fontSize: 14, color: colors.muted, marginBottom: 12 }}>{plan.description}</Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <MaterialIcons name="schedule" size={16} color={colors.muted} />
              <Text style={{ fontSize: 14, color: colors.muted, marginLeft: 4 }}>{plan.duration} min</Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <MaterialIcons name="local-fire-department" size={16} color={colors.warning} />
              <Text style={{ fontSize: 14, color: colors.muted, marginLeft: 4 }}>~{totalCalories} cal</Text>
            </View>
            <View style={{ backgroundColor: getDifficultyColor(plan.difficulty) + "20", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 }}>
              <Text style={{ color: getDifficultyColor(plan.difficulty), fontSize: 12, fontWeight: "600", textTransform: "capitalize" }}>
                {plan.difficulty}
              </Text>
            </View>
          </View>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 12 }}>
            {plan.bodyParts.map((part) => (
              <View key={part} style={{ backgroundColor: colors.primary + "15", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 }}>
                <Text style={{ fontSize: 12, color: colors.primary, fontWeight: "500" }}>{part}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Music quick links */}
        <MusicShortcuts />

        {/* Exercise List, split into phases */}
        <Text style={{ fontSize: 16, fontWeight: "600", color: colors.foreground, marginBottom: 4 }}>
          Workout ({exercises.length} moves)
        </Text>

        {warmupEx.length > 0 && (
          <>
            <PhaseHeader label="🔥 Warm Up" />
            {warmupEx.map(renderExerciseCard)}
          </>
        )}

        <PhaseHeader label="💪 Main Workout" />
        {mainEx.map(renderExerciseCard)}

        {cooldownEx.length > 0 && (
          <>
            <PhaseHeader label="🧘 Cool Down" />
            {cooldownEx.map(renderExerciseCard)}
          </>
        )}
      </ScrollView>

      {/* Start Workout Button */}
      <View style={{ position: "absolute", bottom: 24, left: 16, right: 16 }}>
        <TouchableOpacity
          onPress={() => router.push({ pathname: "/exercise-player" as any, params: { planId: plan.id, isCustom: isCustom || "0" } })}
          style={{
            backgroundColor: colors.primary,
            borderRadius: 16,
            paddingVertical: 16,
            alignItems: "center",
            flexDirection: "row",
            justifyContent: "center",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.15,
            shadowRadius: 8,
            elevation: 4,
          }}
          activeOpacity={0.8}
        >
          <MaterialIcons name="play-arrow" size={24} color="#FFF" />
          <Text style={{ color: "#FFF", fontWeight: "700", fontSize: 18, marginLeft: 8 }}>Start Workout</Text>
        </TouchableOpacity>
      </View>
    </ScreenContainer>
  );
}
