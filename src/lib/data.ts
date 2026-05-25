import { restaurants, platforms, restaurantPlatformLinks } from "@/data/sample-restaurants";
import { offers, offerHistory } from "@/data/sample-offers";
import type { Restaurant } from "@/types/restaurant";
import type { Offer } from "@/types/offer";

export function getRestaurants() {
  return restaurants.filter((restaurant) => restaurant.active);
}

export function getRestaurantBySlug(slug: string) {
  return restaurants.find((restaurant) => restaurant.slug === slug && restaurant.active) ?? null;
}

export function getRestaurantById(id: string) {
  return restaurants.find((restaurant) => restaurant.id === id && restaurant.active) ?? null;
}

export function getOffersForRestaurant(restaurantId: string) {
  return offers.filter((offer) => offer.restaurant_id === restaurantId && offer.active);
}

export function getLinksForRestaurant(restaurantId: string) {
  return restaurantPlatformLinks.filter((link) => link.restaurant_id === restaurantId && link.active);
}

export function getFeaturedByArea(area: string, limit = 8) {
  return restaurants.filter((restaurant) => restaurant.area.toLowerCase() === area.toLowerCase()).slice(0, limit);
}

export function getStats() {
  const staleCutoff = Date.now() - 24 * 60 * 60 * 1000;
  return {
    totalRestaurants: restaurants.length,
    activeOffers: offers.filter((offer) => offer.active).length,
    offersChangedToday: offerHistory.length,
    offersNeedingReview: offers.filter((offer) => offer.verification_status === "needs_review" || offer.verification_status === "uncertain").length,
    staleOffers: offers.filter((offer) => !offer.last_checked_at || new Date(offer.last_checked_at).getTime() < staleCutoff).length,
    restaurantsWithoutLinks: restaurants.filter((restaurant) => !restaurantPlatformLinks.some((link) => link.restaurant_id === restaurant.id)).length,
    expiringSoon: offers.filter((offer) => offer.valid_until && new Date(offer.valid_until).getTime() - Date.now() < 7 * 24 * 60 * 60 * 1000).length
  };
}

export { restaurants, platforms, restaurantPlatformLinks, offers, offerHistory };
export type { Restaurant, Offer };
