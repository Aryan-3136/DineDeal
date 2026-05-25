import Image from "next/image";
import Link from "next/link";
import { ExternalLink, MapPin, Star } from "lucide-react";
import { notFound } from "next/navigation";
import { BestDealCard } from "@/components/BestDealCard";
import { CompareForm } from "@/components/CompareForm";
import { LastCheckedBadge } from "@/components/LastCheckedBadge";
import { PlatformLogoBadge } from "@/components/PlatformLogoBadge";
import { VerificationStatusBadge } from "@/components/VerificationStatusBadge";
import { compareOffers } from "@/lib/compareOffers";
import { getLinksForRestaurant, getOffersForRestaurant, getRestaurantBySlug } from "@/lib/data";
import { formatINR } from "@/lib/money";

export default async function RestaurantPage({ params }: { params: { slug: string } }) {
  const restaurant = await getRestaurantBySlug(params.slug);
  if (!restaurant) notFound();
  const currentRestaurant = restaurant!;
  const [offers, links] = await Promise.all([getOffersForRestaurant(currentRestaurant.id), getLinksForRestaurant(currentRestaurant.id)]);
  const today = new Date().toISOString().slice(0, 10);
  const preset = [1500, 3000, 5000].map((bill) => ({ bill, result: compareOffers(offers, bill, today, "20:30", 2) }));
  const latest = offers.map((offer) => offer.last_checked_at).filter(Boolean).sort().at(-1) || null;

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <section className="grid gap-6 lg:grid-cols-[1.1fr_.9fr]">
        <div>
          <div className="relative aspect-[16/9] overflow-hidden rounded-lg bg-mist">
            {currentRestaurant.image_url ? <Image src={currentRestaurant.image_url} alt={currentRestaurant.name} fill className="object-cover" /> : null}
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <h1 className="text-4xl font-semibold">{currentRestaurant.name}</h1>
            <p className="mt-2 flex items-center gap-2 text-ink/65"><MapPin size={17} /> {currentRestaurant.area} · {currentRestaurant.address}</p>
            <p className="mt-2 text-ink/70">{currentRestaurant.cuisine.join(", ")} · {formatINR(currentRestaurant.approx_cost_for_two)} for two</p>
            <p className="mt-2 flex items-center gap-1 text-amber"><Star size={16} fill="currentColor" /> {currentRestaurant.rating?.toFixed(1)}</p>
          </div>
          <div className="flex flex-wrap gap-2">{links.map((link) => <PlatformLogoBadge key={link.id} name={link.platform?.name || "Platform"} />)}</div>
          <LastCheckedBadge value={latest} />
          {currentRestaurant.google_maps_url ? <a className="inline-flex items-center gap-1 text-sm font-semibold text-leaf" href={currentRestaurant.google_maps_url} target="_blank" rel="noreferrer">Open Google Maps <ExternalLink size={14} /></a> : null}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="mb-3 text-xl font-semibold">Compare for my bill</h2>
        <CompareForm compact restaurant={currentRestaurant} />
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-3">
        {preset.map(({ bill, result }) => (
          <div key={bill} className="rounded-lg border border-ink/10 bg-white p-4">
            <div className="text-sm text-ink/60">Best app for {formatINR(bill)} bill</div>
            <div className="mt-2 text-lg font-semibold">{result.best_overall_deal?.platform_name || "No valid offer"}</div>
            <div className="text-sm text-leaf">Estimated saving {formatINR(result.best_overall_deal?.instant_saving || 0)}</div>
          </div>
        ))}
      </section>

      <section className="mt-8">
        <BestDealCard deal={preset[1].result.best_instant_deal} billAmount={3000} />
      </section>

      <section className="mt-8">
        <h2 className="mb-3 text-xl font-semibold">Current Offers</h2>
        <div className="grid gap-3">
          {offers.map((offer) => (
            <div key={offer.id} className="rounded-lg border border-ink/10 bg-white p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="font-semibold">{offer.platform?.name}</div>
                  <p className="mt-1 text-sm text-ink/65">{offer.offer_text}</p>
                </div>
                <VerificationStatusBadge status={offer.verification_status} />
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <LastCheckedBadge value={offer.last_checked_at} />
                <Link href={offer.source_url || "#"} className="rounded-full bg-cream px-3 py-1 text-xs text-leaf">Source URL</Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
