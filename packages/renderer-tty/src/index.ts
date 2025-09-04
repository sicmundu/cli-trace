/**
 * CLI-Trace TTY Renderer Package
 *
 * Provides terminal-based rendering for animated stroke paths
 */

// TTY Renderer
export { TTYRenderer } from './tty-renderer.js';
export type { TTYRendererOptions } from './tty-renderer.js';

// ANSI utilities
export {
  detectTerminalCapabilities,
  getColorEscape,
  clearScreen,
  hideCursor,
  showCursor,
  ANSI
} from './ansi.js';
export type { TerminalCapabilities } from './ansi.js';

// Braille utilities
export {
  imageToBraille,
  renderBrailleGrid,
  pathToBrailleGrid,
  brailleChar,
  pixelsToBraille,
  BRAILLE_SHAPES
} from './braille.js';

// Main TTY trace function
export { ttyTrace } from './tty-trace.js';

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
