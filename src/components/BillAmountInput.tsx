"use client";

import { IndianRupee } from "lucide-react";
import { Input } from "./ui/Input";

export function BillAmountInput({ value, onChange }: { value: number; onChange: (value: number) => void }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium">Expected bill</span>
      <div className="relative">
        <IndianRupee className="pointer-events-none absolute left-3 top-3 text-ink/45" size={18} />
        <Input min={1} type="number" value={value} onChange={(event) => onChange(Number(event.target.value))} className="pl-10" />
      </div>
    </label>
  );
}
