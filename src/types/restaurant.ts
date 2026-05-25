export type Platform = {
  id: string;
  name: string;
  slug: string;
  logo_url?: string | null;
  base_url?: string | null;
  active: boolean;
  created_at?: string;
};

export type Restaurant = {
  id: string;
  name: string;
  slug: string;
  city: string;
  area: string;
  address?: string | null;
  cuisine: string[];
  approx_cost_for_two?: number | null;
  rating?: number | null;
  image_url?: string | null;
  google_maps_url?: string | null;
  active: boolean;
  created_at?: string;
  updated_at?: string;
};

export type RestaurantPlatformLink = {
  id: string;
  restaurant_id: string;
  platform_id: string;
  platform_restaurant_url?: string | null;
  platform_restaurant_id?: string | null;
  active: boolean;
  last_checked_at?: string | null;
  created_at?: string;
  updated_at?: string;
  platform?: Platform;
};
