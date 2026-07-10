export const DAYS = [
  { value: 1, label: "Mon", fullLabel: "Monday" },
  { value: 2, label: "Tue", fullLabel: "Tuesday" },
  { value: 3, label: "Wed", fullLabel: "Wednesday" },
  { value: 4, label: "Thu", fullLabel: "Thursday" },
  { value: 5, label: "Fri", fullLabel: "Friday" },
  { value: 6, label: "Sat", fullLabel: "Saturday" },
  { value: 0, label: "Sun", fullLabel: "Sunday" },
] as const;

export const TIME_BLOCKS = [
  { label: "Morning", start: "08:00", end: "12:00" },
  { label: "Afternoon", start: "12:00", end: "16:00" },
  { label: "Evening", start: "16:00", end: "20:00" },
  { label: "Late", start: "20:00", end: "23:00" },
] as const;

export function availabilityKey(
  dayOfWeek: number,
  startTime: string,
  endTime: string,
): string {
  return `${dayOfWeek}:${startTime}-${endTime}`;
}

export function getDayLabel(dayOfWeek: number): string {
  return DAYS.find((day) => day.value === dayOfWeek)?.fullLabel ?? "Unknown day";
}

export function getTimeBlockLabel(startTime: string, endTime: string): string {
  return (
    TIME_BLOCKS.find(
      (block) => block.start === startTime && block.end === endTime,
    )?.label ?? `${startTime} - ${endTime}`
  );
}
