import type { Platform, Restaurant, RestaurantPlatformLink } from "@/types/restaurant";

const now = new Date().toISOString();

export const platforms: Platform[] = [
  { id: "plat-eazy", name: "EazyDiner", slug: "eazydiner", logo_url: "/platforms/eazydiner.svg", base_url: "https://www.eazydiner.com", active: true },
  { id: "plat-swiggy", name: "Swiggy Dineout", slug: "swiggy-dineout", logo_url: "/platforms/swiggy.svg", base_url: "https://www.swiggy.com", active: true },
  { id: "plat-district", name: "District", slug: "district", logo_url: "/platforms/district.svg", base_url: "https://www.district.in", active: true },
  { id: "plat-zomato", name: "Zomato Dining", slug: "zomato-dining", logo_url: "/platforms/zomato.svg", base_url: "https://www.zomato.com", active: true },
  { id: "plat-direct", name: "Restaurant Direct", slug: "restaurant-direct", logo_url: "/platforms/direct.svg", base_url: "", active: true },
  { id: "plat-bank", name: "Bank/Card Offer", slug: "bank-card", logo_url: "/platforms/bank.svg", base_url: "", active: true }
];

const imageIds = ["1565299624946-b28f40a0ae38", "1555396273-367ea4eb4db5", "1517248135467-4c7edcad34c4", "1540189549336-e6e99c3679fe", "1559339352-11d035aa65de"];
const image = (index: number) => `https://images.unsplash.com/photo-${imageIds[index % imageIds.length]}?auto=format&fit=crop&w=900&q=80`;

export const mumbaiAreas = [
  "Bandra", "Powai", "Andheri", "BKC", "Lower Parel", "Juhu", "Colaba", "Churchgate", "Worli", "Dadar", "Ghatkopar", "Thane", "Vashi", "Malad", "Borivali", "Kurla", "Fort", "Marine Lines", "Santacruz", "Khar", "Chembur", "Mulund", "Navi Mumbai"
];

const baseRestaurantRows = [
  ["foo-powai", "Foo", "Powai", ["Asian", "Sushi"], 2600, 4.4],
  ["yauatcha-bkc", "Yauatcha", "BKC", ["Chinese", "Dim Sum"], 4200, 4.5],
  ["the-table-colaba", "The Table", "Colaba", ["European", "Global"], 5000, 4.6],
  ["bastian-bandra", "Bastian", "Bandra", ["Seafood", "Continental"], 4800, 4.4],
  ["masala-library-bkc", "Masala Library", "BKC", ["Modern Indian"], 5200, 4.5],
  ["mainland-china-andheri", "Mainland China", "Andheri", ["Chinese"], 2400, 4.1],
  ["global-fusion-andheri", "Global Fusion", "Andheri", ["Buffet", "Asian"], 3000, 4.2],
  ["mamagoto-bandra", "Mamagoto", "Bandra", ["Asian", "Thai"], 2500, 4.1],
  ["sassy-spoon-nariman-point", "The Sassy Spoon", "Churchgate", ["European", "Desserts"], 3000, 4.2],
  ["bombay-canteen-lower-parel", "The Bombay Canteen", "Lower Parel", ["Indian", "Regional"], 3500, 4.5],
  ["toast-pasta-juhu", "Toast & Pasta", "Juhu", ["Italian", "Cafe"], 2200, 4.0],
  ["koko-lower-parel", "KOKO", "Lower Parel", ["Asian", "Japanese"], 4600, 4.5],
  ["burma-burma-fort", "Burma Burma", "Fort", ["Burmese", "Vegetarian"], 2600, 4.4],
  ["indigo-deli-worli", "Indigo Delicatessen", "Worli", ["European", "Cafe"], 3200, 4.2],
  ["bayroute-bandra", "Bayroute", "Bandra", ["Middle Eastern"], 3400, 4.4],
  ["pop-tates-malad", "Pop Tate's", "Malad", ["Continental", "Bar Food"], 1800, 4.0],
  ["urban-tadka-ghatkopar", "Urban Tadka", "Ghatkopar", ["North Indian"], 1900, 4.1],
  ["sigree-thane", "Sigree Global Grill", "Thane", ["Buffet", "North Indian"], 2400, 4.0],
  ["rainforest-vashi", "Rainforest Resto-Bar", "Vashi", ["Multi Cuisine"], 2200, 3.9],
  ["mahesh-lunch-home-juhu", "Mahesh Lunch Home", "Juhu", ["Seafood", "Mangalorean"], 3000, 4.2],
  ["mini-punjab-dadar", "Mini Punjab", "Dadar", ["North Indian"], 2000, 4.0],
  ["cream-centre-chowpatty", "Cream Centre", "Marine Lines", ["Vegetarian", "Italian"], 2200, 4.1],
  ["olive-bandra", "Olive Bar & Kitchen", "Bandra", ["Mediterranean"], 5200, 4.4],
  ["hakkasan-bandra", "Hakkasan", "Bandra", ["Chinese", "Fine Dining"], 6000, 4.5],
  ["soho-house-juhu", "Soho House", "Juhu", ["European", "Italian"], 5500, 4.3],
  ["good-wife-bkc", "The Good Wife", "BKC", ["European", "Bar Food"], 3800, 4.2],
  ["cafe-mondegar-colaba", "Cafe Mondegar", "Colaba", ["Continental", "Cafe"], 1800, 4.0],
  ["prithvi-cafe-juhu", "Prithvi Cafe", "Juhu", ["Cafe", "Fast Food"], 1000, 4.3],
  ["gajalee-vile-parle", "Gajalee", "Santacruz", ["Seafood", "Maharashtrian"], 2800, 4.3],
  ["arth-khar", "Arth", "Khar", ["Modern Indian"], 3900, 4.2],
  ["grandmamas-cafe-chembur", "Grandmama's Cafe", "Chembur", ["Cafe", "Continental"], 1800, 4.0],
  ["mainland-china-mulund", "Mainland China", "Mulund", ["Chinese"], 2400, 4.0],
  ["barbeque-nation-kurla", "Barbeque Nation", "Kurla", ["Buffet", "Barbecue"], 2200, 4.0],
  ["fusion-borivali", "Fusion Kitchen", "Borivali", ["Global", "North Indian"], 1900, 4.1],
  ["navi-social", "Navi Social", "Navi Mumbai", ["Bar Food", "Cafe"], 2400, 4.1]
];

