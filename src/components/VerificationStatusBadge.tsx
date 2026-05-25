import type { VerificationStatus } from "@/types/offer";

const styles: Record<VerificationStatus, string> = {
  verified: "bg-leaf/10 text-leaf",
  needs_review: "bg-amber/12 text-amber",
  uncertain: "bg-amber/12 text-amber",
  expired: "bg-ink/10 text-ink/55"
};

export function VerificationStatusBadge({ status }: { status: VerificationStatus }) {
  return <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${styles[status]}`}>{status.replace("_", " ")}</span>;
}
