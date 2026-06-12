export * from "./colors";

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 22,
  full: 999,
} as const;

// Extra bottom padding so scroll content clears the floating tab bar.
export const tabBarClearance = 100;

// Height of the floating CustomTabBar pill itself (paddingVertical * 2 + icon
// size), excluding safe-area inset. Combine with useSafeAreaInsets().bottom
// for an exact clearance value.
export const tabBarHeight = 64;
export const tabBarBottomMargin = 12;

export const typography = {
  display: { fontSize: 28, fontWeight: "800" as const },
  title: { fontSize: 24, fontWeight: "700" as const },
  heading: { fontSize: 18, fontWeight: "600" as const },
  subheading: { fontSize: 15, fontWeight: "600" as const },
  body: { fontSize: 14, fontWeight: "400" as const },
  caption: { fontSize: 12, fontWeight: "400" as const },
};
