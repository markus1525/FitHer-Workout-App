import React, { createContext, useContext, useEffect, useReducer, useCallback } from "react";
import {
  UserProfile,
  GoalsData,
  WorkoutSchedule,
  WorkoutHistoryEntry,
  CycleEntry,
  BMIEntry,
  getUserProfile,
  saveUserProfile,
  getGoals,
  saveGoals,
  getWorkoutSchedule,
  saveWorkoutSchedule,
  getWorkoutHistory,
  addWorkoutHistory,
  getCycleData,
  saveCycleData,
  getBMIHistory,
  addBMIEntry,
  getCustomPlans,
  saveCustomPlans,
  isOnboardingDone,
  setOnboardingDone,
  getWaterIntake,
  saveWaterIntake,
  clearAllData,
  getFavoritePlans,
  saveFavoritePlans,
} from "./storage";
import { WorkoutPlan } from "@/data/exercises";

interface AppState {
  isLoading: boolean;
  onboardingDone: boolean;
  profile: UserProfile | null;
  goals: GoalsData;
  schedule: WorkoutSchedule;
  history: WorkoutHistoryEntry[];
  cycleData: CycleEntry[];
  bmiHistory: BMIEntry[];
  customPlans: WorkoutPlan[];
  todayWater: number;
  favorites: string[];
}

type AppAction =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ONBOARDING"; payload: boolean }
  | { type: "SET_PROFILE"; payload: UserProfile | null }
  | { type: "SET_GOALS"; payload: GoalsData }
  | { type: "SET_SCHEDULE"; payload: WorkoutSchedule }
  | { type: "SET_HISTORY"; payload: WorkoutHistoryEntry[] }
  | { type: "SET_CYCLE_DATA"; payload: CycleEntry[] }
  | { type: "SET_BMI_HISTORY"; payload: BMIEntry[] }
  | { type: "SET_CUSTOM_PLANS"; payload: WorkoutPlan[] }
  | { type: "SET_WATER"; payload: number }
  | { type: "SET_FAVORITES"; payload: string[] };

const initialState: AppState = {
  isLoading: true,
  onboardingDone: false,
  profile: null,
  goals: {
    targetWeight: 0,
    weeklyWorkouts: 4,
    dailyWater: 8,
    currentStreak: 0,
    longestStreak: 0,
    totalWorkouts: 0,
    totalCalories: 0,
    totalMinutes: 0,
  },
  schedule: {
    0: { isRestDay: false },
    1: { isRestDay: false },
    2: { isRestDay: false },
    3: { isRestDay: true },
    4: { isRestDay: false },
    5: { isRestDay: false },
    6: { isRestDay: true },
  },
  history: [],
  cycleData: [],
  bmiHistory: [],
  customPlans: [],
  todayWater: 0,
  favorites: [],
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };
    case "SET_ONBOARDING":
      return { ...state, onboardingDone: action.payload };
    case "SET_PROFILE":
      return { ...state, profile: action.payload };
    case "SET_GOALS":
      return { ...state, goals: action.payload };
    case "SET_SCHEDULE":
      return { ...state, schedule: action.payload };
    case "SET_HISTORY":
      return { ...state, history: action.payload };
    case "SET_CYCLE_DATA":
      return { ...state, cycleData: action.payload };
    case "SET_BMI_HISTORY":
      return { ...state, bmiHistory: action.payload };
    case "SET_CUSTOM_PLANS":
      return { ...state, customPlans: action.payload };
    case "SET_WATER":
      return { ...state, todayWater: action.payload };
    case "SET_FAVORITES":
      return { ...state, favorites: action.payload };
    default:
      return state;
  }
}

