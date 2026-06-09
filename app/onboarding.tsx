import { Text, View, TouchableOpacity, TextInput, ScrollView } from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { ScreenContainer } from "@/components/screen-container";
import { useApp } from "@/lib/app-context";
import { useColors } from "@/hooks/use-colors";

const FITNESS_GOALS = [
  { id: "lose_weight", label: "Lose Weight", icon: "🔥", desc: "Burn fat and slim down" },
  { id: "tone_up", label: "Tone Up", icon: "💪", desc: "Build lean muscle" },
  { id: "stay_active", label: "Stay Active", icon: "🏃‍♀️", desc: "Maintain fitness" },
  { id: "build_strength", label: "Build Strength", icon: "🏋️‍♀️", desc: "Get stronger" },
];

const FITNESS_LEVELS = [
  { id: "beginner", label: "Beginner", desc: "New to working out" },
  { id: "intermediate", label: "Intermediate", desc: "Work out occasionally" },
  { id: "advanced", label: "Advanced", desc: "Regular fitness routine" },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const { updateProfile, completeOnboarding } = useApp();
  const colors = useColors();
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [goal, setGoal] = useState("");
  const [level, setLevel] = useState("");

  const handleComplete = async () => {
    await updateProfile({
      name: name.trim() || "Beautiful",
      age: parseInt(age) || 25,
      height: parseFloat(height) || 165,
      weight: parseFloat(weight) || 60,
      fitnessGoal: goal || "stay_active",
      fitnessLevel: level || "beginner",
      unitSystem: "metric",
    });
    await completeOnboarding();
    router.replace("/");
  };

  const canProceed = () => {
    switch (step) {
      case 0: return true; // welcome
      case 1: return name.trim().length > 0;
      case 2: return age.length > 0 && height.length > 0 && weight.length > 0;
      case 3: return goal.length > 0;
      case 4: return level.length > 0;
      default: return true;
    }
  };

  return (
    <ScreenContainer edges={["top", "bottom", "left", "right"]} className="px-6">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>
        {/* Progress */}
        <View className="flex-row gap-1.5 mt-4 mb-8">
          {[0, 1, 2, 3, 4].map((i) => (
            <View
              key={i}
              className="flex-1 h-1 rounded-full"
              style={{ backgroundColor: i <= step ? colors.primary : colors.border }}
            />
          ))}
        </View>

        {/* Step 0: Welcome */}
        {step === 0 && (
          <View className="flex-1 items-center justify-center">
            <Text className="text-6xl mb-4">🌸</Text>
            <Text className="text-3xl font-bold text-foreground text-center">Welcome to FitHer</Text>
            <Text className="text-base text-muted text-center mt-3 px-4">
              Your personal home workout companion designed just for women.
            </Text>
            <Text className="text-sm text-muted text-center mt-2 px-4">
              Let's set up your profile to personalize your experience.
            </Text>
          </View>
        )}

        {/* Step 1: Name */}
        {step === 1 && (
          <View className="flex-1 justify-center">
            <Text className="text-2xl font-bold text-foreground mb-2">What's your name?</Text>
            <Text className="text-sm text-muted mb-6">We'll use this to personalize your experience.</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Enter your name"
              placeholderTextColor={colors.muted}
              className="bg-surface border border-border rounded-2xl px-4 py-4 text-lg text-foreground"
              autoFocus
              returnKeyType="done"
            />
          </View>
        )}

        {/* Step 2: Body Info */}
        {step === 2 && (
          <View className="flex-1 justify-center">
            <Text className="text-2xl font-bold text-foreground mb-2">Your measurements</Text>
            <Text className="text-sm text-muted mb-6">This helps us calculate BMI and recommend workouts.</Text>
            <View className="gap-4">
              <View>
                <Text className="text-sm text-muted mb-1">Age</Text>
                <TextInput
                  value={age}
                  onChangeText={setAge}
                  placeholder="25"
                  placeholderTextColor={colors.muted}
                  keyboardType="number-pad"
                  className="bg-surface border border-border rounded-2xl px-4 py-3.5 text-base text-foreground"
                />
              </View>
              <View>
                <Text className="text-sm text-muted mb-1">Height (cm)</Text>
                <TextInput
                  value={height}
                  onChangeText={setHeight}
                  placeholder="165"
                  placeholderTextColor={colors.muted}
                  keyboardType="decimal-pad"
                  className="bg-surface border border-border rounded-2xl px-4 py-3.5 text-base text-foreground"
                />
              </View>
              <View>
                <Text className="text-sm text-muted mb-1">Weight (kg)</Text>
                <TextInput
                  value={weight}
                  onChangeText={setWeight}
                  placeholder="60"
                  placeholderTextColor={colors.muted}
                  keyboardType="decimal-pad"
                  className="bg-surface border border-border rounded-2xl px-4 py-3.5 text-base text-foreground"
                />
              </View>
            </View>
          </View>
        )}

        {/* Step 3: Fitness Goal */}
        {step === 3 && (
          <View className="flex-1 justify-center">
            <Text className="text-2xl font-bold text-foreground mb-2">What's your goal?</Text>
            <Text className="text-sm text-muted mb-6">We'll tailor your workout plans accordingly.</Text>
            <View className="gap-3">
              {FITNESS_GOALS.map((g) => (
                <TouchableOpacity
                  key={g.id}
                  onPress={() => setGoal(g.id)}
                  style={goal === g.id ? { borderColor: colors.primary, backgroundColor: colors.primary + "10" } : { borderColor: colors.border }}
                  className="flex-row items-center p-4 rounded-2xl border"
                  activeOpacity={0.7}
                >
                  <Text className="text-2xl mr-3">{g.icon}</Text>
                  <View className="flex-1">
                    <Text className="text-base font-semibold text-foreground">{g.label}</Text>
                    <Text className="text-xs text-muted">{g.desc}</Text>
                  </View>
                  {goal === g.id && <MaterialIcons name="check-circle" size={24} color={colors.primary} />}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Step 4: Fitness Level */}
        {step === 4 && (
          <View className="flex-1 justify-center">
            <Text className="text-2xl font-bold text-foreground mb-2">Your fitness level?</Text>
            <Text className="text-sm text-muted mb-6">This helps us pick the right intensity.</Text>
            <View className="gap-3">
              {FITNESS_LEVELS.map((l) => (
                <TouchableOpacity
                  key={l.id}
                  onPress={() => setLevel(l.id)}
                  style={level === l.id ? { borderColor: colors.primary, backgroundColor: colors.primary + "10" } : { borderColor: colors.border }}
                  className="p-4 rounded-2xl border"
                  activeOpacity={0.7}
                >
                  <View className="flex-row items-center justify-between">
                    <View>
                      <Text className="text-base font-semibold text-foreground">{l.label}</Text>
                      <Text className="text-xs text-muted mt-0.5">{l.desc}</Text>
                    </View>
                    {level === l.id && <MaterialIcons name="check-circle" size={24} color={colors.primary} />}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Navigation Buttons */}
        <View className="flex-row gap-3 mt-8 mb-6">
          {step > 0 && (
            <TouchableOpacity
              onPress={() => setStep(step - 1)}
              className="flex-1 bg-surface border border-border rounded-2xl py-4 items-center"
              activeOpacity={0.7}
            >
              <Text className="text-foreground font-semibold">Back</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            onPress={() => {
              if (step === 4) {
                handleComplete();
              } else {
                setStep(step + 1);
              }
            }}
            className="flex-1 bg-primary rounded-2xl py-4 items-center"
            style={{ opacity: canProceed() ? 1 : 0.5 }}
            activeOpacity={0.7}
            disabled={!canProceed()}
          >
            <Text className="text-white font-bold text-base">
              {step === 0 ? "Get Started" : step === 4 ? "Complete" : "Next"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
