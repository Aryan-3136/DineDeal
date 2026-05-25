import { Clock3 } from "lucide-react";
import { formatDateTime } from "@/lib/dateTime";

export function LastCheckedBadge({ value }: { value?: string | null }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-mist px-2.5 py-1 text-xs text-ink/70">
      <Clock3 size={14} />
      Last checked: {formatDateTime(value)}
    </span>
  );
}