interface AppContextType {
  state: AppState;
  updateProfile: (profile: UserProfile) => Promise<void>;
  updateGoals: (goals: GoalsData) => Promise<void>;
  updateSchedule: (schedule: WorkoutSchedule) => Promise<void>;
  logWorkout: (entry: WorkoutHistoryEntry) => Promise<void>;
  updateCycleData: (data: CycleEntry[]) => Promise<void>;
  addBMI: (entry: BMIEntry) => Promise<void>;
  updateCustomPlans: (plans: WorkoutPlan[]) => Promise<void>;
  deleteCustomPlan: (planId: string) => Promise<void>;
  completeOnboarding: () => Promise<void>;
  addWater: () => Promise<void>;
  removeWater: () => Promise<void>;
  refreshData: () => Promise<void>;
  resetAllData: () => Promise<void>;
  toggleFavoritePlan: (planId: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  const today = new Date().toISOString().split("T")[0];

  const loadData = useCallback(async () => {
    try {
      const [onboarded, profile, goals, schedule, history, cycleData, bmiHistory, customPlans, water, favorites] = await Promise.all([
        isOnboardingDone(),
        getUserProfile(),
        getGoals(),
        getWorkoutSchedule(),
        getWorkoutHistory(),
        getCycleData(),
        getBMIHistory(),
        getCustomPlans(),
        getWaterIntake(today),
        getFavoritePlans(),
      ]);

      // If the last workout was before yesterday, the streak is broken.
      // Reset it on load so a missed day shows 0 even before the next workout.
      const yesterday = (() => {
        const d = new Date(today + "T00:00:00");
        d.setDate(d.getDate() - 1);
        return d.toISOString().split("T")[0];
      })();
      if (
        goals.lastWorkoutDate &&
        goals.lastWorkoutDate !== today &&
        goals.lastWorkoutDate !== yesterday &&
        (goals.currentStreak || 0) !== 0
      ) {
        goals.currentStreak = 0;
        await saveGoals(goals);
      }

      dispatch({ type: "SET_ONBOARDING", payload: onboarded });
      dispatch({ type: "SET_PROFILE", payload: profile });
      dispatch({ type: "SET_GOALS", payload: goals });
      dispatch({ type: "SET_SCHEDULE", payload: schedule });
      dispatch({ type: "SET_HISTORY", payload: history });
      dispatch({ type: "SET_CYCLE_DATA", payload: cycleData });
      dispatch({ type: "SET_BMI_HISTORY", payload: bmiHistory });
      dispatch({ type: "SET_CUSTOM_PLANS", payload: customPlans as WorkoutPlan[] });
      dispatch({ type: "SET_WATER", payload: water });
      dispatch({ type: "SET_FAVORITES", payload: favorites });
    } catch (e) {
      console.error("Error loading data:", e);
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }, [today]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const updateProfile = async (profile: UserProfile) => {
    await saveUserProfile(profile);
    dispatch({ type: "SET_PROFILE", payload: profile });
  };

  const updateGoals = async (goals: GoalsData) => {
    await saveGoals(goals);
    dispatch({ type: "SET_GOALS", payload: goals });
  };

  const updateSchedule = async (schedule: WorkoutSchedule) => {
    await saveWorkoutSchedule(schedule);
    dispatch({ type: "SET_SCHEDULE", payload: schedule });
  };

  const logWorkout = async (entry: WorkoutHistoryEntry) => {
    await addWorkoutHistory(entry);
    const history = await getWorkoutHistory();
    dispatch({ type: "SET_HISTORY", payload: history });
    // Update goals stats
    const goals = await getGoals();
    goals.totalWorkouts += 1;
    goals.totalCalories += entry.caloriesBurned;
    goals.totalMinutes += entry.duration;

    // Update streak based on the workout date (YYYY-MM-DD)
    const workoutDate = entry.date;
    const yesterday = (() => {
      const d = new Date(workoutDate + "T00:00:00");
      d.setDate(d.getDate() - 1);
      return d.toISOString().split("T")[0];
    })();
    const last = goals.lastWorkoutDate;
    if (last === workoutDate) {
      // Already worked out today, keep the streak but never leave it at 0
      goals.currentStreak = Math.max(goals.currentStreak || 0, 1);
    } else if (last === yesterday) {
      goals.currentStreak = (goals.currentStreak || 0) + 1;
    } else {
      goals.currentStreak = 1;
    }
    goals.lastWorkoutDate = workoutDate;
    if (goals.currentStreak > (goals.longestStreak || 0)) {
      goals.longestStreak = goals.currentStreak;
    }

    await saveGoals(goals);
    dispatch({ type: "SET_GOALS", payload: goals });
  };

  const updateCycleData = async (data: CycleEntry[]) => {
    await saveCycleData(data);
    dispatch({ type: "SET_CYCLE_DATA", payload: data });
  };

  const addBMI = async (entry: BMIEntry) => {
    await addBMIEntry(entry);
    const history = await getBMIHistory();
    dispatch({ type: "SET_BMI_HISTORY", payload: history });
  };

  const updateCustomPlans = async (plans: WorkoutPlan[]) => {
    await saveCustomPlans(plans);
    dispatch({ type: "SET_CUSTOM_PLANS", payload: plans as WorkoutPlan[] });
  };

  const deleteCustomPlan = async (planId: string) => {
    const remaining = state.customPlans.filter((p) => p.id !== planId);
    await saveCustomPlans(remaining);
    dispatch({ type: "SET_CUSTOM_PLANS", payload: remaining as WorkoutPlan[] });

    // Clear this plan from any weekday it was assigned to
    const usedInSchedule = Object.values(state.schedule).some((d) => d?.planId === planId);
    if (usedInSchedule) {
      const newSchedule: WorkoutSchedule = { ...state.schedule };
      for (const key of Object.keys(newSchedule)) {
        const idx = Number(key);
        if (newSchedule[idx]?.planId === planId) {
          newSchedule[idx] = { ...newSchedule[idx], planId: undefined };
        }
      }
      await saveWorkoutSchedule(newSchedule);
      dispatch({ type: "SET_SCHEDULE", payload: newSchedule });
    }
  };

  const completeOnboarding = async () => {
    await setOnboardingDone();
    dispatch({ type: "SET_ONBOARDING", payload: true });
  };

  const addWater = async () => {
    const newCount = state.todayWater + 1;
    await saveWaterIntake(today, newCount);
    dispatch({ type: "SET_WATER", payload: newCount });
  };

  const removeWater = async () => {
    const newCount = Math.max(0, state.todayWater - 1);
    await saveWaterIntake(today, newCount);
    dispatch({ type: "SET_WATER", payload: newCount });
  };

  const resetAllData = async () => {
    try {
      await clearAllData();
      dispatch({ type: "SET_ONBOARDING", payload: false });
      dispatch({ type: "SET_PROFILE", payload: null });
      dispatch({ type: "SET_GOALS", payload: {
        targetWeight: 0,
        weeklyWorkouts: 4,
        dailyWater: 8,
        currentStreak: 0,
        longestStreak: 0,
        totalWorkouts: 0,
        totalCalories: 0,
        totalMinutes: 0,
      }});
      dispatch({ type: "SET_SCHEDULE", payload: {
        0: { isRestDay: false },
        1: { isRestDay: false },
        2: { isRestDay: false },
        3: { isRestDay: true },
        4: { isRestDay: false },
        5: { isRestDay: false },
        6: { isRestDay: true },
      }});
      dispatch({ type: "SET_HISTORY", payload: [] });
      dispatch({ type: "SET_CYCLE_DATA", payload: [] });
      dispatch({ type: "SET_BMI_HISTORY", payload: [] });
      dispatch({ type: "SET_CUSTOM_PLANS", payload: [] });
      dispatch({ type: "SET_WATER", payload: 0 });
      dispatch({ type: "SET_FAVORITES", payload: [] });
    } catch (e) {
      console.error("Error resetting all data:", e);
    }
  };

  const toggleFavoritePlan = async (planId: string) => {
    const next = state.favorites.includes(planId)
      ? state.favorites.filter((id) => id !== planId)
      : [...state.favorites, planId];
    await saveFavoritePlans(next);
    dispatch({ type: "SET_FAVORITES", payload: next });
  };

  const refreshData = loadData;

  return (
    <AppContext.Provider
      value={{
        state,
        updateProfile,
        updateGoals,
        updateSchedule,
        logWorkout,
        updateCycleData,
        addBMI,
        updateCustomPlans,
        deleteCustomPlan,
        completeOnboarding,
        addWater,
        removeWater,
        refreshData,
        resetAllData,
        toggleFavoritePlan,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within AppProvider");
  }
  return context;
}
