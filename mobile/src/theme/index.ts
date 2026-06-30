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
  sm: 2,
  md: 4,
  lg: 8,
  xl: 12,
  full: 999,
} as const;

// Terminal-style monospace font, loaded via @expo-google-fonts/jetbrains-mono
// in App.tsx and applied globally — see fontFamily below.
export const fontFamily = {
  regular: "JetBrainsMono_400Regular",
  medium: "JetBrainsMono_500Medium",
  bold: "JetBrainsMono_700Bold",
};

// Extra bottom padding so scroll content clears the floating tab bar.
export const tabBarClearance = 100;

// Height of the floating CustomTabBar pill itself (paddingVertical * 2 + icon
// size), excluding safe-area inset. Combine with useSafeAreaInsets().bottom
// for an exact clearance value.
export const tabBarHeight = 64;
export const tabBarBottomMargin = 12;

export const typography = {
  display: { fontSize: moderateScale(28), fontWeight: "800" as const, fontFamily: fontFamily.bold },
  title: { fontSize: moderateScale(24), fontWeight: "700" as const, fontFamily: fontFamily.bold },
  heading: { fontSize: moderateScale(18), fontWeight: "600" as const, fontFamily: fontFamily.medium },
  subheading: { fontSize: moderateScale(15), fontWeight: "600" as const, fontFamily: fontFamily.medium },
  body: { fontSize: moderateScale(14), fontWeight: "400" as const, fontFamily: fontFamily.regular },
  caption: { fontSize: moderateScale(12), fontWeight: "400" as const, fontFamily: fontFamily.regular },
};
