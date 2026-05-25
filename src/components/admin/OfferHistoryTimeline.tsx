import { offerHistory } from "@/lib/data";

export function OfferHistoryTimeline() {
  return (
    <div className="space-y-3">
      {offerHistory.map((item) => (
        <div key={item.id} className="rounded-lg border border-ink/10 bg-white p-4">
          <div className="text-sm font-semibold">{item.change_reason}</div>
          <div className="mt-1 text-sm text-ink/65">{item.old_offer_text} → {item.new_offer_text}</div>
          <div className="mt-2 text-xs text-ink/50">{new Date(item.changed_at).toLocaleString("en-IN")}</div>
        </div>
      ))}
    </div>
  );
}
