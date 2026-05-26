import type { Restaurant } from "@/types/restaurant";

export type RestaurantSearchResult = Restaurant & {
  match_score: number;
  match_reason: string;
  aliases?: string[];
};

const typoAliases: Record<string, string> = {
  powi: "powai",
  powei: "powai",
  "bandra-kurla": "bandra kurla complex",
  yauatch: "yauatcha",
  bastain: "bastian",
  andheriwest: "andheri",
  dineout: "dine out"
};

export function normalizeSearchText(input: string) {
  const cleaned = input
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return cleaned
    .split(" ")
    .map((part) => typoAliases[part] || part)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

function trigrams(value: string) {
  const normalized = `  ${value} `;
  const grams = new Set<string>();
  for (let i = 0; i < normalized.length - 2; i += 1) grams.add(normalized.slice(i, i + 3));
  return grams;
}

export function trigramSimilarity(a: string, b: string) {
  const aGrams = trigrams(normalizeSearchText(a));
  const bGrams = trigrams(normalizeSearchText(b));
  if (!aGrams.size || !bGrams.size) return 0;
  let hits = 0;
  bGrams.forEach((gram) => {
    if (aGrams.has(gram)) hits += 1;
  });
  return (2 * hits) / (aGrams.size + bGrams.size);
}

function includesAllTerms(haystack: string, terms: string[]) {
  return terms.every((term) => haystack.includes(term) || trigramSimilarity(haystack, term) > 0.42);
}

function searchableArea(area: string) {
  const normalized = normalizeSearchText(area);
  if (normalized === "bkc") return "bkc bandra kurla complex";
  return normalized;
}

export function scoreRestaurantSearch(restaurant: Restaurant, rawQuery: string) {
  const query = normalizeSearchText(rawQuery);
  const name = normalizeSearchText(restaurant.name);
  const canonicalName = normalizeSearchText(restaurant.canonical_name || restaurant.name);
  const area = searchableArea(restaurant.area);
  const cuisine = normalizeSearchText(restaurant.cuisine.join(" "));
  const aliases = Array.isArray((restaurant as RestaurantSearchResult).aliases)
    ? (restaurant as RestaurantSearchResult).aliases!.map(normalizeSearchText)
    : [];
  const combined = normalizeSearchText(`${restaurant.name} ${restaurant.area}`);
  const full = normalizeSearchText(`${restaurant.name} ${restaurant.canonical_name || ""} ${aliases.join(" ")} ${restaurant.area} ${restaurant.cuisine.join(" ")}`);
  const terms = query.split(" ").filter(Boolean);
  const ratingBoost = Number(restaurant.rating ?? 0) * 2;
  let score = 0;
  let reason = "";

  if (!query) return { score: 0, reason: "empty" };
  if (canonicalName === query || name === query) return { score: 100 + ratingBoost, reason: "exact canonical name match" };
  if (aliases.some((alias) => alias === query)) return { score: 95 + ratingBoost, reason: "alias exact match" };
  if (name.startsWith(query)) return { score: 80 + ratingBoost, reason: "name starts with query" };
  if (name.includes(query)) return { score: 60 + ratingBoost, reason: "name includes query" };
  if (combined.includes(query)) return { score: 55 + ratingBoost, reason: "restaurant and area match" };
  if (area === query) return { score: 45 + ratingBoost, reason: "area exact match" };
  if (area.includes(query)) return { score: 35 + ratingBoost, reason: "area match" };
  if (cuisine.includes(query)) return { score: 25 + ratingBoost, reason: "cuisine match" };

  if (terms.length > 1 && includesAllTerms(full, terms)) {
    const areaTermHit = terms.some((term) => area.includes(term) || trigramSimilarity(area, term) > 0.5);
    const nameTermHit = terms.some((term) => name.includes(term) || trigramSimilarity(name, term) > 0.5);
    score = (areaTermHit && nameTermHit ? 62 : 48) + ratingBoost;
    reason = areaTermHit && nameTermHit ? "restaurant and area terms match" : "all search terms match";
  }

  const fuzzyTargets = [combined, name, area, cuisine, full];
  const fuzzy = Math.max(...fuzzyTargets.map((target) => trigramSimilarity(target, query)));
  const fuzzyScore = fuzzy * 30;
  if (fuzzyScore > score) {
    score = fuzzyScore + ratingBoost;
    reason = "fuzzy match";
  }

  if (score === 0) {
    const partialTermHits = terms.filter((term) => full.includes(term)).length;
    if (partialTermHits) {
      score = partialTermHits * 14 + ratingBoost;
      reason = "partial term match";
    }
  }

  return { score, reason };
}

export function searchRestaurantsLocal(restaurants: Restaurant[], q: string, limit = 10): RestaurantSearchResult[] {
  const query = normalizeSearchText(q);
  if (!query) return [];

  return restaurants
    .map((restaurant) => {
      const { score, reason } = scoreRestaurantSearch(restaurant, query);
      return {
        ...restaurant,
        match_score: Math.round(score * 100) / 100,
        match_reason: reason
      };
    })
    .filter((restaurant) => restaurant.match_score > 8)
    .sort((a, b) => b.match_score - a.match_score || Number(b.rating ?? 0) - Number(a.rating ?? 0) || a.name.localeCompare(b.name))
    .slice(0, limit);
}

export function fuzzySearchRestaurants(restaurants: Restaurant[], q: string, limit = 10) {
  return searchRestaurantsLocal(restaurants, q, limit);
}
