/**
 * Web Haptics Utility using HTML5 Vibration API
 */
export const triggerHaptic = (type: "light" | "medium" | "heavy" | "selection" = "light") => {
  if (typeof window !== "undefined" && "navigator" in window && "vibrate" in navigator) {
    try {
      if (type === "light") {
        navigator.vibrate(10);
      } else if (type === "medium") {
        navigator.vibrate(22);
      } else if (type === "heavy") {
        navigator.vibrate([30, 20, 30]);
      } else if (type === "selection") {
        navigator.vibrate(6);
      }
    } catch {
      // Silently ignore if browser blocks vibration without direct user action
    }
  }
};
