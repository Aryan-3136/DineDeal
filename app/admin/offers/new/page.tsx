import { AdminOfferForm } from "@/components/admin/AdminOfferForm";
import { getPlatforms, getRestaurants } from "@/lib/data";
import { AccessDenied } from "@/components/admin/AccessDenied";
import { requireAdminPage } from "@/lib/adminPageAuth";

export default async function NewOfferPage() {
  const auth = await requireAdminPage();
  if (auth.denied) return <AccessDenied />;
  const [restaurants, platforms] = await Promise.all([getRestaurants({ limit: 500 }), getPlatforms()]);
  return <main className="mx-auto max-w-5xl px-4 py-8"><h1 className="mb-5 text-3xl font-semibold">Add Offer</h1><AdminOfferForm restaurants={restaurants} platforms={platforms} /></main>;
}
