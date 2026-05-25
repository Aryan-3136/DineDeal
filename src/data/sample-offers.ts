import type { Offer, OfferHistory } from "@/types/offer";
import { platforms, restaurants } from "./sample-restaurants";

const checked = new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString();
const platform = (id: string) => platforms.find((item) => item.id === id);

function offer(index: number, platformId: string, patch: Partial<Offer>): Offer {
  const restaurant = restaurants[index % restaurants.length];
  const source = platform(platformId);
  return {
    id: `offer-${index + 1}-${platformId}`,
    restaurant_id: restaurant.id,
    platform_id: platformId,
    offer_text: patch.offer_text || "Dining offer available",
    discount_type: patch.discount_type || "percentage",
    discount_percent: patch.discount_percent ?? null,
    flat_discount: patch.flat_discount ?? null,
    minimum_bill: patch.minimum_bill ?? null,
    maximum_discount_cap: patch.maximum_discount_cap ?? null,
    cashback_value: patch.cashback_value ?? null,
    cashback_or_instant: patch.cashback_or_instant || "instant",
    membership_required: patch.membership_required ?? false,
    membership_text: patch.membership_text ?? null,
    payment_required: patch.payment_required ?? false,
    payment_text: patch.payment_text ?? null,
    valid_days: patch.valid_days ?? ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
    valid_start_time: patch.valid_start_time ?? "11:00",
    valid_end_time: patch.valid_end_time ?? "23:30",
    valid_from: patch.valid_from ?? "2026-01-01",
    valid_until: patch.valid_until ?? "2026-12-31",
    meal_type: patch.meal_type || "all_day",
    alcohol_included: patch.alcohol_included ?? false,
    service_charge_included: patch.service_charge_included ?? false,
    booking_required: patch.booking_required ?? true,
    terms_text: patch.terms_text || "Demo data. Admin must verify source before marking verified.",
    offer_url: patch.offer_url || (source?.base_url ? `${source.base_url}/mumbai/${restaurant.slug}` : "#"),
    source_url: patch.source_url || (source?.base_url ? `${source.base_url}/mumbai/${restaurant.slug}` : "#"),
    source_platform: source?.name,
    verification_status: patch.verification_status || "needs_review",
    confidence_score: patch.confidence_score ?? 0.55,
    active: patch.active ?? true,
    last_checked_at: patch.last_checked_at ?? checked,
    last_changed_at: checked,
    created_at: checked,
    updated_at: checked,
    platform: source
  };
}

export const offers: Offer[] = restaurants.flatMap((_, index) => [
  offer(index, "plat-eazy", {
    offer_text: "25% off up to Rs 1,000",
    discount_percent: 25,
    maximum_discount_cap: 1000,
    minimum_bill: 1500,
    verification_status: index % 4 === 0 ? "uncertain" : "needs_review"
  }),
  offer(index, "plat-swiggy", {
    offer_text: "40% off up to Rs 500",
    discount_percent: 40,
    maximum_discount_cap: 500,
    minimum_bill: 1200,
    payment_required: index % 3 === 0,
    payment_text: "May require selected card or wallet payment",
    verification_status: "needs_review"
  }),
  offer(index, "plat-district", {
    offer_text: "Flat Rs 600 off dinner bills above Rs 2,500",
    discount_type: "flat",
    flat_discount: 600,
    minimum_bill: 2500,
    meal_type: "dinner",
    valid_start_time: "18:00",
    valid_end_time: "23:30",
    verification_status: "uncertain"
  }),
  offer(index, index % 2 ? "plat-direct" : "plat-bank", {
    offer_text: index % 2 ? "10% restaurant direct lunch offer up to Rs 400" : "Rs 300 cashback on eligible bank cards",
    discount_type: index % 2 ? "percentage" : "cashback",
    discount_percent: index % 2 ? 10 : null,
    maximum_discount_cap: index % 2 ? 400 : null,
    cashback_value: index % 2 ? null : 300,
    cashback_or_instant: index % 2 ? "instant" : "cashback",
    minimum_bill: 1000,
    meal_type: index % 2 ? "lunch" : "all_day",
    membership_required: index % 5 === 0,
    membership_text: "May require loyalty membership",
    verification_status: "needs_review"
  })
]);

export const offerHistory: OfferHistory[] = offers.slice(0, 12).map((item, index) => ({
  id: `history-${index + 1}`,
  offer_id: item.id,
  old_offer_text: "Older demo offer text",
  new_offer_text: item.offer_text,
  old_discount_percent: item.discount_percent ? Number(item.discount_percent) - 5 : null,
  new_discount_percent: item.discount_percent ?? null,
  old_cap: item.maximum_discount_cap ? Number(item.maximum_discount_cap) - 100 : null,
  new_cap: item.maximum_discount_cap ?? null,
  old_minimum_bill: item.minimum_bill ? Number(item.minimum_bill) + 200 : null,
  new_minimum_bill: item.minimum_bill ?? null,
  change_reason: "Seeded example of offer change tracking",
  changed_at: item.last_changed_at || checked
}));
