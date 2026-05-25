import Image from "next/image";
import Link from "next/link";
import { MapPin, Star } from "lucide-react";
import type { Restaurant } from "@/types/restaurant";
import { formatINR } from "@/lib/money";

export function RestaurantCard({ restaurant }: { restaurant: Restaurant }) {
  return (
    <Link href={`/restaurant/${restaurant.slug}`} className="group overflow-hidden rounded-lg border border-ink/10 bg-white shadow-soft transition hover:-translate-y-0.5">
      <div className="relative aspect-[16/10] bg-mist">
        {restaurant.image_url ? <Image src={restaurant.image_url} alt={restaurant.name} fill className="object-cover" /> : null}
      </div>
      <div className="space-y-3 p-4">
        <div>
          <h3 className="font-semibold group-hover:text-leaf">{restaurant.name}</h3>
          <p className="mt-1 flex items-center gap-1 text-sm text-ink/65"><MapPin size={14} /> {restaurant.area}</p>
        </div>
        <p className="text-sm text-ink/70">{restaurant.cuisine.join(", ")}</p>
        <div className="flex items-center justify-between text-sm">
          <span>{formatINR(restaurant.approx_cost_for_two)} for two</span>
          <span className="flex items-center gap-1 text-amber"><Star size={15} fill="currentColor" /> {restaurant.rating?.toFixed(1) ?? "New"}</span>
        </div>
      </div>
    </Link>
  );
}
