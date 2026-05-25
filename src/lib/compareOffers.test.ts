import { describe, expect, it } from "vitest";
import { compareOffers } from "./compareOffers";
import type { Offer } from "../types/offer";

function makeOffer(id: string, patch: Partial<Offer>): Offer {
  return {
    id,
    restaurant_id: "rest-1",
    platform_id: `plat-${id}`,
    offer_text: "Test offer",
    discount_type: "percentage",
    discount_percent: 10,
    flat_discount: null,
    minimum_bill: null,
    maximum_discount_cap: null,
    cashback_value: null,
    cashback_or_instant: "instant",
    membership_required: false,
    payment_required: false,
    valid_days: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
    valid_start_time: "11:00",
    valid_end_time: "23:30",
    valid_from: "2026-01-01",
    valid_until: "2026-12-31",
    meal_type: "all_day",
    alcohol_included: false,
    service_charge_included: false,
    booking_required: true,
    terms_text: "Test terms",
    offer_url: "https://example.com",
    source_url: "https://example.com",
    source_platform: "Test",
    verification_status: "verified",
    confidence_score: 1,
    active: true,
    last_checked_at: new Date().toISOString(),
    last_changed_at: new Date().toISOString(),
    platform: { id: `plat-${id}`, name: patch.source_platform || id, slug: id },
    ...patch
  };
}

describe("compareOffers", () => {
  it("selects 25% up to Rs 1000 over 40% up to Rs 500 for a Rs 4000 bill", () => {
    const result = compareOffers([
      makeOffer("eazy", { source_platform: "EazyDiner", discount_percent: 25, maximum_discount_cap: 1000 }),
      makeOffer("dineout", { source_platform: "Swiggy Dineout", discount_percent: 40, maximum_discount_cap: 500 })
    ], 4000, "2026-06-15", "20:30", 4);

    expect(result.best_instant_deal?.platform_name).toBe("EazyDiner");
    expect(result.best_instant_deal?.instant_saving).toBe(1000);
    expect(result.best_instant_deal?.final_payable).toBe(3000);
  });

  it("does not reduce final payable for cashback-only offers", () => {
    const result = compareOffers([
      makeOffer("bank", {
        source_platform: "Bank/Card Offer",
        discount_type: "cashback",
        discount_percent: null,
        cashback_value: 300,
        cashback_or_instant: "cashback"
      })
    ], 2500, "2026-06-15", "20:30", 2);

    expect(result.best_cashback_deal?.cashback_value).toBe(300);
    expect(result.best_cashback_deal?.instant_saving).toBe(0);
    expect(result.best_cashback_deal?.final_payable).toBe(2500);
  });

  it("marks offers invalid when minimum bill is not met", () => {
    const result = compareOffers([
      makeOffer("min", { minimum_bill: 5000, discount_percent: 50, maximum_discount_cap: 1000 })
    ], 3000, "2026-06-15", "20:30", 2);

    expect(result.best_instant_deal).toBeNull();
    expect(result.invalid_offers[0].invalid_reasons).toContain("Minimum bill not met");
  });

  it("rejects dinner-only offers for lunch searches", () => {
    const result = compareOffers([
      makeOffer("dinner", { meal_type: "dinner", valid_start_time: "18:00", valid_end_time: "23:30" })
    ], 3000, "2026-06-15", "13:00", 2);

    expect(result.invalid_offers[0].invalid_reasons).toContain("Dinner-only offer");
  });

  it("rejects lunch-only offers for dinner searches", () => {
    const result = compareOffers([
      makeOffer("lunch", { meal_type: "lunch", valid_start_time: "11:00", valid_end_time: "16:00" })
    ], 3000, "2026-06-15", "20:30", 2);

    expect(result.invalid_offers[0].invalid_reasons).toContain("Lunch-only offer");
  });

  it("calculates flat discounts as instant savings", () => {
    const result = compareOffers([
      makeOffer("flat", {
        source_platform: "Restaurant Direct",
        discount_type: "flat",
        discount_percent: null,
        flat_discount: 750,
        minimum_bill: 2000
      })
    ], 3000, "2026-06-15", "20:30", 2);

    expect(result.best_instant_deal?.instant_saving).toBe(750);
    expect(result.best_instant_deal?.final_payable).toBe(2250);
  });

  it("marks weekday-only offers invalid on Saturday", () => {
    const result = compareOffers([
      makeOffer("weekday", { valid_days: ["monday", "tuesday", "wednesday", "thursday", "friday"] })
    ], 3000, "2026-06-20", "20:30", 2);

    expect(result.invalid_offers[0].invalid_reasons).toContain("Not valid on selected day");
  });

  it("marks expired offers invalid", () => {
    const result = compareOffers([
      makeOffer("expired", { valid_until: "2026-01-31", verification_status: "expired" })
    ], 3000, "2026-06-15", "20:30", 2);

    expect(result.invalid_offers[0].status).toBe("expired");
    expect(result.invalid_offers[0].invalid_reasons).toContain("Expired");
  });

  it("adds membership warnings", () => {
    const result = compareOffers([
      makeOffer("member", { membership_required: true, membership_text: "Requires Gold membership" })
    ], 3000, "2026-06-15", "20:30", 2);

    expect(result.all_offers_ranked[0].warnings).toContain("Requires Gold membership");
  });

  it("adds payment warnings", () => {
    const result = compareOffers([
      makeOffer("payment", { payment_required: true, payment_text: "Requires HDFC card" })
    ], 3000, "2026-06-15", "20:30", 2);

    expect(result.all_offers_ranked[0].warnings).toContain("Requires HDFC card");
  });

  it("adds stale offer warnings", () => {
    const result = compareOffers([
      makeOffer("stale", { last_checked_at: "2026-01-01T00:00:00.000Z" })
    ], 3000, "2026-06-15", "20:30", 2);

    expect(result.all_offers_ranked[0].warnings).toContain("Offer not verified recently");
  });
});
