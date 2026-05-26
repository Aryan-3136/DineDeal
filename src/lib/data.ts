import { restaurants as sampleRestaurants, platforms as samplePlatforms, restaurantPlatformLinks as sampleLinks } from "@/data/sample-restaurants";
import { offers as sampleOffers, offerHistory as sampleOfferHistory } from "@/data/sample-offers";
import type { Restaurant } from "@/types/restaurant";
import type { Offer, OfferHistory } from "@/types/offer";
import { normalizeSearchText, scoreRestaurantSearch, searchRestaurantsLocal, type RestaurantSearchResult } from "./search";
import { createSupabaseAdminClient, createSupabaseBrowserClient } from "./supabaseClient";

function supabase() {
  return createSupabaseAdminClient() || createSupabaseBrowserClient();
}

function withPlatform(offer: Offer): Offer {
  if (offer.platform) return offer;
  return {
    ...offer,
    platform: samplePlatforms.find((platform) => platform.id === offer.platform_id)
  };
}

export type RestaurantFilters = {
  area?: string | null;
  cuisine?: string | null;
  platform?: string | null;
  q?: string | null;
  limit?: number;
  offset?: number;
};

export async function getRestaurants(filters: RestaurantFilters = {}) {
  const client = supabase();
  const limit = filters.limit ?? 100;
  const offset = filters.offset ?? 0;

  if (client) {
    if (filters.q) {
      let data = await searchRestaurants(filters.q, 1000);
      if (filters.area) data = data.filter((restaurant) => restaurant.area.toLowerCase() === filters.area!.toLowerCase());
      if (filters.cuisine) data = data.filter((restaurant) => restaurant.cuisine.some((item) => item.toLowerCase().includes(filters.cuisine!.toLowerCase())));
      if (filters.platform) {
        const { data: links } = await client
          .from("restaurant_platform_links")
          .select("restaurant_id, platforms!inner(slug)")
          .eq("active", true)
          .eq("platforms.slug", filters.platform);
        const ids = new Set((links || []).map((link) => link.restaurant_id));
        data = data.filter((restaurant) => ids.has(restaurant.id));
      }
      return data.slice(offset, offset + limit);
    }
    let query = client.from("restaurants").select("*").eq("active", true).order("name").range(offset, offset + limit - 1);
    if (filters.area) query = query.ilike("area", filters.area);
    if (filters.cuisine) query = query.contains("cuisine", [filters.cuisine]);
    const { data, error } = await query;
    if (!error && data) {
      if (!filters.platform) return data as Restaurant[];
      const { data: links } = await client
        .from("restaurant_platform_links")
        .select("restaurant_id, platforms!inner(slug)")
        .eq("active", true)
        .eq("platforms.slug", filters.platform);
      const ids = new Set((links || []).map((link) => link.restaurant_id));
      return (data as Restaurant[]).filter((restaurant) => ids.has(restaurant.id));
    }
  }

  let data = filters.q ? searchRestaurantsLocal(sampleRestaurants, filters.q, 200) : sampleRestaurants.filter((restaurant) => restaurant.active);
  if (filters.area) data = data.filter((restaurant) => restaurant.area.toLowerCase() === filters.area!.toLowerCase());
  if (filters.cuisine) data = data.filter((restaurant) => restaurant.cuisine.some((item) => item.toLowerCase().includes(filters.cuisine!.toLowerCase())));
  if (filters.platform) data = data.filter((restaurant) => sampleLinks.some((link) => link.restaurant_id === restaurant.id && link.platform?.slug === filters.platform));
  return data.slice(offset, offset + limit);
}

export async function countRestaurants(filters: RestaurantFilters = {}) {
  if (filters.q || filters.platform || filters.cuisine) {
    return (await getRestaurants({ ...filters, limit: 10000, offset: 0 })).length;
  }
  const client = supabase();
  if (client) {
    let query = client.from("restaurants").select("id", { count: "exact", head: true }).eq("active", true);
    if (filters.area) query = query.ilike("area", filters.area);
    const { count, error } = await query;
    if (!error && typeof count === "number") return count;
  }
  return (await getRestaurants({ ...filters, limit: 10000 })).length;
}

