import type { SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Select({ className, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={cn("focus-ring min-h-11 w-full rounded-lg border border-ink/15 bg-white px-3 text-sm text-ink", className)} {...props} />;
}
