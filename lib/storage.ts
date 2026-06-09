import AsyncStorage from "@react-native-async-storage/async-storage";

const KEYS = {
  USER_PROFILE: "fither_user_profile",
  WORKOUT_PLANS: "fither_custom_plans",
  WORKOUT_SCHEDULE: "fither_schedule",
  WORKOUT_HISTORY: "fither_history",
  GOALS: "fither_goals",
  CYCLE_DATA: "fither_cycle",
  WATER_INTAKE: "fither_water",
  BMI_HISTORY: "fither_bmi",
  ONBOARDING_DONE: "fither_onboarded",
  FAVORITE_PLANS: "fither_favorite_plans",
};

export interface UserProfile {
  name: string;
  age: number;
  height: number; // cm
  weight: number; // kg
  fitnessGoal: string;
  fitnessLevel: string;
  unitSystem: "metric" | "imperial";
  workoutsMode?: "home" | "gym" | "both";
  profileImage?: string; // local URI for profile picture
}

export interface WorkoutSchedule {
  [dayIndex: number]: { isRestDay: boolean; planId?: string };
}

export interface WorkoutHistoryEntry {
  id: string;
  date: string;
  planId: string;
  planName: string;
  duration: number;
  caloriesBurned: number;
  exercisesCompleted: number;
}

export interface GoalsData {
  targetWeight: number;
  weeklyWorkouts: number;
  dailyWater: number; // glasses
  currentStreak: number;
  longestStreak: number;
  totalWorkouts: number;
  totalCalories: number;
  totalMinutes: number;
}

export interface CycleEntry {
  startDate: string;
  endDate?: string;
  cycleLength: number;
  periodLength: number;
  symptoms?: string[];
}

export interface WaterEntry {
  date: string;
  glasses: number;
}

export interface BMIEntry {
  date: string;
  bmi: number;
  weight: number;
  height: number;
}

// Generic storage helpers
async function getItem<T>(key: string): Promise<T | null> {
  try {
    const data = await AsyncStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

async function setItem<T>(key: string, value: T): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error("Storage error:", e);
  }
}

// User Profile
export async function getUserProfile(): Promise<UserProfile | null> {
  return getItem<UserProfile>(KEYS.USER_PROFILE);
}

export async function saveUserProfile(profile: UserProfile): Promise<void> {
  return setItem(KEYS.USER_PROFILE, profile);
}

// Onboarding
export async function isOnboardingDone(): Promise<boolean> {
  const val = await AsyncStorage.getItem(KEYS.ONBOARDING_DONE);
  return val === "true";
}

export async function setOnboardingDone(): Promise<void> {
  await AsyncStorage.setItem(KEYS.ONBOARDING_DONE, "true");
}

// Custom Workout Plans
export async function getCustomPlans(): Promise<any[]> {
  return (await getItem<any[]>(KEYS.WORKOUT_PLANS)) || [];
}

export async function saveCustomPlans(plans: any[]): Promise<void> {
  return setItem(KEYS.WORKOUT_PLANS, plans);
}

// Workout Schedule
export async function getWorkoutSchedule(): Promise<WorkoutSchedule> {
  return (await getItem<WorkoutSchedule>(KEYS.WORKOUT_SCHEDULE)) || {
    0: { isRestDay: false },
    1: { isRestDay: false },
    2: { isRestDay: false },
    3: { isRestDay: true },
    4: { isRestDay: false },
    5: { isRestDay: false },
    6: { isRestDay: true },
  };
}

export async function saveWorkoutSchedule(schedule: WorkoutSchedule): Promise<void> {
  return setItem(KEYS.WORKOUT_SCHEDULE, schedule);
}

// Workout History
export async function getWorkoutHistory(): Promise<WorkoutHistoryEntry[]> {
  return (await getItem<WorkoutHistoryEntry[]>(KEYS.WORKOUT_HISTORY)) || [];
}

export async function addWorkoutHistory(entry: WorkoutHistoryEntry): Promise<void> {
  const history = await getWorkoutHistory();
  history.unshift(entry);
  return setItem(KEYS.WORKOUT_HISTORY, history.slice(0, 100)); // Keep last 100
}

// Goals
export async function getGoals(): Promise<GoalsData> {
  return (await getItem<GoalsData>(KEYS.GOALS)) || {
    targetWeight: 0,
    weeklyWorkouts: 4,
    dailyWater: 8,
    currentStreak: 0,
    longestStreak: 0,
    totalWorkouts: 0,
    totalCalories: 0,
    totalMinutes: 0,
  };
}

export async function saveGoals(goals: GoalsData): Promise<void> {
  return setItem(KEYS.GOALS, goals);
}

// Cycle Data
export async function getCycleData(): Promise<CycleEntry[]> {
  return (await getItem<CycleEntry[]>(KEYS.CYCLE_DATA)) || [];
}

export async function saveCycleData(data: CycleEntry[]): Promise<void> {
  return setItem(KEYS.CYCLE_DATA, data);
}

// Water Intake
export async function getWaterIntake(date: string): Promise<number> {
  const data = await getItem<WaterEntry[]>(KEYS.WATER_INTAKE) || [];
  const entry = data.find((e) => e.date === date);
  return entry?.glasses || 0;
}

export async function saveWaterIntake(date: string, glasses: number): Promise<void> {
  const data = (await getItem<WaterEntry[]>(KEYS.WATER_INTAKE)) || [];
  const idx = data.findIndex((e) => e.date === date);
  if (idx >= 0) {
    data[idx].glasses = glasses;
  } else {
    data.push({ date, glasses });
  }
  return setItem(KEYS.WATER_INTAKE, data.slice(-30)); // Keep last 30 days
}

// BMI History
export async function getBMIHistory(): Promise<BMIEntry[]> {
  return (await getItem<BMIEntry[]>(KEYS.BMI_HISTORY)) || [];
}

export async function addBMIEntry(entry: BMIEntry): Promise<void> {
  const history = await getBMIHistory();
  history.push(entry);
  return setItem(KEYS.BMI_HISTORY, history.slice(-50));
}

export async function getFavoritePlans(): Promise<string[]> {
  return (await getItem<string[]>(KEYS.FAVORITE_PLANS)) || [];
}

export async function saveFavoritePlans(ids: string[]): Promise<void> {
  return setItem(KEYS.FAVORITE_PLANS, ids);
}

export async function clearAllData(): Promise<void> {
  try {
    await AsyncStorage.clear();
  } catch (e) {
    console.error("Error clearing AsyncStorage:", e);
  }
}

export async function exportAppData(): Promise<string> {
  const backup: Record<string, any> = {};
  for (const [name, key] of Object.entries(KEYS)) {
    const val = await AsyncStorage.getItem(key);
    if (val !== null) {
      try {
        backup[key] = JSON.parse(val);
      } catch {
        backup[key] = val;
      }
    }
  }
  return JSON.stringify(backup, null, 2);
}

export async function importAppData(jsonStr: string): Promise<boolean> {
  try {
    const data = JSON.parse(jsonStr);
    if (typeof data !== "object" || data === null) return false;
    
    const hasKeys = Object.values(KEYS).some((key) => key in data);
    if (!hasKeys) return false;

    for (const key of Object.values(KEYS)) {
      if (key in data) {
        const val = data[key];
        if (typeof val === "string" && (val === "true" || val === "false")) {
          await AsyncStorage.setItem(key, val);
        } else {
          await AsyncStorage.setItem(key, JSON.stringify(val));
        }
      }
    }
    return true;
  } catch (e) {
    console.error("Failed to import data:", e);
    return false;
  }
}

export { KEYS };
