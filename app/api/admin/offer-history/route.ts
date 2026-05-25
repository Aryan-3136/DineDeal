import { NextResponse } from "next/server";
import { offerHistory } from "@/lib/data";

export async function GET() {
  return NextResponse.json({ history: offerHistory });
}
