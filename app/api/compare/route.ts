import { NextRequest, NextResponse } from "next/server";
import { compareOffers } from "@/lib/compareOffers";
import { getOffersForRestaurant, getRestaurantById } from "@/lib/data";
import { compareRequestSchema } from "@/lib/validations";

export async function POST(request: NextRequest) {
  const parsed = compareRequestSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid comparison input", details: parsed.error.flatten() }, { status: 400 });

  const restaurant = getRestaurantById(parsed.data.restaurant_id);
  if (!restaurant) return NextResponse.json({ error: "Restaurant not found" }, { status: 404 });

  const offers = getOffersForRestaurant(restaurant.id);
  const result = compareOffers(offers, parsed.data.bill_amount, parsed.data.date, parsed.data.time, parsed.data.people_count);

  return NextResponse.json({
    restaurant,
    ...result
  });
}
