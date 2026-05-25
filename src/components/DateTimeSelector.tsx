"use client";

import { Input } from "./ui/Input";

export function DateTimeSelector({ date, time, onDate, onTime }: { date: string; time: string; onDate: (value: string) => void; onTime: (value: string) => void }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <label>
        <span className="mb-1 block text-sm font-medium">Date</span>
        <Input type="date" value={date} onChange={(event) => onDate(event.target.value)} />
      </label>
      <label>
        <span className="mb-1 block text-sm font-medium">Time</span>
        <Input type="time" value={time} onChange={(event) => onTime(event.target.value)} />
      </label>
    </div>
  );
}
