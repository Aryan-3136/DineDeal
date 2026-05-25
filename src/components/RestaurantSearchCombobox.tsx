"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { Input } from "./ui/Input";
import type { Restaurant } from "@/types/restaurant";

export function RestaurantSearchCombobox({ onSelect }: { onSelect?: (restaurant: Restaurant) => void }) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<Restaurant[]>([]);

  useEffect(() => {
    const controller = new AbortController();
    if (!q.trim()) {
      setResults([]);
      return;
    }
    fetch(`/api/restaurants/search?q=${encodeURIComponent(q)}`, { signal: controller.signal })
      .then((res) => res.json())
      .then((data) => setResults(data.restaurants || []))
      .catch(() => undefined);
    return () => controller.abort();
  }, [q]);

  return (
    <div className="relative">
      <Search className="pointer-events-none absolute left-3 top-3 text-ink/45" size={18} />
      <Input value={q} onChange={(event) => setQ(event.target.value)} placeholder="Search restaurant in Mumbai" className="pl-10" />
      {results.length > 0 ? (
        <div className="absolute z-30 mt-2 max-h-96 w-full overflow-auto rounded-lg border border-ink/10 bg-white shadow-soft">
          {results.map((restaurant) => {
            const content = (
              <>
                <div className="font-medium">{restaurant.name}, {restaurant.area}</div>
                <div className="text-sm text-ink/60">{restaurant.cuisine.join(", ")} · approx {restaurant.approx_cost_for_two}</div>
              </>
            );
            return onSelect ? (
              <button
                key={restaurant.id}
                type="button"
                onClick={() => {
                  onSelect(restaurant);
                  setQ(`${restaurant.name}, ${restaurant.area}`);
                  setResults([]);
                }}
                className="block w-full border-b border-ink/5 px-4 py-3 text-left hover:bg-cream"
              >
                {content}
              </button>
            ) : (
              <Link key={restaurant.id} href={`/restaurant/${restaurant.slug}`} className="block border-b border-ink/5 px-4 py-3 hover:bg-cream">
                {content}
              </Link>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
