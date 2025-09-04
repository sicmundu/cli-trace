/**
 * Core types for CLI-Trace
 */

export interface Point {
  x: number;
  y: number;
}

export interface CubicBezierCurve {
  start: Point;
  control1: Point;
  control2: Point;
  end: Point;
}

export interface QuadraticBezierCurve {
  start: Point;
  control: Point;
  end: Point;
}

export type BezierCurve = CubicBezierCurve | QuadraticBezierCurve;

export interface PathSegment {
  type: 'M' | 'L' | 'C' | 'Q' | 'Z';
  points: Point[];
  curve?: BezierCurve;
}

export interface PathData {
  segments: PathSegment[];
  totalLength: number;
  bounds: {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
  };
}

export type TraceSource = {
  svg?: string;
  paths?: string[];
  text?: {
    value: string;
    fontUrl?: string;
    fontSize?: number;
  };
};

export type EasingFunction = 'linear' | 'easeInOutCubic' | [number, number, number, number];

export type Direction = 'forward' | 'reverse' | 'yoyo';

export interface TraceOptions {
  durationMs: number;
  delayMs?: number;
  loop?: boolean;
  easing?: EasingFunction;
  direction?: Direction;
  strokeWidth?: number;
  globalTiming?: boolean; // true = all paths share same progress, false = per-path timing
}

export interface TraceFrame {
  progress: number; // 0-1
  paths: Array<{
    segments: PathSegment[];
    dashOffset: number;
    dashArray: string;
  }>;
  timestamp: number;
}

export interface TraceModel {
  source: TraceSource;
  options: TraceOptions;
  paths: PathData[];
  totalDuration: number;
}

export interface TraceEngine {
  load(source: TraceSource): Promise<TraceModel>;
  frame(model: TraceModel, timeMs: number): TraceFrame;
  dispose(model: TraceModel): void;
}

export interface LUTEntry {
  t: number; // parameter 0-1
  point: Point;
  length: number; // cumulative length at this point
}

export interface PathLUT {
  entries: LUTEntry[];
  totalLength: number;
  resolution: number; // points per unit length
}
