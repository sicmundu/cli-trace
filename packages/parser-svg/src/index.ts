/**
 * CLI-Trace SVG Parser Package
 *
 * Provides utilities for parsing and normalizing SVG path data
 */

// Path parsing utilities
export {
  parsePathData,
  normalizeToCubicBeziers,
  calculatePathBounds,
  createPathData,
} from './parser.js';

// SVG document parsing
export {
  extractPathsFromSVG,
  parseSVG,
  extractViewBox,
  extractDimensions,
  parseSVGWithMetadata,
  isValidPathData,
  normalizeSVG,
} from './svg-parser.js';

export type { SVGParsedData } from './svg-parser.js';
