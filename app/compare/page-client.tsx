"use client";

import { useEffect, useRef, useState } from "react";
import { Search } from "lucide-react";
import { BestDealCard } from "@/components/BestDealCard";
import { OfferComparisonTable } from "@/components/OfferComparisonTable";
import { WarningBox } from "@/components/WarningBox";
import { LoadingState } from "@/components/LoadingState";
import { ErrorState } from "@/components/ErrorState";
import { RestaurantSearchCombobox } from "@/components/RestaurantSearchCombobox";
import { BillAmountInput } from "@/components/BillAmountInput";
import { DateTimeSelector } from "@/components/DateTimeSelector";
import { PeopleSelector } from "@/components/PeopleSelector";
import { Button } from "@/components/ui/Button";
import type { CompareResult } from "@/types/comparison";
import type { Restaurant } from "@/types/restaurant";
import { formatINR } from "@/lib/money";
import { normalizeSearchText } from "@/lib/search";

type ApiResult = CompareResult & { restaurant: Restaurant };
type InitialParams = {
  restaurant_id?: string;
  bill_amount?: string;
  date?: string;
  time?: string;
  people_count?: string;
};

function today() {
  return new Date().toISOString().slice(0, 10);
}

export function ComparePageClient({ initialParams }: { initialParams: InitialParams }) {
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [restaurantId, setRestaurantId] = useState(initialParams.restaurant_id || "");
  const [restaurantQuery, setRestaurantQuery] = useState("");
  const [restaurantResults, setRestaurantResults] = useState<Restaurant[]>([]);
  const [billAmount, setBillAmount] = useState(Number(initialParams.bill_amount || 3000));
  const [date, setDate] = useState(initialParams.date || today());
  const [time, setTime] = useState(initialParams.time || "20:30");
  const [people, setPeople] = useState(Number(initialParams.people_count || 2));
  const [data, setData] = useState<ApiResult | null>(null);
  const [error, setError] = useState("");
  const [validationError, setValidationError] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(Boolean(initialParams.restaurant_id));
  const resultsRef = useRef<HTMLDivElement | null>(null);

  async function runCompare(nextRestaurantId = restaurantId) {
    setError("");
    setValidationError("");
    setData(null);
    setHasSubmitted(true);

    if (!nextRestaurantId) {
      setValidationError("Please select a restaurant from the suggestions.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          restaurant_id: nextRestaurantId,
          bill_amount: billAmount,
          date,
          time,
          people_count: people
        })
      });
      if (!response.ok) throw new Error("Could not compare offers");
      setData(await response.json());
      window.setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not compare offers");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (initialParams.restaurant_id) {
      void runCompare(initialParams.restaurant_id);
    }
    // Run once for deep-linked comparison URLs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function submit(event: React.FormEvent) {
    event.preventDefault();
    let nextRestaurantId = restaurantId;
    if (!nextRestaurantId && restaurantQuery.trim()) {
      const normalized = normalizeSearchText(restaurantQuery);
      const exact = restaurantResults.find((item) => {
        const name = normalizeSearchText(item.name);
        const nameArea = normalizeSearchText(`${item.name} ${item.area}`);
        const commaNameArea = normalizeSearchText(`${item.name}, ${item.area}`);
        return normalized === name || normalized === nameArea || normalized === commaNameArea;
      });
      if (exact) {
        setSelectedRestaurant(exact);
        setRestaurantId(exact.id);
        nextRestaurantId = exact.id;
      }
    }
    void runCompare(nextRestaurantId);
  }

  return (
    <section className="mx-auto max-w-7xl space-y-3 px-3 pb-3 pt-4 md:grid md:grid-cols-[0.9fr_1.1fr] md:gap-6 md:space-y-0 md:px-4 md:py-8">
      <div className="md:pt-4">
        <div className="mb-2 inline-flex rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-leaf shadow-sm md:text-sm">BestDiningDeal for Mumbai</div>
        <h1 className="max-w-sm text-3xl font-semibold leading-tight md:max-w-xl md:text-5xl">Find the Best Dining Deal</h1>
        <p className="mt-2 max-w-xl text-sm text-ink/70 md:mt-4 md:text-lg">Compare real savings across EazyDiner, Dineout, District and more.</p>
        <p className="mt-3 hidden text-sm font-medium text-leaf md:block">Actual savings after caps, timing rules and cashback separation.</p>
      </div>

      <form onSubmit={submit} className="rounded-2xl border border-ink/10 bg-white p-3 shadow-soft md:p-5">
        <div className="grid gap-4 md:grid-cols-[1.7fr_1fr_1.2fr_.7fr_auto] md:items-end">
          <div>
            <span className="mb-1 block text-sm font-medium">Restaurant</span>
            {selectedRestaurant ? (
              <button
                className="min-h-11 w-full rounded-lg border border-ink/15 bg-cream px-3 text-left text-sm"
                type="button"
                onClick={() => {
                  setSelectedRestaurant(null);
                  setRestaurantId("");
                  setData(null);
                }}
              >
                {selectedRestaurant.name}, {selectedRestaurant.area}
              </button>
            ) : (
              <RestaurantSearchCombobox
                selectedRestaurant={selectedRestaurant}
                onSelect={(restaurant) => {
                  setSelectedRestaurant(restaurant);
                  setRestaurantId(restaurant?.id || "");
                  setValidationError("");
                }}
                onQueryChange={setRestaurantQuery}
                onResultsChange={setRestaurantResults}
              />
            )}
            {validationError ? <p className="mt-2 text-sm text-red-700">{validationError}</p> : null}
          </div>
          <BillAmountInput value={billAmount} onChange={setBillAmount} />
          <DateTimeSelector date={date} time={time} onDate={setDate} onTime={setTime} />
          <PeopleSelector value={people} onChange={setPeople} />
          <Button type="submit" disabled={loading} className="w-full"><Search size={18} /> {loading ? "Comparing..." : "Find Best Deal"}</Button>
        </div>
        <p className="mt-3 text-xs text-ink/55">Estimated savings only. Verify on the platform before booking.</p>
      </form>

      <div ref={resultsRef} className="md:col-span-2">
        {loading ? <LoadingState label="Calculating actual savings" /> : null}
        {error ? <ErrorState message={error} /> : null}
        {hasSubmitted && !loading && !error && !data ? (
          <div className="rounded-lg border border-ink/10 bg-white p-4 text-sm text-ink/65">Select a restaurant from the suggestions, then compare deals.</div>
        ) : null}
      </div>

      {data ? (
        <section className="space-y-5 md:col-span-2">
          <div>
            <h2 className="text-2xl font-semibold">Offer comparison for {data.restaurant.name}</h2>
            <p className="mt-2 text-ink/65">
              {data.restaurant.area} - Bill {formatINR(data.input_summary.bill_amount)} - {data.input_summary.day} - {data.input_summary.time} - {data.input_summary.meal_type} - {data.input_summary.people_count} people
            </p>
          </div>
          <BestDealCard deal={data.best_instant_deal} billAmount={data.input_summary.bill_amount} />
          {data.best_cashback_deal ? (
            <div className="rounded-lg border border-ink/10 bg-white p-4 text-sm">
              Best cashback: <strong>{data.best_cashback_deal.platform_name}</strong> gives cashback value {formatINR(data.best_cashback_deal.cashback_value)}. Cashback is not deducted from final payable.
            </div>
          ) : null}
          <WarningBox warnings={data.warnings} />
          {data.invalid_offers.length ? (
            <div className="rounded-lg border border-ink/10 bg-white p-4">
              <h3 className="font-semibold">Invalid Offers</h3>
              <div className="mt-3 space-y-2 text-sm text-ink/70">
                {data.invalid_offers.map((item) => (
                  <div key={item.offer.id} className="rounded-lg bg-cream p-3">
                    <strong>{item.platform_name}:</strong> {item.invalid_reasons.join(", ") || item.status}
                  </div>
                ))}
              </div>
            </div>
          ) : null}
          <OfferComparisonTable offers={data.all_offers_ranked} />
          <p className="text-sm text-ink/60">{data.disclaimer}</p>
          <p className="text-sm text-ink/60">{data.calculation_explanation}</p>
        </section>
      ) : null}
    </section>
  );
}

