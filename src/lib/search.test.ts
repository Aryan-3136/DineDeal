import { describe, expect, it } from "vitest";
import { restaurants } from "@/data/sample-restaurants";
import { normalizeSearchText, searchRestaurantsLocal } from "./search";
import type { Restaurant } from "@/types/restaurant";

describe("restaurant search ranking", () => {
  it("normalizes case, punctuation and extra spaces", () => {
    expect(normalizeSearchText("  Foo,   POWI!! ")).toBe("foo powai");
  });

  it("returns Foo Powai first for foo", () => {
    const results = searchRestaurantsLocal(restaurants, "foo", 10);
    expect(results[0]?.name).toBe("Foo");
    expect(results[0]?.area).toBe("Powai");
  });

  it("returns Foo Powai first for typo restaurant plus area", () => {
    const results = searchRestaurantsLocal(restaurants, "foo powi", 10);
    expect(results[0]?.name).toBe("Foo");
    expect(results[0]?.area).toBe("Powai");
  });

  it("returns BKC restaurants for bkc", () => {
    const results = searchRestaurantsLocal(restaurants, "bkc", 10);
    expect(results.length).toBeGreaterThan(0);
    expect(results.slice(0, 5).some((restaurant) => restaurant.area === "BKC")).toBe(true);
  });

  it("prioritizes Chinese restaurants in Andheri for andheri chinese", () => {
    const results = searchRestaurantsLocal(restaurants, "andheri chinese", 10);
    expect(results[0]?.area).toBe("Andheri");
    expect(results[0]?.cuisine.join(" ").toLowerCase()).toContain("chinese");
  });

  it("finds Global Fusion Andheri", () => {
    const results = searchRestaurantsLocal(restaurants, "global fusion", 10);
    expect(results[0]?.name).toBe("Global Fusion");
    expect(results[0]?.area).toBe("Andheri");
  });

  it("finds Yauatcha BKC", () => {
    const results = searchRestaurantsLocal(restaurants, "yauatcha", 10);
    expect(results[0]?.name).toBe("Yauatcha");
    expect(results[0]?.area).toBe("BKC");
  });

  it("finds Masala Library BKC for restaurant plus area", () => {
    const results = searchRestaurantsLocal(restaurants, "masala bkc", 10);
    expect(results[0]?.name).toBe("Masala Library");
    expect(results[0]?.area).toBe("BKC");
  });

  it("lets exact name beat area or cuisine matches", () => {
    const custom: Restaurant[] = [
      { ...restaurants[0], id: "exact", name: "Powai", area: "Bandra", cuisine: ["Italian"], rating: 3.5 },
      { ...restaurants[1], id: "area", name: "Some Cafe", area: "Powai", cuisine: ["Cafe"], rating: 5 }
    ];
    const results = searchRestaurantsLocal(custom, "powai", 10);
    expect(results[0]?.id).toBe("exact");
    expect(results[0]?.match_reason).toContain("exact");
  });
});
