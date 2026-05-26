import { CompareLandingPage } from "@/components/CompareLandingPage";

type CompareSearchParams = {
  restaurant_id?: string;
  bill_amount?: string;
  date?: string;
  time?: string;
  people_count?: string;
};

export default function ComparePage({ searchParams }: { searchParams: CompareSearchParams }) {
  return <CompareLandingPage initialParams={searchParams} />;
}