const generatedRestaurantRows = Array.from({ length: 65 }, (_, index) => {
  const area = mumbaiAreas[index % mumbaiAreas.length];
  const cuisines = [
    ["North Indian", "Mughlai"],
    ["Asian", "Thai"],
    ["Italian", "Cafe"],
    ["Continental", "Bar Food"],
    ["Seafood", "Maharashtrian"],
    ["Modern Indian", "Regional"]
  ][index % 6];
  const names = [
    "Aamchi Rasoi", "Bombay Bistro", "Coastal Curry House", "The Tiffin Room", "Bayleaf Kitchen",
    "Junoon Table", "The Spice Foundry", "Kokum & Co", "Monsoon Grill", "Sea Salt Social",
    "Pali Naka Kitchen", "Urban Tandoor", "Curry Culture", "The Pantry Lane", "Masala Works",
    "Harbour Spice", "Kebab & Kurry", "Nawab's Table", "Bandra Bowl House", "Powai Plate",
    "Andheri Adda", "Juhu Junction", "Fort Local", "Worli Wok", "Thane Tandoor"
  ];
  const name = `${names[index % names.length]} ${area}`;
  return [
    `${name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}`,
    name,
    area,
    cuisines,
    1400 + (index % 10) * 350,
    3.8 + (index % 8) / 10
  ];
});

export const restaurants: Restaurant[] = [...baseRestaurantRows, ...generatedRestaurantRows].slice(0, 100).map(([slug, name, area, cuisine, cost, rating], index) => ({
  id: `rest-${index + 1}`,
  slug: slug as string,
  name: name as string,
  city: "Mumbai",
  area: area as string,
  address: `${area}, Mumbai`,
  cuisine: cuisine as string[],
  approx_cost_for_two: cost as number,
  rating: rating as number,
  image_url: image(index),
  google_maps_url: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${name} ${area} Mumbai`)}`,
  active: true,
  created_at: now,
  updated_at: now
}));

export const restaurantPlatformLinks: RestaurantPlatformLink[] = restaurants.flatMap((restaurant, index) =>
  platforms.slice(0, 4 + (index % 2)).map((platform) => ({
    id: `link-${restaurant.id}-${platform.id}`,
    restaurant_id: restaurant.id,
    platform_id: platform.id,
    platform_restaurant_url: `${platform.base_url || "https://example.com"}/mumbai/${restaurant.slug}`,
    platform_restaurant_id: `${platform.slug}-${restaurant.slug}`,
    active: true,
    last_checked_at: new Date(Date.now() - (index % 8) * 60 * 60 * 1000).toISOString(),
    created_at: now,
    updated_at: now,
    platform
  }))
);
