/**
 * SVG Path Parser
 *
 * Parses SVG path data strings and converts them to normalized path segments
 */

import { Point, PathSegment, PathData, CubicBezierCurve, QuadraticBezierCurve } from '@cli-trace/core';

/**
 * Parse SVG path data string into path segments
 */
export function parsePathData(pathString: string): PathSegment[] {
  const segments: PathSegment[] = [];
  const commands = tokenizePath(pathString);

  let currentPoint: Point = { x: 0, y: 0 };
  let lastControlPoint: Point | null = null;

  for (const command of commands) {
    const { type, args } = command;
    const upperType = type.toUpperCase();
    const relative = type !== upperType;

    switch (upperType) {
      case 'M': // Move to
        for (let i = 0; i < args.length; i += 2) {
          const x = args[i];
          const y = args[i + 1];
          const point = relative
            ? { x: currentPoint.x + x, y: currentPoint.y + y }
            : { x, y };

          segments.push({
            type: i === 0 ? 'M' : 'L',
            points: [point],
          });

          currentPoint = point;
          lastControlPoint = null;
        }
        break;

      case 'L': // Line to
        for (let i = 0; i < args.length; i += 2) {
          const x = args[i];
          const y = args[i + 1];
          const point = relative
            ? { x: currentPoint.x + x, y: currentPoint.y + y }
            : { x, y };

          segments.push({
            type: 'L',
            points: [point],
          });

          currentPoint = point;
          lastControlPoint = null;
        }
        break;

      case 'H': // Horizontal line to
        for (let i = 0; i < args.length; i++) {
          const x = args[i];
          const point = relative
            ? { x: currentPoint.x + x, y: currentPoint.y }
            : { x, y: currentPoint.y };

          segments.push({
            type: 'L',
            points: [point],
          });

          currentPoint = point;
          lastControlPoint = null;
        }
        break;

      case 'V': // Vertical line to
        for (let i = 0; i < args.length; i++) {
          const y = args[i];
          const point = relative
            ? { x: currentPoint.x, y: currentPoint.y + y }
            : { x: currentPoint.x, y };

          segments.push({
            type: 'L',
            points: [point],
          });

          currentPoint = point;
          lastControlPoint = null;
        }
        break;

      case 'C': // Cubic Bézier curve
        for (let i = 0; i < args.length; i += 6) {
          const cp1x = args[i];
          const cp1y = args[i + 1];
          const cp2x = args[i + 2];
          const cp2y = args[i + 3];
          const x = args[i + 4];
          const y = args[i + 5];

          const control1 = relative
            ? { x: currentPoint.x + cp1x, y: currentPoint.y + cp1y }
            : { x: cp1x, y: cp1y };

          const control2 = relative
            ? { x: currentPoint.x + cp2x, y: currentPoint.y + cp2y }
            : { x: cp2x, y: cp2y };

          const end = relative
            ? { x: currentPoint.x + x, y: currentPoint.y + y }
            : { x, y };

          const curve: CubicBezierCurve = {
            start: currentPoint,
            control1,
            control2,
            end,
          };

          segments.push({
            type: 'C',
            points: [end],
            curve,
          });

          currentPoint = end;
          lastControlPoint = control2;
        }
        break;

      case 'S': // Smooth cubic Bézier curve
        for (let i = 0; i < args.length; i += 4) {
          const cp2x = args[i];
          const cp2y = args[i + 1];
          const x = args[i + 2];
          const y = args[i + 3];

          // Calculate control1 as reflection of last control point
          const control1 = lastControlPoint
            ? {
                x: 2 * currentPoint.x - lastControlPoint.x,
                y: 2 * currentPoint.y - lastControlPoint.y,
              }
            : currentPoint;

          const control2 = relative
            ? { x: currentPoint.x + cp2x, y: currentPoint.y + cp2y }
            : { x: cp2x, y: cp2y };

          const end = relative
            ? { x: currentPoint.x + x, y: currentPoint.y + y }
            : { x, y };

          const curve: CubicBezierCurve = {
            start: currentPoint,
            control1,
            control2,
            end,
          };

          segments.push({
            type: 'C',
            points: [end],
            curve,
          });

          currentPoint = end;
          lastControlPoint = control2;
        }
        break;

      case 'Q': // Quadratic Bézier curve
        for (let i = 0; i < args.length; i += 4) {
          const cpx = args[i];
          const cpy = args[i + 1];
          const x = args[i + 2];
          const y = args[i + 3];

          const control = relative
            ? { x: currentPoint.x + cpx, y: currentPoint.y + cpy }
            : { x: cpx, y: cpy };

          const end = relative
            ? { x: currentPoint.x + x, y: currentPoint.y + y }
            : { x, y };

          const curve: QuadraticBezierCurve = {
            start: currentPoint,
            control,
            end,
          };

          segments.push({
            type: 'Q',
            points: [end],
            curve,
          });

          currentPoint = end;
          lastControlPoint = control;
        }
        break;

      case 'T': // Smooth quadratic Bézier curve
        for (let i = 0; i < args.length; i += 2) {
          const x = args[i];
          const y = args[i + 1];

          // Calculate control as reflection of last control point
          const control: Point = lastControlPoint
            ? {
                x: 2 * currentPoint.x - lastControlPoint.x,
                y: 2 * currentPoint.y - lastControlPoint.y,
              }
            : currentPoint;

          const end = relative
            ? { x: currentPoint.x + x, y: currentPoint.y + y }
            : { x, y };

          const curve: QuadraticBezierCurve = {
            start: currentPoint,
            control,
            end,
          };

          segments.push({
            type: 'Q',
            points: [end],
            curve,
          });

          currentPoint = end;
          lastControlPoint = control;
        }
        break;

      case 'A': // Arc (converted to cubic Bézier curves)
        // This is a simplified implementation
        // Full arc to Bézier conversion is complex
        for (let i = 0; i < args.length; i += 7) {
          const rx = args[i];
          const ry = args[i + 1];
          const xAxisRotation = args[i + 2];
          const largeArcFlag = args[i + 3];
          const sweepFlag = args[i + 4];
          const x = args[i + 5];
          const y = args[i + 6];

          const end = relative
            ? { x: currentPoint.x + x, y: currentPoint.y + y }
            : { x, y };

          // For now, treat arcs as lines (simplified)
          segments.push({
            type: 'L',
            points: [end],
          });

          currentPoint = end;
          lastControlPoint = null;
        }
        break;

      case 'Z': // Close path
        segments.push({
          type: 'Z',
          points: [],
        });
        // Don't update currentPoint for Z command
        lastControlPoint = null;
        break;

      default:
        console.warn(`Unknown path command: ${type}`);
    }
  }

  return segments;
}

