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
  | { type: "SET_WATER"; payload: number };

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
  completeOnboarding: () => Promise<void>;
  addWater: () => Promise<void>;
  removeWater: () => Promise<void>;
  refreshData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  const today = new Date().toISOString().split("T")[0];

  const loadData = useCallback(async () => {
    try {
      const [onboarded, profile, goals, schedule, history, cycleData, bmiHistory, customPlans, water] = await Promise.all([
        isOnboardingDone(),
        getUserProfile(),
        getGoals(),
        getWorkoutSchedule(),
        getWorkoutHistory(),
        getCycleData(),
        getBMIHistory(),
        getCustomPlans(),
        getWaterIntake(today),
      ]);

      dispatch({ type: "SET_ONBOARDING", payload: onboarded });
      dispatch({ type: "SET_PROFILE", payload: profile });
      dispatch({ type: "SET_GOALS", payload: goals });
      dispatch({ type: "SET_SCHEDULE", payload: schedule });
      dispatch({ type: "SET_HISTORY", payload: history });
      dispatch({ type: "SET_CYCLE_DATA", payload: cycleData });
      dispatch({ type: "SET_BMI_HISTORY", payload: bmiHistory });
      dispatch({ type: "SET_CUSTOM_PLANS", payload: customPlans as WorkoutPlan[] });
      dispatch({ type: "SET_WATER", payload: water });
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
        completeOnboarding,
        addWater,
        removeWater,
        refreshData,
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
