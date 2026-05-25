"use client";

import { useState } from "react";
import { Save } from "lucide-react";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import type { Restaurant } from "@/types/restaurant";
import { createSupabaseBrowserClient } from "@/lib/supabaseClient";

export function AdminRestaurantForm({ restaurant }: { restaurant?: Restaurant }) {
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setErrors({});
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
    const nextErrors: Record<string, string> = {};
    if (!String(payload.name || "").trim()) nextErrors.name = "Restaurant name is required.";
    if (!String(payload.slug || "").trim()) nextErrors.slug = "Slug is required.";
    if (!String(payload.area || "").trim()) nextErrors.area = "Area is required.";
    if (!payload.cuisine.length) nextErrors.cuisine = "Add at least one cuisine.";
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }
    setLoading(true);
    const supabase = createSupabaseBrowserClient();
    const { data } = supabase ? await supabase.auth.getSession() : { data: { session: null } };
    const headers: HeadersInit = { "Content-Type": "application/json" };
    if (data.session?.access_token) headers.Authorization = `Bearer ${data.session.access_token}`;
    const res = await fetch(restaurant ? `/api/admin/restaurants/${restaurant.id}` : "/api/admin/restaurants", {
      method: restaurant ? "PUT" : "POST",
      headers,
      body: JSON.stringify(payload)
    });
    setLoading(false);
    setMessage(res.ok ? "Restaurant saved successfully." : "Could not save restaurant. Check your admin access and fields.");
  }

  function Field({ label, name, children }: { label: string; name: string; children: React.ReactNode }) {
    return (
      <label className="block">
        <span className="mb-1 block text-sm font-medium">{label}</span>
        {children}
        {errors[name] ? <span className="mt-1 block text-xs text-red-700">{errors[name]}</span> : null}
      </label>
    );
  }

  return (
    <form onSubmit={submit} className="grid gap-4 rounded-lg border border-ink/10 bg-white p-5 shadow-soft md:grid-cols-2">
      {message ? <div className={`md:col-span-2 rounded-lg p-3 text-sm ${message.includes("success") ? "bg-leaf/10 text-leaf" : "bg-red-50 text-red-700"}`}>{message}</div> : null}
      <Field label="Restaurant name" name="name"><Input name="name" required placeholder="Foo" defaultValue={restaurant?.name} /></Field>
      <Field label="Slug" name="slug"><Input name="slug" required placeholder="foo-powai" defaultValue={restaurant?.slug} /></Field>
      <Field label="Area" name="area"><Input name="area" required placeholder="Powai" defaultValue={restaurant?.area} /></Field>
      <Field label="Cuisine" name="cuisine"><Input name="cuisine" placeholder="Asian, Sushi" defaultValue={restaurant?.cuisine.join(", ")} /></Field>
      <Field label="Approx cost for two" name="approx_cost_for_two"><Input name="approx_cost_for_two" type="number" placeholder="2600" defaultValue={restaurant?.approx_cost_for_two ?? ""} /></Field>
      <Field label="Rating" name="rating"><Input name="rating" type="number" step="0.1" placeholder="4.3" defaultValue={restaurant?.rating ?? ""} /></Field>
      <div className="md:col-span-2"><Field label="Address" name="address"><Input name="address" placeholder="Powai, Mumbai" defaultValue={restaurant?.address ?? ""} /></Field></div>
      <div className="md:col-span-2"><Field label="Image URL" name="image_url"><Input name="image_url" placeholder="https://..." defaultValue={restaurant?.image_url ?? ""} /></Field></div>
      <div className="md:col-span-2"><Field label="Google Maps URL" name="google_maps_url"><Input name="google_maps_url" placeholder="https://www.google.com/maps/..." defaultValue={restaurant?.google_maps_url ?? ""} /></Field></div>
      <label className="flex items-center gap-2 text-sm"><input name="active" type="checkbox" defaultChecked={restaurant?.active ?? true} /> Active</label>
      <div className="md:col-span-2"><Button type="submit" disabled={loading}><Save size={18} /> {loading ? "Saving..." : "Save restaurant"}</Button></div>
    </form>
  );
}
