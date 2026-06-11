/**
 * Builds a weekly schedule (a plan for each day) from the user's goal,
 * workout mode, and fitness level. The user never has to pick exercises for
 * the day, but can still edit any day in the Workout Schedule settings.
 */
import { DEFAULT_WORKOUT_PLANS } from "@/data/exercises";
import { WorkoutSchedule } from "@/lib/storage";

type Category = "full" | "lower" | "upper" | "core" | "glutes" | "hiit" | "recovery";
type Mode = "home" | "gym" | "both";
type Level = "beginner" | "intermediate" | "advanced";

// Concrete plan ids grouped by focus, for home and gym sets.
const HOME_CATS: Record<Category, string[]> = {
  full: ["home-dumbbell-tone", "beginner-full-body", "advanced-total-body"],
  lower: ["home-db-lower-body", "beginner-lower-body"],
  upper: ["intermediate-upper"],
  core: ["intermediate-core"],
  glutes: ["home-glute-core-sculpt"],
  hiit: ["intermediate-hiit"],
  recovery: ["dynamic-warmup-stretch"],
};

const GYM_CATS: Record<Category, string[]> = {
  full: ["gym-db-full-body"],
  lower: ["gym-legs-glutes-sculpt", "gym-db-glutes-legs"],
  upper: ["gym-upper-body-sculpt", "gym-db-upper-body"],
  core: ["intermediate-core"],
  glutes: ["gym-db-glute-builder"],
  hiit: ["intermediate-hiit"],
  recovery: ["dynamic-warmup-stretch"],
};

// Weekly pattern per goal, indices 0..6 = Sun..Sat. null means rest day.
const GOAL_PATTERNS: Record<string, (Category | null)[]> = {
  // Lots of calorie burn: HIIT plus full body and lower
  lose_weight: [null, "hiit", "lower", "full", "hiit", "glutes", null],
  // Lean muscle: a balanced split across the week
  tone_up: [null, "upper", "lower", "core", "glutes", "full", null],
  // Strength: heavier lower/upper split with recovery
  build_strength: [null, "lower", "upper", null, "lower", "upper", null],
  // Maintenance: a lighter, balanced few days plus recovery
  stay_active: ["recovery", "full", null, "core", null, "lower", null],
};

function pickPlanId(cat: Category, mode: Mode, level: Level): string | undefined {
  const cats = mode === "gym" ? GYM_CATS : HOME_CATS;
  const candidateIds = (cats[cat] || []).filter((id) => DEFAULT_WORKOUT_PLANS.some((p) => p.id === id));

  if (candidateIds.length === 0) {
    // Fallback to any plan that fits the chosen environment
    const fallback = DEFAULT_WORKOUT_PLANS.find((p) => (mode === "gym" ? p.mode === "gym" : p.mode !== "gym"));
    return fallback?.id;
  }

  // Prefer a plan whose difficulty matches the user's level
  const matchingLevel = candidateIds.find(
    (id) => DEFAULT_WORKOUT_PLANS.find((p) => p.id === id)?.difficulty === level
  );
  return matchingLevel || candidateIds[0];
}

export function generateScheduleFromGoal(
  goal: string,
  mode: Mode = "both",
  level: Level = "beginner"
): { schedule: WorkoutSchedule; workoutDays: number } {
  const pattern = GOAL_PATTERNS[goal] || GOAL_PATTERNS["stay_active"];
  const schedule: WorkoutSchedule = {};
  let workoutDays = 0;

  for (let d = 0; d < 7; d++) {
    const cat = pattern[d];
    if (!cat) {
      schedule[d] = { isRestDay: true };
    } else {
      const planId = pickPlanId(cat, mode, level);
      if (planId) {
        schedule[d] = { isRestDay: false, planId };
        workoutDays++;
      } else {
        schedule[d] = { isRestDay: true };
      }
    }
  }

  return { schedule, workoutDays };
}

export const GOAL_LABELS: Record<string, string> = {
  lose_weight: "Lose Weight",
  tone_up: "Tone Up",
  build_strength: "Build Strength",
  stay_active: "Stay Active",
};
