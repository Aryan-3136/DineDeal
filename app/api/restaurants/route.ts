import { NextRequest, NextResponse } from "next/server";
import { getRestaurants, getLinksForRestaurant } from "@/lib/data";
import { fuzzySearchRestaurants } from "@/lib/search";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const q = params.get("q") || "";
  const area = params.get("area");
  const cuisine = params.get("cuisine");
  const platform = params.get("platform");
  const limit = Number(params.get("limit") || 30);
  const offset = Number(params.get("offset") || 0);

  let data = q ? fuzzySearchRestaurants(getRestaurants(), q, 200) : getRestaurants();
  if (area) data = data.filter((restaurant) => restaurant.area.toLowerCase() === area.toLowerCase());
  if (cuisine) data = data.filter((restaurant) => restaurant.cuisine.some((item) => item.toLowerCase().includes(cuisine.toLowerCase())));
  if (platform) data = data.filter((restaurant) => getLinksForRestaurant(restaurant.id).some((link) => link.platform?.slug === platform));

  return NextResponse.json({ restaurants: data.slice(offset, offset + limit), total: data.length });
}
