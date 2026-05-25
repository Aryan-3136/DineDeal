import { ComparePageClient } from "./page-client";

type CompareSearchParams = {
  restaurant_id?: string;
  bill_amount?: string;
  date?: string;
  time?: string;
  people_count?: string;
};

export default function ComparePage({ searchParams }: { searchParams: CompareSearchParams }) {
  return <ComparePageClient initialParams={searchParams} />;
}
