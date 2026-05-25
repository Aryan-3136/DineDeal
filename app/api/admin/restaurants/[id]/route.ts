import { NextRequest, NextResponse } from "next/server";
import { requireAdminRequest } from "@/lib/adminAuth";
import { createSupabaseAdminClient } from "@/lib/supabaseClient";
import { restaurantFormSchema } from "@/lib/validations";

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const unauthorized = await requireAdminRequest(request);
  if (unauthorized) return unauthorized;
  const parsed = restaurantFormSchema.partial().safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid restaurant", details: parsed.error.flatten() }, { status: 400 });
  const body = parsed.data;
  const supabase = createSupabaseAdminClient();
  if (supabase) {
    const { data, error } = await supabase.from("restaurants").update(body).eq("id", params.id).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ restaurant: data });
  }
  return NextResponse.json({ restaurant: { id: params.id, ...body }, demo_mode: true });
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  const unauthorized = await requireAdminRequest(_request);
  if (unauthorized) return unauthorized;
  const supabase = createSupabaseAdminClient();
  if (supabase) {
    const { error } = await supabase.from("restaurants").update({ active: false }).eq("id", params.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}
