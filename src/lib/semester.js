/**
 * Derives a semester string from a date.
 * Aug 1 – Dec 31 → "Fall YYYY"
 * Jan 1 – May 31 → "Spring YYYY"
 * Jun 1 – Jul 31 → "Summer YYYY"
 */
export function getSemester(date = new Date()) {
  const d = date instanceof Date ? date : new Date(date);
  const month = d.getMonth(); // 0-indexed
  const year = d.getFullYear();
  if (month >= 7) return `Fall ${year}`;       // Aug (7) – Dec (11)
  if (month <= 4) return `Spring ${year}`;     // Jan (0) – May (4)
  return `Summer ${year}`;                      // Jun (5) – Jul (6)
}
