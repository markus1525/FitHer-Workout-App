import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines class names using clsx and tailwind-merge.
 * This ensures Tailwind classes are properly merged without conflicts.
 *
 * Usage:
 * ```tsx
 * cn("px-4 py-2", isActive && "bg-primary", className)
 * ```
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ── Height conversion helpers ──────────────────────────────────────────────

/** Convert cm to feet + inches (rounded, handles 11.9→12 rollover). */
export function cmToFtIn(cm: number): { ft: number; inches: number } {
  const totalInches = cm / 2.54;
  const ft = Math.floor(totalInches / 12);
  let inches = Math.round(totalInches % 12);
  if (inches === 12) return { ft: ft + 1, inches: 0 };
  return { ft, inches };
}

/** Convert feet + inches to cm (1 decimal place). */
export function ftInToCm(ft: number, inches: number): number {
  return Math.round((ft * 12 + inches) * 2.54 * 10) / 10;
}

/** Format height for display (e.g. "165 cm" or "5' 8\""). */
export function formatHeight(cm: number, unitSystem: "metric" | "imperial"): string {
  if (unitSystem === "metric") return `${cm} cm`;
  const { ft, inches } = cmToFtIn(cm);
  return `${ft}' ${inches}"`;
}
