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
