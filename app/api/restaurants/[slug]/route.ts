import { NextRequest, NextResponse } from "next/server";
import { compareOffers } from "@/lib/compareOffers";
import { getLinksForRestaurant, getOffersForRestaurant, getRestaurantBySlug } from "@/lib/data";

export async function GET(_request: NextRequest, { params }: { params: { slug: string } }) {
  const restaurant = await getRestaurantBySlug(params.slug);
  if (!restaurant) return NextResponse.json({ error: "Restaurant not found" }, { status: 404 });
  const [offers, links] = await Promise.all([getOffersForRestaurant(restaurant.id), getLinksForRestaurant(restaurant.id)]);
  const today = new Date().toISOString().slice(0, 10);
  return NextResponse.json({
    restaurant,
    platform_links: links,
    offers,
    preset_best_offers: {
      1500: compareOffers(offers, 1500, today, "20:30", 2).best_overall_deal,
      3000: compareOffers(offers, 3000, today, "20:30", 2).best_overall_deal,
      5000: compareOffers(offers, 5000, today, "20:30", 2).best_overall_deal
    }
  });
}
