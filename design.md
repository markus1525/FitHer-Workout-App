# FitHer - Women's Workout App Design

## Overview
A comprehensive home workout app designed exclusively for women/girls. The app focuses on personalized fitness with features like BMI tracking, customizable workout plans, menstrual cycle awareness, and motivational goal setting. The design follows Apple HIG for a native iOS feel while being fully responsive on Android.

## Color Palette
- **Primary**: #E91E63 (Pink - feminine, energetic)
- **Primary Light**: #F48FB1
- **Primary Dark**: #C2185B
- **Secondary**: #7C4DFF (Purple accent)
- **Background Light**: #FFFFFF
- **Background Dark**: #1A1A2E
- **Surface Light**: #FFF0F5 (Lavender blush)
- **Surface Dark**: #252540
- **Success**: #4CAF50
- **Warning**: #FF9800
- **Error**: #F44336
- **Muted Light**: #9E9E9E
- **Muted Dark**: #B0BEC5

## Screen List

### 1. Home Screen (Tab: Home)
- Greeting with user's name and motivational quote
- Today's workout summary card
- Quick stats (streak, calories, minutes)
- Progress ring showing weekly goal
- "Start Workout" CTA button
- Menstrual cycle phase indicator (subtle)

### 2. Workouts Screen (Tab: Workouts)
- Toggle: Default Plans / My Plans
- Default suggested plans (Beginner, Intermediate, Advanced)
- Each plan shows: name, duration, difficulty, muscle groups
- Custom plan creation button
- Workout/Rest day calendar view
- Filter by body part, duration, difficulty

### 3. Workout Detail Screen
- Exercise list with thumbnails
- Each exercise: name, sets, reps, duration, YouTube preview
- Start workout button
- Edit plan option (for custom plans)

### 4. Exercise Player Screen
- YouTube video embed for exercise preview
- Timer/rep counter
- Next/Previous exercise navigation
- Rest timer between exercises
- Progress bar

### 5. BMI Calculator Screen (Tab: Profile sub-screen)
- Height input (cm/ft toggle)
- Weight input (kg/lbs toggle)
- Age input
- BMI result with color-coded category
- BMI history chart
- Health recommendations

### 6. Goals Screen (Tab: Goals)
- Target weight goal
- Weekly workout frequency goal
- Daily water intake goal
- Progress bars for each goal
- Achievement badges
- Streak counter

### 7. Cycle Tracker Screen (Tab: Cycle)
- Calendar with cycle phases color-coded
- Current phase indicator (Menstrual, Follicular, Ovulation, Luteal)
- Workout recommendations based on cycle phase
- Symptom logging
- Cycle history and predictions
- Phase-appropriate exercise suggestions

### 8. Profile/Settings Screen
- User profile (name, age, height, weight)
- Unit preferences (metric/imperial)
- Notification settings
- Dark/Light mode toggle
- "Developed by Markus with ❤️" footer
- App version info

## Key User Flows

### Flow 1: First Launch / Onboarding
1. Welcome screen with app intro
2. Enter basic info (name, age, height, weight)
3. Set fitness goal (lose weight, tone up, stay active, build strength)
4. Choose workout level (beginner, intermediate, advanced)
5. Set workout days preference
6. Home screen with personalized plan

### Flow 2: Start a Workout
1. Home → Tap "Start Workout" or go to Workouts tab
2. Select a workout plan
3. View exercise list with YouTube previews
4. Tap "Begin Workout"
5. Follow exercise-by-exercise with timer
6. Complete → Summary with calories, duration, exercises done

### Flow 3: Create Custom Plan
1. Workouts tab → "Create Plan"
2. Name the plan
3. Select exercises from library
4. Set reps/duration for each
5. Assign to specific days
6. Save plan

### Flow 4: Track Menstrual Cycle
1. Cycle tab → Log period start
2. View predicted phases on calendar
3. See workout recommendations for current phase
4. Log symptoms (optional)

### Flow 5: Check BMI & Set Goals
1. Profile → BMI Calculator
2. Enter/update measurements
3. View BMI result and category
4. Set target weight goal
5. Track progress over time

## Primary Content & Functionality

### Home Screen
- **Data**: User name, daily quote, today's plan, streak count, weekly progress
- **Functionality**: Quick workout start, view stats, cycle phase awareness

### Workouts
- **Data**: Exercise library (50+ exercises), default plans (6+), custom plans
- **Functionality**: Browse, filter, create, edit, delete plans; play YouTube previews

### Goals
- **Data**: Weight target, workout frequency, water intake, achievements
- **Functionality**: Set goals, track progress, earn badges

### Cycle Tracker
- **Data**: Period dates, cycle length, phase predictions, symptoms
- **Functionality**: Log periods, predict cycles, suggest phase-appropriate workouts

### Profile
- **Data**: Personal info, BMI history, preferences
- **Functionality**: Edit profile, calculate BMI, change settings

## Additional Features (Suggested)
1. **Water Intake Tracker** - Daily water goal with glass counter
2. **Daily Motivational Quotes** - Rotating fitness quotes for women
3. **Workout Reminders** - Push notification for scheduled workouts
4. **Progress Photos** - Before/after photo timeline (local storage)
5. **Calorie Estimation** - Approximate calories burned per workout
6. **Stretching/Cooldown** - Pre and post workout routines
7. **Rest Day Activities** - Yoga/meditation suggestions for rest days
8. **Weekly Summary** - End of week progress report

## Typography
- Headers: System Bold (SF Pro on iOS, Roboto on Android)
- Body: System Regular
- Accent: System Medium

## Layout Principles
- Bottom tab navigation (5 tabs max)
- Cards with rounded corners (16px radius)
- Consistent 16px horizontal padding
- 8px spacing grid
- Large touch targets (44pt minimum)
- One-handed reachability for primary actions
