import fetch from "node-fetch";

const EPS_OCCURRENCES_URL =
  "https://services9.arcgis.com/pkzvt2xlZJnPgk1Z/arcgis/rest/services/EPS_OCC_30DAY/FeatureServer/0/query";

const EDMONTON_INCIDENTS_URL = "https://data.edmonton.ca/resource/7hsn-idqi.json";

export interface TrendBucket {
  weekLabel: string;
  weekStart: string;
  crime: number;
  fire: number;
  traffic: number;
}

export interface TrendsData {
  weeks: TrendBucket[];
  hourly: number[];
  peakHour: number;
  totalCrime: number;
  totalFire: number;
  totalTraffic: number;
  dataSource: string;
}

function weekLabel(date: Date): string {
  return date.toLocaleDateString("en-CA", { month: "short", day: "numeric", timeZone: "America/Edmonton" });
}

function bucketIndex(timestamp: number, now: number): number {
  const daysAgo = (now - timestamp) / (1000 * 60 * 60 * 24);
  if (daysAgo < 7) return 3;
  if (daysAgo < 14) return 2;
  if (daysAgo < 21) return 1;
  return 0;
}

function edmontonHour(isoTimestamp: string): number {
  const date = new Date(isoTimestamp);
  const edmonton = date.toLocaleString("en-CA", { hour: "numeric", hour12: false, timeZone: "America/Edmonton" });
  return parseInt(edmonton, 10) % 24;
}

export async function fetchTrends(): Promise<TrendsData> {
  const now = Date.now();
  const cutoff30 = new Date(now - 30 * 24 * 60 * 60 * 1000);

  const weeks: TrendBucket[] = Array.from({ length: 4 }, (_, i) => {
    const weekStart = new Date(now - (28 - i * 7) * 24 * 60 * 60 * 1000);
    return { weekLabel: weekLabel(weekStart), weekStart: weekStart.toISOString(), crime: 0, fire: 0, traffic: 0 };
  });

  const hourly = new Array<number>(24).fill(0);
  let totalCrime = 0;
  let totalFire = 0;
  let totalTraffic = 0;

  // EPS crime occurrences — 30 days
  try {
    const where = encodeURIComponent(`Reported_Date >= TIMESTAMP '${cutoff30.toISOString().slice(0, 19).replace("T", " ")}'`);
    const url = `${EPS_OCCURRENCES_URL}?where=${where}&outFields=Reported_Date,Occurrence_Type_Group&outSR=4326&f=json&resultRecordCount=500`;
    const res = await fetch(url);
    if (res.ok) {
      const data = (await res.json()) as { features?: { attributes: Record<string, any> }[] };
      for (const feature of data.features ?? []) {
        const ts = feature.attributes.Reported_Date as number;
        if (!ts) continue;
        const date = new Date(ts);
        const bi = bucketIndex(date.getTime(), now);
        weeks[bi].crime += 1;
        totalCrime += 1;
        hourly[edmontonHour(date.toISOString())] += 1;
      }
    }
  } catch (err) {
    console.error("trendsService crime fetch error:", err);
  }

  // Edmonton fire/EMS incidents — 30 days
  try {
    const cutoffStr = cutoff30.toISOString().slice(0, 10);
    const url = `${EDMONTON_INCIDENTS_URL}?$where=dispatch_date_date>'${cutoffStr}T00:00:00.000'&$limit=500&$select=dispatch_datetime,event_type_group`;
    const res = await fetch(url);
    if (res.ok) {
      const data = (await res.json()) as Record<string, any>[];
      for (const row of data) {
        const raw = row.dispatch_datetime as string | undefined;
        if (!raw) continue;
        const date = new Date(raw);
        if (Number.isNaN(date.getTime())) continue;
        const bi = bucketIndex(date.getTime(), now);
        const group = ((row.event_type_group as string) ?? "").toUpperCase();
        if (group.includes("FIRE") || group.includes("MEDICAL") || group.includes("RESCUE")) {
          weeks[bi].fire += 1;
          totalFire += 1;
        } else if (group.includes("TRAFFIC") || group.includes("MVC") || group.includes("COLLISION")) {
          weeks[bi].traffic += 1;
          totalTraffic += 1;
        } else {
          weeks[bi].fire += 1;
          totalFire += 1;
        }
        hourly[edmontonHour(date.toISOString())] += 1;
      }
    }
  } catch (err) {
    console.error("trendsService fire fetch error:", err);
  }

  const peakHour = hourly.indexOf(Math.max(...hourly));

  return { weeks, hourly, peakHour, totalCrime, totalFire, totalTraffic, dataSource: "EPS + Edmonton Fire/EMS" };
}
