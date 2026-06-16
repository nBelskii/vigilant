export interface Incident {
  id: string;
  type: string;
  location: string;
  lat: number | null;
  lng: number | null;
  timestamp: string;
  source?: "city" | "police" | "social";
  url?: string;
}

export interface Alert {
  id: string;
  title: string;
  severity: string;
  location: string;
  timestamp: string;
  category?: "traffic" | "weather";
}

export interface AirQuality {
  city: string;
  aqhi: number | null;
  category: string;
  timestamp: string;
}
