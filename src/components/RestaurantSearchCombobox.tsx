"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Loader2, Search, Star, X } from "lucide-react";
import { Input } from "./ui/Input";
import type { Restaurant } from "@/types/restaurant";
import { restaurants as localRestaurants } from "@/data/sample-restaurants";
import { normalizeSearchText, searchRestaurantsLocal, type RestaurantSearchResult } from "@/lib/search";
import { formatINR } from "@/lib/money";

type ApiRestaurant = RestaurantSearchResult & {
  available_platforms?: string[];
  active_offer_count?: number;
  last_checked_at?: string | null;
};

const queryCache = new Map<string, ApiRestaurant[]>();

export function RestaurantSearchCombobox({
  selectedRestaurant,
  onSelect,
  onQueryChange,
  onResultsChange,
  placeholder = "Search restaurant in Mumbai",
  inputId
}: {
  selectedRestaurant?: Restaurant | null;
  onSelect?: (restaurant: Restaurant | null) => void;
  onQueryChange?: (query: string) => void;
  onResultsChange?: (restaurants: Restaurant[]) => void;
  placeholder?: string;
  inputId?: string;
}) {
  const [query, setQuery] = useState(selectedRestaurant ? `${selectedRestaurant.name}, ${selectedRestaurant.area}` : "");
  const [results, setResults] = useState<ApiRestaurant[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const abortRef = useRef<AbortController | null>(null);
  const selectedLabel = useMemo(() => selectedRestaurant ? `${selectedRestaurant.name}, ${selectedRestaurant.area}` : "", [selectedRestaurant]);

  useEffect(() => {
    if (selectedLabel) setQuery(selectedLabel);
  }, [selectedLabel]);

  useEffect(() => {
    onQueryChange?.(query);
    const normalized = normalizeSearchText(query);
    if (!normalized) {
      setResults([]);
      onResultsChange?.([]);
      setLoading(false);
      return;
    }

    const selectedNormalized = selectedRestaurant ? normalizeSearchText(`${selectedRestaurant.name} ${selectedRestaurant.area}`) : "";
    if (selectedNormalized && normalized === selectedNormalized) return;

    const cached = queryCache.get(normalized);
    if (cached) {
      setResults(cached);
      onResultsChange?.(cached);
      setOpen(true);
      return;
    }

    const timeout = window.setTimeout(async () => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      setLoading(true);
      setError("");
      try {
        const response = await fetch(`/api/restaurants/search?q=${encodeURIComponent(query)}&limit=10`, { signal: controller.signal });
        if (!response.ok) throw new Error("Search failed");
        const data = await response.json();
        const next = (data.restaurants || []) as ApiRestaurant[];
        queryCache.set(normalized, next);
        setResults(next);
        onResultsChange?.(next);
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        const fallback = searchRestaurantsLocal(localRestaurants, query, 10) as ApiRestaurant[];
        setResults(fallback);
        onResultsChange?.(fallback);
        setError(fallback.length ? "" : "Search is temporarily unavailable.");
      } finally {
        setLoading(false);
        setOpen(true);
      }
    }, 250);

    return () => {
      window.clearTimeout(timeout);
      abortRef.current?.abort();
    };
  }, [query, onQueryChange, onResultsChange, selectedRestaurant]);

  function choose(restaurant: Restaurant) {
    setQuery(`${restaurant.name}, ${restaurant.area}`);
    setOpen(false);
    setActiveIndex(0);
    onSelect?.(restaurant);
  }

  function clear() {
    setQuery("");
    setResults([]);
    setOpen(false);
    setError("");
    onSelect?.(null);
    onQueryChange?.("");
    onResultsChange?.([]);
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setOpen(true);
      setActiveIndex((index) => Math.min(index + 1, Math.max(results.length - 1, 0)));
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => Math.max(index - 1, 0));
    }
    if (event.key === "Enter" && open && results[activeIndex]) {
      event.preventDefault();
      choose(results[activeIndex]);
    }
    if (event.key === "Escape") setOpen(false);
  }

  return (
    <div className="relative">
      <Search className="pointer-events-none absolute left-3 top-3.5 text-ink/45" size={18} />
      <Input
        id={inputId}
        value={query}
        onChange={(event) => {
          setQuery(event.target.value);
          setOpen(true);
        }}
        onFocus={() => query.trim() && setOpen(true)}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        autoComplete="off"
        className="pl-10 pr-16"
      />
      <div className="absolute right-2 top-2 flex items-center gap-1">
        {loading ? <Loader2 className="animate-spin text-ink/45" size={17} /> : null}
        {query ? (
          <button type="button" aria-label="Clear restaurant search" onMouseDown={(event) => event.preventDefault()} onClick={clear} className="rounded-full p-1 text-ink/45 hover:bg-cream hover:text-ink">
            <X size={15} />
          </button>
        ) : null}
      </div>
      {open && query.trim() ? (
        <div className="absolute left-0 right-0 z-50 mt-2 max-h-[360px] min-w-full overflow-y-auto overflow-x-hidden rounded-xl border border-ink/10 bg-white p-1 shadow-soft md:min-w-[420px]">
          {results.length ? results.map((restaurant, index) => {
            const content = (
              <div className="flex min-w-0 items-start justify-between gap-3 rounded-lg">
                <div className="min-w-0">
                  <div className="truncate font-semibold">{restaurant.name}</div>
                  <div className="truncate text-sm text-ink/60">
                    {restaurant.area} - {restaurant.cuisine.join(", ")}
                  </div>
                  <div className="mt-1 truncate text-xs text-ink/50">
                    {restaurant.approx_cost_for_two ? `${formatINR(restaurant.approx_cost_for_two)} for two` : "Cost not listed"} - {restaurant.active_offer_count ? `${restaurant.active_offer_count} offers available` : "Best deals available"}
                  </div>
                  <div className="mt-1 truncate text-xs text-ink/40">{restaurant.match_reason}</div>
                </div>
                <div className="flex shrink-0 items-center gap-1 rounded-full bg-cream px-2 py-1 text-sm font-semibold text-ink/70"><Star size={14} className="fill-amber text-amber" /> {restaurant.rating ?? "-"}</div>
              </div>
            );
            return onSelect ? (
              <button
                key={restaurant.id}
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => choose(restaurant)}
                onMouseEnter={() => setActiveIndex(index)}
                className={`block w-full rounded-lg px-3 py-3 text-left ${index === activeIndex ? "bg-cream" : "hover:bg-cream"}`}
              >
                {content}
              </button>
            ) : (
              <Link key={restaurant.id} href={`/restaurant/${restaurant.slug}`} className="block rounded-lg px-3 py-3 hover:bg-cream">
                {content}
              </Link>
            );
          }) : (
            <div className="px-4 py-4 text-sm text-ink/60">{loading ? "Searching restaurants..." : error || "No restaurants found"}</div>
          )}
        </div>
      ) : null}
    </div>
  );
}
