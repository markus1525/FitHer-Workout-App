import { ScrollView, Text, View, TouchableOpacity, TextInput, Alert, Platform } from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { ScreenContainer } from "@/components/screen-container";
import { useApp } from "@/lib/app-context";
import { useColors } from "@/hooks/use-colors";

export default function ProfileScreen() {
  const router = useRouter();
  const { state, updateProfile, updateSchedule } = useApp();
  const colors = useColors();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(state.profile?.name || "");
  const [age, setAge] = useState(String(state.profile?.age || ""));
  const [height, setHeight] = useState(String(state.profile?.height || ""));
  const [weight, setWeight] = useState(String(state.profile?.weight || ""));

  const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const handleSaveProfile = async () => {
    if (!name.trim()) return;
    await updateProfile({
      name: name.trim(),
      age: parseInt(age) || 25,
      height: parseFloat(height) || 165,
      weight: parseFloat(weight) || 60,
      fitnessGoal: state.profile?.fitnessGoal || "stay_active",
      fitnessLevel: state.profile?.fitnessLevel || "beginner",
      unitSystem: state.profile?.unitSystem || "metric",
    });
    setEditing(false);
  };

  const toggleRestDay = async (dayIndex: number) => {
    const newSchedule = { ...state.schedule };
    newSchedule[dayIndex] = { ...newSchedule[dayIndex], isRestDay: !newSchedule[dayIndex]?.isRestDay };
    await updateSchedule(newSchedule);
  };

  return (
    <ScreenContainer className="px-4 pt-2">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        <Text className="text-2xl font-bold text-foreground mb-4">Profile</Text>

        {/* Profile Card */}
        <View className="bg-surface rounded-2xl p-5 mb-4 items-center">
          <View className="w-20 h-20 rounded-full bg-primary/20 items-center justify-center mb-3">
            <Text className="text-3xl">👩</Text>
          </View>
          {!editing ? (
            <>
              <Text className="text-xl font-bold text-foreground">{state.profile?.name || "User"}</Text>
              <Text className="text-sm text-muted mt-1">
                {state.profile?.age || 0} yrs • {state.profile?.height || 0} cm • {state.profile?.weight || 0} kg
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setEditing(true);
                  setName(state.profile?.name || "");
                  setAge(String(state.profile?.age || ""));
                  setHeight(String(state.profile?.height || ""));
                  setWeight(String(state.profile?.weight || ""));
                }}
                className="mt-3 bg-primary/10 rounded-full px-4 py-2 flex-row items-center"
                activeOpacity={0.7}
              >
                <MaterialIcons name="edit" size={16} color={colors.primary} />
                <Text className="text-primary font-semibold text-sm ml-1">Edit Profile</Text>
              </TouchableOpacity>
            </>
          ) : (
            <View className="w-full mt-2">
              <View className="mb-3">
                <Text className="text-xs text-muted mb-1">Name</Text>
                <TextInput
                  value={name}
                  onChangeText={setName}
                  className="bg-background border border-border rounded-xl px-3 py-2.5 text-foreground"
                  placeholder="Your name"
                  placeholderTextColor={colors.muted}
                />
              </View>
              <View className="flex-row gap-3 mb-3">
                <View className="flex-1">
                  <Text className="text-xs text-muted mb-1">Age</Text>
                  <TextInput
                    value={age}
                    onChangeText={setAge}
                    keyboardType="number-pad"
                    className="bg-background border border-border rounded-xl px-3 py-2.5 text-foreground"
                    placeholder="25"
                    placeholderTextColor={colors.muted}
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-xs text-muted mb-1">Height (cm)</Text>
                  <TextInput
                    value={height}
                    onChangeText={setHeight}
                    keyboardType="decimal-pad"
                    className="bg-background border border-border rounded-xl px-3 py-2.5 text-foreground"
                    placeholder="165"
                    placeholderTextColor={colors.muted}
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-xs text-muted mb-1">Weight (kg)</Text>
                  <TextInput
                    value={weight}
                    onChangeText={setWeight}
                    keyboardType="decimal-pad"
                    className="bg-background border border-border rounded-xl px-3 py-2.5 text-foreground"
                    placeholder="60"
                    placeholderTextColor={colors.muted}
                  />
                </View>
              </View>
              <View className="flex-row gap-3">
                <TouchableOpacity
                  onPress={() => setEditing(false)}
                  className="flex-1 bg-border rounded-xl py-2.5 items-center"
                  activeOpacity={0.7}
                >
                  <Text className="text-foreground font-semibold">Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleSaveProfile}
                  className="flex-1 bg-primary rounded-xl py-2.5 items-center"
                  activeOpacity={0.7}
                >
                  <Text className="text-white font-semibold">Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* BMI Calculator Link */}
        <TouchableOpacity
          onPress={() => router.push("/bmi-calculator" as any)}
          className="bg-surface rounded-2xl p-4 mb-3 flex-row items-center border border-border"
          activeOpacity={0.7}
        >
          <View className="w-10 h-10 rounded-full bg-primary/10 items-center justify-center">
            <MaterialIcons name="monitor-weight" size={22} color={colors.primary} />
          </View>
          <View className="flex-1 ml-3">
            <Text className="text-sm font-semibold text-foreground">BMI Calculator</Text>
            <Text className="text-xs text-muted">Check your Body Mass Index</Text>
          </View>
          <MaterialIcons name="chevron-right" size={22} color={colors.muted} />
        </TouchableOpacity>

        {/* Workout Schedule */}
        <View className="bg-surface rounded-2xl p-4 mb-4">
          <Text className="text-sm font-semibold text-foreground mb-3">Workout Schedule</Text>
          <Text className="text-xs text-muted mb-3">Tap to toggle rest days</Text>
          <View className="flex-row justify-between">
            {DAYS.map((day, idx) => {
              const isRest = state.schedule[idx]?.isRestDay ?? false;
              return (
                <TouchableOpacity
                  key={day}
                  onPress={() => toggleRestDay(idx)}
                  style={isRest ? { backgroundColor: colors.border } : { backgroundColor: colors.primary }}
                  className="w-10 h-10 rounded-full items-center justify-center"
                  activeOpacity={0.7}
                >
                  <Text className={`text-xs font-semibold ${isRest ? "text-muted" : "text-white"}`}>{day}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <View className="flex-row items-center mt-3 gap-4">
            <View className="flex-row items-center">
              <View className="w-3 h-3 rounded-full bg-primary mr-1" />
              <Text className="text-xs text-muted">Workout</Text>
            </View>
            <View className="flex-row items-center">
              <View style={{ backgroundColor: colors.border }} className="w-3 h-3 rounded-full mr-1" />
              <Text className="text-xs text-muted">Rest</Text>
            </View>
          </View>
        </View>

        {/* Settings */}
        <Text className="text-base font-semibold text-foreground mb-3">Settings</Text>
        <View className="bg-surface rounded-2xl overflow-hidden mb-6">
          <View className="flex-row items-center p-4 border-b border-border">
            <MaterialIcons name="notifications" size={20} color={colors.primary} />
            <Text className="text-sm text-foreground ml-3 flex-1">Notifications</Text>
            <MaterialIcons name="chevron-right" size={20} color={colors.muted} />
          </View>
          <View className="flex-row items-center p-4 border-b border-border">
            <MaterialIcons name="language" size={20} color={colors.primary} />
            <Text className="text-sm text-foreground ml-3 flex-1">Units: Metric</Text>
            <MaterialIcons name="chevron-right" size={20} color={colors.muted} />
          </View>
          <View className="flex-row items-center p-4">
            <MaterialIcons name="info" size={20} color={colors.primary} />
            <Text className="text-sm text-foreground ml-3 flex-1">About</Text>
            <Text className="text-xs text-muted">v1.0.0</Text>
          </View>
        </View>

        {/* Footer */}
        <View className="items-center mb-8">
          <Text className="text-sm text-primary font-semibold">FitHer</Text>
          <Text className="text-xs text-muted mt-1">Developed by Markus with ❤️</Text>
          <Text className="text-xs text-muted mt-0.5">Your fitness journey, your way.</Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
