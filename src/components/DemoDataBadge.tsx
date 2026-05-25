import { hasSupabaseEnv } from "@/lib/supabaseClient";

export function DemoDataBadge() {
  if (hasSupabaseEnv()) return null;
  return (
    <div className="rounded-lg border border-amber/25 bg-amber/10 px-4 py-3 text-sm text-ink/75">
      Demo seed data is being shown. Configure Supabase environment variables to use live restaurants and offers.
    </div>
  );
}
