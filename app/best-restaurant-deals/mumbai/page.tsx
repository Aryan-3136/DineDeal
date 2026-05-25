import { RestaurantCard } from "@/components/RestaurantCard";
import { getRestaurants } from "@/lib/data";

export default async function MumbaiDealsPage() {
  const restaurants = await getRestaurants({ limit: 100 });
  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-3xl font-semibold">Best Restaurant Deals in Mumbai</h1>
      <p className="mt-2 max-w-2xl text-ink/65">Top restaurants, highest estimated savings and recently updated dining offers. Source links and verification status are shown on each restaurant page.</p>
      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {restaurants.map((restaurant) => <RestaurantCard key={restaurant.id} restaurant={restaurant} />)}
      </div>
      <p className="mt-8 rounded-lg bg-amber/10 p-4 text-sm text-ink/70">Offers may change anytime. Please verify on the platform before booking or payment.</p>
    </main>
  );
}
