import { NextRequest, NextResponse } from "next/server";
import { requireAdminRequest } from "@/lib/adminAuth";
import { createSupabaseAdminClient } from "@/lib/supabaseClient";
import { restaurantFormSchema } from "@/lib/validations";

export async function POST(request: NextRequest) {
  const unauthorized = await requireAdminRequest(request);
  if (unauthorized) return unauthorized;
  const parsed = restaurantFormSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid restaurant", details: parsed.error.flatten() }, { status: 400 });
  const body = parsed.data;
  const supabase = createSupabaseAdminClient();
  if (supabase) {
    const { data, error } = await supabase.from("restaurants").insert(body).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ restaurant: data });
  }
  return NextResponse.json({ restaurant: { id: crypto.randomUUID(), ...body }, demo_mode: true });
}
