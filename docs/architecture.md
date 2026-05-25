# Architecture

DineDeal Mumbai uses Next.js App Router for public pages, admin pages and API routes. Supabase PostgreSQL stores restaurants, platform links, offers, history, admin users and search analytics.

The MVP includes TypeScript seed data so the app is demo-ready before Supabase is configured. In production, API routes can replace the sample data calls with Supabase queries, including the `search_restaurants` trigram function.

Core modules:
- `src/lib/compareOffers.ts` contains offer validation, savings calculation and ranking.
- `src/lib/dateTime.ts` detects day, weekend and meal type.
- `src/lib/search.ts` provides local fuzzy fallback.
- `supabase/schema.sql` defines the scalable data model and indexes.
