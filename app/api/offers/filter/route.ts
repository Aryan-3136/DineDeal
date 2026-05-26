import { NextRequest, NextResponse } from "next/server";
import { getRestaurantsByDiscountFilter, type DiscountFilter } from "@/lib/discountFilters";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const type = params.get("type");
  let filter: DiscountFilter | null = null;

  if (type === "percent") filter = { type, min: Number(params.get("min") || 10) };
  if (type === "flat") filter = { type, min: Number(params.get("min") || 500) };
  if (type === "cashback") filter = { type };
  if (type === "bank") filter = { type };

  if (!filter) return NextResponse.json({ error: "Invalid discount filter" }, { status: 400 });

  const results = await getRestaurantsByDiscountFilter(filter, 12);
  return NextResponse.json({
    results: results.map((item) => ({
      restaurant: item.restaurant,
      offer: item.offer,
      platform: item.platform_name,
      estimated_saving_for_3000_bill: item.estimated_saving_for_3000_bill,
      verification_status: item.verification_status,
      last_checked_at: item.last_checked_at
    }))
  });
}
