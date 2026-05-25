"use client";

import { Users } from "lucide-react";
import { Input } from "./ui/Input";

export function PeopleSelector({ value, onChange }: { value: number; onChange: (value: number) => void }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium">People</span>
      <div className="relative">
        <Users className="pointer-events-none absolute left-3 top-3 text-ink/45" size={18} />
        <Input min={1} max={30} type="number" value={value} onChange={(event) => onChange(Number(event.target.value))} className="pl-10" />
      </div>
    </label>
  );
}
