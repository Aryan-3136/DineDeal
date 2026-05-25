import { OfferHistoryTimeline } from "@/components/admin/OfferHistoryTimeline";
import { getOfferHistory } from "@/lib/data";

export default async function OfferHistoryPage() {
  const history = await getOfferHistory();
  return <main className="mx-auto max-w-5xl px-4 py-8"><h1 className="mb-5 text-3xl font-semibold">Offer History</h1><OfferHistoryTimeline history={history} /></main>;
}
