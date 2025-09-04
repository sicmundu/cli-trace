/**
 * CLI-Trace Web Renderer Package
 *
 * Provides SVG and Canvas renderers for web-based stroke animations
 */

// SVG Renderer
export { SVGRenderer, createSvgTracer } from './svg-renderer.js';
export type { SVGRendererOptions } from './svg-renderer.js';

// Canvas Renderer
export { CanvasRenderer } from './canvas-renderer.js';
export type { CanvasRendererOptions } from './canvas-renderer.js';

// Re-export core types for convenience
export type {
  TraceOptions,
  TraceFrame,
  TraceModel,
  PathData,
  Point,
} from 'cli-trace-core';

// Re-export parser utilities for convenience
export {
  parseSVG,
  createPathData,
} from 'cli-trace-parser-svg';
