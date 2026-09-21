// Emoji shown next to each predefined meal slot. Shared by the meal placeholder
// (MealAnchor) and the meal badge on a filled-in eatery card so the two always
// present the same icon for a given slot.
const MEAL_EMOJI: Record<string, string> = {
  Breakfast: "🥐",
  Lunch: "🥗",
  Dinner: "🍷",
};

export function mealEmoji(title: string): string {
  return MEAL_EMOJI[title] ?? "🍽";
}
