/**
 * Easing functions for animation timing
 */

import { EasingFunction } from './types.js';

/**
 * Linear easing (no acceleration)
 */
export function linear(t: number): number {
  return t;
}

/**
 * Cubic ease-in-out
 */
export function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

/**
 * Cubic Bézier easing using the standard CSS cubic-bezier function
 */
export function cubicBezier(t: number, p1x: number, p1y: number, p2x: number, p2y: number): number {
  // Implementation of the cubic-bezier function
  // This is a simplified version - in production you'd want a more robust implementation
  // that handles edge cases and uses Newton's method for better accuracy

  const epsilon = 1e-6;

  // Binary search to find t for given x
  let left = 0;
  let right = 1;

  while (right - left > epsilon) {
    const mid = (left + right) / 2;
    const x = cubicBezierPoint(mid, 0, p1x, p2x, 1);

    if (x < t) {
      left = mid;
    } else {
      right = mid;
    }
  }

  return cubicBezierPoint(left, 0, p1y, p2y, 1);
}

/**
 * Helper function for cubic bezier point calculation
 */
function cubicBezierPoint(t: number, p0: number, p1: number, p2: number, p3: number): number {
  const mt = 1 - t;
  return mt * mt * mt * p0 +
         3 * mt * mt * t * p1 +
         3 * mt * t * t * p2 +
         t * t * t * p3;
}

/**
 * Apply easing function to a value
 */
export function applyEasing(t: number, easing: EasingFunction): number {
  if (typeof easing === 'string') {
    switch (easing) {
      case 'linear':
        return linear(t);
      case 'easeInOutCubic':
        return easeInOutCubic(t);
      default:
        return linear(t);
    }
  } else if (Array.isArray(easing) && easing.length === 4) {
    return cubicBezier(t, easing[0], easing[1], easing[2], easing[3]);
  }

  return linear(t);
}

/**
 * Predefined easing functions
 */
export const easings = {
  linear,
  easeInOutCubic,
  easeIn: (t: number) => t * t * t,
  easeOut: (t: number) => 1 - Math.pow(1 - t, 3),
  easeInOut: (t: number) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
  easeInQuad: (t: number) => t * t,
  easeOutQuad: (t: number) => 1 - (1 - t) * (1 - t),
  easeInOutQuad: (t: number) => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2,
} as const;
