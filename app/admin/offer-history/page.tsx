import { OfferHistoryTimeline } from "@/components/admin/OfferHistoryTimeline";
import { getOfferHistory } from "@/lib/data";
import { AccessDenied } from "@/components/admin/AccessDenied";
import { requireAdminPage } from "@/lib/adminPageAuth";

export default async function OfferHistoryPage() {
  const auth = await requireAdminPage();
  if (auth.denied) return <AccessDenied />;
  const history = await getOfferHistory();
  return <main className="mx-auto max-w-5xl px-4 py-8"><h1 className="mb-5 text-3xl font-semibold">Offer History</h1><OfferHistoryTimeline history={history} /></main>;
}
