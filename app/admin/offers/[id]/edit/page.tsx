import { notFound } from "next/navigation";
import { AdminOfferForm } from "@/components/admin/AdminOfferForm";
import { getOfferById, getPlatforms, getRestaurants } from "@/lib/data";
import { AccessDenied } from "@/components/admin/AccessDenied";
import { requireAdminPage } from "@/lib/adminPageAuth";

export default async function EditOfferPage({ params }: { params: { id: string } }) {
  const auth = await requireAdminPage();
  if (auth.denied) return <AccessDenied />;
  const [offer, restaurants, platforms] = await Promise.all([getOfferById(params.id), getRestaurants({ limit: 500 }), getPlatforms()]);
  if (!offer) notFound();
  return <main className="mx-auto max-w-5xl px-4 py-8"><h1 className="mb-5 text-3xl font-semibold">Edit Offer</h1><AdminOfferForm offer={offer} restaurants={restaurants} platforms={platforms} /></main>;
}
