/**
 * Bézier curve utilities
 */

import { Point, CubicBezierCurve, QuadraticBezierCurve, BezierCurve, LUTEntry, PathLUT } from './types.js';

/**
 * Evaluate a cubic Bézier curve at parameter t (0-1)
 */
export function cubicBezierPoint(curve: CubicBezierCurve, t: number): Point {
  const { start, control1, control2, end } = curve;
  const mt = 1 - t;

  const x = mt * mt * mt * start.x +
           3 * mt * mt * t * control1.x +
           3 * mt * t * t * control2.x +
           t * t * t * end.x;

  const y = mt * mt * mt * start.y +
           3 * mt * mt * t * control1.y +
           3 * mt * t * t * control2.y +
           t * t * t * end.y;

  return { x, y };
}

/**
 * Evaluate a quadratic Bézier curve at parameter t (0-1)
 */
export function quadraticBezierPoint(curve: QuadraticBezierCurve, t: number): Point {
  const { start, control, end } = curve;
  const mt = 1 - t;

  const x = mt * mt * start.x + 2 * mt * t * control.x + t * t * end.x;
  const y = mt * mt * start.y + 2 * mt * t * control.y + t * t * end.y;

  return { x, y };
}

/**
 * Evaluate any Bézier curve at parameter t
 */
export function bezierPoint(curve: BezierCurve, t: number): Point {
  if ('control1' in curve) {
    return cubicBezierPoint(curve, t);
  } else {
    return quadraticBezierPoint(curve, t);
  }
}

/**
 * Approximate the arc length of a cubic Bézier curve using Gauss-Legendre quadrature
 */
export function cubicBezierArcLength(curve: CubicBezierCurve, samples: number = 10): number {
  let length = 0;
  const dt = 1 / samples;

  for (let i = 0; i < samples; i++) {
    const t1 = i * dt;
    const t2 = (i + 1) * dt;

    const p1 = cubicBezierPoint(curve, t1);
    const p2 = cubicBezierPoint(curve, t2);

    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    length += Math.sqrt(dx * dx + dy * dy);
  }

  return length;
}

/**
 * Approximate the arc length of a quadratic Bézier curve
 */
export function quadraticBezierArcLength(curve: QuadraticBezierCurve, samples: number = 10): number {
  let length = 0;
  const dt = 1 / samples;

  for (let i = 0; i < samples; i++) {
    const t1 = i * dt;
    const t2 = (i + 1) * dt;

    const p1 = quadraticBezierPoint(curve, t1);
    const p2 = quadraticBezierPoint(curve, t2);

    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    length += Math.sqrt(dx * dx + dy * dy);
  }

  return length;
}

/**
 * Create a Look-Up Table for a Bézier curve for fast length-to-parameter conversion
 */
export function createBezierLUT(curve: BezierCurve, resolution: number = 1): PathLUT {
  const entries: LUTEntry[] = [];
  let totalLength = 0;

  // Sample points along the curve
  const numSamples = Math.max(10, Math.ceil(bezierArcLength(curve) * resolution));
  const dt = 1 / numSamples;

  for (let i = 0; i <= numSamples; i++) {
    const t = i * dt;
    const point = bezierPoint(curve, t);

    entries.push({
      t,
      point,
      length: totalLength,
    });

    if (i < numSamples) {
      const nextPoint = bezierPoint(curve, (i + 1) * dt);
      const dx = nextPoint.x - point.x;
      const dy = nextPoint.y - point.y;
      totalLength += Math.sqrt(dx * dx + dy * dy);
    }
  }

  return {
    entries,
    totalLength,
    resolution,
  };
}

/**
 * Convert arc length to parameter t using binary search on LUT
 */
export function lengthToParameter(lut: PathLUT, targetLength: number): number {
  if (targetLength <= 0) return 0;
  if (targetLength >= lut.totalLength) return 1;

  // Binary search
  let left = 0;
  let right = lut.entries.length - 1;

  while (left < right) {
    const mid = Math.floor((left + right) / 2);
    const entry = lut.entries[mid];

    if (entry.length < targetLength) {
      left = mid + 1;
    } else {
      right = mid;
    }
  }

  // Linear interpolation between the two closest points
  const entry1 = lut.entries[left - 1];
  const entry2 = lut.entries[left];

  if (!entry1 || !entry2) return 0;

  const lengthDiff = entry2.length - entry1.length;
  if (lengthDiff === 0) return entry1.t;

  const t = (targetLength - entry1.length) / lengthDiff;
  return entry1.t + t * (entry2.t - entry1.t);
}

/**
 * Get arc length of any Bézier curve
 */
export function bezierArcLength(curve: BezierCurve, samples: number = 10): number {
  if ('control1' in curve) {
    return cubicBezierArcLength(curve, samples);
  } else {
    return quadraticBezierArcLength(curve, samples);
  }
}

/**
 * Split a cubic Bézier curve at parameter t
 */
export function splitCubicBezier(curve: CubicBezierCurve, t: number): [CubicBezierCurve, CubicBezierCurve] {
  const { start, control1, control2, end } = curve;
  const mt = 1 - t;

  // First curve control points
  const p1 = {
    x: mt * start.x + t * control1.x,
    y: mt * start.y + t * control1.y,
  };

  const p2 = {
    x: mt * control1.x + t * control2.x,
    y: mt * control1.y + t * control2.y,
  };

  const p3 = {
    x: mt * control2.x + t * end.x,
    y: mt * control2.y + t * end.y,
  };

  // Second curve control points
  const p4 = {
    x: mt * p2.x + t * p3.x,
    y: mt * p2.y + t * p3.y,
  };

  const p5 = {
    x: mt * p3.x + t * end.x,
    y: mt * p3.y + t * end.y,
  };

  const firstCurve: CubicBezierCurve = {
    start,
    control1: p1,
    control2: p4,
    end: p5,
  };

  const secondCurve: CubicBezierCurve = {
    start: p5,
    control1: p3,
    control2: p2,
    end,
  };

  return [firstCurve, secondCurve];
}
