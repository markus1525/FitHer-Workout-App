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
  const [unitSystem, setUnitSystem] = useState<"metric" | "imperial">("metric");

  const handleComplete = async () => {
    const rawHeight = parseFloat(height);
    const rawWeight = parseFloat(weight);
    
    const defaultHeight = unitSystem === "imperial" ? 65 : 165;
    const defaultWeight = unitSystem === "imperial" ? 132 : 60;
    
    const h = isNaN(rawHeight) ? defaultHeight : rawHeight;
    const w = isNaN(rawWeight) ? defaultWeight : rawWeight;

    const heightCm = unitSystem === "imperial" ? h / 0.393701 : h;
    const weightKg = unitSystem === "imperial" ? w / 2.20462 : w;

    await updateProfile({
      name: name.trim() || "Beautiful",
      age: parseInt(age) || 25,
      height: heightCm,
      weight: weightKg,
      fitnessGoal: goal || "stay_active",
      fitnessLevel: level || "beginner",
      unitSystem: unitSystem,
    });
    await completeOnboarding();
    router.replace("/");
  };

  const canProceed = () => {
    switch (step) {
      case 0: return true;
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
        <View style={{ flexDirection: "row", gap: 6, marginTop: 16, marginBottom: 32 }}>
          {[0, 1, 2, 3, 4].map((i) => (
            <View
              key={i}
              style={{
                flex: 1,
                height: 4,
                borderRadius: 2,
                backgroundColor: i <= step ? colors.primary : colors.border,
              }}
            />
          ))}
        </View>

        {/* Step 0: Welcome */}
        {step === 0 && (
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
            <Text style={{ fontSize: 56 }}>🌸</Text>
            <Text style={{ fontSize: 28, fontWeight: "700", color: colors.foreground, textAlign: "center", marginTop: 16 }}>
              Welcome to FitHer
            </Text>
            <Text style={{ fontSize: 16, color: colors.muted, textAlign: "center", marginTop: 12, paddingHorizontal: 16 }}>
              Your personal home workout companion designed just for women.
            </Text>
            <Text style={{ fontSize: 14, color: colors.muted, textAlign: "center", marginTop: 8, paddingHorizontal: 16 }}>
              Let's set up your profile to personalize your experience.
            </Text>
          </View>
        )}

        {/* Step 1: Name */}
        {step === 1 && (
          <View style={{ flex: 1, justifyContent: "center" }}>
            <Text style={{ fontSize: 24, fontWeight: "700", color: colors.foreground, marginBottom: 8 }}>
              What's your name?
            </Text>
            <Text style={{ fontSize: 14, color: colors.muted, marginBottom: 24 }}>
              We'll use this to personalize your experience.
            </Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Enter your name"
              placeholderTextColor={colors.muted}
              style={{
                backgroundColor: colors.surface,
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: 16,
                paddingHorizontal: 18,
                paddingVertical: 16,
                fontSize: 17,
                color: colors.foreground,
                textAlign: "left",
                textAlignVertical: "center",
              }}
              autoFocus
              returnKeyType="done"
            />
          </View>
        )}

        {/* Step 2: Body Info */}
        {step === 2 && (
          <View style={{ flex: 1, justifyContent: "center" }}>
            <Text style={{ fontSize: 24, fontWeight: "700", color: colors.foreground, marginBottom: 8 }}>
              Your measurements
            </Text>
            <Text style={{ fontSize: 14, color: colors.muted, marginBottom: 16 }}>
              This helps us calculate BMI and recommend workouts.
            </Text>

            {/* Unit Switcher */}
            <View style={{ flexDirection: "row", backgroundColor: colors.surface, borderRadius: 12, padding: 4, marginBottom: 20, borderWidth: 1, borderColor: colors.border }}>
              <TouchableOpacity
                onPress={() => setUnitSystem("metric")}
                style={{
                  flex: 1,
                  paddingVertical: 8,
                  alignItems: "center",
                  borderRadius: 10,
                  backgroundColor: unitSystem === "metric" ? colors.primary : "transparent",
                }}
                activeOpacity={0.7}
              >
                <Text style={{ color: unitSystem === "metric" ? "#FFF" : colors.foreground, fontWeight: "600", fontSize: 13 }}>
                  Metric (kg/cm)
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setUnitSystem("imperial")}
                style={{
                  flex: 1,
                  paddingVertical: 8,
                  alignItems: "center",
                  borderRadius: 10,
                  backgroundColor: unitSystem === "imperial" ? colors.primary : "transparent",
                }}
                activeOpacity={0.7}
              >
                <Text style={{ color: unitSystem === "imperial" ? "#FFF" : colors.foreground, fontWeight: "600", fontSize: 13 }}>
                  Imperial (lb/in)
                </Text>
              </TouchableOpacity>
            </View>

            <View style={{ gap: 16 }}>
              <View>
                <Text style={{ fontSize: 14, color: colors.muted, marginBottom: 6 }}>Age</Text>
                <TextInput
                  value={age}
                  onChangeText={setAge}
                  placeholder="25"
                  placeholderTextColor={colors.muted}
                  keyboardType="number-pad"
                  style={{
                    backgroundColor: colors.surface,
                    borderWidth: 1,
                    borderColor: colors.border,
                    borderRadius: 16,
                    paddingHorizontal: 18,
                    paddingVertical: 14,
                    fontSize: 16,
                    color: colors.foreground,
                    textAlign: "left",
                    textAlignVertical: "center",
                  }}
                  returnKeyType="done"
                />
              </View>
              <View>
                <Text style={{ fontSize: 14, color: colors.muted, marginBottom: 6 }}>
                  Height ({unitSystem === "imperial" ? "inches" : "cm"})
                </Text>
                <TextInput
                  value={height}
                  onChangeText={setHeight}
                  placeholder={unitSystem === "imperial" ? "65" : "165"}
                  placeholderTextColor={colors.muted}
                  keyboardType="decimal-pad"
                  style={{
                    backgroundColor: colors.surface,
                    borderWidth: 1,
                    borderColor: colors.border,
                    borderRadius: 16,
                    paddingHorizontal: 18,
                    paddingVertical: 14,
                    fontSize: 16,
                    color: colors.foreground,
                    textAlign: "left",
                    textAlignVertical: "center",
                  }}
                  returnKeyType="done"
                />
              </View>
              <View>
                <Text style={{ fontSize: 14, color: colors.muted, marginBottom: 6 }}>
                  Weight ({unitSystem === "imperial" ? "lbs" : "kg"})
                </Text>
                <TextInput
                  value={weight}
                  onChangeText={setWeight}
                  placeholder={unitSystem === "imperial" ? "132" : "60"}
                  placeholderTextColor={colors.muted}
                  keyboardType="decimal-pad"
                  style={{
                    backgroundColor: colors.surface,
                    borderWidth: 1,
                    borderColor: colors.border,
                    borderRadius: 16,
                    paddingHorizontal: 18,
                    paddingVertical: 14,
                    fontSize: 16,
                    color: colors.foreground,
                    textAlign: "left",
                    textAlignVertical: "center",
                  }}
                  returnKeyType="done"
                />
              </View>
            </View>
          </View>
        )}

        {/* Step 3: Fitness Goal */}
        {step === 3 && (
          <View style={{ flex: 1, justifyContent: "center" }}>
            <Text style={{ fontSize: 24, fontWeight: "700", color: colors.foreground, marginBottom: 8 }}>
              What's your goal?
            </Text>
            <Text style={{ fontSize: 14, color: colors.muted, marginBottom: 24 }}>
              We'll tailor your workout plans accordingly.
            </Text>
            <View style={{ gap: 12 }}>
              {FITNESS_GOALS.map((g) => (
                <TouchableOpacity
                  key={g.id}
                  onPress={() => setGoal(g.id)}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    padding: 16,
                    borderRadius: 16,
                    borderWidth: 1,
                    borderColor: goal === g.id ? colors.primary : colors.border,
                    backgroundColor: goal === g.id ? colors.primary + "10" : "transparent",
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={{ fontSize: 24, marginRight: 12 }}>{g.icon}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 16, fontWeight: "600", color: colors.foreground }}>{g.label}</Text>
                    <Text style={{ fontSize: 12, color: colors.muted }}>{g.desc}</Text>
                  </View>
                  {goal === g.id && <MaterialIcons name="check-circle" size={24} color={colors.primary} />}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Step 4: Fitness Level */}
        {step === 4 && (
          <View style={{ flex: 1, justifyContent: "center" }}>
            <Text style={{ fontSize: 24, fontWeight: "700", color: colors.foreground, marginBottom: 8 }}>
              Your fitness level?
            </Text>
            <Text style={{ fontSize: 14, color: colors.muted, marginBottom: 24 }}>
              This helps us pick the right intensity.
            </Text>
            <View style={{ gap: 12 }}>
              {FITNESS_LEVELS.map((l) => (
                <TouchableOpacity
                  key={l.id}
                  onPress={() => setLevel(l.id)}
                  style={{
                    padding: 16,
                    borderRadius: 16,
                    borderWidth: 1,
                    borderColor: level === l.id ? colors.primary : colors.border,
                    backgroundColor: level === l.id ? colors.primary + "10" : "transparent",
                  }}
                  activeOpacity={0.7}
                >
                  <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                    <View>
                      <Text style={{ fontSize: 16, fontWeight: "600", color: colors.foreground }}>{l.label}</Text>
                      <Text style={{ fontSize: 12, color: colors.muted, marginTop: 2 }}>{l.desc}</Text>
                    </View>
                    {level === l.id && <MaterialIcons name="check-circle" size={24} color={colors.primary} />}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Navigation Buttons */}
        <View style={{ flexDirection: "row", gap: 12, marginTop: 32, marginBottom: 24 }}>
          {step > 0 && (
            <TouchableOpacity
              onPress={() => setStep(step - 1)}
              style={{
                flex: 1,
                backgroundColor: colors.surface,
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: 16,
                paddingVertical: 16,
                alignItems: "center",
              }}
              activeOpacity={0.7}
            >
              <Text style={{ color: colors.foreground, fontWeight: "600" }}>Back</Text>
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
            style={{
              flex: 1,
              backgroundColor: colors.primary,
              borderRadius: 16,
              paddingVertical: 16,
              alignItems: "center",
              opacity: canProceed() ? 1 : 0.5,
            }}
            activeOpacity={0.7}
            disabled={!canProceed()}
          >
            <Text style={{ color: "#FFF", fontWeight: "700", fontSize: 16 }}>
              {step === 0 ? "Get Started" : step === 4 ? "Complete" : "Next"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
