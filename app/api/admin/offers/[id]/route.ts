import { NextRequest, NextResponse } from "next/server";
import { requireAdminRequest } from "@/lib/adminAuth";
import { createSupabaseAdminClient } from "@/lib/supabaseClient";
import { offerFormSchema } from "@/lib/validations";

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const unauthorized = await requireAdminRequest(request);
  if (unauthorized) return unauthorized;
  const parsed = offerFormSchema.partial().safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid offer", details: parsed.error.flatten() }, { status: 400 });
  const body = parsed.data;
  const supabase = createSupabaseAdminClient();
  if (supabase) {
    const { data: oldOffer, error: oldError } = await supabase.from("offers").select("*").eq("id", params.id).maybeSingle();
    if (oldError) return NextResponse.json({ error: oldError.message }, { status: 400 });
    const { data, error } = await supabase.from("offers").update(body).eq("id", params.id).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    if (oldOffer && (
      oldOffer.offer_text !== data.offer_text ||
      Number(oldOffer.discount_percent ?? 0) !== Number(data.discount_percent ?? 0) ||
      Number(oldOffer.maximum_discount_cap ?? 0) !== Number(data.maximum_discount_cap ?? 0) ||
      Number(oldOffer.minimum_bill ?? 0) !== Number(data.minimum_bill ?? 0)
    )) {
      await supabase.from("offer_history").insert({
        offer_id: params.id,
        old_offer_text: oldOffer.offer_text,
        new_offer_text: data.offer_text,
        old_discount_percent: oldOffer.discount_percent,
        new_discount_percent: data.discount_percent,
        old_cap: oldOffer.maximum_discount_cap,
        new_cap: data.maximum_discount_cap,
        old_minimum_bill: oldOffer.minimum_bill,
        new_minimum_bill: data.minimum_bill,
        change_reason: "Admin edited offer"
      });
    }
    return NextResponse.json({ offer: data });
  }
  return NextResponse.json({ offer: { id: params.id, ...body }, demo_mode: true });
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  const unauthorized = await requireAdminRequest(_request);
  if (unauthorized) return unauthorized;
  const supabase = createSupabaseAdminClient();
  if (supabase) {
    const { error } = await supabase.from("offers").update({ active: false, verification_status: "expired" }).eq("id", params.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}
