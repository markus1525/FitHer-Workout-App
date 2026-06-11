/**
 * Native daily reminders for FitHer (Android / iOS) using expo-notifications.
 * The web build uses lib/web-notifications.ts instead.
 */
import * as Notifications from "expo-notifications";

const MOTIVATION_MESSAGES = [
  "Small steps every day add up to big changes.",
  "You are stronger than your excuses. Let's move!",
  "Future you will thank you for today's workout.",
  "Progress, not perfection. Just show up.",
  "Your body can do it, it's your mind you have to convince.",
  "Consistency beats intensity. Keep going!",
  "One workout at a time. You've got this.",
];

/**
 * Cancel any existing reminders and schedule daily repeating notifications:
 * a workout nudge and a motivation message at the chosen hour, plus a midday
 * water reminder.
 */
export async function scheduleAllNativeReminders(hourOfDay = 8): Promise<void> {
  try {
    Notifications.setNotificationHandler({
      handleNotification: async () =>
        ({
          shouldShowBanner: true,
          shouldShowList: true,
          shouldPlaySound: true,
          shouldSetBadge: false,
        }) as any,
    });

    await Notifications.cancelAllScheduledNotificationsAsync();

    const daily = (hour: number, minute = 0) =>
      ({
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour,
        minute,
      }) as any;

    const msg = MOTIVATION_MESSAGES[new Date().getDate() % MOTIVATION_MESSAGES.length];

    await Notifications.scheduleNotificationAsync({
      content: { title: "FitHer 💪 Time to Work Out!", body: "Your daily workout is waiting. Let's crush it today!" },
      trigger: daily(hourOfDay, 0),
    });
    await Notifications.scheduleNotificationAsync({
      content: { title: "FitHer ✨ Daily Motivation", body: msg },
      trigger: daily(hourOfDay, 5),
    });
    await Notifications.scheduleNotificationAsync({
      content: { title: "FitHer 💧 Hydration Check!", body: "Don't forget to drink water. Staying hydrated means better workouts!" },
      trigger: daily(12, 0),
    });
  } catch (e) {
    console.warn("[FitHer] Failed to schedule native reminders:", e);
  }
}

export async function cancelAllNativeReminders(): Promise<void> {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch {
    // ignore
  }
}
