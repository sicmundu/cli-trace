/**
 * SVG Document Parser
 *
 * Extracts path data from SVG strings and converts to PathData objects
 */

import { PathData } from '@cli-trace/core';
import { createPathData } from './parser.js';

/**
 * Extract all path elements from SVG string
 */
export function extractPathsFromSVG(svgString: string): string[] {
  const paths: string[] = [];

  // Simple regex to find path elements (not perfect but works for basic cases)
  const pathRegex = /<path[^>]*d="([^"]*)"[^>]*>/gi;

  let match;
  while ((match = pathRegex.exec(svgString)) !== null) {
    const pathData = match[1].trim();
    if (pathData) {
      paths.push(pathData);
    }
  }

  return paths;
}

/**
 * Parse SVG string and return array of PathData objects
 */
export function parseSVG(svgString: string): PathData[] {
  const pathStrings = extractPathsFromSVG(svgString);
  return pathStrings.map(pathString => createPathData(pathString));
}

/**
 * Extract viewBox from SVG string
 */
export function extractViewBox(svgString: string): { x: number; y: number; width: number; height: number } | null {
  const viewBoxRegex = /viewBox="([^"]*)"/i;
  const match = svgString.match(viewBoxRegex);

  if (!match) return null;

  const values = match[1].split(/[\s,]+/).map(v => parseFloat(v.trim()));

  if (values.length !== 4 || values.some(isNaN)) {
    return null;
  }

  return {
    x: values[0],
    y: values[1],
    width: values[2],
    height: values[3],
  };
}

/**
 * Extract width and height from SVG string
 */
export function extractDimensions(svgString: string): { width: number; height: number } | null {
  const widthRegex = /width="([^"]*)"/i;
  const heightRegex = /height="([^"]*)"/i;

  const widthMatch = svgString.match(widthRegex);
  const heightMatch = svgString.match(heightRegex);

  if (!widthMatch || !heightMatch) return null;

  const width = parseFloat(widthMatch[1]);
  const height = parseFloat(heightMatch[1]);

  if (isNaN(width) || isNaN(height)) return null;

  return { width, height };
}

/**
 * Parse SVG with additional metadata
 */
export interface SVGParsedData {
  paths: PathData[];
  viewBox: { x: number; y: number; width: number; height: number } | null;
  dimensions: { width: number; height: number } | null;
}

export function parseSVGWithMetadata(svgString: string): SVGParsedData {
  return {
    paths: parseSVG(svgString),
    viewBox: extractViewBox(svgString),
    dimensions: extractDimensions(svgString),
  };
}

/**
 * Validate SVG path data string
 */
export function isValidPathData(pathString: string): boolean {
  try {
    const segments = pathString.trim();
    if (!segments) return false;

    // Basic validation - check for valid commands
    const validCommands = /^[MLHVCSQTAZmlhvcsqtaz\s,\-\d.]+$/;
    return validCommands.test(segments);
  } catch {
    return false;
  }
}

/**
 * Clean and normalize SVG string
 */
export function normalizeSVG(svgString: string): string {
  // Remove XML declaration if present
  let normalized = svgString.replace(/<\?xml[^>]*\?>/gi, '');

  // Remove DOCTYPE if present
  normalized = normalized.replace(/<!DOCTYPE[^>]*>/gi, '');

  // Remove comments
  normalized = normalized.replace(/<!--[\s\S]*?-->/g, '');

  // Normalize whitespace
  normalized = normalized.replace(/\s+/g, ' ');

  return normalized.trim();
}
