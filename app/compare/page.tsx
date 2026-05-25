import { ComparePageClient } from "./page-client";
import { CompareForm } from "@/components/CompareForm";

type CompareSearchParams = {
  restaurant_id?: string;
  bill_amount?: string;
  date?: string;
  time?: string;
  people_count?: string;
};

export default function ComparePage({ searchParams }: { searchParams: CompareSearchParams }) {
  if (!searchParams.restaurant_id) {
    return (
      <main className="mx-auto max-w-7xl space-y-5 px-4 py-8">
        <section>
          <h1 className="text-3xl font-semibold">Compare Restaurant Deals</h1>
          <p className="mt-2 text-ink/65">Select a restaurant first to compare offers.</p>
        </section>
        <CompareForm />
      </main>
    );
  }

  return <ComparePageClient initialParams={searchParams} />;
}
