import { notFound } from "next/navigation";
import { RestaurantCard } from "@/components/RestaurantCard";
import { offers, restaurants } from "@/lib/data";

function label(area: string) {
  return area.split("-").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ");
}

export default function AreaDealsPage({ params }: { params: { area: string } }) {
  const areaLabel = label(params.area);
  const areaRestaurants = restaurants.filter((restaurant) => restaurant.area.toLowerCase() === areaLabel.toLowerCase());
  if (!areaRestaurants.length) notFound();
  const ids = new Set(areaRestaurants.map((restaurant) => restaurant.id));
  const areaOffers = offers.filter((offer) => ids.has(offer.restaurant_id));

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-3xl font-semibold">Best Restaurant Deals in {areaLabel}, Mumbai</h1>
      <p className="mt-2 text-ink/65">Best deals today, top restaurants, highest estimated savings and recently updated offers for {areaLabel}.</p>
      <div className="mt-5 grid gap-4 md:grid-cols-3">
        <div className="rounded-lg bg-white p-4 shadow-sm"><div className="text-sm text-ink/60">Restaurants</div><div className="text-2xl font-semibold">{areaRestaurants.length}</div></div>
        <div className="rounded-lg bg-white p-4 shadow-sm"><div className="text-sm text-ink/60">Active demo offers</div><div className="text-2xl font-semibold">{areaOffers.length}</div></div>
        <div className="rounded-lg bg-white p-4 shadow-sm"><div className="text-sm text-ink/60">Recently updated</div><div className="text-2xl font-semibold">{areaOffers.filter((offer) => offer.last_checked_at).length}</div></div>
      </div>
      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {areaRestaurants.map((restaurant) => <RestaurantCard key={restaurant.id} restaurant={restaurant} />)}
      </div>
      <p className="mt-8 rounded-lg bg-amber/10 p-4 text-sm text-ink/70">Offers may change anytime. Please verify on the platform before booking or payment.</p>
    </main>
  );
}