/**
 * Tokenize SVG path string into commands and arguments
 */
function tokenizePath(pathString: string): Array<{ type: string; args: number[] }> {
  const commands: Array<{ type: string; args: number[] }> = [];
  const regex = /([MLHVCSQTAZmlhvcsqtaz])([^MLHVCSQTAZmlhvcsqtaz]*)/g;

  let match;
  while ((match = regex.exec(pathString)) !== null) {
    const type = match[1];
    const argsString = match[2].trim();

    if (argsString) {
      const args = argsString.split(/[\s,]+/).map(arg => {
        const num = parseFloat(arg);
        return isNaN(num) ? 0 : num;
      });

      commands.push({ type, args });
    } else if (type.toUpperCase() === 'Z') {
      commands.push({ type, args: [] });
    }
  }

  return commands;
}

/**
 * Convert path segments to cubic Bézier curves only
 */
export function normalizeToCubicBeziers(segments: PathSegment[]): PathSegment[] {
  const normalized: PathSegment[] = [];

  for (const segment of segments) {
    if (segment.type === 'Q' && segment.curve) {
      // Convert quadratic to cubic Bézier
      const quad = segment.curve as QuadraticBezierCurve;
      const cubic: CubicBezierCurve = {
        start: quad.start,
        control1: {
          x: quad.start.x + (2/3) * (quad.control.x - quad.start.x),
          y: quad.start.y + (2/3) * (quad.control.y - quad.start.y),
        },
        control2: {
          x: quad.end.x + (2/3) * (quad.control.x - quad.end.x),
          y: quad.end.y + (2/3) * (quad.control.y - quad.end.y),
        },
        end: quad.end,
      };

      normalized.push({
        type: 'C',
        points: [quad.end],
        curve: cubic,
      });
    } else {
      normalized.push(segment);
    }
  }

  return normalized;
}

/**
 * Calculate path bounds
 */
export function calculatePathBounds(segments: PathSegment[]): { minX: number; minY: number; maxX: number; maxY: number } {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const segment of segments) {
    for (const point of segment.points) {
      minX = Math.min(minX, point.x);
      minY = Math.min(minY, point.y);
      maxX = Math.max(maxX, point.x);
      maxY = Math.max(maxY, point.y);
    }

    // Include control points for curves
    if (segment.curve) {
      if ('control1' in segment.curve) {
        const curve = segment.curve as CubicBezierCurve;
        minX = Math.min(minX, curve.control1.x, curve.control2.x);
        minY = Math.min(minY, curve.control1.y, curve.control2.y);
        maxX = Math.max(maxX, curve.control1.x, curve.control2.x);
        maxY = Math.max(maxY, curve.control1.y, curve.control2.y);
      } else {
        const curve = segment.curve as QuadraticBezierCurve;
        minX = Math.min(minX, curve.control.x);
        minY = Math.min(minY, curve.control.y);
        maxX = Math.max(maxX, curve.control.x);
        maxY = Math.max(maxY, curve.control.y);
      }
    }
  }

  return {
    minX: minX === Infinity ? 0 : minX,
    minY: minY === Infinity ? 0 : minY,
    maxX: maxX === -Infinity ? 0 : maxX,
    maxY: maxY === -Infinity ? 0 : maxY,
  };
}

/**
 * Create PathData from SVG path string
 */
export function createPathData(pathString: string): PathData {
  const segments = parsePathData(pathString);
  const normalizedSegments = normalizeToCubicBeziers(segments);
  const bounds = calculatePathBounds(normalizedSegments);

  // Calculate total length (simplified - just sum straight line distances)
  let totalLength = 0;
  let currentPoint: Point | null = null;

  for (const segment of normalizedSegments) {
    if (segment.points.length > 0) {
      const point = segment.points[0];
      if (currentPoint) {
        const dx = point.x - currentPoint.x;
        const dy = point.y - currentPoint.y;
        totalLength += Math.sqrt(dx * dx + dy * dy);
      }
      currentPoint = point;
    }
  }

  return {
    segments: normalizedSegments,
    totalLength,
    bounds,
  };
}
