/**
 * Canvas Renderer for CLI-Trace
 *
 * Renders animated stroke paths using HTML5 Canvas with advanced effects
 */

import {
  TraceOptions,
  TraceFrame,
  TraceModel,
  PathData,
  PathSegment,
  Point,
  BezierCurve,
  cubicBezierPoint,
  quadraticBezierPoint
} from 'cli-trace-core';

export interface CanvasRendererOptions {
  container?: HTMLElement | string;
  width?: number;
  height?: number;
  background?: string;
  strokeWidth?: number;
  strokeColor?: string;
  fillColor?: string;
  pixelRatio?: number;
  glowEffect?: boolean;
  glowColor?: string;
  glowIntensity?: number;
}

export class CanvasRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private options: CanvasRendererOptions;
  private pathData: PathData[] = [];
  private isPlaying = false;
  private animationId?: number;

  constructor(options: CanvasRendererOptions = {}) {
    this.options = {
      width: 800,
      height: 600,
      background: 'transparent',
      strokeWidth: 2,
      strokeColor: '#000000',
      fillColor: 'transparent',
      pixelRatio: window.devicePixelRatio || 1,
      glowEffect: false,
      glowColor: '#ffffff',
      glowIntensity: 0.5,
      ...options
    };

    this.canvas = this.createCanvasElement();
    this.ctx = this.canvas.getContext('2d')!;

    // Set up high-DPI canvas
    this.setupHighDPI();

    this.setupContainer();
  }

  private createCanvasElement(): HTMLCanvasElement {
    const canvas = document.createElement('canvas');

    canvas.width = this.options.width! * this.options.pixelRatio!;
    canvas.height = this.options.height! * this.options.pixelRatio!;
    canvas.style.width = `${this.options.width}px`;
    canvas.style.height = `${this.options.height}px`;

    return canvas;
  }

  private setupHighDPI(): void {
    const ctx = this.ctx;
    const pixelRatio = this.options.pixelRatio!;

    ctx.scale(pixelRatio, pixelRatio);

    // Set up context for crisp lines
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.imageSmoothingEnabled = true;
  }

  private setupContainer(): void {
    if (this.options.container) {
      const container = typeof this.options.container === 'string'
        ? document.querySelector(this.options.container) as HTMLElement
        : this.options.container;

      if (container) {
        container.appendChild(this.canvas);
      } else {
        console.warn('Container element not found, appending to body');
        document.body.appendChild(this.canvas);
      }
    } else {
      document.body.appendChild(this.canvas);
    }
  }

  /**
   * Load path data for rendering
   */
  loadPathData(pathData: PathData): void {
    this.pathData.push(pathData);
  }

  /**
   * Load multiple path data
   */
  loadPathDataArray(pathDataArray: PathData[]): void {
    this.pathData.push(...pathDataArray);
  }

  /**
   * Clear canvas and redraw background
   */
  private clearCanvas(): void {
    const ctx = this.ctx;
    const width = this.options.width!;
    const height = this.options.height!;

    ctx.clearRect(0, 0, width, height);

    if (this.options.background && this.options.background !== 'transparent') {
      ctx.fillStyle = this.options.background;
      ctx.fillRect(0, 0, width, height);
    }
  }

  /**
   * Render path at specific progress
   */
  renderPath(pathData: PathData, progress: number): void {
    const ctx = this.ctx;
    const segments = pathData.segments;

    ctx.save();

    // Set stroke style
    ctx.strokeStyle = this.options.strokeColor!;
    ctx.lineWidth = this.options.strokeWidth!;

    // Apply glow effect if enabled
    if (this.options.glowEffect) {
      ctx.shadowColor = this.options.glowColor!;
      ctx.shadowBlur = this.options.glowIntensity! * 10;
    }

    ctx.beginPath();

    let currentPoint: Point | null = null;
    let pathProgress = 0;
    const totalLength = pathData.totalLength;

    for (const segment of segments) {
      if (segment.points.length === 0) continue;

      const segmentStart = currentPoint;
      const segmentEnd = segment.points[0];

      if (!segmentStart) {
        // First point
        ctx.moveTo(segmentEnd.x, segmentEnd.y);
        currentPoint = segmentEnd;
        continue;
      }

      // Calculate segment length (simplified)
      let segmentLength = 0;
      if (segment.type === 'C' && segment.curve && 'control1' in segment.curve) {
        // Approximate cubic curve length
        segmentLength = Math.sqrt(
          Math.pow(segmentEnd.x - segmentStart.x, 2) +
          Math.pow(segmentEnd.y - segmentStart.y, 2)
        ) * 1.5; // Rough approximation
      } else {
        segmentLength = Math.sqrt(
          Math.pow(segmentEnd.x - segmentStart.x, 2) +
          Math.pow(segmentEnd.y - segmentStart.y, 2)
        );
      }

      const segmentStartProgress = pathProgress / totalLength;
      const segmentEndProgress = (pathProgress + segmentLength) / totalLength;

      if (progress >= segmentStartProgress) {
        if (progress >= segmentEndProgress) {
          // Draw full segment
          this.drawSegment(segment, segmentStart);
        } else {
          // Draw partial segment
          const segmentProgress = (progress - segmentStartProgress) / (segmentEndProgress - segmentStartProgress);
          this.drawPartialSegment(segment, segmentStart, segmentProgress);
        }
      }

      currentPoint = segmentEnd;
      pathProgress += segmentLength;
    }

    ctx.stroke();
    ctx.restore();
  }

  /**
   * Draw complete segment
   */
  private drawSegment(segment: PathSegment, startPoint: Point): void {
    const ctx = this.ctx;

    switch (segment.type) {
      case 'L':
        ctx.lineTo(segment.points[0].x, segment.points[0].y);
        break;

      case 'C':
        if (segment.curve && 'control1' in segment.curve) {
          const curve = segment.curve as any;
          ctx.bezierCurveTo(
            curve.control1.x, curve.control1.y,
            curve.control2.x, curve.control2.y,
            curve.end.x, curve.end.y
          );
        }
        break;

      case 'Q':
        if (segment.curve && 'control' in segment.curve) {
          const curve = segment.curve as any;
          ctx.quadraticCurveTo(
            curve.control.x, curve.control.y,
            curve.end.x, curve.end.y
          );
        }
        break;
    }
  }

  /**
   * Draw partial segment
   */
  private drawPartialSegment(segment: PathSegment, startPoint: Point, progress: number): void {
    const ctx = this.ctx;

    switch (segment.type) {
      case 'L':
        const endPoint = segment.points[0];
        const partialX = startPoint.x + (endPoint.x - startPoint.x) * progress;
        const partialY = startPoint.y + (endPoint.y - startPoint.y) * progress;
        ctx.lineTo(partialX, partialY);
        break;

      case 'C':
        if (segment.curve && 'control1' in segment.curve) {
          // Draw partial cubic curve by sampling points
          this.drawPartialCurve(segment.curve, progress);
        }
        break;

      case 'Q':
        if (segment.curve && 'control' in segment.curve) {
          // Draw partial quadratic curve by sampling points
          this.drawPartialCurve(segment.curve, progress);
        }
        break;
    }
  }

  /**
   * Draw partial curve by sampling points
   */
  private drawPartialCurve(curve: BezierCurve, progress: number): void {
    const ctx = this.ctx;
    const samples = 20;
    const step = progress / samples;

    for (let i = 0; i <= samples; i++) {
      const t = i * step;
      const point = 'control1' in curve
        ? cubicBezierPoint(curve as any, t)
        : quadraticBezierPoint(curve as any, t);

      if (i === 0) {
        ctx.moveTo(point.x, point.y);
      } else {
        ctx.lineTo(point.x, point.y);
      }
    }
  }

  /**
   * Render all paths at given progress
   */
  render(progress: number): void {
    this.clearCanvas();

    this.pathData.forEach(pathData => {
      this.renderPath(pathData, progress);
    });
  }

  /**
   * Animate with custom timing
   */
  animate(
    duration: number,
    timingFunction: (t: number) => number = (t) => t,
    onUpdate?: (progress: number) => void,
    onComplete?: () => void
  ): Promise<void> {
    return new Promise((resolve) => {
      const startTime = Date.now();
      this.isPlaying = true;

      const animateFrame = () => {
        if (!this.isPlaying) return;

        const elapsed = Date.now() - startTime;
        const rawProgress = Math.min(elapsed / duration, 1);
        const progress = timingFunction(rawProgress);

        this.render(progress);

        if (onUpdate) {
          onUpdate(progress);
        }

        if (rawProgress < 1) {
          this.animationId = requestAnimationFrame(animateFrame);
        } else {
          this.isPlaying = false;
          if (onComplete) {
            onComplete();
          }
          resolve();
        }
      };

      animateFrame();
    });
  }

  /**
   * Stop current animation
   */
  stop(): void {
    this.isPlaying = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = undefined;
    }
  }

  /**
   * Reset canvas
   */
  reset(): void {
    this.stop();
    this.clearCanvas();
  }

  /**
   * Set stroke color
   */
  setStrokeColor(color: string): void {
    this.options.strokeColor = color;
  }

  /**
   * Set stroke width
   */
  setStrokeWidth(width: number): void {
    this.options.strokeWidth = width;
  }

  /**
   * Get canvas element
   */
  getElement(): HTMLCanvasElement {
    return this.canvas;
  }

  /**
   * Clean up and remove from DOM
   */
  destroy(): void {
    this.stop();
    if (this.canvas.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas);
    }
    this.pathData = [];
  }
}
