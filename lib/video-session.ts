// Module-level flag — resets to false on every fresh app open (JS reload).
// Shared between onboarding.tsx and index.tsx so the video never double-shows.
let _shown = false;

export const videoSession = {
  get shown() {
    return _shown;
  },
  markShown() {
    _shown = true;
  },
};