export async function searchRestaurants(q: string, limit = 10): Promise<RestaurantSearchResult[]> {
  const normalized = normalizeSearchText(q);
  if (!normalized) return [];
  const client = supabase();
  if (client) {
    const { data, error } = await client.rpc("search_restaurants", { search_text: normalized, result_limit: limit });
    if (!error && data) {
      return (data as Restaurant[]).map((restaurant) => {
        const existingScore = "match_score" in restaurant ? Number((restaurant as RestaurantSearchResult).match_score) : null;
        const existingReason = "match_reason" in restaurant ? String((restaurant as RestaurantSearchResult).match_reason) : "";
        const scored = scoreRestaurantSearch(restaurant, normalized);
        return {
          ...restaurant,
          match_score: existingScore && existingScore > 0 ? existingScore : Math.round(scored.score * 100) / 100,
          match_reason: existingReason || scored.reason
        };
      }).sort((a, b) => b.match_score - a.match_score).slice(0, limit);
    }

    const { data: allRestaurants } = await client.from("restaurants").select("*").eq("active", true).limit(500);
    if (allRestaurants) return searchRestaurantsLocal(allRestaurants as Restaurant[], normalized, limit);
  }
  return searchRestaurantsLocal(sampleRestaurants, normalized, limit);
}

export async function getRestaurantBySlug(slug: string) {
  const client = supabase();
  if (client) {
    const { data, error } = await client.from("restaurants").select("*").eq("slug", slug).eq("active", true).maybeSingle();
    if (!error && data) return data as Restaurant;
  }
  return sampleRestaurants.find((restaurant) => restaurant.slug === slug && restaurant.active) ?? null;
}

export async function getRestaurantById(id: string, includeInactive = false) {
  const client = supabase();
  if (client) {
    let query = client.from("restaurants").select("*").eq("id", id);
    if (!includeInactive) query = query.eq("active", true);
    const { data, error } = await query.maybeSingle();
    if (!error && data) return data as Restaurant;
  }
  return sampleRestaurants.find((restaurant) => restaurant.id === id && (includeInactive || restaurant.active)) ?? null;
}

export async function getOffersForRestaurant(restaurantId: string, includeInactive = false) {
  const client = supabase();
  if (client) {
    let query = client.from("offers").select("*, platform:platforms(id,name,slug,logo_url,base_url)").eq("restaurant_id", restaurantId);
    if (!includeInactive) query = query.eq("active", true);
    const { data, error } = await query.order("last_checked_at", { ascending: false });
    if (!error && data) return data as Offer[];
  }
  return sampleOffers.filter((offer) => offer.restaurant_id === restaurantId && (includeInactive || offer.active)).map(withPlatform);
}

export async function getAllOffers(includeInactive = false) {
  const client = supabase();
  if (client) {
    let query = client.from("offers").select("*, platform:platforms(id,name,slug,logo_url,base_url)");
    if (!includeInactive) query = query.eq("active", true);
    const { data, error } = await query.order("last_checked_at", { ascending: false });
    if (!error && data) return data as Offer[];
  }
  return sampleOffers.filter((offer) => includeInactive || offer.active).map(withPlatform);
}

export async function getOfferById(id: string) {
  const client = supabase();
  if (client) {
    const { data, error } = await client.from("offers").select("*, platform:platforms(id,name,slug,logo_url,base_url)").eq("id", id).maybeSingle();
    if (!error && data) return data as Offer;
  }
  return sampleOffers.find((offer) => offer.id === id) ?? null;
}

