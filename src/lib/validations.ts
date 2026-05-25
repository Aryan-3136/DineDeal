import { z } from "zod";

export const compareRequestSchema = z.object({
  restaurant_id: z.string().min(1),
  bill_amount: z.coerce.number().positive(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().regex(/^\d{2}:\d{2}$/),
  people_count: z.coerce.number().int().min(1).max(30)
});

export const restaurantFormSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  area: z.string().min(2),
  address: z.string().optional(),
  cuisine: z.array(z.string()).default([]),
  approx_cost_for_two: z.coerce.number().optional(),
  rating: z.coerce.number().optional(),
  image_url: z.string().optional(),
  google_maps_url: z.string().optional(),
  active: z.boolean().default(true)
});

const optionalNumber = z.preprocess((value) => value === "" || value === null ? undefined : value, z.coerce.number().optional());

export const offerFormSchema = z.object({
  restaurant_id: z.string().min(1),
  platform_id: z.string().min(1),
  offer_text: z.string().min(2),
  discount_type: z.enum(["percentage", "flat", "cashback", "bogo", "custom"]),
  discount_percent: optionalNumber.nullable().optional(),
  flat_discount: optionalNumber.nullable().optional(),
  minimum_bill: optionalNumber.nullable().optional(),
  maximum_discount_cap: optionalNumber.nullable().optional(),
  cashback_value: optionalNumber.nullable().optional(),
  cashback_or_instant: z.enum(["instant", "cashback", "both", "unknown"]).default("unknown"),
  membership_required: z.boolean().default(false),
  membership_text: z.string().nullable().optional(),
  payment_required: z.boolean().default(false),
  payment_text: z.string().nullable().optional(),
  valid_days: z.array(z.string()).nullable().optional(),
  valid_start_time: z.string().nullable().optional(),
  valid_end_time: z.string().nullable().optional(),
  valid_from: z.string().nullable().optional(),
  valid_until: z.string().nullable().optional(),
  meal_type: z.enum(["lunch", "dinner", "all_day", "unknown"]).default("unknown"),
  alcohol_included: z.boolean().nullable().optional(),
  service_charge_included: z.boolean().nullable().optional(),
  booking_required: z.boolean().default(true),
  terms_text: z.string().nullable().optional(),
  offer_url: z.string().nullable().optional(),
  source_url: z.string().nullable().optional(),
  source_platform: z.string().nullable().optional(),
  verification_status: z.enum(["verified", "needs_review", "expired", "uncertain"]).default("needs_review"),
  confidence_score: optionalNumber.nullable().optional(),
  active: z.boolean().default(true),
  last_checked_at: z.string().nullable().optional(),
  last_changed_at: z.string().nullable().optional()
});
