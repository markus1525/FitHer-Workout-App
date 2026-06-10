<div align="center">

<img src="https://d2xsxph8kpxj0f.cloudfront.net/310519663523605261/3PvwNR8VybWQnjqXPU9foG/fither-icon-79aubkohDz4ENMLsKWHnyj.png" width="100" height="100" style="border-radius: 22px" />

# FitHer

**Your personal home workout app designed for women**

[![Live App](https://img.shields.io/badge/Live%20App-FitHer-E91E63?style=for-the-badge&logo=googlechrome&logoColor=white)](https://minthukyawkhaung.github.io/FitHer-Workout-App)
[![Discord](https://img.shields.io/badge/Community-Discord-5865F2?style=for-the-badge&logo=discord&logoColor=white)](https://discord.gg/dWPwCy4GEG)
[![License](https://img.shields.io/badge/License-MIT-pink?style=for-the-badge)](LICENSE)

</div>

---

## About

FitHer is a free home workout app built for women of all fitness levels. No gym, no equipment — just open the app and start moving.

The app runs as a Progressive Web App (PWA), so you can install it on your phone from the browser without going to any app store.

---

## Features

- **Exercise Library** — Browse workouts by category with video tutorials for each exercise
- **Workout Plans** — Create and follow custom workout plans
- **Exercise Player** — Step-by-step guidance during your workout
- **BMI Calculator** — Track your body metrics
- **Cycle and Wellness** — Log your cycle and wellness notes
- **Daily Reminders** — Get notified to work out and drink water
- **Offline Support** — Works without internet after first load
- **PWA Support** — Install on iOS and Android from the browser
- **Dark and Light Mode** — Automatic based on your system settings

---

## Install on Your Phone

**iPhone (iOS):**
1. Open [FitHer](https://minthukyawkhaung.github.io/FitHer-Workout-App) in Safari
2. Tap the Share button at the bottom
3. Tap **Add to Home Screen**
4. Tap **Add**

**Android:**
1. Open [FitHer](https://minthukyawkhaung.github.io/FitHer-Workout-App) in Chrome
2. Tap the three-dot menu at the top right
3. Tap **Add to Home Screen** or **Install App**
4. Tap **Install**

---

## Tech Stack

| Category | Technology |
|---|---|
| Framework | Expo SDK 54 / Expo Router 6 |
| Language | TypeScript |
| UI | React Native + NativeWind (Tailwind CSS) |
| State | TanStack Query + React Context |
| API | tRPC |
| Database | Drizzle ORM |
| Deployment | GitHub Pages (PWA) |
| Service Worker | Offline caching + background notifications |

---

## Project Structure

```
app/
  _layout.tsx          - Root layout with providers
  onboarding.tsx       - First launch onboarding
  (tabs)/
    index.tsx          - Home screen
    workouts.tsx        - Workout browser
    profile.tsx        - Settings and profile
  exercise-player.tsx  - Active workout screen
  workout-detail.tsx   - Workout overview
  bmi-calculator.tsx   - BMI tool
components/            - Reusable UI components
data/
  exercises.ts         - Exercise library with YouTube IDs
lib/
  web-notifications.ts - PWA notification utilities
  app-context.tsx      - Global app state
public/
  sw.js                - Service worker
  manifest.json        - PWA manifest
  offline.html         - Offline fallback page
scripts/
  patch-web.mjs        - Post-export PWA patcher
```

---

## Local Development

**Requirements:** Node.js 18+, pnpm

```bash
# Clone the repo
git clone https://github.com/markus1525/FitHer-Workout-App.git
cd FitHer-Workout-App

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

Open [http://localhost:8081](http://localhost:8081) in your browser.

**Build and deploy:**

```bash
# Export as static web app
pnpm export

# Deploy to GitHub Pages
npm run deploy
```

---

## Community

Join the FitHer Discord server for support, workout tips, and motivation.

[![Join Discord](https://img.shields.io/badge/Join%20FitHer%20Discord-5865F2?style=for-the-badge&logo=discord&logoColor=white)](https://discord.gg/dWPwCy4GEG)

---

## License

MIT License. See [LICENSE](LICENSE) for details.

---

<div align="center">
Made with 🌸 for women, by women in mind
</div>
