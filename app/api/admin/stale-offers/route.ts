import { NextResponse } from "next/server";
import { offers } from "@/lib/data";

export async function GET() {
  const cutoff = Date.now() - 24 * 60 * 60 * 1000;
  return NextResponse.json({
    offers: offers.filter((offer) => !offer.last_checked_at || new Date(offer.last_checked_at).getTime() < cutoff)
  });
}
