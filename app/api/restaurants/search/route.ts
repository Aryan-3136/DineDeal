import { NextRequest, NextResponse } from "next/server";
import { getLinksForRestaurant, searchRestaurants } from "@/lib/data";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q") || "";
  const matches = await searchRestaurants(q, Number(request.nextUrl.searchParams.get("limit") || 10));
  const restaurants = await Promise.all(matches.map(async (restaurant) => {
    const links = await getLinksForRestaurant(restaurant.id);
    return {
      ...restaurant,
      available_platforms: links.map((link) => link.platform?.name).filter(Boolean),
      last_checked_at: links.map((link) => link.last_checked_at).filter(Boolean).sort().at(-1) || null
    };
  }));
  return NextResponse.json({ restaurants });
}
