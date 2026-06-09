import { ScrollView, Text, View, TouchableOpacity, TextInput } from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { ScreenContainer } from "@/components/screen-container";
import { useApp } from "@/lib/app-context";
import { useColors } from "@/hooks/use-colors";

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

  const [height, setHeight] = useState(String(state.profile?.height || ""));
  const [weight, setWeight] = useState(String(state.profile?.weight || ""));
  const [result, setResult] = useState<number | null>(null);

  const calculateBMI = () => {
    const h = parseFloat(height);
    const w = parseFloat(weight);
    if (!h || !w || h <= 0 || w <= 0) return;

    const heightM = h / 100;
    const bmi = w / (heightM * heightM);
    const rounded = Math.round(bmi * 10) / 10;
    setResult(rounded);

    addBMI({
      date: new Date().toISOString().split("T")[0],
      bmi: rounded,
      weight: w,
      height: h,
    });
  };

  const category = result ? getBMICategory(result) : null;

  return (
    <ScreenContainer className="px-4 pt-2">
      {/* Header */}
      <View className="flex-row items-center mb-4">
        <TouchableOpacity onPress={() => router.back()} className="mr-3" activeOpacity={0.7}>
          <MaterialIcons name="arrow-back" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-foreground">BMI Calculator</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Input Card */}
        <View className="bg-surface rounded-2xl p-5 mb-4">
          <Text className="text-sm text-muted mb-4">
            Body Mass Index (BMI) is a measure of body fat based on height and weight.
          </Text>
          <View className="mb-4">
            <Text className="text-sm font-semibold text-foreground mb-2">Height (cm)</Text>
            <TextInput
              value={height}
              onChangeText={setHeight}
              placeholder="e.g., 165"
              placeholderTextColor={colors.muted}
              keyboardType="decimal-pad"
              className="bg-background border border-border rounded-xl px-4 py-3 text-base text-foreground"
            />
          </View>
          <View className="mb-4">
            <Text className="text-sm font-semibold text-foreground mb-2">Weight (kg)</Text>
            <TextInput
              value={weight}
              onChangeText={setWeight}
              placeholder="e.g., 60"
              placeholderTextColor={colors.muted}
              keyboardType="decimal-pad"
              className="bg-background border border-border rounded-xl px-4 py-3 text-base text-foreground"
            />
          </View>
          <TouchableOpacity
            onPress={calculateBMI}
            className="bg-primary rounded-xl py-3.5 items-center"
            activeOpacity={0.7}
          >
            <Text className="text-white font-bold text-base">Calculate BMI</Text>
          </TouchableOpacity>
        </View>

        {/* Result */}
        {result !== null && category && (
          <View className="bg-surface rounded-2xl p-5 mb-4 items-center">
            <Text className="text-sm text-muted mb-2">Your BMI</Text>
            <Text className="text-5xl font-bold" style={{ color: category.color }}>{result}</Text>
            <View style={{ backgroundColor: category.color + "20" }} className="px-4 py-1.5 rounded-full mt-2">
              <Text style={{ color: category.color }} className="font-bold text-base">{category.label}</Text>
            </View>
            <Text className="text-sm text-muted text-center mt-3 px-4">{category.advice}</Text>

            {/* BMI Scale */}
            <View className="w-full mt-5">
              <View className="flex-row h-3 rounded-full overflow-hidden">
                <View style={{ flex: 18.5, backgroundColor: "#2196F3" }} />
                <View style={{ flex: 6.5, backgroundColor: "#4CAF50" }} />
                <View style={{ flex: 5, backgroundColor: "#FF9800" }} />
                <View style={{ flex: 10, backgroundColor: "#F44336" }} />
              </View>
              <View className="flex-row justify-between mt-1">
                <Text className="text-[10px] text-muted">Underweight</Text>
                <Text className="text-[10px] text-muted">Normal</Text>
                <Text className="text-[10px] text-muted">Overweight</Text>
                <Text className="text-[10px] text-muted">Obese</Text>
              </View>
              {/* Indicator */}
              <View className="relative mt-2">
                <View
                  style={{ left: `${Math.min(Math.max((result / 40) * 100, 5), 95)}%` }}
                  className="absolute -top-1"
                >
                  <MaterialIcons name="arrow-drop-up" size={20} color={category.color} />
                </View>
              </View>
            </View>
          </View>
        )}

        {/* BMI History */}
        {state.bmiHistory.length > 0 && (
          <View className="bg-surface rounded-2xl p-4 mb-4">
            <Text className="text-sm font-semibold text-foreground mb-3">BMI History</Text>
            {state.bmiHistory.slice(-10).reverse().map((entry, idx) => {
              const cat = getBMICategory(entry.bmi);
              return (
                <View key={idx} className="flex-row items-center py-2 border-b border-border">
                  <Text className="text-xs text-muted flex-1">{entry.date}</Text>
                  <Text className="text-xs text-muted mr-3">{entry.weight} kg</Text>
                  <Text style={{ color: cat.color }} className="text-sm font-bold">{entry.bmi}</Text>
                </View>
              );
            })}
          </View>
        )}

        {/* BMI Info */}
        <View className="bg-surface rounded-2xl p-4">
          <Text className="text-sm font-semibold text-foreground mb-3">BMI Categories</Text>
          <View className="gap-2">
            <View className="flex-row items-center">
              <View className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: "#2196F3" }} />
              <Text className="text-xs text-foreground flex-1">Underweight</Text>
              <Text className="text-xs text-muted">Below 18.5</Text>
            </View>
            <View className="flex-row items-center">
              <View className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: "#4CAF50" }} />
              <Text className="text-xs text-foreground flex-1">Normal</Text>
              <Text className="text-xs text-muted">18.5 – 24.9</Text>
            </View>
            <View className="flex-row items-center">
              <View className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: "#FF9800" }} />
              <Text className="text-xs text-foreground flex-1">Overweight</Text>
              <Text className="text-xs text-muted">25.0 – 29.9</Text>
            </View>
            <View className="flex-row items-center">
              <View className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: "#F44336" }} />
              <Text className="text-xs text-foreground flex-1">Obese</Text>
              <Text className="text-xs text-muted">30.0 and above</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
