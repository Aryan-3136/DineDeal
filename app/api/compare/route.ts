import { NextRequest, NextResponse } from "next/server";
import { compareOffers } from "@/lib/compareOffers";
import { getOffersForRestaurant, getRestaurantById } from "@/lib/data";
import { createSupabaseAdminClient } from "@/lib/supabaseClient";
import { compareRequestSchema } from "@/lib/validations";

export async function POST(request: NextRequest) {
  const parsed = compareRequestSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid comparison input", details: parsed.error.flatten() }, { status: 400 });

  const restaurant = await getRestaurantById(parsed.data.restaurant_id);
  if (!restaurant) return NextResponse.json({ error: "Restaurant not found" }, { status: 404 });

  const offers = await getOffersForRestaurant(restaurant.id);
  const result = compareOffers(offers, parsed.data.bill_amount, parsed.data.date, parsed.data.time, parsed.data.people_count);
  const supabase = createSupabaseAdminClient();
  if (supabase) {
    await supabase.from("user_searches").insert({
      restaurant_id: restaurant.id,
      bill_amount: parsed.data.bill_amount,
      search_date: parsed.data.date,
      search_time: parsed.data.time,
      people_count: parsed.data.people_count,
      meal_type: result.input_summary.meal_type,
      best_platform_id: result.best_overall_deal?.offer.platform_id ?? null,
      estimated_saving: result.best_overall_deal?.instant_saving ?? 0,
      cashback_value: result.best_overall_deal?.cashback_value ?? 0,
      final_payable: result.best_overall_deal?.final_payable ?? parsed.data.bill_amount
    });
  }

  return NextResponse.json({
    restaurant,
    ...result
  });
}
