import { ExternalLink, Trophy } from "lucide-react";
import type { ComparedOffer } from "@/types/comparison";
import { formatINR } from "@/lib/money";
import { LastCheckedBadge } from "./LastCheckedBadge";
import { VerificationStatusBadge } from "./VerificationStatusBadge";

export function BestDealCard({ deal, billAmount }: { deal: ComparedOffer | null; billAmount: number }) {
  if (!deal) {
    return <div className="rounded-lg border border-ink/10 bg-white p-5 text-sm text-ink/65">No valid instant discount found for this input. Check cashback and unavailable offers below.</div>;
  }

  return (
    <section className="rounded-lg border border-leaf/20 bg-leaf/10 p-5 shadow-soft">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-leaf text-white px-3 py-1 text-xs font-semibold">
            <Trophy size={15} /> Likely best deal
          </div>
          <h2 className="text-2xl font-semibold">{deal.platform_name}</h2>
          <p className="mt-1 text-sm text-ink/70">{deal.reason}</p>
        </div>
        <div className="text-right">
          <div className="text-sm text-ink/60">Estimated instant saving</div>
          <div className="text-3xl font-semibold text-leaf">{formatINR(deal.instant_saving)}</div>
          <div className="text-sm text-ink/65">Final payable {formatINR(deal.final_payable)} on {formatINR(billAmount)}</div>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <VerificationStatusBadge status={deal.offer.verification_status} />
        <LastCheckedBadge value={deal.offer.last_checked_at} />
        <a className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-xs font-semibold text-leaf" href={deal.offer.offer_url || deal.offer.source_url || "#"} target="_blank" rel="noreferrer">
          Open platform <ExternalLink size={13} />
        </a>
      </div>
    </section>
  );
}
