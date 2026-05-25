import type { Restaurant } from "@/types/restaurant";

function scoreRestaurant(restaurant: Restaurant, q: string) {
  const query = q.toLowerCase().trim();
  const haystack = [restaurant.name, restaurant.area, restaurant.cuisine.join(" ")].join(" ").toLowerCase();
  if (!query) return 1;
  if (haystack.includes(query)) return 100;
  const parts = query.split(/\s+/);
  return parts.reduce((score, part) => score + (haystack.includes(part) ? 25 : similarity(haystack, part) * 10), 0);
}

function similarity(text: string, needle: string) {
  const grams = new Set<string>();
  for (let i = 0; i < text.length - 2; i += 1) grams.add(text.slice(i, i + 3));
  let hits = 0;
  for (let i = 0; i < needle.length - 2; i += 1) {
    if (grams.has(needle.slice(i, i + 3))) hits += 1;
  }
  return hits / Math.max(1, needle.length - 2);
}

export function fuzzySearchRestaurants(restaurants: Restaurant[], q: string, limit = 10) {
  return restaurants
    .map((restaurant) => ({ restaurant, score: scoreRestaurant(restaurant, q) }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || a.restaurant.name.localeCompare(b.restaurant.name))
    .slice(0, limit)
    .map((item) => item.restaurant);
}
