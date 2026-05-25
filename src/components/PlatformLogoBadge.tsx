import { BadgeIndianRupee } from "lucide-react";

export function PlatformLogoBadge({ name }: { name: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-ink/10 bg-white px-2.5 py-1 text-xs font-medium text-ink/75">
      <BadgeIndianRupee size={14} className="text-leaf" />
      {name}
    </span>
  );
}
