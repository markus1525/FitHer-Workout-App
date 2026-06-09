import { ScrollView, Text, View, TouchableOpacity, TextInput, Alert, Platform, Image, Switch, Linking, AppState } from "react-native";
import { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import * as ImagePicker from "expo-image-picker";
import { ScreenContainer } from "@/components/screen-container";
import { useApp } from "@/lib/app-context";
import { useColors } from "@/hooks/use-colors";
import { useThemeContext } from "@/lib/theme-provider";

export default function ProfileScreen() {
  const router = useRouter();
  const { state, updateProfile, updateSchedule } = useApp();
  const colors = useColors();
  const { colorScheme, setColorScheme } = useThemeContext();
  const [editing, setEditing] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  const checkNotificationPermission = async () => {
    if (Platform.OS === "web") return;
    try {
      const Notifications = require("expo-notifications");
      const { status } = await Notifications.getPermissionsAsync();
      setNotificationsEnabled(status === "granted");
    } catch (error) {
      console.log("Error checking notification permissions", error);
    }
  };

  useEffect(() => {
    checkNotificationPermission();

    // Recheck permission when app returns to foreground
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (nextAppState === "active") {
        checkNotificationPermission();
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const handleToggleNotifications = async () => {
    if (Platform.OS === "web") {
      Alert.alert(
        "Notifications",
        "To manage notifications in your browser, please update your browser site settings."
      );
      return;
    }
    // Direct user to device app settings
    try {
      await Linking.openSettings();
    } catch (error) {
      Alert.alert("Error", "Unable to open device settings.");
    }
  };

  useEffect(() => {
    if (Platform.OS === "web") {
      const handleBeforeInstallPrompt = (e: any) => {
        e.preventDefault();
        setDeferredPrompt(e);
      };
      window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      return () => {
        window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      };
    }
  }, []);

  const handleAddToHomeScreen = async () => {
    if (Platform.OS === "web" && deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setDeferredPrompt(null);
      }
    } else {
      if (Platform.OS === "web") {
        Alert.alert(
          "Install FitHer",
          "To add FitHer to your home screen, tap your browser's menu button (such as the Share button in Safari on iOS, or the menu icon/three dots in Chrome) and select 'Add to Home Screen'."
        );
      } else {
        Alert.alert(
          "Already Installed",
          "You are already running the app as a native application!"
        );
      }
    }
  };
  const [name, setName] = useState(state.profile?.name || "");
  const [age, setAge] = useState(String(state.profile?.age || ""));
  const [height, setHeight] = useState(String(state.profile?.height || ""));
  const [weight, setWeight] = useState(String(state.profile?.weight || ""));
  const [showNotifInfo, setShowNotifInfo] = useState(false);
  const [showAboutInfo, setShowAboutInfo] = useState(false);
  const [unitSystem, setUnitSystem] = useState<"metric" | "imperial">(state.profile?.unitSystem || "metric");

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
      unitSystem: unitSystem,
      profileImage: state.profile?.profileImage,
    });
    setEditing(false);
  };

  const toggleRestDay = async (dayIndex: number) => {
    const newSchedule = { ...state.schedule };
    newSchedule[dayIndex] = { ...newSchedule[dayIndex], isRestDay: !newSchedule[dayIndex]?.isRestDay };
    await updateSchedule(newSchedule);
  };

  const pickProfileImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        await updateProfile({
          name: state.profile?.name || "User",
          age: state.profile?.age || 25,
          height: state.profile?.height || 165,
          weight: state.profile?.weight || 60,
          fitnessGoal: state.profile?.fitnessGoal || "stay_active",
          fitnessLevel: state.profile?.fitnessLevel || "beginner",
          unitSystem: state.profile?.unitSystem || "metric",
          profileImage: imageUri,
        });
      }
    } catch (error) {
      if (Platform.OS !== "web") {
        Alert.alert("Error", "Failed to pick image. Please try again.");
      }
    }
  };

  const toggleUnit = async () => {
    const newUnit = unitSystem === "metric" ? "imperial" : "metric";
    setUnitSystem(newUnit);
    if (state.profile) {
      await updateProfile({
        ...state.profile,
        unitSystem: newUnit,
      });
    }
  };

  return (
    <ScreenContainer className="px-4 pt-2">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
        <Text className="text-2xl font-bold mb-4" style={{ color: colors.foreground }}>Profile</Text>

        {/* Profile Card */}
        <View className="rounded-2xl p-5 mb-4 items-center" style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}>
          {/* Profile Picture */}
          <TouchableOpacity
            onPress={pickProfileImage}
            activeOpacity={0.7}
            style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: colors.primary + "20",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 12,
              overflow: "hidden",
            }}
          >
            {state.profile?.profileImage ? (
              <Image
                source={{ uri: state.profile.profileImage }}
                style={{ width: 80, height: 80, borderRadius: 40 }}
              />
            ) : (
              <Text style={{ fontSize: 30 }}>👩</Text>
            )}
            <View
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                height: 24,
                backgroundColor: "rgba(0,0,0,0.5)",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <MaterialIcons name="camera-alt" size={14} color="#FFF" />
            </View>
          </TouchableOpacity>

          {!editing ? (
            <>
              <Text className="text-xl font-bold" style={{ color: colors.foreground }}>{state.profile?.name || "User"}</Text>
              <Text className="text-sm mt-1" style={{ color: colors.muted }}>
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
                style={{
                  marginTop: 12,
                  backgroundColor: colors.primary + "15",
                  borderRadius: 20,
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  flexDirection: "row",
                  alignItems: "center",
                }}
                activeOpacity={0.7}
              >
                <MaterialIcons name="edit" size={16} color={colors.primary} />
                <Text style={{ color: colors.primary, fontWeight: "600", fontSize: 14, marginLeft: 4 }}>Edit Profile</Text>
              </TouchableOpacity>
            </>
          ) : (
            <View className="w-full mt-2">
              <View style={{ marginBottom: 12 }}>
                <Text style={{ fontSize: 12, color: colors.muted, marginBottom: 4 }}>Name</Text>
                <TextInput
                  value={name}
                  onChangeText={setName}
                  style={{
                    backgroundColor: colors.background,
                    borderWidth: 1,
                    borderColor: colors.border,
                    borderRadius: 12,
                    paddingHorizontal: 14,
                    paddingVertical: 12,
                    fontSize: 15,
                    color: colors.foreground,
                    textAlign: "left",
                    textAlignVertical: "center",
                  }}
                  placeholder="Your name"
                  placeholderTextColor={colors.muted}
                  returnKeyType="done"
                />
              </View>
              <View style={{ flexDirection: "row", gap: 10, marginBottom: 12 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 12, color: colors.muted, marginBottom: 4 }}>Age</Text>
                  <TextInput
                    value={age}
                    onChangeText={setAge}
                    keyboardType="number-pad"
                    style={{
                      backgroundColor: colors.background,
                      borderWidth: 1,
                      borderColor: colors.border,
                      borderRadius: 12,
                      paddingHorizontal: 14,
                      paddingVertical: 12,
                      fontSize: 15,
                      color: colors.foreground,
                      textAlign: "center",
                      textAlignVertical: "center",
                    }}
                    placeholder="25"
                    placeholderTextColor={colors.muted}
                    returnKeyType="done"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 12, color: colors.muted, marginBottom: 4 }}>Height (cm)</Text>
                  <TextInput
                    value={height}
                    onChangeText={setHeight}
                    keyboardType="decimal-pad"
                    style={{
                      backgroundColor: colors.background,
                      borderWidth: 1,
                      borderColor: colors.border,
                      borderRadius: 12,
                      paddingHorizontal: 14,
                      paddingVertical: 12,
                      fontSize: 15,
                      color: colors.foreground,
                      textAlign: "center",
                      textAlignVertical: "center",
                    }}
                    placeholder="165"
                    placeholderTextColor={colors.muted}
                    returnKeyType="done"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 12, color: colors.muted, marginBottom: 4 }}>Weight (kg)</Text>
                  <TextInput
                    value={weight}
                    onChangeText={setWeight}
                    keyboardType="decimal-pad"
                    style={{
                      backgroundColor: colors.background,
                      borderWidth: 1,
                      borderColor: colors.border,
                      borderRadius: 12,
                      paddingHorizontal: 14,
                      paddingVertical: 12,
                      fontSize: 15,
                      color: colors.foreground,
                      textAlign: "center",
                      textAlignVertical: "center",
                    }}
                    placeholder="60"
                    placeholderTextColor={colors.muted}
                    returnKeyType="done"
                  />
                </View>
              </View>
              <View style={{ flexDirection: "row", gap: 10 }}>
                <TouchableOpacity
                  onPress={() => setEditing(false)}
                  style={{
                    flex: 1,
                    backgroundColor: colors.border,
                    borderRadius: 12,
                    paddingVertical: 12,
                    alignItems: "center",
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={{ color: colors.foreground, fontWeight: "600" }}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleSaveProfile}
                  style={{
                    flex: 1,
                    backgroundColor: colors.primary,
                    borderRadius: 12,
                    paddingVertical: 12,
                    alignItems: "center",
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={{ color: "#FFF", fontWeight: "600" }}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* BMI Calculator Link */}
        <TouchableOpacity
          onPress={() => router.push("/bmi-calculator" as any)}
          style={{
            backgroundColor: colors.surface,
            borderRadius: 16,
            padding: 16,
            marginBottom: 12,
            flexDirection: "row",
            alignItems: "center",
            borderWidth: 1,
            borderColor: colors.border,
          }}
          activeOpacity={0.7}
        >
          <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primary + "15", alignItems: "center", justifyContent: "center" }}>
            <MaterialIcons name="monitor-weight" size={22} color={colors.primary} />
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={{ fontSize: 14, fontWeight: "600", color: colors.foreground }}>BMI Calculator</Text>
            <Text style={{ fontSize: 12, color: colors.muted }}>Check your Body Mass Index</Text>
          </View>
          <MaterialIcons name="chevron-right" size={22} color={colors.muted} />
        </TouchableOpacity>

        {/* Workout Schedule */}
        <View className="rounded-2xl p-4 mb-4" style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}>
          <Text style={{ fontSize: 14, fontWeight: "600", color: colors.foreground, marginBottom: 8 }}>Workout Schedule</Text>
          <Text style={{ fontSize: 12, color: colors.muted, marginBottom: 12 }}>Tap to toggle rest days</Text>
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            {DAYS.map((day, idx) => {
              const isRest = state.schedule[idx]?.isRestDay ?? false;
              return (
                <TouchableOpacity
                  key={day}
                  onPress={() => toggleRestDay(idx)}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: isRest ? colors.border : colors.primary,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={{ fontSize: 11, fontWeight: "600", color: isRest ? colors.muted : "#FFF" }}>{day}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", marginTop: 12, gap: 16 }}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: colors.primary, marginRight: 4 }} />
              <Text style={{ fontSize: 12, color: colors.muted }}>Workout</Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: colors.border, marginRight: 4 }} />
              <Text style={{ fontSize: 12, color: colors.muted }}>Rest</Text>
            </View>
          </View>
        </View>

        {/* Install FitHer */}
        <View
          style={{
            backgroundColor: colors.surface,
            borderRadius: 16,
            padding: 16,
            marginBottom: 16,
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <Text style={{ fontSize: 14, fontWeight: "600", color: colors.foreground, marginBottom: 6 }}>
            Install FitHer
          </Text>
          <Text style={{ fontSize: 12, color: colors.muted, lineHeight: 18, marginBottom: 14 }}>
            Add FitHer to your home screen to use it like a normal app, full screen and offline. Data won't lose.
          </Text>
          <TouchableOpacity
            onPress={handleAddToHomeScreen}
            style={{
              backgroundColor: colors.primary,
              borderRadius: 12,
              paddingVertical: 12,
              alignItems: "center",
              justifyContent: "center",
            }}
            activeOpacity={0.8}
          >
            <Text style={{ color: "#FFF", fontWeight: "600", fontSize: 14 }}>
              Add to home screen
            </Text>
          </TouchableOpacity>
        </View>

        {/* Settings */}
        <Text style={{ fontSize: 16, fontWeight: "600", color: colors.foreground, marginBottom: 12 }}>Settings</Text>
        <View style={{ backgroundColor: colors.surface, borderRadius: 16, overflow: "hidden", marginBottom: 24 }}>
          {/* Notifications */}
          <TouchableOpacity
            onPress={() => setShowNotifInfo(!showNotifInfo)}
            style={{
              flexDirection: "row",
              alignItems: "center",
              padding: 16,
              borderBottomWidth: 1,
              borderBottomColor: colors.border,
            }}
            activeOpacity={0.7}
          >
            <MaterialIcons name="notifications" size={20} color={colors.primary} />
            <Text style={{ fontSize: 14, color: colors.foreground, marginLeft: 12, flex: 1 }}>Notifications</Text>
            <Switch
              value={notificationsEnabled}
              onValueChange={handleToggleNotifications}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={Platform.OS === "android" ? (notificationsEnabled ? colors.primary : "#f4f3f4") : undefined}
              style={{ marginRight: 8, transform: Platform.OS === "ios" ? [{ scaleX: 0.8 }, { scaleY: 0.8 }] : undefined }}
            />
            <MaterialIcons name={showNotifInfo ? "expand-less" : "expand-more"} size={20} color={colors.muted} />
          </TouchableOpacity>
          {showNotifInfo && (
            <View style={{ padding: 16, paddingLeft: 48, paddingTop: 12, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: colors.border }}>
              <Text style={{ fontSize: 12, color: colors.muted, lineHeight: 18 }}>
                Notifications will remind you about daily workouts and water intake. Enable them in your device settings for the best experience.
              </Text>
            </View>
          )}

          {/* Units */}
          <TouchableOpacity
            onPress={toggleUnit}
            style={{
              flexDirection: "row",
              alignItems: "center",
              padding: 16,
              borderBottomWidth: 1,
              borderBottomColor: colors.border,
            }}
            activeOpacity={0.7}
          >
            <MaterialIcons name="straighten" size={20} color={colors.primary} />
            <Text style={{ fontSize: 14, color: colors.foreground, marginLeft: 12, flex: 1 }}>
              Units: {unitSystem === "metric" ? "Metric (kg/cm)" : "Imperial (lb/in)"}
            </Text>
            <MaterialIcons name="swap-horiz" size={20} color={colors.muted} />
          </TouchableOpacity>

          {/* Theme */}
          <TouchableOpacity
            onPress={() => setColorScheme(colorScheme === "dark" ? "light" : "dark")}
            style={{
              flexDirection: "row",
              alignItems: "center",
              padding: 16,
              borderBottomWidth: 1,
              borderBottomColor: colors.border,
            }}
            activeOpacity={0.7}
          >
            <MaterialIcons name={colorScheme === "dark" ? "dark-mode" : "light-mode"} size={20} color={colors.primary} />
            <Text style={{ fontSize: 14, color: colors.foreground, marginLeft: 12, flex: 1 }}>
              Theme: {colorScheme === "dark" ? "Dark Mode" : "Light Mode"}
            </Text>
            <Switch
              value={colorScheme === "dark"}
              onValueChange={(val) => setColorScheme(val ? "dark" : "light")}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={Platform.OS === "android" ? (colorScheme === "dark" ? colors.primary : "#f4f3f4") : undefined}
              style={{ marginRight: 8, transform: Platform.OS === "ios" ? [{ scaleX: 0.8 }, { scaleY: 0.8 }] : undefined }}
            />
          </TouchableOpacity>

          {/* About */}
          <TouchableOpacity
            onPress={() => setShowAboutInfo(!showAboutInfo)}
            style={{
              flexDirection: "row",
              alignItems: "center",
              padding: 16,
            }}
            activeOpacity={0.7}
          >
            <MaterialIcons name="info" size={20} color={colors.primary} />
            <Text style={{ fontSize: 14, color: colors.foreground, marginLeft: 12, flex: 1 }}>About</Text>
            <Text style={{ fontSize: 12, color: colors.muted }}>v1.0.0</Text>
          </TouchableOpacity>
          {showAboutInfo && (
            <View style={{ padding: 16, paddingLeft: 48, paddingTop: 12, paddingBottom: 16 }}>
              <Text style={{ fontSize: 12, color: colors.muted, lineHeight: 18 }}>
                FitHer is a home workout app designed exclusively for women. It provides personalized workout plans, menstrual cycle tracking, BMI monitoring, and more to help you achieve your fitness goals.
              </Text>
            </View>
          )}
        </View>

        {/* Footer */}
        <View style={{ alignItems: "center", marginBottom: 32 }}>
          <Text style={{ fontSize: 14, color: colors.primary, fontWeight: "600" }}>FitHer</Text>
          <Text style={{ fontSize: 12, color: colors.muted, marginTop: 4 }}>Developed by Markus with ❤️</Text>
          <Text style={{ fontSize: 12, color: colors.muted, marginTop: 2 }}>Your fitness journey, your way.</Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
