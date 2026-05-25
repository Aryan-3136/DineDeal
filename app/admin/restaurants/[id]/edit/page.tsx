import { notFound } from "next/navigation";
import { AdminRestaurantForm } from "@/components/admin/AdminRestaurantForm";
import { restaurants } from "@/lib/data";

export default function EditRestaurantPage({ params }: { params: { id: string } }) {
  const restaurant = restaurants.find((item) => item.id === params.id);
  if (!restaurant) notFound();
  return <main className="mx-auto max-w-5xl px-4 py-8"><h1 className="mb-5 text-3xl font-semibold">Edit Restaurant</h1><AdminRestaurantForm restaurant={restaurant} /></main>;
}
