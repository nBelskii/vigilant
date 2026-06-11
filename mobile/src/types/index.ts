export interface Incident {
  id: string;
  type: string;
  location: string;
  lat: number | null;
  lng: number | null;
  timestamp: string;
}

export interface Alert {
  id: string;
  title: string;
  severity: string;
  location: string;
  timestamp: string;
}

export interface AirQuality {
  city: string;
  aqhi: number | null;
  category: string;
  timestamp: string;
}

export type IncidentCategory = "crime" | "fire" | "traffic" | "other";
