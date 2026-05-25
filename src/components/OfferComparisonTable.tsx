import { ExternalLink } from "lucide-react";
import type { ComparedOffer } from "@/types/comparison";
import { formatDateTime } from "@/lib/dateTime";
import { formatINR } from "@/lib/money";
import { VerificationStatusBadge } from "./VerificationStatusBadge";

export function OfferComparisonTable({ offers }: { offers: ComparedOffer[] }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-ink/10 bg-white">
      <table className="min-w-[1180px] w-full text-left text-sm">
        <thead className="bg-cream text-xs uppercase text-ink/60">
          <tr>
            {["Platform", "Offer", "Valid Now?", "Type", "Min Bill", "Max Cap", "Membership", "Payment", "Valid Time", "Estimated Instant Saving", "Cashback Value", "Final Payable", "Conditions", "Source", "Last Checked"].map((head) => <th key={head} className="px-3 py-3">{head}</th>)}
          </tr>
        </thead>
        <tbody>
          {offers.map((item) => (
            <tr key={item.offer.id} className="border-t border-ink/8 align-top">
              <td className="px-3 py-3 font-medium">{item.platform_name}</td>
              <td className="px-3 py-3">{item.offer.offer_text}</td>
              <td className="px-3 py-3">{item.valid ? "Yes" : item.invalid_reasons.join(", ") || item.status}</td>
              <td className="px-3 py-3">{item.offer.cashback_or_instant}</td>
              <td className="px-3 py-3">{item.offer.minimum_bill ? formatINR(item.offer.minimum_bill) : "-"}</td>
              <td className="px-3 py-3">{item.offer.maximum_discount_cap ? formatINR(item.offer.maximum_discount_cap) : "-"}</td>
              <td className="px-3 py-3">{item.offer.membership_required ? item.offer.membership_text || "Required" : "No"}</td>
              <td className="px-3 py-3">{item.offer.payment_required ? item.offer.payment_text || "Required" : "No"}</td>
              <td className="px-3 py-3">{item.offer.valid_start_time || "All day"}-{item.offer.valid_end_time || ""}</td>
              <td className="px-3 py-3 font-semibold text-leaf">{formatINR(item.instant_saving)}</td>
              <td className="px-3 py-3">{formatINR(item.cashback_value)}</td>
              <td className="px-3 py-3">{formatINR(item.final_payable)}</td>
              <td className="px-3 py-3">{[item.offer.terms_text, ...item.warnings].filter(Boolean).join(" ")}</td>
              <td className="px-3 py-3">
                <a className="inline-flex items-center gap-1 text-leaf" href={item.offer.source_url || item.offer.offer_url || "#"} target="_blank" rel="noreferrer">Open <ExternalLink size={13} /></a>
                <div className="mt-2"><VerificationStatusBadge status={item.offer.verification_status} /></div>
              </td>
              <td className="px-3 py-3">{formatDateTime(item.offer.last_checked_at)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
