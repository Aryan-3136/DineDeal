import { NextRequest, NextResponse } from "next/server";
import { requireAdminRequest } from "@/lib/adminAuth";
import { createSupabaseAdminClient } from "@/lib/supabaseClient";

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const unauthorized = requireAdminRequest(request);
  if (unauthorized) return unauthorized;
  const body = await request.json();
  const supabase = createSupabaseAdminClient();
  if (supabase) {
    const { data, error } = await supabase.from("restaurants").update(body).eq("id", params.id).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ restaurant: data });
  }
  return NextResponse.json({ restaurant: { id: params.id, ...body }, demo_mode: true });
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  const unauthorized = requireAdminRequest(_request);
  if (unauthorized) return unauthorized;
  const supabase = createSupabaseAdminClient();
  if (supabase) {
    const { error } = await supabase.from("restaurants").update({ active: false }).eq("id", params.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}
