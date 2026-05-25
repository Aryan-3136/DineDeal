"use client";

import { useState } from "react";
import { Save } from "lucide-react";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import type { Restaurant } from "@/types/restaurant";

export function AdminRestaurantForm({ restaurant }: { restaurant?: Restaurant }) {
  const [message, setMessage] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const payload = {
      name: form.get("name"),
      slug: form.get("slug"),
      area: form.get("area"),
      address: form.get("address"),
      cuisine: String(form.get("cuisine") || "").split(",").map((item) => item.trim()).filter(Boolean),
      approx_cost_for_two: Number(form.get("approx_cost_for_two") || 0),
      rating: Number(form.get("rating") || 0),
      image_url: form.get("image_url"),
      google_maps_url: form.get("google_maps_url"),
      active: form.get("active") === "on"
    };
    const res = await fetch(restaurant ? `/api/admin/restaurants/${restaurant.id}` : "/api/admin/restaurants", {
      method: restaurant ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    setMessage(res.ok ? "Restaurant saved. Supabase writes are used when env keys are configured; otherwise this demo returns a validated response." : "Could not save restaurant.");
  }

  return (
    <form onSubmit={submit} className="grid gap-4 rounded-lg border border-ink/10 bg-white p-5 shadow-soft md:grid-cols-2">
      <Input name="name" required placeholder="Restaurant name" defaultValue={restaurant?.name} />
      <Input name="slug" required placeholder="slug" defaultValue={restaurant?.slug} />
      <Input name="area" required placeholder="Area" defaultValue={restaurant?.area} />
      <Input name="cuisine" placeholder="Cuisine, comma separated" defaultValue={restaurant?.cuisine.join(", ")} />
      <Input name="approx_cost_for_two" type="number" placeholder="Approx cost for two" defaultValue={restaurant?.approx_cost_for_two ?? ""} />
      <Input name="rating" type="number" step="0.1" placeholder="Rating" defaultValue={restaurant?.rating ?? ""} />
      <Input name="address" placeholder="Address" defaultValue={restaurant?.address ?? ""} className="md:col-span-2" />
      <Input name="image_url" placeholder="Image URL" defaultValue={restaurant?.image_url ?? ""} className="md:col-span-2" />
      <Input name="google_maps_url" placeholder="Google Maps URL" defaultValue={restaurant?.google_maps_url ?? ""} className="md:col-span-2" />
      <label className="flex items-center gap-2 text-sm"><input name="active" type="checkbox" defaultChecked={restaurant?.active ?? true} /> Active</label>
      <div className="md:col-span-2"><Button type="submit"><Save size={18} /> Save restaurant</Button></div>
      {message ? <p className="md:col-span-2 text-sm text-ink/65">{message}</p> : null}
    </form>
  );
}
