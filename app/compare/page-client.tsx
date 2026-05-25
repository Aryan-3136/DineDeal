"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { BestDealCard } from "@/components/BestDealCard";
import { OfferComparisonTable } from "@/components/OfferComparisonTable";
import { WarningBox } from "@/components/WarningBox";
import { LoadingState } from "@/components/LoadingState";
import { ErrorState } from "@/components/ErrorState";
import type { CompareResult } from "@/types/comparison";
import type { Restaurant } from "@/types/restaurant";
import { formatINR } from "@/lib/money";

type ApiResult = CompareResult & { restaurant: Restaurant };

export function ComparePageClient() {
  const params = useSearchParams();
  const [data, setData] = useState<ApiResult | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const payload = {
      restaurant_id: params.get("restaurant_id") || "",
      bill_amount: Number(params.get("bill_amount") || 3000),
      date: params.get("date") || new Date().toISOString().slice(0, 10),
      time: params.get("time") || "20:30",
      people_count: Number(params.get("people_count") || 2)
    };
    fetch("/api/compare", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
      .then((res) => res.ok ? res.json() : Promise.reject(new Error("Could not compare offers")))
      .then(setData)
      .catch((err) => setError(err.message));
  }, [params]);

  if (error) return <main className="mx-auto max-w-7xl px-4 py-8"><ErrorState message={error} /></main>;
  if (!data) return <main className="mx-auto max-w-7xl px-4 py-8"><LoadingState label="Calculating actual savings" /></main>;

  return (
    <main className="mx-auto max-w-7xl space-y-6 px-4 py-8">
      <section>
        <h1 className="text-3xl font-semibold">Offer comparison for {data.restaurant.name}</h1>
        <p className="mt-2 text-ink/65">
          {data.restaurant.area} · Bill {formatINR(data.input_summary.bill_amount)} · {data.input_summary.day} · {data.input_summary.time} · {data.input_summary.meal_type} · {data.input_summary.people_count} people
        </p>
      </section>
      <BestDealCard deal={data.best_instant_deal} billAmount={data.input_summary.bill_amount} />
      {data.best_cashback_deal ? (
        <div className="rounded-lg border border-ink/10 bg-white p-4 text-sm">
          Best cashback: <strong>{data.best_cashback_deal.platform_name}</strong> gives cashback value {formatINR(data.best_cashback_deal.cashback_value)}. Cashback is not deducted from final payable.
        </div>
      ) : null}
      <WarningBox warnings={data.warnings} />
      <OfferComparisonTable offers={data.all_offers_ranked} />
      <p className="text-sm text-ink/60">{data.calculation_explanation}</p>
    </main>
  );
}
