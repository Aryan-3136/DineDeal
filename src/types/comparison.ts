import type { Offer } from "./offer";

export type ComparedOffer = {
  offer: Offer;
  platform_name: string;
  valid: boolean;
  status: "valid" | "invalid" | "needs_review" | "expired";
  invalid_reasons: string[];
  instant_saving: number;
  cashback_value: number;
  final_payable: number;
  warnings: string[];
  reason: string;
};

export type CompareResult = {
  best_instant_deal: ComparedOffer | null;
  best_cashback_deal: ComparedOffer | null;
  best_overall_deal: ComparedOffer | null;
  all_offers_ranked: ComparedOffer[];
  invalid_offers: ComparedOffer[];
  warnings: string[];
  last_checked_at: string | null;
  disclaimer: string;
  calculation_explanation: string;
  input_summary: {
    bill_amount: number;
    date: string;
    day: string;
    is_weekend: boolean;
    time: string;
    meal_type: "lunch" | "dinner" | "unknown";
    people_count: number;
  };
};
