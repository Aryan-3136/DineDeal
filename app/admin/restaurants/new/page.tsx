import { AdminRestaurantForm } from "@/components/admin/AdminRestaurantForm";
import { AccessDenied } from "@/components/admin/AccessDenied";
import { requireAdminPage } from "@/lib/adminPageAuth";

export default async function NewRestaurantPage() {
  const auth = await requireAdminPage();
  if (auth.denied) return <AccessDenied />;
  return <main className="mx-auto max-w-5xl px-4 py-8"><h1 className="mb-5 text-3xl font-semibold">Add Restaurant</h1><AdminRestaurantForm /></main>;
}
