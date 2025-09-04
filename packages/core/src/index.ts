/**
 * CLI-Trace Core Package
 *
 * Provides fundamental utilities for Bézier curves, animation timing,
 * and geometric calculations used throughout the CLI-Trace ecosystem.
 */

// Types
export type {
  Point,
  CubicBezierCurve,
  QuadraticBezierCurve,
  BezierCurve,
  PathSegment,
  PathData,
  TraceSource,
  EasingFunction,
  Direction,
  TraceOptions,
  TraceFrame,
  TraceModel,
  TraceEngine,
  LUTEntry,
  PathLUT,
} from './types.js';

// Bézier curve utilities
export {
  cubicBezierPoint,
  quadraticBezierPoint,
  bezierPoint,
  cubicBezierArcLength,
  quadraticBezierArcLength,
  bezierArcLength,
  createBezierLUT,
  lengthToParameter,
  splitCubicBezier,
} from './bezier.js';

// Easing functions
export {
  linear,
  easeInOutCubic,
  cubicBezier,
  applyEasing,
  easings,
} from './easing.js';

// Timeline utilities
export {
  createTimeline,
  startTimeline,
  stopTimeline,
  resetTimeline,
  updateTimeline,
  getTimelineProgress,
  isAtStart,
  isAtEnd,
  getRemainingTime,
} from './timeline.js';

export type { TimelineState } from './timeline.js';
