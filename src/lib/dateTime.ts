export const DAY_NAMES = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"] as const;

export function getDayInfo(dateText: string) {
  const date = new Date(`${dateText}T00:00:00`);
  const day = DAY_NAMES[date.getDay()] ?? "monday";
  return {
    day,
    isWeekend: day === "saturday" || day === "sunday"
  };
}

export function detectMealType(timeText: string): "lunch" | "dinner" | "unknown" {
  const minutes = timeToMinutes(timeText);
  if (minutes >= 11 * 60 && minutes <= 16 * 60) return "lunch";
  if (minutes >= 18 * 60 && minutes <= 23 * 60 + 59) return "dinner";
  return "unknown";
}

export function timeToMinutes(timeText?: string | null) {
  if (!timeText) return 0;
  const [hours = "0", minutes = "0"] = timeText.split(":");
  return Number(hours) * 60 + Number(minutes);
}

export function isOlderThanHours(value: string | null | undefined, hours: number) {
  if (!value) return true;
  return Date.now() - new Date(value).getTime() > hours * 60 * 60 * 1000;
}

export function formatDateTime(value?: string | null) {
  if (!value) return "Not checked";
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Kolkata"
  }).format(new Date(value));
}
