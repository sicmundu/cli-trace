/**
 * CLI-Trace React Renderer Package
 *
 * Provides React components and hooks for animated stroke rendering
 */

// React Component
export { Trace } from './Trace.js';
export type { TraceProps } from './Trace.js';

// React Hook
export { useTrace } from './useTrace.js';
export type { UseTraceOptions, UseTraceReturn } from './useTrace.js';

// Re-export core types for convenience
export type {
  TraceSource,
  TraceOptions,
  Point,
  PathData,
} from '@cli-trace/core';

// Re-export parser utilities for convenience
export {
  parseSVG,
  createPathData,
} from '@cli-trace/parser-svg';
