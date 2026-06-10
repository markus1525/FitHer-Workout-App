/**
 * Web notification utilities for FitHer PWA.
 * Works alongside expo-notifications (used in native builds).
 * On web, uses the browser Notification API + service worker message passing.
 */

const BASE = "/FitHer-Workout-App";

/** Register the service worker and return its registration, or null if unavailable. */
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return null;
  try {
    const reg = await navigator.serviceWorker.register(`${BASE}/sw.js`, {
      scope: BASE + "/",
    });
    return reg;
  } catch (err) {
    console.warn("[FitHer SW] Registration failed:", err);
    return null;
  }
}

/** Get the active SW registration (registers if not yet done). */
async function getSW(): Promise<ServiceWorkerRegistration | null> {
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return null;
  return navigator.serviceWorker.ready.catch(() => null);
}

/**
 * Schedule a local notification via the service worker.
 * Works while Chrome/Safari is running in the background on Android/iOS.
 *
 * @param id       Unique ID — calling again with same id replaces the previous timer.
 * @param delayMs  Milliseconds from now to show the notification.
 * @param title    Notification title.
 * @param body     Notification body text.
 */
export async function scheduleLocalNotification(
  id: string,
  delayMs: number,
  title: string,
  body: string
): Promise<void> {
  const sw = await getSW();
  if (!sw?.active) return;
  sw.active.postMessage({ type: "SCHEDULE_NOTIFICATION", id, delay: delayMs, title, body });
}

/** Cancel a previously scheduled local notification. */
export async function cancelLocalNotification(id: string): Promise<void> {
  const sw = await getSW();
  if (!sw?.active) return;
  sw.active.postMessage({ type: "CANCEL_NOTIFICATION", id });
}

/**
 * Schedule the daily workout reminder for tomorrow at the given hour (24h).
 * Call this every time the app loads when notifications are enabled.
 */
export async function scheduleDailyWorkoutReminder(hourOfDay = 8): Promise<void> {
  if (Notification.permission !== "granted") return;

  const now = new Date();
  const target = new Date();
  target.setHours(hourOfDay, 0, 0, 0);

  // If target time already passed today, schedule for tomorrow
  if (target <= now) target.setDate(target.getDate() + 1);

  const delayMs = target.getTime() - now.getTime();

  await scheduleLocalNotification(
    "daily-workout-reminder",
    delayMs,
    "FitHer 💪 Time to Work Out!",
    "Your daily workout is waiting. Let's crush it today!"
  );
}

/**
 * Schedule the daily water intake reminder (noon by default).
 */
export async function scheduleDailyWaterReminder(hourOfDay = 12): Promise<void> {
  if (Notification.permission !== "granted") return;

  const now = new Date();
  const target = new Date();
  target.setHours(hourOfDay, 0, 0, 0);
  if (target <= now) target.setDate(target.getDate() + 1);

  const delayMs = target.getTime() - now.getTime();

  await scheduleLocalNotification(
    "daily-water-reminder",
    delayMs,
    "FitHer 💧 Hydration Check!",
    "Don't forget to drink water. Staying hydrated = better workouts!"
  );
}

/** Cancel all FitHer scheduled notifications. */
export async function cancelAllReminders(): Promise<void> {
  await cancelLocalNotification("daily-workout-reminder");
  await cancelLocalNotification("daily-water-reminder");
}
