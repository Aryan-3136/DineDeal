import type { Offer } from "@/types/offer";
import type { Restaurant } from "@/types/restaurant";
import { getAllOffers, getPlatforms, getRestaurants } from "./data";

export type DiscountFilter =
  | { type: "percent"; min: number }
  | { type: "flat"; min: number }
  | { type: "cashback" }
  | { type: "bank" };

export type DiscountFilterResult = {
  restaurant: Restaurant;
  offer: Offer;
  platform_name: string;
  estimated_saving_for_3000_bill: number;
  verification_status: Offer["verification_status"];
  last_checked_at: string | null;
};

function instantSavingForBill(offer: Offer, billAmount = 3000) {
  if (offer.minimum_bill && billAmount < Number(offer.minimum_bill)) return 0;
  if (offer.cashback_or_instant === "cashback") return 0;
  if (offer.discount_type === "percentage" && offer.discount_percent) {
    const raw = billAmount * Number(offer.discount_percent) / 100;
    return Math.min(raw, Number(offer.maximum_discount_cap ?? raw), billAmount);
  }
  if (offer.discount_type === "flat" && offer.flat_discount) {
    return Math.min(Number(offer.flat_discount), Number(offer.maximum_discount_cap ?? offer.flat_discount), billAmount);
  }
  return 0;
}

function matchesFilter(offer: Offer, filter: DiscountFilter) {
  if (!offer.active || offer.verification_status === "expired") return false;
  if (filter.type === "percent") return offer.discount_type === "percentage" && Number(offer.discount_percent ?? 0) >= filter.min;
  if (filter.type === "flat") return offer.discount_type === "flat" && instantSavingForBill(offer) >= filter.min;
  if (filter.type === "cashback") return offer.cashback_or_instant === "cashback" || offer.discount_type === "cashback" || Number(offer.cashback_value ?? 0) > 0;
  return offer.payment_required || /bank|card|upi|hdfc|icici|axis|sbi|amex/i.test(`${offer.platform?.name || ""} ${offer.source_platform || ""} ${offer.payment_text || ""} ${offer.offer_text}`);
}

export async function getRestaurantsByDiscountFilter(filter: DiscountFilter, limit = 12): Promise<DiscountFilterResult[]> {
  const [restaurants, offers] = await Promise.all([getRestaurants({ limit: 1000 }), getAllOffers()]);
  const restaurantById = new Map(restaurants.map((restaurant) => [restaurant.id, restaurant]));
  return offers
    .filter((offer) => matchesFilter(offer, filter))
    .map((offer) => {
      const restaurant = restaurantById.get(offer.restaurant_id);
      if (!restaurant) return null;
      return {
        restaurant,
        offer,
        platform_name: offer.platform?.name || offer.source_platform || "Unknown platform",
        estimated_saving_for_3000_bill: instantSavingForBill(offer),
        verification_status: offer.verification_status,
        last_checked_at: offer.last_checked_at ?? null
      };
    })
    .filter((item): item is DiscountFilterResult => Boolean(item))
    .sort((a, b) => {
      const verifiedDelta = Number(b.verification_status === "verified") - Number(a.verification_status === "verified");
      if (verifiedDelta) return verifiedDelta;
      return b.estimated_saving_for_3000_bill - a.estimated_saving_for_3000_bill ||
        new Date(b.last_checked_at || 0).getTime() - new Date(a.last_checked_at || 0).getTime() ||
        Number(b.restaurant.rating ?? 0) - Number(a.restaurant.rating ?? 0);
    })
    .slice(0, limit);
}

export async function getBestInstantSavingsToday(limit = 6) {
  const [restaurants, offers] = await Promise.all([getRestaurants({ limit: 1000 }), getAllOffers()]);
  const restaurantById = new Map(restaurants.map((restaurant) => [restaurant.id, restaurant]));
  return offers
    .filter((offer) => offer.active && offer.verification_status !== "expired")
    .map((offer) => {
      const restaurant = restaurantById.get(offer.restaurant_id);
      const saving = instantSavingForBill(offer);
      if (!restaurant || saving <= 0) return null;
      return { restaurant, offer, saving, platform_name: offer.platform?.name || offer.source_platform || "Unknown platform" };
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item))
    .sort((a, b) => b.saving - a.saving)
    .slice(0, limit);
}

export async function getPlatformOfferCounts() {
  const [platforms, offers] = await Promise.all([getPlatforms(), getAllOffers()]);
  return platforms.map((platform) => ({
    platform,
    count: offers.filter((offer) => offer.platform_id === platform.id && offer.active).length
  }));
}

export async function getRecentlyCheckedOffers(limit = 6) {
  const [restaurants, offers] = await Promise.all([getRestaurants({ limit: 1000 }), getAllOffers()]);
  const restaurantById = new Map(restaurants.map((restaurant) => [restaurant.id, restaurant]));
  return offers
    .filter((offer) => offer.active)
    .sort((a, b) => new Date(b.last_checked_at || 0).getTime() - new Date(a.last_checked_at || 0).getTime())
    .slice(0, limit)
    .map((offer) => ({ offer, restaurant: restaurantById.get(offer.restaurant_id), platform_name: offer.platform?.name || offer.source_platform || "Unknown platform" }))
    .filter((item): item is { offer: Offer; restaurant: Restaurant; platform_name: string } => Boolean(item.restaurant));
}
