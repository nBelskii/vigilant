export * from "./colors";
export * from "./responsive";

import { moderateScale } from "./responsive";

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const radius = {
  sm: 10,
  md: 14,
  lg: 20,
  xl: 28,
  full: 999,
} as const;

// Clean bold sans-serif, loaded via @expo-google-fonts/instrument-sans in
// App.tsx and applied globally — see fontFamily usage in typography below.
export const fontFamily = {
  regular: "InstrumentSans_400Regular",
  medium: "InstrumentSans_500Medium",
  bold: "InstrumentSans_700Bold",
};

// Extra bottom padding so scroll content clears the docked tab bar
// (bar base ~54px + up to 44px safe-area inset on notched devices).
export const tabBarClearance = 100;

// Base height of the docked tab bar (icon + label + vertical padding),
// excluding safe-area inset. Add useSafeAreaInsets().bottom for precise
// positioning above the bar (e.g. the Map FAB).
export const tabBarHeight = 54;
export const tabBarBottomMargin = 0;

export const typography = {
  display: { fontSize: moderateScale(30), fontWeight: "800" as const, fontFamily: fontFamily.bold },
  title: { fontSize: moderateScale(24), fontWeight: "700" as const, fontFamily: fontFamily.bold },
  heading: { fontSize: moderateScale(18), fontWeight: "600" as const, fontFamily: fontFamily.medium },
  subheading: { fontSize: moderateScale(15), fontWeight: "600" as const, fontFamily: fontFamily.medium },
  body: { fontSize: moderateScale(14), fontWeight: "400" as const, fontFamily: fontFamily.regular },
  caption: { fontSize: moderateScale(12), fontWeight: "400" as const, fontFamily: fontFamily.regular },
};