export async function getLinksForRestaurant(restaurantId: string) {
  const client = supabase();
  if (client) {
    const { data, error } = await client
      .from("restaurant_platform_links")
      .select("*, platform:platforms(id,name,slug,logo_url,base_url)")
      .eq("restaurant_id", restaurantId)
      .eq("active", true);
    if (!error && data) return data;
  }
  return sampleLinks.filter((link) => link.restaurant_id === restaurantId && link.active);
}

export async function getPlatforms() {
  const client = supabase();
  if (client) {
    const { data, error } = await client.from("platforms").select("*").eq("active", true).order("name");
    if (!error && data) return data;
  }
  return samplePlatforms.filter((platform) => platform.active);
}

export async function getOfferHistory() {
  const client = supabase();
  if (client) {
    const { data, error } = await client.from("offer_history").select("*").order("changed_at", { ascending: false });
    if (!error && data) return data as OfferHistory[];
  }
  return sampleOfferHistory;
}

export async function getStats() {
  const client = supabase();
  const staleCutoff = Date.now() - 24 * 60 * 60 * 1000;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const todayText = today.toISOString();
  const todayDate = new Date().toISOString().slice(0, 10);

  if (client) {
    const [
      restaurantsCount,
      activeOffers,
      changedToday,
      reviewCount,
      staleOld,
      staleNull,
      links,
      expiring
    ] = await Promise.all([
      client.from("restaurants").select("id", { count: "exact", head: true }).eq("active", true),
      client.from("offers").select("id", { count: "exact", head: true }).eq("active", true),
      client.from("offer_history").select("id", { count: "exact", head: true }).gte("changed_at", todayText),
      client.from("offers").select("id", { count: "exact", head: true }).in("verification_status", ["needs_review", "uncertain"]).eq("active", true),
      client.from("offers").select("id", { count: "exact", head: true }).eq("active", true).lt("last_checked_at", new Date(staleCutoff).toISOString()),
      client.from("offers").select("id", { count: "exact", head: true }).eq("active", true).is("last_checked_at", null),
      client.from("restaurant_platform_links").select("restaurant_id").eq("active", true),
      client.from("offers").select("id", { count: "exact", head: true }).eq("active", true).gte("valid_until", todayDate).lte("valid_until", nextWeek)
    ]);
    const linkedIds = new Set((links.data || []).map((link) => link.restaurant_id));
    return {
      totalRestaurants: restaurantsCount.count ?? 0,
      activeOffers: activeOffers.count ?? 0,
      offersChangedToday: changedToday.count ?? 0,
      offersNeedingReview: reviewCount.count ?? 0,
      staleOffers: (staleOld.count ?? 0) + (staleNull.count ?? 0),
      restaurantsWithoutLinks: Math.max(0, (restaurantsCount.count ?? 0) - linkedIds.size),
      expiringSoon: expiring.count ?? 0
    };
  }

  return {
    totalRestaurants: sampleRestaurants.length,
    activeOffers: sampleOffers.filter((offer) => offer.active).length,
    offersChangedToday: sampleOfferHistory.filter((history) => new Date(history.changed_at).getTime() >= today.getTime()).length,
    offersNeedingReview: sampleOffers.filter((offer) => offer.verification_status === "needs_review" || offer.verification_status === "uncertain").length,
    staleOffers: sampleOffers.filter((offer) => !offer.last_checked_at || new Date(offer.last_checked_at).getTime() < staleCutoff).length,
    restaurantsWithoutLinks: sampleRestaurants.filter((restaurant) => !sampleLinks.some((link) => link.restaurant_id === restaurant.id)).length,
    expiringSoon: sampleOffers.filter((offer) => offer.valid_until && offer.valid_until >= todayDate && offer.valid_until <= nextWeek).length
  };
}

export { sampleRestaurants as restaurants, samplePlatforms as platforms, sampleLinks as restaurantPlatformLinks, sampleOffers as offers, sampleOfferHistory as offerHistory };
export type { Restaurant, Offer };
