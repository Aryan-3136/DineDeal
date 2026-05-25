import { NextRequest, NextResponse } from "next/server";
import { countRestaurants, getRestaurants } from "@/lib/data";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const q = params.get("q") || "";
  const area = params.get("area");
  const cuisine = params.get("cuisine");
  const platform = params.get("platform");
  const limit = Number(params.get("limit") || 30);
  const offset = Number(params.get("offset") || 0);

  const filters = { q, area, cuisine, platform, limit, offset };
  const [restaurants, total] = await Promise.all([getRestaurants(filters), countRestaurants(filters)]);
  return NextResponse.json({ restaurants, total });
}
