import { Dimensions } from 'react-native';

const { width: WINDOW_WIDTH, height: WINDOW_HEIGHT } = Dimensions.get('window');

// Standard modern smartphone baseline (iPhone 13/14/15, modern ~6" Android baseline)
const GUIDELINE_BASE_WIDTH = 390;
const GUIDELINE_BASE_HEIGHT = 844;

export const SCREEN_WIDTH = WINDOW_WIDTH;
export const SCREEN_HEIGHT = WINDOW_HEIGHT;

export const isSmallDevice = WINDOW_WIDTH < 375;
export const isLargeDevice = WINDOW_WIDTH >= 412;

/**
 * Linearly scales horizontal dimensions based on screen width.
 */
export const scale = (size: number): number => {
  return Math.round((WINDOW_WIDTH / GUIDELINE_BASE_WIDTH) * size);
};

/**
 * Linearly scales vertical dimensions based on screen height.
 */
export const verticalScale = (size: number): number => {
  return Math.round((WINDOW_HEIGHT / GUIDELINE_BASE_HEIGHT) * size);
};

/**
 * Moderate scaling applies a damping factor so sizes scale gently
 * on larger phones without expanding too aggressively.
 */
export const moderateScale = (size: number, factor = 0.4): number => {
  return Math.round(size + (scale(size) - size) * factor);
};

export const moderateVerticalScale = (size: number, factor = 0.4): number => {
  return Math.round(size + (verticalScale(size) - size) * factor);
};

/**
 * Responsive font scaling with an absolute minimum floor of 11.5dp,
 * preventing illegible microscopic text on any mobile screen.
 */
export const responsiveFont = (size: number, factor = 0.35): number => {
  const scaled = moderateScale(size, factor);
  return Math.max(11.5, scaled);
};
