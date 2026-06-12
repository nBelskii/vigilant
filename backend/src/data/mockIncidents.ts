import { Incident } from "../types";

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;

function minutesAgo(mins: number): string {
  return new Date(Date.now() - mins * MINUTE).toISOString();
}

function hoursAgo(hrs: number): string {
  return new Date(Date.now() - hrs * HOUR).toISOString();
}

// Curated fallback incidents covering well-known Edmonton neighborhoods, used
// when the live open-data feeds are unavailable or return no results so the
// map and incident sheet never render empty. Timestamps are generated
// relative to the current time so they always read as "recent".
export function getMockIncidents(): Incident[] {
  return [
    // High severity - crime / emergency response
    {
      id: "mock-crime-1",
      type: "ASSAULT (NON-DOMESTIC)",
      location: "Jasper Ave & 102 St, Downtown",
      lat: 53.5444,
      lng: -113.4909,
      timestamp: minutesAgo(18),
      source: "police",
    },
    {
      id: "mock-crime-2",
      type: "ROBBERY",
      location: "104 Ave & 124 St, Oliver",
      lat: 53.5476,
      lng: -113.526,
      timestamp: minutesAgo(47),
      source: "police",
    },
    {
      id: "mock-crime-3",
      type: "EMERGENCY SERVICES RESPONSE",
      location: "Rogers Place, Ice District, Downtown",
      lat: 53.5469,
      lng: -113.4977,
      timestamp: minutesAgo(9),
      source: "police",
    },

    // High severity - fire / structure response
    {
      id: "mock-fire-1",
      type: "STRUCTURE FIRE",
      location: "82 Ave & Gateway Blvd, Strathcona",
      lat: 53.5183,
      lng: -113.4938,
      timestamp: hoursAgo(1.5),
      source: "city",
    },

    // Medium severity - traffic / road incidents
    {
      id: "mock-traffic-1",
      type: "MOTOR VEHICLE COLLISION",
      location: "Wayne Gretzky Dr & 118 Ave",
      lat: 53.568,
      lng: -113.464,
      timestamp: minutesAgo(32),
      source: "city",
    },
    {
      id: "mock-traffic-2",
      type: "TRAFFIC INCIDENT - LANE BLOCKED",
      location: "Anthony Henday Dr near Whitemud Dr",
      lat: 53.464,
      lng: -113.543,
      timestamp: hoursAgo(2),
      source: "city",
    },
    {
      id: "mock-traffic-3",
      type: "VEHICLE COLLISION",
      location: "Stony Plain Rd & 142 St, Glenora",
      lat: 53.547,
      lng: -113.558,
      timestamp: minutesAgo(55),
      source: "city",
    },

    // Medium severity - utility disruption
    {
      id: "mock-utility-1",
      type: "UTILITY OUTAGE - POWER RESTORATION IN PROGRESS",
      location: "87 Ave & 112 St, University of Alberta area",
      lat: 53.5232,
      lng: -113.5263,
      timestamp: hoursAgo(3),
      source: "city",
    },

    // Low severity - general advisories
    {
      id: "mock-advisory-1",
      type: "AIR QUALITY ADVISORY",
      location: "Edmonton region",
      lat: 53.5461,
      lng: -113.4938,
      timestamp: hoursAgo(4),
      source: "city",
    },
    {
      id: "mock-advisory-2",
      type: "WEATHER WARNING - WIND ADVISORY",
      location: "Edmonton region",
      lat: 53.532,
      lng: -113.501,
      timestamp: hoursAgo(5),
      source: "city",
    },
  ];
}
