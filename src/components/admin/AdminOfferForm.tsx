"use client";

import { useState } from "react";
import { Save } from "lucide-react";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Select } from "../ui/Select";
import type { Offer } from "@/types/offer";
import { platforms, restaurants } from "@/lib/data";

export function AdminOfferForm({ offer }: { offer?: Offer }) {
  const [message, setMessage] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const payload = Object.fromEntries(form.entries());
    const res = await fetch(offer ? `/api/admin/offers/${offer.id}` : "/api/admin/offers", {
      method: offer ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...payload,
        discount_percent: Number(payload.discount_percent || 0),
        flat_discount: Number(payload.flat_discount || 0),
        minimum_bill: Number(payload.minimum_bill || 0),
        maximum_discount_cap: Number(payload.maximum_discount_cap || 0),
        cashback_value: Number(payload.cashback_value || 0),
        membership_required: form.get("membership_required") === "on",
        payment_required: form.get("payment_required") === "on",
        booking_required: form.get("booking_required") === "on",
        active: form.get("active") === "on",
        valid_days: String(form.get("valid_days") || "").split(",").map((item) => item.trim().toLowerCase()).filter(Boolean)
      })
    });
    setMessage(res.ok ? "Offer saved and ready for admin verification workflow." : "Could not save offer.");
  }

  return (
    <form onSubmit={submit} className="grid gap-4 rounded-lg border border-ink/10 bg-white p-5 shadow-soft md:grid-cols-2">
      <Select name="restaurant_id" defaultValue={offer?.restaurant_id}>{restaurants.map((item) => <option key={item.id} value={item.id}>{item.name}, {item.area}</option>)}</Select>
      <Select name="platform_id" defaultValue={offer?.platform_id}>{platforms.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</Select>
      <Input name="offer_text" required placeholder="Offer text" defaultValue={offer?.offer_text} className="md:col-span-2" />
      <Select name="discount_type" defaultValue={offer?.discount_type || "percentage"}><option value="percentage">Percentage</option><option value="flat">Flat</option><option value="cashback">Cashback</option><option value="bogo">BOGO</option><option value="custom">Custom</option></Select>
      <Select name="cashback_or_instant" defaultValue={offer?.cashback_or_instant || "instant"}><option value="instant">Instant</option><option value="cashback">Cashback</option><option value="both">Both</option><option value="unknown">Unknown</option></Select>
      <Input name="discount_percent" type="number" placeholder="Discount percent" defaultValue={offer?.discount_percent ?? ""} />
      <Input name="flat_discount" type="number" placeholder="Flat discount" defaultValue={offer?.flat_discount ?? ""} />
      <Input name="minimum_bill" type="number" placeholder="Minimum bill" defaultValue={offer?.minimum_bill ?? ""} />
      <Input name="maximum_discount_cap" type="number" placeholder="Maximum cap" defaultValue={offer?.maximum_discount_cap ?? ""} />
      <Input name="cashback_value" type="number" placeholder="Cashback value" defaultValue={offer?.cashback_value ?? ""} />
      <Select name="verification_status" defaultValue={offer?.verification_status || "needs_review"}><option value="verified">Verified</option><option value="needs_review">Needs review</option><option value="uncertain">Uncertain</option><option value="expired">Expired</option></Select>
      <Input name="valid_days" placeholder="monday,tuesday..." defaultValue={offer?.valid_days?.join(",") ?? "monday,tuesday,wednesday,thursday,friday,saturday,sunday"} />
      <Select name="meal_type" defaultValue={offer?.meal_type || "all_day"}><option value="all_day">All day</option><option value="lunch">Lunch</option><option value="dinner">Dinner</option><option value="unknown">Unknown</option></Select>
      <Input name="valid_start_time" type="time" defaultValue={offer?.valid_start_time ?? "11:00"} />
      <Input name="valid_end_time" type="time" defaultValue={offer?.valid_end_time ?? "23:30"} />
      <Input name="valid_from" type="date" defaultValue={offer?.valid_from ?? "2026-01-01"} />
      <Input name="valid_until" type="date" defaultValue={offer?.valid_until ?? "2026-12-31"} />
      <Input name="payment_text" placeholder="Payment condition" defaultValue={offer?.payment_text ?? ""} />
      <Input name="membership_text" placeholder="Membership condition" defaultValue={offer?.membership_text ?? ""} />
      <Input name="source_url" placeholder="Source URL" defaultValue={offer?.source_url ?? ""} />
      <Input name="offer_url" placeholder="Offer URL" defaultValue={offer?.offer_url ?? ""} />
      <Input name="terms_text" placeholder="Terms" defaultValue={offer?.terms_text ?? ""} className="md:col-span-2" />
      <label className="flex items-center gap-2 text-sm"><input name="membership_required" type="checkbox" defaultChecked={offer?.membership_required} /> Membership required</label>
      <label className="flex items-center gap-2 text-sm"><input name="payment_required" type="checkbox" defaultChecked={offer?.payment_required} /> Payment required</label>
      <label className="flex items-center gap-2 text-sm"><input name="booking_required" type="checkbox" defaultChecked={offer?.booking_required ?? true} /> Booking required</label>
      <label className="flex items-center gap-2 text-sm"><input name="active" type="checkbox" defaultChecked={offer?.active ?? true} /> Active</label>
      <div className="md:col-span-2"><Button type="submit"><Save size={18} /> Save offer</Button></div>
      {message ? <p className="md:col-span-2 text-sm text-ink/65">{message}</p> : null}
    </form>
  );
}
