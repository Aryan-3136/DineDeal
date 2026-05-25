import { offers } from "@/lib/data";
import { formatDateTime } from "@/lib/dateTime";

export default function StaleOffersPage() {
  const cutoff = Date.now() - 24 * 60 * 60 * 1000;
  const stale = offers.filter((offer) => !offer.last_checked_at || new Date(offer.last_checked_at).getTime() < cutoff);
  return <main className="mx-auto max-w-7xl px-4 py-8"><h1 className="text-3xl font-semibold">Stale Offers</h1><div className="mt-5 grid gap-3">{stale.map((offer) => <div key={offer.id} className="rounded-lg bg-white p-4 shadow-sm"><div className="font-semibold">{offer.platform?.name}</div><div className="text-sm text-ink/65">{offer.offer_text}</div><div className="mt-2 text-xs text-ink/50">Last checked {formatDateTime(offer.last_checked_at)}</div></div>)}</div></main>;
}
