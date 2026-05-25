import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabaseClient";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const supabase = createSupabaseAdminClient();
  if (supabase) {
    const { data, error } = await supabase.from("restaurants").insert(body).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ restaurant: data });
  }
  return NextResponse.json({ restaurant: { id: crypto.randomUUID(), ...body }, demo_mode: true });
}
