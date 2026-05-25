# DineDeal Mumbai / BestDiningDeal

A demo-ready MVP for comparing estimated Mumbai restaurant dining savings across EazyDiner, Swiggy Dineout, District, Zomato Dining, restaurant direct offers and bank/card offers.

The important behavior is actual savings calculation, not percentage comparison. The engine applies minimum bill, maximum cap, date/day/time validity, lunch/dinner rules, membership/payment conditions and cashback separation before ranking offers.

## Tech Stack

- Next.js 14 App Router
- TypeScript
- Tailwind CSS
- shadcn-style local UI primitives
- Lucide icons
- Supabase PostgreSQL and Supabase Auth-ready admin model
- PostgreSQL `pg_trgm` fuzzy search schema

## Local Setup

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

If Supabase variables are not configured, the app runs from TypeScript seed data in `src/data`.

## Environment Variables

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

## Supabase Setup

1. Create a Supabase project.
2. Run `supabase/schema.sql`.
3. Run `supabase/policies.sql`.
4. Run `supabase/seed.sql` for starter SQL data.
5. Create an auth user and add a matching row in `admin_users`.

Admin writes use `SUPABASE_SERVICE_ROLE_KEY` when configured. In demo mode, admin forms validate and return sample responses without persisting.

## How To Run

```bash
npm run dev
npm run typecheck
npm run build
```

## Main Routes

- `/`
- `/compare`
- `/restaurant/[slug]`
- `/best-restaurant-deals/mumbai`
- `/best-restaurant-deals/mumbai/bandra`
- `/admin/dashboard`
- `/admin/restaurants`
- `/admin/offers`
- `/admin/stale-offers`
- `/admin/offer-history`

## Comparison Logic

Core function: `src/lib/compareOffers.ts`

It detects:

- Day of week
- Weekday/weekend
- Meal type: lunch, dinner or unknown
- Validity by date, day and time
- Minimum bill
- Maximum discount cap
- Instant discount versus cashback
- Membership/payment/booking warnings
- Stale offer warnings

Cashback never reduces final payable. Every customer-facing result includes source, last checked time, verification status and the warning:

“Offers may change anytime. Please verify on the platform before booking or payment.”

## Seed Data

- `src/data/sample-restaurants.ts`: 35 Mumbai restaurants across the requested areas.
- `src/data/sample-offers.ts`: demo offer rules for each restaurant and platform.
- `supabase/seed.sql`: SQL starter data and examples.

Demo offers are marked `needs_review` or `uncertain` unless an admin later verifies real platform source URLs.

## Future Automation

The `scrapers` folder contains compliance-first scaffolds only. Production automation must use approved APIs, partnerships, or legally allowed public pages only. It must never bypass login, CAPTCHA, robots.txt, paywalls, private APIs or technical access controls.

## Deployment

- Deploy Next.js to Vercel.
- Use Supabase for database/auth/storage.
- Set environment variables in Vercel.
- Protect `/admin/*` with Supabase Auth middleware before production use.

## Disclaimer

This app uses safer language such as “estimated saving” and “likely best deal.” It never claims guaranteed savings, confirmed best price, always available offers, or 100% accuracy.
