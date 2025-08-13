export function formatUtc(iso, options = {}) {
  // Trim microseconds (e.g., 2025-08-13T01:07:12.444940Z → …12.444Z)
  const clean = iso.replace(/(\.\d{3})\d+Z$/, "$1Z");
  const d = new Date(clean);

  const fmt = new Intl.DateTimeFormat(undefined, {
    month: "short",   // Aug
    day: "2-digit",   // 12
    year: "numeric",  // 2025
    hour: "numeric",  // 8 PM
    minute: "2-digit",
    timeZoneName: "short", // CDT
    ...options, // you can pass { timeZone: 'America/Chicago' } if you want to lock it
  });

  return fmt.format(d);
}