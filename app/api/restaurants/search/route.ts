import { NextRequest, NextResponse } from "next/server";
import { getLinksForRestaurant, getOffersForRestaurant, searchRestaurants } from "@/lib/data";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q") || "";
  const limit = Math.min(Math.max(Number(request.nextUrl.searchParams.get("limit") || 10), 1), 20);
  if (!q.trim()) return NextResponse.json({ restaurants: [] });

  const matches = await searchRestaurants(q, limit);
  const restaurants = await Promise.all(matches.map(async (restaurant) => {
    const [links, offers] = await Promise.all([getLinksForRestaurant(restaurant.id), getOffersForRestaurant(restaurant.id)]);
    const activeLinks = links.filter((link) => link.active);
    return {
      id: restaurant.id,
      name: restaurant.name,
      slug: restaurant.slug,
      area: restaurant.area,
      cuisine: restaurant.cuisine,
      approx_cost_for_two: restaurant.approx_cost_for_two,
      rating: restaurant.rating,
      image_url: restaurant.image_url,
      match_score: restaurant.match_score,
      match_reason: restaurant.match_reason,
      available_platforms: activeLinks.map((link) => link.platform?.name).filter(Boolean),
      active_offer_count: offers.filter((offer) => offer.active).length,
      last_checked_at: activeLinks.map((link) => link.last_checked_at).filter(Boolean).sort().at(-1) || null
    };
  }));
  return NextResponse.json({ restaurants });
}
