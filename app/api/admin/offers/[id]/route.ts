import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabaseClient";

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const body = await request.json();
  const supabase = createSupabaseAdminClient();
  if (supabase) {
    const { data, error } = await supabase.from("offers").update(body).eq("id", params.id).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ offer: data });
  }
  return NextResponse.json({ offer: { id: params.id, ...body }, demo_mode: true });
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createSupabaseAdminClient();
  if (supabase) {
    const { error } = await supabase.from("offers").update({ active: false, verification_status: "expired" }).eq("id", params.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}
