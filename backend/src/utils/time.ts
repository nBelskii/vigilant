// Edmonton's open data feeds return naive timestamps ("2026-06-10T23:43:53.000")
// that represent local Edmonton time with no offset. Converts wall-clock
// Edmonton time to a correct UTC ISO string so clients can render it in any
// timezone without double-shifting.
export function edmontonLocalToUTCISO(localDateTime: string): string {
  const naiveUTC = new Date(`${localDateTime.replace(" ", "T").slice(0, 19)}Z`);

  const edmontonString = naiveUTC.toLocaleString("en-US", { timeZone: "America/Edmonton" });
  const edmontonAsUTC = new Date(`${edmontonString} UTC`);
  const offsetMs = naiveUTC.getTime() - edmontonAsUTC.getTime();

  return new Date(naiveUTC.getTime() + offsetMs).toISOString();
}
