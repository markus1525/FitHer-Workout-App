import { ScrollView, Text, View, TouchableOpacity, TextInput, Alert, Platform, Image, Linking, Switch } from "react-native";
import { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import * as ImagePicker from "expo-image-picker";
import { ScreenContainer } from "@/components/screen-container";
import { useApp } from "@/lib/app-context";
import { useColors } from "@/hooks/use-colors";
import { useThemeContext } from "@/lib/theme-provider";
import { cmToFtIn, ftInToCm, formatHeight } from "@/lib/utils";

export default function ProfileScreen() {
  const router = useRouter();
  const { state, updateProfile, updateSchedule, resetAllData } = useApp();
  const colors = useColors();
  const { colorScheme, setColorScheme } = useThemeContext();
  const [editing, setEditing] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  const unitSystem = state.profile?.unitSystem || "metric";
  const workoutsMode = state.profile?.workoutsMode || "both";

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
    if (Platform.OS !== "web") {
      Alert.alert("Already Installed", "You are already running FitHer as a native app!");
      return;
    }

    if (deferredPrompt) {
      // Android Chrome / desktop Chrome — native install prompt available
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") setDeferredPrompt(null);
      return;
    }

    // No native prompt — show manual instructions based on browser/OS
    const ua = typeof navigator !== "undefined" ? navigator.userAgent : "";
    const isIOS = /iPad|iPhone|iPod/.test(ua);
    const isAndroid = /Android/.test(ua);

    if (isIOS) {
      window.alert(
        "Add FitHer to Home Screen (iOS Safari)\n\n" +
        "1. Tap the Share button at the bottom of Safari (the box with an arrow pointing up).\n" +
        "2. Scroll down and tap \"Add to Home Screen\".\n" +
        "3. Tap \"Add\" in the top right corner.\n\n" +
        "Note: This only works in Safari — not Chrome or other browsers on iOS."
      );
    } else if (isAndroid) {
      window.alert(
        "Add FitHer to Home Screen (Android)\n\n" +
        "1. Tap the three-dot menu (⋮) in your browser.\n" +
        "2. Tap \"Add to Home screen\" or \"Install app\".\n" +
        "3. Confirm by tapping \"Add\"."
      );
    } else {
      window.alert(
        "Install FitHer\n\n" +
        "In Chrome: click the install icon (⊕) in the address bar, or open the menu (⋮) and select \"Install FitHer\".\n\n" +
        "In Edge: click the install icon in the address bar.\n\n" +
        "In Safari (Mac): use File → Add to Dock."
      );
    }
  };
  const [name, setName] = useState(state.profile?.name || "");
  const [age, setAge] = useState(String(state.profile?.age || ""));
  // Metric: heightCm string. Imperial: separate ft + in strings.
  const [heightCm, setHeightCm] = useState(String(state.profile?.height || ""));
  const [heightFt, setHeightFt] = useState("");
  const [heightIn, setHeightIn] = useState("");
  const [weight, setWeight] = useState(String(state.profile?.weight || ""));
  const [showAboutInfo, setShowAboutInfo] = useState(false);
  const [notifEnabled, setNotifEnabled] = useState(false);
  const [videoEnabled, setVideoEnabled] = useState(true);

  useEffect(() => {
    const checkPerm = async () => {
      if (Platform.OS === "web") {
        if (typeof window !== "undefined" && "Notification" in window) {
          setNotifEnabled(Notification.permission === "granted");
        }
      } else {
        try {
          const Notifications = require("expo-notifications");
          const { status } = await Notifications.getPermissionsAsync();
          setNotifEnabled(status === "granted");
        } catch {
          const val = await AsyncStorage.getItem("fither_notifications_enabled");
          setNotifEnabled(val === "true");
        }
      }
    };
    checkPerm();
    AsyncStorage.getItem("fither_welcome_video_enabled").then((val) => {
      setVideoEnabled(val !== "false");
    });
  }, []);

  const handleToggleNotif = async (val: boolean) => {
    if (Platform.OS === "web") {
      if (typeof window === "undefined") return;
      const win = window as any;
      if (!("Notification" in win)) {
        win.alert("Your browser does not support notifications.");
        setNotifEnabled(false);
        return;
      }
      if (Notification.permission === "granted") {
        win.alert(
          "Notifications are ON.\n\n" +
          "To turn them off:\n" +
          "• Chrome/Edge: click the lock icon in the address bar → Notifications → Block\n" +
          "• Safari: Settings → Websites → Notifications → find this site → Deny\n" +
          "• Firefox: click the lock icon → Connection Secure → More Information → Permissions"
        );
        setNotifEnabled(true);
      } else if (Notification.permission === "denied") {
        win.alert(
          "Notifications are blocked by your browser.\n\n" +
          "To enable them:\n" +
          "• Chrome/Edge: click the lock icon in the address bar → Notifications → Allow\n" +
          "• Safari: Settings → Websites → Notifications → find this site → Allow\n" +
          "• Firefox: click the lock icon → Permissions → Notifications → Allow"
        );
        setNotifEnabled(false);
      } else {
        const permission = await Notification.requestPermission();
        const isGranted = permission === "granted";
        setNotifEnabled(isGranted);
        await AsyncStorage.setItem("fither_notifications_enabled", isGranted ? "true" : "false");
        if (!isGranted) {
          win.alert("Notifications blocked. You can enable them in your browser's site settings.");
        }
      }
      return;
    }

    // Native (Android / iOS)
    try {
      const Notifications = require("expo-notifications");
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      if (existingStatus === "granted") {
        // Already granted — direct to settings to turn off
        Alert.alert(
          "Notifications are ON",
          "To turn off notifications, go to your device Settings and disable them for FitHer.",
          [
            { text: "Cancel", style: "cancel" },
            { text: "Open Settings", onPress: () => Linking.openSettings() },
          ]
        );
      } else {
        // Request permission
        const { status } = await Notifications.requestPermissionsAsync();
        const isGranted = status === "granted";
        setNotifEnabled(isGranted);
        await AsyncStorage.setItem("fither_notifications_enabled", isGranted ? "true" : "false");
        if (!isGranted) {
          Alert.alert(
            "Enable Notifications",
            "Notifications are disabled. Enable them in your device Settings to receive workout reminders.",
            [
              { text: "Cancel", style: "cancel" },
              { text: "Open Settings", onPress: () => Linking.openSettings() },
            ]
          );
        }
      }
    } catch (error) {
      console.log("Error handling notifications toggle", error);
    }
  };

  const handleToggleVideo = async (val: boolean) => {
    setVideoEnabled(val);
    await AsyncStorage.setItem("fither_welcome_video_enabled", val ? "true" : "false");
  };

  const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const handleSaveProfile = async () => {
    if (!name.trim()) return;
    const rawWeight = parseFloat(weight);
    let finalHeightCm: number;
    let weightKg = isNaN(rawWeight) ? 60 : rawWeight;

    if (unitSystem === "imperial") {
      const ft = parseInt(heightFt) || 0;
      const inches = parseInt(heightIn) || 0;
      finalHeightCm = ftInToCm(ft, inches) || 165;
      weightKg = weightKg / 2.20462;
    } else {
      finalHeightCm = parseFloat(heightCm) || 165;
    }

    await updateProfile({
      ...state.profile,
      name: name.trim(),
      age: parseInt(age) || 25,
      height: Math.round(finalHeightCm * 10) / 10,
      weight: Math.round(weightKg * 10) / 10,
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
          ...state.profile,
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

    if (editing) {
      // Convert height
      if (newUnit === "imperial") {
        // cm → ft/in
        const cm = parseFloat(heightCm) || 165;
        const { ft, inches } = cmToFtIn(cm);
        setHeightFt(String(ft));
        setHeightIn(String(inches));
      } else {
        // ft/in → cm
        const ft = parseInt(heightFt) || 0;
        const inches = parseInt(heightIn) || 0;
        setHeightCm(String(ftInToCm(ft, inches)));
      }
      // Convert weight
      const w = parseFloat(weight);
      if (!isNaN(w)) {
        if (newUnit === "imperial") {
          setWeight(String(Math.round(w * 2.20462 * 10) / 10));
        } else {
          setWeight(String(Math.round((w / 2.20462) * 10) / 10));
        }
      }
    }

    if (state.profile) {
      await updateProfile({ ...state.profile, unitSystem: newUnit });
    }
  };

  const toggleWorkoutsMode = async () => {
    if (!state.profile) return;
    const currentMode = state.profile.workoutsMode || "both";
    const nextMode: "both" | "home" | "gym" =
      currentMode === "both" ? "home" : currentMode === "home" ? "gym" : "both";
    await updateProfile({ ...state.profile, workoutsMode: nextMode });
  };

  const handleReset = () => {
    const doReset = async () => {
      await resetAllData();
      router.replace("/onboarding");
    };

    if (Platform.OS === "web") {
      const confirmed = window.confirm(
        "Reset all data?\n\nThis will delete your profile, workout history, and all settings. You will go back to the welcome screen."
      );
      if (confirmed) doReset();
    } else {
      Alert.alert(
        "Reset All Data",
        "This will delete your profile, workout history, and all settings. You will go back to the welcome screen.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Reset", style: "destructive", onPress: doReset },
        ]
      );
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
                {state.profile?.age || 0} yrs • {formatHeight(state.profile?.height || 0, unitSystem)} • {unitSystem === "imperial" ? `${Math.round((state.profile?.weight || 0) * 2.20462 * 10) / 10} lbs` : `${state.profile?.weight || 0} kg`}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setEditing(true);
                  setName(state.profile?.name || "");
                  setAge(String(state.profile?.age || ""));
                  const h = state.profile?.height || 165;
                  const w = state.profile?.weight || 60;
                  if (unitSystem === "imperial") {
                    const { ft, inches } = cmToFtIn(h);
                    setHeightFt(String(ft));
                    setHeightIn(String(inches));
                    setWeight(String(Math.round(w * 2.20462 * 10) / 10));
                  } else {
                    setHeightCm(String(h));
                    setWeight(String(w));
                  }
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
                {unitSystem === "imperial" ? (
                  <>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 12, color: colors.muted, marginBottom: 4 }}>Feet</Text>
                      <TextInput
                        value={heightFt}
                        onChangeText={setHeightFt}
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
                        placeholder="5"
                        placeholderTextColor={colors.muted}
                        returnKeyType="done"
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 12, color: colors.muted, marginBottom: 4 }}>Inches</Text>
                      <TextInput
                        value={heightIn}
                        onChangeText={setHeightIn}
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
                        placeholder="8"
                        placeholderTextColor={colors.muted}
                        returnKeyType="done"
                      />
                    </View>
                  </>
                ) : (
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 12, color: colors.muted, marginBottom: 4 }}>Height (cm)</Text>
                    <TextInput
                      value={heightCm}
                      onChangeText={setHeightCm}
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
                )}
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 12, color: colors.muted, marginBottom: 4 }}>Weight ({unitSystem === "imperial" ? "lbs" : "kg"})</Text>
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
                    placeholder={unitSystem === "imperial" ? "132" : "60"}
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
          <View
            style={{
              padding: 16,
              borderBottomWidth: 1,
              borderBottomColor: colors.border,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <MaterialIcons name="notifications" size={20} color={colors.primary} />
              <Text style={{ fontSize: 14, color: colors.foreground, marginLeft: 12, flex: 1 }}>
                Notifications
              </Text>
              <Switch
                value={notifEnabled}
                onValueChange={handleToggleNotif}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={Platform.OS === "android" ? (notifEnabled ? colors.primary : "#f4f3f4") : undefined}
                style={{ transform: Platform.OS === "ios" ? [{ scaleX: 0.8 }, { scaleY: 0.8 }] : undefined }}
              />
            </View>
            <Text style={{ fontSize: 11, color: colors.muted, marginTop: 6, lineHeight: 16, paddingLeft: 32 }}>
              Notifications will remind you about daily workouts and water intake. Enable them in your device settings for the best experience.
            </Text>
          </View>

          {/* Startup Motivation Video */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              padding: 16,
              borderBottomWidth: 1,
              borderBottomColor: colors.border,
            }}
          >
            <MaterialIcons name="play-circle-outline" size={20} color={colors.primary} />
            <Text style={{ fontSize: 14, color: colors.foreground, marginLeft: 12, flex: 1 }}>
              Startup Motivation Video
            </Text>
            <Switch
              value={videoEnabled}
              onValueChange={handleToggleVideo}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={Platform.OS === "android" ? (videoEnabled ? colors.primary : "#f4f3f4") : undefined}
              style={{ transform: Platform.OS === "ios" ? [{ scaleX: 0.8 }, { scaleY: 0.8 }] : undefined }}
            />
          </View>

          {/* Workouts Mode */}
          <TouchableOpacity
            onPress={toggleWorkoutsMode}
            style={{
              flexDirection: "row",
              alignItems: "center",
              padding: 16,
              borderBottomWidth: 1,
              borderBottomColor: colors.border,
            }}
            activeOpacity={0.7}
          >
            <MaterialIcons name="fitness-center" size={20} color={colors.primary} />
            <Text style={{ fontSize: 14, color: colors.foreground, marginLeft: 12, flex: 1 }}>
              Workouts Mode: {
                workoutsMode === "both" ? "Both (Home & Gym)" :
                workoutsMode === "home" ? "Home Workouts Only" : "Gym Workouts Only"
              }
            </Text>
            <MaterialIcons name="swap-horiz" size={20} color={colors.muted} />
          </TouchableOpacity>

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
            <View style={{ padding: 16, paddingLeft: 48, paddingTop: 12, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: colors.border }}>
              <Text style={{ fontSize: 12, color: colors.muted, lineHeight: 18 }}>
                FitHer is a home workout app designed exclusively for women. It provides personalized workout plans, menstrual cycle tracking, BMI monitoring, and more to help you achieve your fitness goals.
              </Text>
            </View>
          )}

          {/* Reset */}
          <TouchableOpacity
            onPress={handleReset}
            style={{
              flexDirection: "row",
              alignItems: "center",
              padding: 16,
            }}
            activeOpacity={0.7}
          >
            <MaterialIcons name="restart-alt" size={20} color="#F44336" />
            <Text style={{ fontSize: 14, color: "#F44336", marginLeft: 12, flex: 1, fontWeight: "600" }}>
              Reset All Data
            </Text>
            <MaterialIcons name="chevron-right" size={20} color="#F44336" />
          </TouchableOpacity>
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
