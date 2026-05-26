"use client";

import { useState } from "react";
import Link from "next/link";
import { BadgePercent, Landmark, Loader2, WalletCards } from "lucide-react";
import { EmptyState } from "./EmptyState";
import { ErrorState } from "./ErrorState";
import { LastCheckedBadge } from "./LastCheckedBadge";
import { VerificationStatusBadge } from "./VerificationStatusBadge";
import { formatINR } from "@/lib/money";
import type { Offer } from "@/types/offer";
import type { Restaurant } from "@/types/restaurant";

type Filter = { label: string; type: "percent" | "flat" | "cashback" | "bank"; min?: number };
type Result = {
  restaurant: Restaurant;
  offer: Offer;
  platform: string;
  estimated_saving_for_3000_bill: number;
  verification_status: Offer["verification_status"];
  last_checked_at: string | null;
};

const filters: Filter[] = [
  { label: "10% Off", type: "percent", min: 10 },
  { label: "15% Off", type: "percent", min: 15 },
  { label: "20% Off", type: "percent", min: 20 },
  { label: "25% Off", type: "percent", min: 25 },
  { label: "30% Off", type: "percent", min: 30 },
  { label: "40% Off", type: "percent", min: 40 },
  { label: "50% Off", type: "percent", min: 50 },
  { label: "Flat Rs 500+", type: "flat", min: 500 },
  { label: "Cashback Offers", type: "cashback" },
  { label: "Bank Offers", type: "bank" }
];

function queryFor(filter: Filter) {
  const params = new URLSearchParams({ type: filter.type });
  if (filter.min) params.set("min", String(filter.min));
  return params.toString();
}

export function DiscountQuickFilters() {
  const [active, setActive] = useState<Filter>(filters[2]);
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function load(filter: Filter) {
    setActive(filter);
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/offers/filter?${queryFor(filter)}`);
      if (!response.ok) throw new Error("Could not load matching offers");
      const data = await response.json();
      setResults(data.results || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load matching offers");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-5">
        <h2 className="text-2xl font-semibold">Quick Discount Filters</h2>
        <p className="mt-1 text-sm text-ink/65">Find restaurants by offer type using current offer data and estimated savings on a Rs 3000 bill.</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {filters.map((filter) => (
          <button
            key={`${filter.type}-${filter.min ?? filter.label}`}
            type="button"
            onClick={() => void load(filter)}
            className={`inline-flex min-h-11 items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-semibold shadow-sm transition hover:-translate-y-0.5 md:px-4 ${active.label === filter.label ? "border-leaf bg-leaf/10 text-leaf" : "border-ink/10 bg-white text-ink/75"}`}
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-cream text-leaf">
              {filter.type === "bank" ? <Landmark size={18} /> : filter.type === "cashback" ? <WalletCards size={18} /> : <BadgePercent size={18} />}
            </span>
            <span>{filter.label}</span>
          </button>
        ))}
      </div>

      <div className="mt-6">
        {loading ? <div className="rounded-lg border border-ink/10 bg-white p-5 text-sm text-ink/65"><Loader2 className="mr-2 inline animate-spin" size={16} />Loading matching offers...</div> : null}
        {error ? <ErrorState message={error} /> : null}
        {!loading && !error && !results.length ? (
          <EmptyState title="Pick a filter to see matching restaurants" body="Results use active offer data and sort by estimated savings, verification, freshness and rating." />
        ) : null}
        {results.length ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {results.map((item) => (
              <div key={`${item.restaurant.id}-${item.offer.id}`} className="rounded-lg border border-ink/10 bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold">{item.restaurant.name}</h3>
                    <p className="text-sm text-ink/60">{item.restaurant.area} - {item.restaurant.cuisine.join(", ")}</p>
                  </div>
                  <VerificationStatusBadge status={item.verification_status} />
                </div>
                <p className="mt-3 text-sm font-medium">{item.offer.offer_text}</p>
                <p className="mt-1 text-sm text-ink/65">{item.platform} - cap {item.offer.maximum_discount_cap ? formatINR(item.offer.maximum_discount_cap) : "not listed"}</p>
                <p className="mt-2 text-sm font-semibold text-leaf">Estimated instant saving on Rs 3000: {formatINR(item.estimated_saving_for_3000_bill)}</p>
                <div className="mt-3"><LastCheckedBadge value={item.last_checked_at} /></div>
                <Link className="mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-leaf px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-leaf/90" href={`/compare?restaurant_id=${item.restaurant.id}&slug=${item.restaurant.slug}&bill_amount=3000&date=${new Date().toISOString().slice(0, 10)}&time=20:30&people_count=2`}>
                  Compare This Restaurant
                </Link>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
