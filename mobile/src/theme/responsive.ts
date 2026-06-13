import { Dimensions, PixelRatio, Platform } from "react-native";

// Baseline design size (iPhone 14/15/16 width-class). All scale helpers are
// relative to this so layouts built against it stay proportional on smaller
// phones (SE), larger phones (Pro Max), and tablets.
const BASE_WIDTH = 390;
const BASE_HEIGHT = 844;

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

export { SCREEN_WIDTH, SCREEN_HEIGHT };

// Breakpoints by device width.
export const isSmallDevice = SCREEN_WIDTH < 375; // iPhone SE / mini
export const isLargeDevice = SCREEN_WIDTH >= 428; // Pro Max / large Android
export const isTablet = SCREEN_WIDTH >= 768;

/** Scales a size horizontally relative to the baseline screen width. */
export function scale(size: number): number {
  return (SCREEN_WIDTH / BASE_WIDTH) * size;
}

/** Scales a size vertically relative to the baseline screen height. */
export function verticalScale(size: number): number {
  return (SCREEN_HEIGHT / BASE_HEIGHT) * size;
}

/**
 * Scales a size with a damping factor so it doesn't grow/shrink as
 * aggressively as `scale`. Ideal for font sizes and padding — keeps text
 * readable on small devices without overflowing on large ones.
 */
export function moderateScale(size: number, factor = 0.5): number {
  return size + (scale(size) - size) * factor;
}

/** Rounds a scaled value to the nearest pixel for crisp borders/text. */
export function pixelRound(size: number): number {
  return PixelRatio.roundToNearestPixel(size);
}

// Shared horizontal page padding — slightly tighter on small devices so
// content has more breathing room and doesn't run into the screen edges.
export const screenPadding = isSmallDevice ? 12 : 16;

// Max content width for large devices/tablets so single-column content
// doesn't stretch into uncomfortably wide lines.
export const maxContentWidth = isTablet ? 640 : SCREEN_WIDTH;

export const isIOS = Platform.OS === "ios";
