/**
 * Coaching detail for exercises: target muscles, how-to steps, and common
 * mistakes. Kept in its own file so the large EXERCISES array stays readable.
 * The workout detail screen looks up an exercise here by id.
 */
export type ExerciseCoaching = {
  targetMuscles: string[];
  formTips: string[];
  commonMistakes: string[];
};

export const EXERCISE_COACHING: Record<string, ExerciseCoaching> = {
  // ── Warmups / cardio / full body ──────────────────────────────────────────
  "jumping-jacks": {
    targetMuscles: ["Full Body", "Shoulders", "Calves", "Cardio"],
    formTips: [
      "Stand tall with feet together and arms at your sides.",
      "Jump your feet out wide while raising your arms overhead.",
      "Jump back to the start in one smooth motion.",
      "Land softly on the balls of your feet, knees slightly bent.",
    ],
    commonMistakes: ["Landing flat-footed and heavy", "Stiff straight knees", "Holding your breath"],
  },
  "high-knees": {
    targetMuscles: ["Hip Flexors", "Quads", "Core", "Cardio"],
    formTips: [
      "Stand tall and run on the spot.",
      "Drive each knee up toward hip height.",
      "Stay light on the balls of your feet.",
      "Pump your arms in time with your legs.",
    ],
    commonMistakes: ["Knees too low", "Leaning back", "Slamming your feet down"],
  },
  "arm-circles": {
    targetMuscles: ["Shoulders", "Upper Back"],
    formTips: [
      "Stand with arms straight out to the sides at shoulder height.",
      "Make small circles forward for a few seconds.",
      "Reverse and circle backward.",
      "Keep your shoulders relaxed, not shrugged.",
    ],
    commonMistakes: ["Shrugging the shoulders", "Circles too big too soon", "Bending the elbows"],
  },
  "burpees": {
    targetMuscles: ["Full Body", "Chest", "Legs", "Core", "Cardio"],
    formTips: [
      "From standing, squat down and place your hands on the floor.",
      "Jump or step your feet back into a plank.",
      "Lower into a push-up (optional), then return to plank.",
      "Jump your feet back in and stand or jump up with arms overhead.",
    ],
    commonMistakes: ["Sagging hips in the plank", "Rounding the back", "Landing with locked knees"],
  },
  "butt-kicks": {
    targetMuscles: ["Hamstrings", "Calves", "Cardio"],
    formTips: [
      "Jog on the spot, kicking your heels toward your glutes.",
      "Stay on the balls of your feet.",
      "Keep your torso tall and core gently braced.",
      "Pump your arms naturally.",
    ],
    commonMistakes: ["Leaning forward", "Heavy footfalls", "Going too fast and losing form"],
  },
  "skaters": {
    targetMuscles: ["Glutes", "Quads", "Outer Thighs", "Cardio"],
    formTips: [
      "Leap sideways onto one foot.",
      "Let the other leg sweep behind you for balance.",
      "Land softly with a slight knee bend.",
      "Push off and leap to the other side.",
    ],
    commonMistakes: ["Landing stiff-legged", "Knee caving inward", "Standing too upright"],
  },

  // ── Legs ────────────────────────────────────────────────────────────────
  "squats": {
    targetMuscles: ["Quads", "Glutes", "Hamstrings", "Core"],
    formTips: [
      "Feet shoulder-width apart, toes slightly turned out.",
      "Push your hips back first, then bend your knees.",
      "Keep your chest up and back flat.",
      "Lower until thighs are about parallel to the floor.",
      "Drive through your heels to stand back up.",
    ],
    commonMistakes: ["Knees caving inward", "Heels lifting off the floor", "Rounding the lower back"],
  },
  "lunges": {
    targetMuscles: ["Quads", "Glutes", "Hamstrings", "Balance"],
    formTips: [
      "Stand tall, then take one long step forward.",
      "Lower until both knees are about 90 degrees.",
      "Keep your front knee over your ankle, not past your toes.",
      "Push through the front heel to return to standing.",
    ],
    commonMistakes: ["Front knee past the toes", "Leaning too far forward", "Back knee slamming down"],
  },
  "wall-sit": {
    targetMuscles: ["Quads", "Glutes", "Core"],
    formTips: [
      "Lean your back flat against a wall.",
      "Slide down until your thighs are parallel to the floor.",
      "Keep knees above your ankles at 90 degrees.",
      "Hold and breathe steadily.",
    ],
    commonMistakes: ["Knees drifting past the toes", "Hips too high", "Holding your breath"],
  },
  "sumo-squats": {
    targetMuscles: ["Inner Thighs", "Glutes", "Quads"],
    formTips: [
      "Stand with a wide stance, toes pointed out about 45 degrees.",
      "Push your hips back and squat straight down.",
      "Keep your chest tall and knees tracking over your toes.",
      "Drive through your heels and squeeze your glutes at the top.",
    ],
    commonMistakes: ["Knees caving in", "Leaning forward", "Not squatting deep enough"],
  },
  "jump-squats": {
    targetMuscles: ["Quads", "Glutes", "Calves", "Cardio"],
    formTips: [
      "Lower into a normal squat.",
      "Explode straight up, extending through your hips.",
      "Land softly back into the squat, knees bent to absorb impact.",
      "Keep your chest up throughout.",
    ],
    commonMistakes: ["Landing with stiff legs", "Knees caving on landing", "Rounding the back"],
  },
  "db-goblet-squats": {
    targetMuscles: ["Quads", "Glutes", "Core", "Inner Thighs"],
    formTips: [
      "Hold one dumbbell vertically against your chest with both hands.",
      "Feet shoulder-width, toes slightly out.",
      "Push your hips back and squat down, chest tall.",
      "Go until thighs are parallel, then drive through your heels.",
    ],
    commonMistakes: ["Letting the chest drop", "Heels rising", "Knees caving inward"],
  },
  "barbell-back-squats": {
    targetMuscles: ["Quads", "Glutes", "Hamstrings", "Core"],
    formTips: [
      "Rest the bar on your upper back, not your neck.",
      "Brace your core hard before you descend.",
      "Push your hips back and squat to about parallel.",
      "Drive through your heels and keep your chest up.",
    ],
    commonMistakes: ["Knees caving inward", "Heels lifting", "Looking up and over-arching the back"],
  },
  "leg-press-machine": {
    targetMuscles: ["Quads", "Glutes", "Hamstrings"],
    formTips: [
      "Sit with your back flat against the pad.",
      "Place feet shoulder-width on the platform.",
      "Lower the weight until your knees reach about 90 degrees.",
      "Press through your heels, without locking your knees at the top.",
    ],
    commonMistakes: ["Locking the knees hard", "Hips lifting off the seat", "Going too deep and rounding the back"],
  },
  "seated-leg-curl": {
    targetMuscles: ["Hamstrings", "Calves"],
    formTips: [
      "Set the pad just above your ankles.",
      "Keep your back against the seat.",
      "Curl your legs down by squeezing your hamstrings.",
      "Return slowly under control.",
    ],
    commonMistakes: ["Using momentum", "Lifting hips off the seat", "Partial range of motion"],
  },
  "db-bulgarian-split-squats": {
    targetMuscles: ["Quads", "Glutes", "Balance"],
    formTips: [
      "Rest your back foot on a bench, laces down.",
      "Hold a dumbbell in each hand.",
      "Lower straight down by bending your front knee.",
      "Drive through your front heel to rise.",
    ],
    commonMistakes: ["Front knee past the toes", "Leaning too far forward", "Pushing off the back foot"],
  },

  // ── Glutes ────────────────────────────────────────────────────────────────
  "glute-bridges": {
    targetMuscles: ["Glutes", "Hamstrings", "Lower Back"],
    formTips: [
      "Lie on your back, knees bent, feet flat and hip-width apart.",
      "Press through your heels and squeeze your glutes.",
      "Lift hips until your body is straight from knee to shoulder.",
      "Lower slowly, stopping just before your hips touch the floor.",
    ],
    commonMistakes: ["Arching the lower back", "Feet too far away", "Rushing the movement"],
  },
  "donkey-kicks": {
    targetMuscles: ["Glutes", "Hamstrings"],
    formTips: [
      "Start on all fours, hands under shoulders, knees under hips.",
      "Keeping a 90 degree knee bend, kick one foot up toward the ceiling.",
      "Squeeze your glute at the top.",
      "Lower with control and repeat, keeping your back flat.",
    ],
    commonMistakes: ["Arching the lower back", "Swinging with momentum", "Kicking too high and losing the squeeze"],
  },
  "fire-hydrants": {
    targetMuscles: ["Outer Glutes", "Hips"],
    formTips: [
      "On all fours, keep a 90 degree bend in your knee.",
      "Lift one knee out to the side, like a hydrant.",
      "Keep your hips level and core braced.",
      "Lower slowly and repeat.",
    ],
    commonMistakes: ["Rotating the torso", "Arching the back", "Using momentum"],
  },
  "clamshells": {
    targetMuscles: ["Outer Glutes", "Hips"],
    formTips: [
      "Lie on your side with knees bent and stacked.",
      "Keep your feet together and hips stacked.",
      "Open your top knee like a clam, squeezing your glute.",
      "Lower slowly with control.",
    ],
    commonMistakes: ["Rolling the top hip back", "Feet drifting apart", "Going too fast"],
  },
  "db-glute-bridges": {
    targetMuscles: ["Glutes", "Hamstrings"],
    formTips: [
      "Lie on your back with a dumbbell resting on your hips.",
      "Hold the weight in place and plant your feet flat.",
      "Drive your hips up by squeezing your glutes.",
      "Pause at the top, then lower slowly.",
    ],
    commonMistakes: ["Arching the lower back", "Not pausing at the top", "Feet too far forward"],
  },
  "cable-glute-kickbacks": {
    targetMuscles: ["Glutes", "Hamstrings"],
    formTips: [
      "Attach the strap to your ankle at a low pulley.",
      "Hold the frame and hinge forward slightly.",
      "Kick your leg straight back, squeezing your glute.",
      "Return slowly without swinging.",
    ],
    commonMistakes: ["Using the lower back instead of the glute", "Swinging with momentum", "Arching the back"],
  },
  "hip-abduction-machine": {
    targetMuscles: ["Outer Glutes", "Hip Abductors"],
    formTips: [
      "Sit tall with your knees against the pads.",
      "Push your knees outward as wide as comfortable.",
      "Pause at the widest point.",
      "Return slowly, keeping your upper body still.",
    ],
    commonMistakes: ["Leaning forward for momentum", "Going too fast", "Using too much weight"],
  },
  "db-rdls": {
    targetMuscles: ["Hamstrings", "Glutes", "Lower Back"],
    formTips: [
      "Hold dumbbells in front of your thighs, soft knees.",
      "Hinge at the hips and push your hips back.",
      "Lower the weights along your legs until you feel a hamstring stretch.",
      "Drive your hips forward to stand, squeezing your glutes.",
    ],
    commonMistakes: ["Rounding the lower back", "Bending the knees too much", "Letting the weights drift away from the legs"],
  },

  // ── Arms / upper body ─────────────────────────────────────────────────────
  "push-ups": {
    targetMuscles: ["Chest", "Triceps", "Shoulders", "Core"],
    formTips: [
      "Knees on the floor, hands slightly wider than your shoulders.",
      "Keep a straight line from head to knees.",
      "Lower your chest toward the floor with elbows about 45 degrees.",
      "Push back up and breathe out on the way up.",
    ],
    commonMistakes: ["Hips sagging or piking up", "Elbows flaring straight out", "Not lowering far enough"],
  },
  "tricep-dips": {
    targetMuscles: ["Triceps", "Shoulders", "Chest"],
    formTips: [
      "Sit on the edge of a chair or bench, hands by your hips.",
      "Slide your hips off the edge, legs out in front.",
      "Bend your elbows to lower straight down to about 90 degrees.",
      "Press through your palms to rise, keeping elbows pointing back.",
    ],
    commonMistakes: ["Elbows flaring out", "Shoulders shrugging up", "Hips drifting away from the bench"],
  },
  "plank-shoulder-taps": {
    targetMuscles: ["Core", "Shoulders", "Arms"],
    formTips: [
      "Start in a high plank, hands under shoulders.",
      "Keep your hips level and core braced.",
      "Tap one hand to the opposite shoulder.",
      "Switch sides slowly, minimizing hip rock.",
    ],
    commonMistakes: ["Hips rocking side to side", "Sagging hips", "Going too fast"],
  },
  "diamond-push-ups": {
    targetMuscles: ["Triceps", "Chest", "Shoulders"],
    formTips: [
      "Place your hands close together forming a diamond shape.",
      "Keep a straight line from head to heels (or knees).",
      "Lower your chest toward your hands, elbows tucked.",
      "Press back up with control.",
    ],
    commonMistakes: ["Elbows flaring wide", "Hips sagging", "Partial range of motion"],
  },
  "lat-pulldowns": {
    targetMuscles: ["Back", "Lats", "Biceps"],
    formTips: [
      "Grip the bar wider than shoulder-width.",
      "Sit tall with a slight lean back.",
      "Pull the bar to your upper chest, leading with your elbows.",
      "Squeeze your back, then return slowly.",
    ],
    commonMistakes: ["Pulling behind the neck", "Using body momentum", "Letting the bar fly back up"],
  },
  "db-chest-press": {
    targetMuscles: ["Chest", "Triceps", "Shoulders"],
    formTips: [
      "Lie on a bench with a dumbbell in each hand.",
      "Start with the weights at chest level, elbows about 45 degrees.",
      "Press up until your arms are nearly straight.",
      "Lower slowly until you feel a chest stretch.",
    ],
    commonMistakes: ["Flaring the elbows to 90 degrees", "Arching the lower back", "Clashing the weights at the top"],
  },
  "db-shoulder-press": {
    targetMuscles: ["Shoulders", "Triceps"],
    formTips: [
      "Sit tall with dumbbells at ear height, palms forward.",
      "Brace your core and keep your back flat.",
      "Press up until your arms are nearly straight.",
      "Lower slowly to ear height.",
    ],
    commonMistakes: ["Leaning back and arching", "Locking the elbows hard", "Dropping the weights fast"],
  },
  "db-rows": {
    targetMuscles: ["Back", "Lats", "Biceps", "Rear Delts"],
    formTips: [
      "Hinge forward with a flat back, dumbbells hanging down.",
      "Pull the weights toward your hips, leading with your elbows.",
      "Squeeze your shoulder blades together at the top.",
      "Lower slowly to a full stretch.",
    ],
    commonMistakes: ["Rounding the back", "Using momentum", "Pulling to the chest instead of the hips"],
  },

  // ── Core ──────────────────────────────────────────────────────────────────
  "crunches": {
    targetMuscles: ["Upper Abs", "Core"],
    formTips: [
      "Lie on your back, knees bent, feet flat.",
      "Hands lightly behind your head, elbows wide.",
      "Curl your shoulders off the floor using your abs.",
      "Lower slowly, keeping tension in your core.",
    ],
    commonMistakes: ["Pulling on your neck", "Using momentum", "Lifting too high with the hip flexors"],
  },
  "plank": {
    targetMuscles: ["Core", "Abs", "Lower Back", "Shoulders"],
    formTips: [
      "Elbows directly under your shoulders, forearms on the floor.",
      "Keep a straight line from head to heels.",
      "Squeeze your core and glutes the whole time.",
      "Look at the floor to keep your neck neutral.",
    ],
    commonMistakes: ["Hips too high", "Hips sagging", "Holding your breath"],
  },
  "bicycle-crunches": {
    targetMuscles: ["Obliques", "Upper Abs", "Core"],
    formTips: [
      "Lie on your back, knees up, hands by your ears.",
      "Bring one elbow toward the opposite knee.",
      "Extend the other leg out straight.",
      "Switch sides in a smooth, controlled pedalling motion.",
    ],
    commonMistakes: ["Pulling on the neck", "Going too fast", "Not extending the opposite leg"],
  },
  "mountain-climbers": {
    targetMuscles: ["Core", "Hip Flexors", "Shoulders", "Cardio"],
    formTips: [
      "Start in a high plank, hands under shoulders.",
      "Drive one knee toward your chest.",
      "Quickly switch legs in a running motion.",
      "Keep your hips low and level.",
    ],
    commonMistakes: ["Hips popping up", "Bouncing the hips", "Hands drifting forward"],
  },
  "leg-raises": {
    targetMuscles: ["Lower Abs", "Hip Flexors"],
    formTips: [
      "Lie flat, hands under your lower back for support.",
      "Keep your legs straight or slightly bent.",
      "Raise your legs to about 90 degrees.",
      "Lower slowly, stopping before your heels touch the floor.",
    ],
    commonMistakes: ["Lower back arching off the floor", "Dropping the legs fast", "Using momentum"],
  },
  "russian-twists": {
    targetMuscles: ["Obliques", "Abs", "Core"],
    formTips: [
      "Sit and lean back slightly, feet off the floor or heels down.",
      "Clasp your hands or hold a weight at your chest.",
      "Rotate your torso to one side, then the other.",
      "Move from your waist, not just your arms.",
    ],
    commonMistakes: ["Rotating with the arms only", "Rounding the back", "Rushing each twist"],
  },
  "v-ups": {
    targetMuscles: ["Upper Abs", "Lower Abs", "Core"],
    formTips: [
      "Lie flat with arms overhead and legs straight.",
      "Lift your legs and upper body at the same time.",
      "Reach your hands toward your toes, forming a V.",
      "Lower with control, do not crash down.",
    ],
    commonMistakes: ["Bending the knees to cheat", "Crashing onto the mat", "Straining the neck"],
  },
  "bird-dog": {
    targetMuscles: ["Core", "Lower Back", "Glutes", "Balance"],
    formTips: [
      "Start on all fours, hands under shoulders.",
      "Extend one arm forward and the opposite leg back.",
      "Keep your hips level and back flat.",
      "Return slowly and switch sides.",
    ],
    commonMistakes: ["Arching or rounding the back", "Hips tilting", "Rushing the reps"],
  },
  "db-russian-twists": {
    targetMuscles: ["Obliques", "Abs", "Core"],
    formTips: [
      "Sit leaning back slightly, holding one dumbbell at your chest.",
      "Lift your feet or keep your heels lightly down.",
      "Rotate the weight to one side, then the other.",
      "Keep the movement controlled and led by your waist.",
    ],
    commonMistakes: ["Using only the arms", "Rounding the back", "Going too fast for the weight"],
  },

  // ── Stretches / recovery ────────────────────────────────────────────────
  "child-pose": {
    targetMuscles: ["Lower Back", "Hips", "Shoulders"],
    formTips: [
      "Kneel and sit your hips back toward your heels.",
      "Reach your arms forward and rest your forehead down.",
      "Breathe slowly and let your back relax.",
      "Hold and sink a little deeper with each exhale.",
    ],
    commonMistakes: ["Holding tension in the shoulders", "Holding your breath", "Forcing the stretch"],
  },
  "cat-cow": {
    targetMuscles: ["Spine", "Core", "Lower Back"],
    formTips: [
      "Start on all fours, hands under shoulders.",
      "Inhale, drop your belly and lift your chest (cow).",
      "Exhale, round your back and tuck your chin (cat).",
      "Move slowly with your breath.",
    ],
    commonMistakes: ["Moving too fast", "Forcing the range", "Holding your breath"],
  },
  "standing-quad-stretch": {
    targetMuscles: ["Quads", "Hip Flexors"],
    formTips: [
      "Stand tall, holding a wall or chair for balance.",
      "Bend one knee and hold your foot behind you.",
      "Keep your knees close together and hips forward.",
      "Hold, then switch sides.",
    ],
    commonMistakes: ["Arching the lower back", "Pulling the knee out to the side", "Bouncing"],
  },
  "seated-forward-fold": {
    targetMuscles: ["Hamstrings", "Lower Back"],
    formTips: [
      "Sit with your legs straight out in front.",
      "Hinge at your hips and reach toward your feet.",
      "Keep your back as long as possible.",
      "Hold and breathe, easing deeper gently.",
    ],
    commonMistakes: ["Rounding hard at the back", "Bouncing into the stretch", "Forcing past tension"],
  },
  "arm-swings": {
    targetMuscles: ["Shoulders", "Chest", "Upper Back"],
    formTips: [
      "Stand tall and swing both arms across your chest.",
      "Then swing them back open wide.",
      "Keep the movement smooth and controlled.",
      "Gradually increase the range as you warm up.",
    ],
    commonMistakes: ["Swinging too hard too soon", "Shrugging the shoulders", "Holding your breath"],
  },
  "hip-circles": {
    targetMuscles: ["Hips", "Lower Back", "Core"],
    formTips: [
      "Stand with hands on your hips, feet hip-width.",
      "Circle your hips slowly in one direction.",
      "Then reverse the direction.",
      "Keep your upper body fairly still.",
    ],
    commonMistakes: ["Moving too fast", "Leaning the torso a lot", "Small stiff circles"],
  },
  "torso-twists": {
    targetMuscles: ["Obliques", "Spine", "Core"],
    formTips: [
      "Stand with feet shoulder-width, arms relaxed.",
      "Gently rotate your torso side to side.",
      "Let your arms swing naturally with the twist.",
      "Keep your hips facing forward.",
    ],
    commonMistakes: ["Twisting too hard", "Locking the knees", "Holding your breath"],
  },
  "shoulder-rolls": {
    targetMuscles: ["Shoulders", "Upper Back", "Neck"],
    formTips: [
      "Stand tall with arms relaxed.",
      "Roll your shoulders up, back, and down in a circle.",
      "Repeat, then reverse the direction.",
      "Keep the motion slow and smooth.",
    ],
    commonMistakes: ["Tensing the neck", "Rushing", "Tiny circles"],
  },
  "cobra-stretch": {
    targetMuscles: ["Abs", "Chest", "Lower Back"],
    formTips: [
      "Lie face down with hands under your shoulders.",
      "Gently press up, lifting your chest.",
      "Keep your hips on the floor and elbows soft.",
      "Breathe and feel a gentle stretch through your front.",
    ],
    commonMistakes: ["Cranking the neck back", "Pushing up too high too soon", "Shrugging the shoulders"],
  },
  "butterfly-stretch": {
    targetMuscles: ["Inner Thighs", "Hips"],
    formTips: [
      "Sit with the soles of your feet together.",
      "Hold your feet and sit up tall.",
      "Let your knees relax down toward the floor.",
      "Hinge gently forward for a deeper stretch.",
    ],
    commonMistakes: ["Rounding the back hard", "Pushing the knees down forcefully", "Bouncing"],
  },
  "pigeon-pose": {
    targetMuscles: ["Glutes", "Hips", "Hip Flexors"],
    formTips: [
      "Bring one shin forward across your mat, back leg extended.",
      "Keep your hips square to the floor.",
      "Sit tall, then fold forward gently if comfortable.",
      "Breathe and hold, then switch sides.",
    ],
    commonMistakes: ["Letting the hips twist", "Forcing the front knee", "Holding your breath"],
  },
  "hip-flexor-stretch": {
    targetMuscles: ["Hip Flexors", "Quads"],
    formTips: [
      "Kneel on one knee with the other foot in front.",
      "Tuck your pelvis and gently push your hips forward.",
      "Keep your torso upright.",
      "Hold, then switch sides.",
    ],
    commonMistakes: ["Arching the lower back", "Front knee past the toes", "Leaning forward"],
  },
  "side-lunge-stretch": {
    targetMuscles: ["Inner Thighs", "Hips", "Hamstrings"],
    formTips: [
      "Stand wide and shift your weight to one bent leg.",
      "Keep the other leg straight, foot flat.",
      "Push your hips back and feel the inner-thigh stretch.",
      "Hold, then shift to the other side.",
    ],
    commonMistakes: ["Letting the bent knee cave in", "Rounding the back", "Heel of the straight leg lifting"],
  },
};
