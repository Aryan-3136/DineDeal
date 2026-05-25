import { NextRequest, NextResponse } from "next/server";
import { getRestaurants, getLinksForRestaurant } from "@/lib/data";
import { fuzzySearchRestaurants } from "@/lib/search";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q") || "";
  const restaurants = fuzzySearchRestaurants(getRestaurants(), q, Number(request.nextUrl.searchParams.get("limit") || 10)).map((restaurant) => ({
    ...restaurant,
    available_platforms: getLinksForRestaurant(restaurant.id).map((link) => link.platform?.name).filter(Boolean),
    last_checked_at: getLinksForRestaurant(restaurant.id).map((link) => link.last_checked_at).filter(Boolean).sort().at(-1) || null
  }));
  return NextResponse.json({ restaurants });
}
