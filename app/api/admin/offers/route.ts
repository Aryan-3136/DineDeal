import { NextRequest, NextResponse } from "next/server";
import { requireAdminRequest } from "@/lib/adminAuth";
import { createSupabaseAdminClient } from "@/lib/supabaseClient";

export async function POST(request: NextRequest) {
  const unauthorized = requireAdminRequest(request);
  if (unauthorized) return unauthorized;
  const body = await request.json();
  const supabase = createSupabaseAdminClient();
  if (supabase) {
    const { data, error } = await supabase.from("offers").insert(body).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ offer: data });
  }
  return NextResponse.json({ offer: { id: crypto.randomUUID(), ...body }, demo_mode: true });
}
