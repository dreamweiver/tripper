import type { EventKind } from "./types.js";

export interface TimelineEvent {
  id: string;
  tripId: string;
  dayIndex: number;
  order: number;
  kind: EventKind;
  title: string;
  nameEn?: string; // English equivalent of a local-language place name, when known
  mealSlot?: string; // predefined meal this stop fills (Breakfast/Lunch/Dinner), if any
  time?: string;
  lat?: number;
  lon?: number;
  address?: string;
  category?: string;
  description?: string;
  openHours?: string;
  imageUrl?: string;
  notes: string[];
}

interface MealSeed {
  title: string;
  time: string;
}

const MEAL_SEEDS: MealSeed[] = [
  { title: "Breakfast", time: "08:00" },
  { title: "Lunch", time: "12:30" },
  { title: "Dinner", time: "20:30" },
];

// The titles of the auto-seeded meal anchors. Used to tell a predefined slot
// (Breakfast/Lunch/Dinner) apart from a manually added anchor (e.g. "Brunch"),
// so only predefined slots surface a meal badge once filled with an eatery.
export const PREDEFINED_MEAL_TITLES: readonly string[] = MEAL_SEEDS.map((s) => s.title);

export function isPredefinedMeal(title: string | undefined): boolean {
  return title !== undefined && PREDEFINED_MEAL_TITLES.includes(title);
}

export function seedMeals(tripId: string, dayIndex: number): TimelineEvent[] {
  return MEAL_SEEDS.map((seed, i) => ({
    id: crypto.randomUUID(),
    tripId,
    dayIndex,
    order: i,
    kind: "meal",
    title: seed.title,
    time: seed.time,
    notes: [],
  }));
}

export function insertOrder(before?: number, after?: number): number {
  if (before !== undefined && after !== undefined) return (before + after) / 2;
  if (before !== undefined) return before + 1;
  if (after !== undefined) return after - 1;
  return 0;
}

export function isOutOfOrder(prevTime?: string, time?: string): boolean {
  if (prevTime === undefined || time === undefined) return false;
  return time < prevTime; // lexical HH:MM compare is valid for 24h zero-padded times
}
