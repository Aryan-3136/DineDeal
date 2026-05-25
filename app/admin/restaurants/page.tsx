import Link from "next/link";
import { restaurants } from "@/lib/data";

export default function AdminRestaurantsPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <div className="flex justify-between"><h1 className="text-3xl font-semibold">Restaurants</h1><Link className="rounded-lg bg-leaf px-4 py-2 text-sm font-semibold text-white" href="/admin/restaurants/new">Add restaurant</Link></div>
      <div className="mt-5 overflow-x-auto rounded-lg border border-ink/10 bg-white">
        <table className="w-full text-left text-sm">
          <tbody>{restaurants.map((restaurant) => <tr key={restaurant.id} className="border-t border-ink/8"><td className="p-3 font-medium">{restaurant.name}</td><td className="p-3">{restaurant.area}</td><td className="p-3">{restaurant.cuisine.join(", ")}</td><td className="p-3"><Link className="text-leaf" href={`/admin/restaurants/${restaurant.id}/edit`}>Edit</Link></td></tr>)}</tbody>
        </table>
      </div>
    </main>
  );
}
