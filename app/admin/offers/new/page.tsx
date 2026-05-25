import { AdminOfferForm } from "@/components/admin/AdminOfferForm";
import { getPlatforms, getRestaurants } from "@/lib/data";

export default async function NewOfferPage() {
  const [restaurants, platforms] = await Promise.all([getRestaurants({ limit: 500 }), getPlatforms()]);
  return <main className="mx-auto max-w-5xl px-4 py-8"><h1 className="mb-5 text-3xl font-semibold">Add Offer</h1><AdminOfferForm restaurants={restaurants} platforms={platforms} /></main>;
}
