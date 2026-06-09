import { ScrollView, Text, View, TouchableOpacity, TextInput } from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { ScreenContainer } from "@/components/screen-container";
import { useApp } from "@/lib/app-context";
import { useColors } from "@/hooks/use-colors";
import { cmToFtIn, ftInToCm } from "@/lib/utils";

function getBMICategory(bmi: number) {
  if (bmi < 18.5) return { label: "Underweight", color: "#2196F3", advice: "Consider gaining some healthy weight through balanced nutrition." };
  if (bmi < 25) return { label: "Normal", color: "#4CAF50", advice: "Great job! Maintain your healthy lifestyle." };
  if (bmi < 30) return { label: "Overweight", color: "#FF9800", advice: "Consider increasing physical activity and balanced eating." };
  return { label: "Obese", color: "#F44336", advice: "Consult a healthcare provider for a personalized plan." };
}

export default function BMICalculatorScreen() {
  const router = useRouter();
  const { state, addBMI } = useApp();
  const colors = useColors();

  const unitSystem = state.profile?.unitSystem || "metric";

  // Imperial height stored as ft + in separately
  const initFtIn = state.profile?.height && unitSystem === "imperial"
    ? cmToFtIn(state.profile.height)
    : null;

  const [heightCm, setHeightCm] = useState(
    state.profile?.height && unitSystem === "metric" ? String(state.profile.height) : ""
  );
  const [heightFt, setHeightFt] = useState(initFtIn ? String(initFtIn.ft) : "");
  const [heightIn, setHeightIn] = useState(initFtIn ? String(initFtIn.inches) : "");
  const [weight, setWeight] = useState(
    state.profile?.weight
      ? (unitSystem === "imperial"
          ? String(Math.round(state.profile.weight * 2.20462 * 10) / 10)
          : String(state.profile.weight))
      : ""
  );
  const [result, setResult] = useState<number | null>(null);

  const calculateBMI = () => {
    const w = parseFloat(weight);
    if (!w || w <= 0) return;

    let bmi = 0;
    let weightKg = w;
    let finalHeightCm: number;

    if (unitSystem === "imperial") {
      const ft = parseInt(heightFt) || 0;
      const inches = parseInt(heightIn) || 0;
      const totalInches = ft * 12 + inches;
      if (totalInches <= 0) return;
      bmi = (703 * w) / (totalInches * totalInches);
      weightKg = w / 2.20462;
      finalHeightCm = ftInToCm(ft, inches);
    } else {
      const h = parseFloat(heightCm);
      if (!h || h <= 0) return;
      const heightM = h / 100;
      bmi = w / (heightM * heightM);
      finalHeightCm = h;
    }

    const rounded = Math.round(bmi * 10) / 10;
    setResult(rounded);

    addBMI({
      date: new Date().toISOString().split("T")[0],
      bmi: rounded,
      weight: Math.round(weightKg * 10) / 10,
      height: Math.round(finalHeightCm * 10) / 10,
    });
  };

  const category = result ? getBMICategory(result) : null;

  return (
    <ScreenContainer className="px-4 pt-2">
      {/* Header */}
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 16 }}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 12 }} activeOpacity={0.7}>
          <MaterialIcons name="arrow-back" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={{ fontSize: 20, fontWeight: "700", color: colors.foreground }}>BMI Calculator</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
        {/* Input Card */}
        <View style={{ backgroundColor: colors.surface, borderRadius: 16, padding: 20, marginBottom: 16 }}>
          <Text style={{ fontSize: 14, color: colors.muted, marginBottom: 16 }}>
            Body Mass Index (BMI) is a measure of body fat based on height and weight.
          </Text>
          {unitSystem === "imperial" ? (
            <View style={{ marginBottom: 16 }}>
              <Text style={{ fontSize: 14, fontWeight: "600", color: colors.foreground, marginBottom: 8 }}>
                Height
              </Text>
              <View style={{ flexDirection: "row", gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <TextInput
                    value={heightFt}
                    onChangeText={setHeightFt}
                    placeholder="5 ft"
                    placeholderTextColor={colors.muted}
                    keyboardType="number-pad"
                    returnKeyType="done"
                    style={{
                      backgroundColor: colors.background,
                      borderWidth: 1,
                      borderColor: colors.border,
                      borderRadius: 12,
                      paddingHorizontal: 16,
                      paddingVertical: 14,
                      fontSize: 16,
                      color: colors.foreground,
                      textAlign: "center",
                      textAlignVertical: "center",
                    }}
                  />
                  <Text style={{ fontSize: 11, color: colors.muted, textAlign: "center", marginTop: 4 }}>feet</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <TextInput
                    value={heightIn}
                    onChangeText={setHeightIn}
                    placeholder="8 in"
                    placeholderTextColor={colors.muted}
                    keyboardType="number-pad"
                    returnKeyType="done"
                    style={{
                      backgroundColor: colors.background,
                      borderWidth: 1,
                      borderColor: colors.border,
                      borderRadius: 12,
                      paddingHorizontal: 16,
                      paddingVertical: 14,
                      fontSize: 16,
                      color: colors.foreground,
                      textAlign: "center",
                      textAlignVertical: "center",
                    }}
                  />
                  <Text style={{ fontSize: 11, color: colors.muted, textAlign: "center", marginTop: 4 }}>inches</Text>
                </View>
              </View>
            </View>
          ) : (
            <View style={{ marginBottom: 16 }}>
              <Text style={{ fontSize: 14, fontWeight: "600", color: colors.foreground, marginBottom: 8 }}>
                Height (cm)
              </Text>
              <TextInput
                value={heightCm}
                onChangeText={setHeightCm}
                placeholder="e.g., 165"
                placeholderTextColor={colors.muted}
                keyboardType="decimal-pad"
                returnKeyType="done"
                style={{
                  backgroundColor: colors.background,
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: 12,
                  paddingHorizontal: 16,
                  paddingVertical: 14,
                  fontSize: 16,
                  color: colors.foreground,
                  textAlign: "left",
                  textAlignVertical: "center",
                }}
              />
            </View>
          )}
          <View style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 14, fontWeight: "600", color: colors.foreground, marginBottom: 8 }}>
              Weight ({unitSystem === "imperial" ? "lbs" : "kg"})
            </Text>
            <TextInput
              value={weight}
              onChangeText={setWeight}
              placeholder={unitSystem === "imperial" ? "e.g., 132" : "e.g., 60"}
              placeholderTextColor={colors.muted}
              keyboardType="decimal-pad"
              returnKeyType="done"
              style={{
                backgroundColor: colors.background,
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: 12,
                paddingHorizontal: 16,
                paddingVertical: 14,
                fontSize: 16,
                color: colors.foreground,
                textAlign: "left",
                textAlignVertical: "center",
              }}
            />
          </View>
          <TouchableOpacity
            onPress={calculateBMI}
            style={{ backgroundColor: colors.primary, borderRadius: 12, paddingVertical: 14, alignItems: "center" }}
            activeOpacity={0.7}
          >
            <Text style={{ color: "#FFF", fontWeight: "700", fontSize: 16 }}>Calculate BMI</Text>
          </TouchableOpacity>
        </View>

        {/* Result */}
        {result !== null && category && (
          <View style={{ backgroundColor: colors.surface, borderRadius: 16, padding: 20, marginBottom: 16, alignItems: "center" }}>
            <Text style={{ fontSize: 14, color: colors.muted, marginBottom: 8 }}>Your BMI</Text>
            <Text style={{ fontSize: 48, fontWeight: "700", color: category.color }}>{result}</Text>
            <View style={{ backgroundColor: category.color + "20", paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20, marginTop: 8 }}>
              <Text style={{ color: category.color, fontWeight: "700", fontSize: 16 }}>{category.label}</Text>
            </View>
            <Text style={{ fontSize: 14, color: colors.muted, textAlign: "center", marginTop: 12, paddingHorizontal: 16 }}>{category.advice}</Text>

            {/* BMI Scale */}
            <View style={{ width: "100%", marginTop: 20 }}>
              <View style={{ flexDirection: "row", height: 12, borderRadius: 6, overflow: "hidden" }}>
                <View style={{ flex: 18.5, backgroundColor: "#2196F3" }} />
                <View style={{ flex: 6.5, backgroundColor: "#4CAF50" }} />
                <View style={{ flex: 5, backgroundColor: "#FF9800" }} />
                <View style={{ flex: 10, backgroundColor: "#F44336" }} />
              </View>
              <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 4 }}>
                <Text style={{ fontSize: 10, color: colors.muted }}>Underweight</Text>
                <Text style={{ fontSize: 10, color: colors.muted }}>Normal</Text>
                <Text style={{ fontSize: 10, color: colors.muted }}>Overweight</Text>
                <Text style={{ fontSize: 10, color: colors.muted }}>Obese</Text>
              </View>
            </View>
          </View>
        )}

        {/* BMI History */}
        {state.bmiHistory.length > 0 && (
          <View style={{ backgroundColor: colors.surface, borderRadius: 16, padding: 16, marginBottom: 16 }}>
            <Text style={{ fontSize: 14, fontWeight: "600", color: colors.foreground, marginBottom: 12 }}>BMI History</Text>
            {state.bmiHistory.slice(-10).reverse().map((entry, idx) => {
              const cat = getBMICategory(entry.bmi);
              return (
                <View key={idx} style={{ flexDirection: "row", alignItems: "center", paddingVertical: 8, borderBottomWidth: idx < state.bmiHistory.length - 1 ? 1 : 0, borderBottomColor: colors.border }}>
                  <Text style={{ fontSize: 12, color: colors.muted, flex: 1 }}>{entry.date}</Text>
                  <Text style={{ fontSize: 12, color: colors.muted, marginRight: 12 }}>
                    {unitSystem === "imperial"
                      ? `${Math.round(entry.weight * 2.20462)} lbs`
                      : `${entry.weight} kg`}
                  </Text>
                  <Text style={{ color: cat.color, fontSize: 14, fontWeight: "700" }}>{entry.bmi}</Text>
                </View>
              );
            })}
          </View>
        )}

        {/* BMI Info */}
        <View style={{ backgroundColor: colors.surface, borderRadius: 16, padding: 16 }}>
          <Text style={{ fontSize: 14, fontWeight: "600", color: colors.foreground, marginBottom: 12 }}>BMI Categories</Text>
          <View style={{ gap: 8 }}>
            {[
              { color: "#2196F3", label: "Underweight", range: "Below 18.5" },
              { color: "#4CAF50", label: "Normal", range: "18.5 – 24.9" },
              { color: "#FF9800", label: "Overweight", range: "25.0 – 29.9" },
              { color: "#F44336", label: "Obese", range: "30.0 and above" },
            ].map((item) => (
              <View key={item.label} style={{ flexDirection: "row", alignItems: "center" }}>
                <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: item.color, marginRight: 8 }} />
                <Text style={{ fontSize: 13, color: colors.foreground, flex: 1 }}>{item.label}</Text>
                <Text style={{ fontSize: 12, color: colors.muted }}>{item.range}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
