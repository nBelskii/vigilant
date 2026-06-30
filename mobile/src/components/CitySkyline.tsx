import React from "react";
import Svg, { Rect, Circle, Defs, LinearGradient, Stop } from "react-native-svg";

interface CitySkylineProps {
  city: string;
  width: number;
  height: number;
}

// Per-city color palette: [skyGradientTop, skyGradientBottom, buildingFill, windowColor]
const CITY_PALETTES: Record<string, [string, string, string, string]> = {
  "Edmonton, AB": ["#0D1F3C", "#162940", "#1E3A5F", "#FFD166"],
  "Calgary, AB":  ["#2A1500", "#3D1F00", "#5C3000", "#FF9F1C"],
  "Toronto, ON":  ["#0B1929", "#122034", "#1A3048", "#90E0EF"],
  "Vancouver, BC":["#061A16", "#0A2A1E", "#0F3D2A", "#80FFBA"],
};
const DEFAULT_PALETTE: [string, string, string, string] = ["#111827", "#1F2937", "#2D3748", "#F5F5F5"];

// Tiny deterministic PRNG seeded by city name — ensures the same city always
// renders the same skyline, different cities get visually distinct profiles.
function seed(name: string): () => number {
  let s = [...name].reduce((acc, c) => (acc * 31 + c.charCodeAt(0)) | 0, 1);
  return () => {
    s = (s ^ (s << 13)) | 0;
    s = (s ^ (s >> 7)) | 0;
    s = (s ^ (s << 17)) | 0;
    return (s >>> 0) / 0xffffffff;
  };
}

export function CitySkyline({ city, width, height }: CitySkylineProps) {
  const palette = CITY_PALETTES[city] ?? DEFAULT_PALETTE;
  const [skyTop, skyBottom, bldgColor, winColor] = palette;

  const rand = seed(city);
  const buildingCount = 8 + Math.floor(rand() * 5); // 8–12 buildings
  const groundY = height;
  const maxH = height * 0.78;

  // Generate building data: x, w, h
  const totalW = width;
  const avgW = totalW / buildingCount;
  let cursor = 0;
  const buildings: { x: number; w: number; h: number }[] = [];
  for (let i = 0; i < buildingCount; i++) {
    const bw = avgW * (0.55 + rand() * 0.9);
    const bh = maxH * (0.25 + rand() * 0.75);
    buildings.push({ x: cursor, w: bw, h: bh });
    cursor += bw * 0.92;
    if (cursor > totalW - bw) break;
  }

  // Scatter any remaining width across buildings (keep flush)
  const lastX = buildings[buildings.length - 1];
  const extra = totalW - (lastX.x + lastX.w);
  buildings.forEach((b) => { b.x += (b.x / totalW) * extra; });

  return (
    <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <Defs>
        <LinearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor={skyTop} />
          <Stop offset="100%" stopColor={skyBottom} />
        </LinearGradient>
      </Defs>

      {/* Sky background */}
      <Rect x={0} y={0} width={width} height={height} fill="url(#sky)" />

      {/* Buildings */}
      {buildings.map((b, i) => {
        const bY = groundY - b.h;
        // Windows: small dots, 2–3 columns x variable rows
        const cols = 2;
        const winW = 4;
        const winH = 3;
        const xGap = (b.w - cols * winW) / (cols + 1);
        const rowCount = Math.floor(b.h / 12);
        const winRows: { wx: number; wy: number; lit: boolean }[] = [];
        for (let row = 0; row < rowCount; row++) {
          for (let col = 0; col < cols; col++) {
            winRows.push({
              wx: b.x + xGap + col * (winW + xGap),
              wy: bY + 8 + row * 12,
              lit: rand() > 0.35,
            });
          }
        }
        return (
          <React.Fragment key={i}>
            <Rect x={b.x} y={bY} width={b.w} height={b.h} fill={bldgColor} rx={1} />
            {winRows.filter((w) => w.lit).map((w, j) => (
              <Rect key={j} x={w.wx} y={w.wy} width={winW} height={winH} fill={winColor} opacity={0.7 + rand() * 0.3} rx={0.5} />
            ))}
          </React.Fragment>
        );
      })}

      {/* Ground line */}
      <Rect x={0} y={groundY - 1} width={width} height={2} fill={bldgColor} opacity={0.6} />
    </Svg>
  );
}
