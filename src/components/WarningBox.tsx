import { AlertTriangle } from "lucide-react";

export function WarningBox({ warnings }: { warnings: string[] }) {
  if (!warnings.length) return null;
  return (
    <div className="rounded-lg border border-amber/25 bg-amber/10 p-4 text-sm text-ink">
      <div className="mb-2 flex items-center gap-2 font-semibold text-amber">
        <AlertTriangle size={18} />
        Verify Before Booking
      </div>
      <ul className="space-y-1">
        {warnings.map((warning) => <li key={warning}>{warning}</li>)}
      </ul>
    </div>
  );
}
