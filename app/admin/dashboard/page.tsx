import Link from "next/link";
import { AlertTriangle, BadgePercent, History, Store } from "lucide-react";
import { getStats } from "@/lib/data";

export default async function AdminDashboardPage() {
  const stats = await getStats();
  const items = [
    ["Total restaurants", stats.totalRestaurants, Store],
    ["Total active offers", stats.activeOffers, BadgePercent],
    ["Offers changed today", stats.offersChangedToday, History],
    ["Offers needing review", stats.offersNeedingReview, AlertTriangle],
    ["Offers not checked in 24 hours", stats.staleOffers, AlertTriangle],
    ["Restaurants without platform links", stats.restaurantsWithoutLinks, Store],
    ["Offers expiring soon", stats.expiringSoon, BadgePercent]
  ] as const;

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div><h1 className="text-3xl font-semibold">Admin Dashboard</h1><p className="mt-1 text-sm text-ink/65">Admin routes are protected by Supabase Auth when Supabase is configured.</p></div>
        <div className="flex gap-2"><Link className="rounded-lg bg-leaf px-4 py-2 text-sm font-semibold text-white" href="/admin/restaurants/new">Add restaurant</Link><Link className="rounded-lg bg-ink px-4 py-2 text-sm font-semibold text-white" href="/admin/offers/new">Add offer</Link></div>
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {items.map(([label, value, Icon]) => <div key={label} className="rounded-lg border border-ink/10 bg-white p-4 shadow-sm"><Icon className="mb-3 text-leaf" size={20} /><div className="text-sm text-ink/60">{label}</div><div className="text-3xl font-semibold">{value}</div></div>)}
      </div>
      <div className="mt-6 flex flex-wrap gap-3 text-sm font-semibold text-leaf">
        <Link href="/admin/restaurants">Restaurants</Link>
        <Link href="/admin/offers">Offers</Link>
        <Link href="/admin/stale-offers">Stale offers</Link>
        <Link href="/admin/offer-history">Offer history</Link>
      </div>
    </main>
  );
}
