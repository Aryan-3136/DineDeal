import { ComparePageClient } from "@/app/compare/page-client";
import { DiscountQuickFilters } from "./DiscountQuickFilters";
import { SmartDealSections } from "./SmartDealSections";

type InitialParams = {
  restaurant_id?: string;
  bill_amount?: string;
  date?: string;
  time?: string;
  people_count?: string;
};

export async function CompareLandingPage({ initialParams = {} }: { initialParams?: InitialParams }) {
  return (
    <main>
      <ComparePageClient initialParams={initialParams} />
      <DiscountQuickFilters />
      <SmartDealSections />
    </main>
  );
}
