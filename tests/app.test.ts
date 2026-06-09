import { describe, it, expect } from "vitest";
import { EXERCISES, DEFAULT_WORKOUT_PLANS, BODY_PARTS, CYCLE_PHASES, MOTIVATIONAL_QUOTES } from "../data/exercises";

describe("Exercise Data", () => {
  it("should have exercises defined", () => {
    expect(EXERCISES.length).toBeGreaterThan(0);
  });

  it("each exercise should have required fields", () => {
    EXERCISES.forEach((exercise) => {
      expect(exercise.id).toBeTruthy();
      expect(exercise.name).toBeTruthy();
      expect(exercise.description).toBeTruthy();
      expect(exercise.duration).toBeGreaterThan(0);
      expect(exercise.calories).toBeGreaterThan(0);
      expect(exercise.bodyPart).toBeTruthy();
      expect(exercise.youtubeId).toBeTruthy();
      expect(exercise.image).toBeTruthy();
      expect(["beginner", "intermediate", "advanced"]).toContain(exercise.difficulty);
    });
  });

  it("each exercise should have a valid YouTube ID", () => {
    EXERCISES.forEach((exercise) => {
      expect(exercise.youtubeId.length).toBeGreaterThan(5);
    });
  });
});

describe("Workout Plans", () => {
  it("should have default plans defined", () => {
    expect(DEFAULT_WORKOUT_PLANS.length).toBeGreaterThan(0);
  });

  it("each plan should reference valid exercise IDs", () => {
    const exerciseIds = EXERCISES.map((e) => e.id);
    DEFAULT_WORKOUT_PLANS.forEach((plan) => {
      plan.exercises.forEach((exId) => {
        expect(exerciseIds).toContain(exId);
      });
    });
  });

  it("each plan should have valid difficulty", () => {
    DEFAULT_WORKOUT_PLANS.forEach((plan) => {
      expect(["beginner", "intermediate", "advanced"]).toContain(plan.difficulty);
    });
  });

  it("each plan should have duration > 0", () => {
    DEFAULT_WORKOUT_PLANS.forEach((plan) => {
      expect(plan.duration).toBeGreaterThan(0);
    });
  });

  it("should have plans for all difficulty levels", () => {
    const difficulties = [...new Set(DEFAULT_WORKOUT_PLANS.map((p) => p.difficulty))];
    expect(difficulties).toContain("beginner");
    expect(difficulties).toContain("intermediate");
    expect(difficulties).toContain("advanced");
  });
});

describe("Cycle Phases", () => {
  it("should have all 4 phases defined", () => {
    expect(Object.keys(CYCLE_PHASES)).toHaveLength(4);
    expect(CYCLE_PHASES.menstrual).toBeDefined();
    expect(CYCLE_PHASES.follicular).toBeDefined();
    expect(CYCLE_PHASES.ovulation).toBeDefined();
    expect(CYCLE_PHASES.luteal).toBeDefined();
  });

  it("each phase should have required fields", () => {
    Object.values(CYCLE_PHASES).forEach((phase) => {
      expect(phase.name).toBeTruthy();
      expect(phase.color).toBeTruthy();
      expect(phase.icon).toBeTruthy();
      expect(phase.description).toBeTruthy();
      expect(phase.tips).toBeTruthy();
      expect(phase.recommendedExercises.length).toBeGreaterThan(0);
    });
  });

  it("recommended exercises should reference valid plan IDs", () => {
    const planIds = DEFAULT_WORKOUT_PLANS.map((p) => p.id);
    Object.values(CYCLE_PHASES).forEach((phase) => {
      phase.recommendedExercises.forEach((planId) => {
        expect(planIds).toContain(planId);
      });
    });
  });
});

describe("Body Parts", () => {
  it("should have body parts defined", () => {
    expect(BODY_PARTS.length).toBeGreaterThan(0);
  });

  it("all exercise body parts should be in BODY_PARTS list", () => {
    const uniqueBodyParts = [...new Set(EXERCISES.map((e) => e.bodyPart))];
    uniqueBodyParts.forEach((bp) => {
      expect(BODY_PARTS).toContain(bp);
    });
  });
});

describe("Motivational Quotes", () => {
  it("should have quotes defined", () => {
    expect(MOTIVATIONAL_QUOTES.length).toBeGreaterThan(10);
  });

  it("each quote should be a non-empty string", () => {
    MOTIVATIONAL_QUOTES.forEach((q) => {
      expect(q.length).toBeGreaterThan(5);
    });
  });
});

describe("BMI Calculation Logic", () => {
  function calculateBMI(heightCm: number, weightKg: number): number {
    const heightM = heightCm / 100;
    return Math.round((weightKg / (heightM * heightM)) * 10) / 10;
  }

  function getBMICategory(bmi: number): string {
    if (bmi < 18.5) return "Underweight";
    if (bmi < 25) return "Normal";
    if (bmi < 30) return "Overweight";
    return "Obese";
  }

  it("should calculate BMI correctly", () => {
    expect(calculateBMI(170, 70)).toBeCloseTo(24.2, 1);
    expect(calculateBMI(160, 50)).toBeCloseTo(19.5, 1);
    expect(calculateBMI(175, 90)).toBeCloseTo(29.4, 1);
  });

  it("should categorize BMI correctly", () => {
    expect(getBMICategory(17)).toBe("Underweight");
    expect(getBMICategory(22)).toBe("Normal");
    expect(getBMICategory(27)).toBe("Overweight");
    expect(getBMICategory(32)).toBe("Obese");
  });
});

describe("Cycle Phase Calculation", () => {
  function getCyclePhase(startDateStr: string, cycleLength: number, periodLength: number): string {
    const startDate = new Date(startDateStr);
    const today = new Date();
    const daysSinceStart = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const dayInCycle = daysSinceStart % cycleLength;

    if (dayInCycle < periodLength) return "menstrual";
    if (dayInCycle < 13) return "follicular";
    if (dayInCycle < 16) return "ovulation";
    return "luteal";
  }

  it("should return menstrual for day 0-4", () => {
    const today = new Date().toISOString().split("T")[0];
    expect(getCyclePhase(today, 28, 5)).toBe("menstrual");
  });

  it("should return follicular for day 5-12", () => {
    const sixDaysAgo = new Date();
    sixDaysAgo.setDate(sixDaysAgo.getDate() - 6);
    expect(getCyclePhase(sixDaysAgo.toISOString().split("T")[0], 28, 5)).toBe("follicular");
  });

  it("should return ovulation for day 13-15", () => {
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
    expect(getCyclePhase(fourteenDaysAgo.toISOString().split("T")[0], 28, 5)).toBe("ovulation");
  });

  it("should return luteal for day 16+", () => {
    const twentyDaysAgo = new Date();
    twentyDaysAgo.setDate(twentyDaysAgo.getDate() - 20);
    expect(getCyclePhase(twentyDaysAgo.toISOString().split("T")[0], 28, 5)).toBe("luteal");
  });
});
