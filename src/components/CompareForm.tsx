"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Button } from "./ui/Button";
import { BillAmountInput } from "./BillAmountInput";
import { DateTimeSelector } from "./DateTimeSelector";
import { PeopleSelector } from "./PeopleSelector";
import { RestaurantSearchCombobox } from "./RestaurantSearchCombobox";
import type { Restaurant } from "@/types/restaurant";

export function CompareForm({ compact = false, restaurant }: { compact?: boolean; restaurant?: Restaurant }) {
  const router = useRouter();
  const today = new Date().toISOString().slice(0, 10);
  const [selected, setSelected] = useState<Restaurant | undefined>(restaurant);
  const [billAmount, setBillAmount] = useState(3000);
  const [date, setDate] = useState(today);
  const [time, setTime] = useState("20:30");
  const [people, setPeople] = useState(2);
  const [error, setError] = useState("");

  function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!selected) {
      setError("Select a restaurant from search first.");
      return;
    }
    if (billAmount <= 0 || people <= 0) {
      setError("Enter a valid bill amount and people count.");
      return;
    }
    const params = new URLSearchParams({
      restaurant_id: selected.id,
      slug: selected.slug,
      bill_amount: String(billAmount),
      date,
      time,
      people_count: String(people)
    });
    router.push(`/compare?${params.toString()}`);
  }

  return (
    <form onSubmit={submit} className={`rounded-lg border border-ink/10 bg-white p-4 shadow-soft ${compact ? "" : "md:p-5"}`}>
      <div className="grid gap-4 md:grid-cols-[1.7fr_1fr_1.2fr_.7fr_auto] md:items-end">
        {restaurant ? (
          <div>
            <span className="mb-1 block text-sm font-medium">Restaurant</span>
            <div className="min-h-11 rounded-lg border border-ink/15 bg-cream px-3 py-3 text-sm">{restaurant.name}, {restaurant.area}</div>
          </div>
        ) : (
          <div>
            <span className="mb-1 block text-sm font-medium">Restaurant</span>
            <RestaurantSearchCombobox onSelect={setSelected} />
          </div>
        )}
        <BillAmountInput value={billAmount} onChange={setBillAmount} />
        <DateTimeSelector date={date} time={time} onDate={setDate} onTime={setTime} />
        <PeopleSelector value={people} onChange={setPeople} />
        <Button type="submit"><Search size={18} /> Find Best Deal</Button>
      </div>
      {error ? <p className="mt-3 text-sm text-red-700">{error}</p> : null}
    </form>
  );
}
