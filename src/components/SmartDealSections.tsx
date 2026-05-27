import Link from "next/link";
import { BadgePercent, Clock3, MapPin, Store } from "lucide-react";
import { LastCheckedBadge } from "./LastCheckedBadge";
import { VerificationStatusBadge } from "./VerificationStatusBadge";
import { formatINR } from "@/lib/money";
import { getBestInstantSavingsToday, getPlatformOfferCounts, getRecentlyCheckedOffers } from "@/lib/discountFilters";

const areas = ["Bandra", "Powai", "Andheri", "BKC", "Lower Parel", "Juhu"];

export async function SmartDealSections() {
  const [bestSavings, platformCounts, recentOffers] = await Promise.all([
    getBestInstantSavingsToday(6),
    getPlatformOfferCounts(),
    getRecentlyCheckedOffers(6)
  ]);

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-3 pb-12 pt-4 md:space-y-10 md:px-4">
      <section>
        <div className="mb-4 flex items-center gap-2">
          <BadgePercent className="text-leaf" size={20} />
          <h2 className="text-xl font-semibold md:text-2xl">Best Instant Savings Today</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {bestSavings.map((item) => (
            <Link key={`${item.restaurant.id}-${item.offer.id}`} href={`/compare?restaurant_id=${item.restaurant.id}&slug=${item.restaurant.slug}&bill_amount=3000&date=${new Date().toISOString().slice(0, 10)}&time=20:30&people_count=2`} className="rounded-lg border border-ink/10 bg-white p-4 shadow-sm transition hover:-translate-y-0.5">
              <div className="text-sm text-ink/55">{item.platform_name}</div>
              <h3 className="mt-1 font-semibold">{item.restaurant.name}, {item.restaurant.area}</h3>
              <p className="mt-2 text-sm text-ink/65">{item.offer.offer_text}</p>
              <p className="mt-3 text-lg font-semibold text-leaf">{formatINR(item.saving)} estimated saving</p>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-center gap-2">
          <MapPin className="text-leaf" size={20} />
          <h2 className="text-xl font-semibold md:text-2xl">Best Deals by Area</h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
          {areas.map((area) => (
            <Link key={area} href={`/best-restaurant-deals/mumbai/${area.toLowerCase().replace(/\s+/g, "-")}`} className="rounded-lg border border-ink/10 bg-white p-4 shadow-sm transition hover:-translate-y-0.5">
              <div className="font-semibold">{area}</div>
              <div className="mt-1 text-sm text-ink/55">Browse area offers</div>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-center gap-2">
          <Store className="text-leaf" size={20} />
          <h2 className="text-xl font-semibold md:text-2xl">Popular Platforms</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-5">
          {platformCounts.slice(0, 5).map(({ platform, count }) => (
            <div key={platform.id} className="rounded-lg border border-ink/10 bg-white p-4 shadow-sm">
              <div className="font-semibold">{platform.name}</div>
              <div className="mt-2 text-2xl font-semibold text-leaf">{count}</div>
              <div className="text-sm text-ink/55">active offers</div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-center gap-2">
          <Clock3 className="text-leaf" size={20} />
          <h2 className="text-xl font-semibold md:text-2xl">Recently Checked Offers</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {recentOffers.map(({ offer, restaurant, platform_name }) => (
            <div key={offer.id} className="rounded-lg border border-ink/10 bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm text-ink/55">{platform_name}</div>
                  <h3 className="mt-1 font-semibold">{restaurant.name}, {restaurant.area}</h3>
                </div>
                <VerificationStatusBadge status={offer.verification_status} />
              </div>
              <p className="mt-3 text-sm text-ink/70">{offer.offer_text}</p>
              <div className="mt-3"><LastCheckedBadge value={offer.last_checked_at} /></div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
