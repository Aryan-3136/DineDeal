import { notFound } from "next/navigation";
import { AdminOfferForm } from "@/components/admin/AdminOfferForm";
import { offers } from "@/lib/data";

export default function EditOfferPage({ params }: { params: { id: string } }) {
  const offer = offers.find((item) => item.id === params.id);
  if (!offer) notFound();
  return <main className="mx-auto max-w-5xl px-4 py-8"><h1 className="mb-5 text-3xl font-semibold">Edit Offer</h1><AdminOfferForm offer={offer} /></main>;
}
