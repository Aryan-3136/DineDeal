import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Button({ className, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn("focus-ring inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-leaf px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-leaf/90 disabled:cursor-not-allowed disabled:bg-ink/25", className)}
      {...props}
    />
  );
}
