// MySQL timestamps come back as "YYYY-MM-DD HH:MM:SS" (dateStrings: true in
// the backend pool config) — slicing avoids a timezone-converting Date parse
// when all we want is the clock reading the server already recorded.
export function formatClock(occurredAt: string): string {
  return occurredAt.slice(11, 16);
}
