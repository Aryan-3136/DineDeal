import type { Offer } from "../types/offer";
import type { CompareResult, ComparedOffer } from "../types/comparison";
import { detectMealType, getDayInfo, isOlderThanHours, timeToMinutes } from "./dateTime";

const DISCLAIMER = "Offers may change anytime. Please verify on the platform before booking or payment.";

function withinDateRange(offer: Offer, selectedDate: string) {
  if (offer.valid_from && selectedDate < offer.valid_from) return false;
  if (offer.valid_until && selectedDate > offer.valid_until) return false;
  return true;
}

function withinTimeRange(offer: Offer, selectedTime: string) {
  if (!offer.valid_start_time || !offer.valid_end_time) return true;
  const selected = timeToMinutes(selectedTime);
  const start = timeToMinutes(offer.valid_start_time);
  const end = timeToMinutes(offer.valid_end_time);
  return start <= end ? selected >= start && selected <= end : selected >= start || selected <= end;
}

function calculateSavings(offer: Offer, billAmount: number) {
  let instantSaving = 0;
  let cashbackValue = Number(offer.cashback_value ?? 0);

  if (offer.discount_type === "percentage" && offer.discount_percent) {
    const raw = (billAmount * Number(offer.discount_percent)) / 100;
    const capped = offer.maximum_discount_cap ? Math.min(raw, Number(offer.maximum_discount_cap)) : raw;
    if (offer.cashback_or_instant === "cashback") cashbackValue = Math.max(cashbackValue, capped);
    else instantSaving = capped;
  }

  if (offer.discount_type === "flat" && offer.flat_discount) {
    instantSaving = Number(offer.flat_discount);
    if (offer.maximum_discount_cap) instantSaving = Math.min(instantSaving, Number(offer.maximum_discount_cap));
  }

  if (offer.discount_type === "cashback") {
    cashbackValue = Math.max(cashbackValue, Number(offer.flat_discount ?? 0));
  }

  if (offer.cashback_or_instant === "both" && offer.cashback_value) {
    cashbackValue = Number(offer.cashback_value);
  }

  instantSaving = Math.min(instantSaving, billAmount);
  return { instantSaving, cashbackValue, finalPayable: billAmount - instantSaving };
}

export function compareOffers(
  offers: Offer[],
  billAmount: number,
  selectedDate: string,
  selectedTime: string,
  peopleCount: number
): CompareResult {
  const { day, isWeekend } = getDayInfo(selectedDate);
  const mealType = detectMealType(selectedTime);
  const globalWarnings = new Set<string>([DISCLAIMER]);

  const compared: ComparedOffer[] = offers.map((offer) => {
    const invalidReasons: string[] = [];
    const warnings: string[] = [];
    let status: ComparedOffer["status"] = "valid";

    if (!offer.active) invalidReasons.push("Offer is inactive");
    if (offer.verification_status === "expired") {
      status = "expired";
      invalidReasons.push("Expired");
    }
    if (offer.verification_status === "needs_review" || offer.verification_status === "uncertain") {
      status = "needs_review";
      warnings.push("Offer needs verification before booking or payment");
    }
    if (!withinDateRange(offer, selectedDate)) invalidReasons.push("Expired");
    if (offer.valid_days?.length && !offer.valid_days.map((d) => d.toLowerCase()).includes(day)) {
      invalidReasons.push("Not valid on selected day");
    }
    if (!withinTimeRange(offer, selectedTime)) invalidReasons.push("Not valid at selected time");
    if (offer.meal_type === "lunch" && mealType !== "lunch") invalidReasons.push("Lunch-only offer");
    if (offer.meal_type === "dinner" && mealType !== "dinner") invalidReasons.push("Dinner-only offer");
    if (offer.minimum_bill && billAmount < Number(offer.minimum_bill)) invalidReasons.push("Minimum bill not met");

    if (offer.membership_required) warnings.push(offer.membership_text || "Requires membership");
    if (offer.payment_required) warnings.push(offer.payment_text || "Specific card/payment required");
    if (offer.alcohol_included === false) warnings.push("Alcohol may be excluded");
    if (offer.service_charge_included === false) warnings.push("Service charge may be excluded");
    if (offer.booking_required) warnings.push("Booking required");
    if (isOlderThanHours(offer.last_checked_at, 24)) warnings.push("Offer not verified recently");

    warnings.forEach((warning) => globalWarnings.add(warning));
    if (invalidReasons.length > 0 && status !== "expired") status = "invalid";

    const { instantSaving, cashbackValue, finalPayable } = calculateSavings(offer, billAmount);
    const platformName = offer.platform?.name || offer.source_platform || "Unknown platform";

    return {
      offer,
      platform_name: platformName,
      valid: invalidReasons.length === 0 && status !== "expired",
      status,
      invalid_reasons: invalidReasons,
      instant_saving: invalidReasons.length ? 0 : instantSaving,
      cashback_value: invalidReasons.length ? 0 : cashbackValue,
      final_payable: invalidReasons.length ? billAmount : finalPayable,
      warnings,
      reason: invalidReasons.length
        ? invalidReasons.join(", ")
        : instantSaving > 0
          ? `${platformName} saves more after caps and minimum bill rules.`
          : cashbackValue > 0
            ? `${platformName} gives cashback, shown separately from instant payable.`
            : `${platformName} is available but has no numeric saving.`
    };
  });

  const ranked = compared.sort((a, b) => {
    const bucket = (offer: ComparedOffer) => {
      if (offer.valid && offer.instant_saving > 0) return 0;
      if (offer.valid && offer.cashback_value > 0) return 1;
      if (offer.status === "needs_review") return 2;
      return 3;
    };
    return bucket(a) - bucket(b) || b.instant_saving - a.instant_saving || b.cashback_value - a.cashback_value;
  });

  const validOffers = ranked.filter((offer) => offer.valid);
  const bestInstant = validOffers.filter((offer) => offer.instant_saving > 0).sort((a, b) => b.instant_saving - a.instant_saving)[0] ?? null;
  const bestCashback = validOffers.filter((offer) => offer.cashback_value > 0).sort((a, b) => b.cashback_value - a.cashback_value)[0] ?? null;
  const bestOverall = [...validOffers].sort((a, b) => (b.instant_saving + b.cashback_value) - (a.instant_saving + a.cashback_value))[0] ?? null;
  const checkedTimes = offers.map((offer) => offer.last_checked_at).filter(Boolean).sort() as string[];

  return {
    best_instant_deal: bestInstant,
    best_cashback_deal: bestCashback,
    best_overall_deal: bestOverall,
    all_offers_ranked: ranked,
    invalid_offers: ranked.filter((offer) => !offer.valid),
    warnings: Array.from(globalWarnings),
    last_checked_at: checkedTimes.at(-1) ?? null,
    disclaimer: DISCLAIMER,
    calculation_explanation: "Estimated instant savings apply percentage or flat discounts after minimum bill, validity and maximum cap checks. Cashback is shown separately and does not reduce final payable.",
    input_summary: {
      bill_amount: billAmount,
      date: selectedDate,
      day,
      is_weekend: isWeekend,
      time: selectedTime,
      meal_type: mealType,
      people_count: peopleCount
    }
  };
}
