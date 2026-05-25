import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn("focus-ring min-h-11 w-full rounded-lg border border-ink/15 bg-white px-3 text-sm text-ink placeholder:text-ink/45", className)} {...props} />;
}
