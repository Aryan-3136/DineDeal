import Link from "next/link";
import { ArrowRight, MapPin, RefreshCcw, ShieldCheck, Sparkles } from "lucide-react";
import { CompareForm } from "@/components/CompareForm";
import { RestaurantCard } from "@/components/RestaurantCard";
import { restaurants, mumbaiAreas } from "@/data/sample-restaurants";

export default function HomePage() {
  const featured = restaurants.slice(0, 8);
  const cards = [
    "Best deals today",
    "Popular restaurants",
    "Best offers in Bandra",
    "Best offers in Powai",
    "Best offers in Andheri",
    "Best offers in BKC",
    "Recently updated deals"
  ];

  return (
    <main>
      <section className="mx-auto max-w-7xl px-4 py-10 md:py-14">
        <div className="max-w-3xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-sm text-leaf shadow-sm"><Sparkles size={16} /> BestDiningDeal for Mumbai</div>
          <h1 className="text-4xl font-semibold leading-tight md:text-6xl">Find the likely best restaurant deal after caps, timing and payment rules.</h1>
          <p className="mt-5 max-w-2xl text-lg text-ink/70">Compare EazyDiner, Swiggy Dineout, District and restaurant offers in one place.</p>
        </div>
        <div className="mt-8"><CompareForm /></div>
      </section>

      <section className="bg-white/70 py-8">
        <div className="mx-auto grid max-w-7xl gap-4 px-4 md:grid-cols-4">
          {cards.map((card) => (
            <Link key={card} href={card.includes("Bandra") ? "/best-restaurant-deals/mumbai/bandra" : card.includes("Powai") ? "/best-restaurant-deals/mumbai/powai" : card.includes("Andheri") ? "/best-restaurant-deals/mumbai/andheri" : card.includes("BKC") ? "/best-restaurant-deals/mumbai/bkc" : "/best-restaurant-deals/mumbai"} className="rounded-lg border border-ink/10 bg-white p-4 shadow-sm transition hover:-translate-y-0.5">
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-cream text-leaf"><RefreshCcw size={18} /></div>
              <h2 className="font-semibold">{card}</h2>
              <p className="mt-2 text-sm text-ink/60">Estimated savings based on last checked offer data.</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold">Popular Mumbai Restaurants</h2>
            <p className="mt-1 text-sm text-ink/65">Search supports restaurant name, area, cuisine, partial spelling and typo-tolerant matching.</p>
          </div>
          <Link href="/best-restaurant-deals/mumbai" className="hidden items-center gap-1 text-sm font-semibold text-leaf md:flex">View all <ArrowRight size={16} /></Link>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((restaurant) => <RestaurantCard key={restaurant.id} restaurant={restaurant} />)}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-12">
        <div className="rounded-lg border border-ink/10 bg-white p-5">
          <div className="mb-3 flex items-center gap-2 font-semibold"><MapPin size={18} className="text-leaf" /> Mumbai areas supported</div>
          <div className="flex flex-wrap gap-2">{mumbaiAreas.map((area) => <Link key={area} href={`/best-restaurant-deals/mumbai/${area.toLowerCase().replace(/\s+/g, "-")}`} className="rounded-full bg-cream px-3 py-1 text-sm text-ink/70 hover:text-leaf">{area}</Link>)}</div>
        </div>
        <div className="mt-5 flex items-start gap-2 rounded-lg bg-amber/10 p-4 text-sm text-ink/70"><ShieldCheck size={18} className="text-amber" /> Offers may change anytime. Please verify on the platform before booking or payment.</div>
      </section>
    </main>
  );
}
