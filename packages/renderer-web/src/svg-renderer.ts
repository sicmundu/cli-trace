/**
 * SVG Renderer for CLI-Trace
 *
 * Renders animated stroke paths using SVG stroke-dashoffset technique
 */

import {
  TraceOptions,
  TraceFrame,
  TraceModel,
  PathData,
  PathSegment,
  Point,
  BezierCurve
} from '@cli-trace/core';
import { createPathData } from '@cli-trace/parser-svg';

export interface SVGRendererOptions {
  container?: HTMLElement | string;
  width?: number;
  height?: number;
  background?: string;
  strokeWidth?: number;
  strokeColor?: string;
  fillColor?: string;
  viewBox?: string;
}

export class SVGRenderer {
  private svgElement: SVGSVGElement;
  private defsElement: SVGDefsElement;
  private pathElements: SVGPathElement[] = [];
  private options: SVGRendererOptions;
  private isPlaying = false;
  private animationId?: number;

  constructor(options: SVGRendererOptions = {}) {
    this.options = {
      width: 800,
      height: 600,
      background: 'transparent',
      strokeWidth: 2,
      strokeColor: '#000000',
      fillColor: 'none',
      ...options
    };

    this.svgElement = this.createSVGElement();
    this.defsElement = this.createDefsElement();
    this.svgElement.appendChild(this.defsElement);

    this.setupContainer();
  }

  private createSVGElement(): SVGSVGElement {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');

    svg.setAttribute('width', String(this.options.width!));
    svg.setAttribute('height', String(this.options.height!));
    svg.setAttribute('viewBox', this.options.viewBox || `0 0 ${this.options.width} ${this.options.height}`);
    svg.style.background = this.options.background!;
    svg.style.overflow = 'visible';

    return svg;
  }

  private createDefsElement(): SVGDefsElement {
    return document.createElementNS('http://www.w3.org/2000/svg', 'defs');
  }

  private setupContainer(): void {
    if (this.options.container) {
      const container = typeof this.options.container === 'string'
        ? document.querySelector(this.options.container) as HTMLElement
        : this.options.container;

      if (container) {
        container.appendChild(this.svgElement);
      } else {
        console.warn('Container element not found, appending to body');
        document.body.appendChild(this.svgElement);
      }
    } else {
      document.body.appendChild(this.svgElement);
    }
  }

  /**
   * Load path data and create SVG path elements
   */
  loadPathData(pathData: PathData): SVGPathElement {
    const pathElement = document.createElementNS('http://www.w3.org/2000/svg', 'path');

    // Convert segments to SVG path string
    const pathString = this.segmentsToPathString(pathData.segments);
    pathElement.setAttribute('d', pathString);

    // Set initial styles
    pathElement.style.stroke = this.options.strokeColor!;
    pathElement.style.strokeWidth = String(this.options.strokeWidth!);
    pathElement.style.fill = this.options.fillColor!;
    pathElement.style.strokeLinecap = 'round';
    pathElement.style.strokeLinejoin = 'round';

    // Calculate and set dash properties for animation
    const pathLength = pathData.totalLength;
    pathElement.style.strokeDasharray = String(pathLength);
    pathElement.style.strokeDashoffset = String(pathLength);

    this.svgElement.appendChild(pathElement);
    this.pathElements.push(pathElement);

    return pathElement;
  }

  /**
   * Load SVG string and extract paths
   */
  loadSVG(svgString: string): SVGPathElement[] {
    const pathStrings = this.extractPathsFromSVG(svgString);
    const pathDataArray = pathStrings.map(pathString => createPathData(pathString));

    return pathDataArray.map(pathData => this.loadPathData(pathData));
  }

  /**
   * Convert path segments to SVG path string
   */
  private segmentsToPathString(segments: PathSegment[]): string {
    let pathString = '';

    for (const segment of segments) {
      switch (segment.type) {
        case 'M':
          const movePoint = segment.points[0];
          pathString += `M ${movePoint.x} ${movePoint.y} `;
          break;

        case 'L':
          const linePoint = segment.points[0];
          pathString += `L ${linePoint.x} ${linePoint.y} `;
          break;

        case 'C':
          if (segment.curve && 'control1' in segment.curve) {
            const curve = segment.curve as any;
            pathString += `C ${curve.control1.x} ${curve.control1.y} ${curve.control2.x} ${curve.control2.y} ${curve.end.x} ${curve.end.y} `;
          }
          break;

        case 'Q':
          if (segment.curve && 'control' in segment.curve) {
            const curve = segment.curve as any;
            pathString += `Q ${curve.control.x} ${curve.control.y} ${curve.end.x} ${curve.end.y} `;
          }
          break;

        case 'Z':
          pathString += 'Z ';
          break;
      }
    }

    return pathString.trim();
  }

  /**
   * Extract path data from SVG string
   */
  private extractPathsFromSVG(svgString: string): string[] {
    const paths: string[] = [];

    // Simple regex to find path elements
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
   * Update path animation progress
   */
  updateProgress(pathElement: SVGPathElement, progress: number): void {
    const pathLength = parseFloat(pathElement.style.strokeDasharray);
    const offset = pathLength * (1 - progress);
    pathElement.style.strokeDashoffset = String(offset);
  }

  /**
   * Update all paths with global progress
   */
  updateAllPaths(progress: number): void {
    this.pathElements.forEach(pathElement => {
      this.updateProgress(pathElement, progress);
    });
  }

  /**
   * Update paths with individual progress values
   */
  updatePathsWithProgresses(progresses: number[]): void {
    this.pathElements.forEach((pathElement, index) => {
      const progress = progresses[index] || 0;
      this.updateProgress(pathElement, progress);
    });
  }

  /**
   * Animate with custom timing function
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

        this.updateAllPaths(progress);

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
   * Reset all paths to initial state
   */
  reset(): void {
    this.stop();
    this.pathElements.forEach(pathElement => {
      const pathLength = parseFloat(pathElement.style.strokeDasharray);
      pathElement.style.strokeDashoffset = String(pathLength);
    });
  }

  /**
   * Set stroke color for all paths
   */
  setStrokeColor(color: string): void {
    this.options.strokeColor = color;
    this.pathElements.forEach(pathElement => {
      pathElement.style.stroke = color;
    });
  }

  /**
   * Set stroke width for all paths
   */
  setStrokeWidth(width: number): void {
    this.options.strokeWidth = width;
    this.pathElements.forEach(pathElement => {
      pathElement.style.strokeWidth = String(width);
    });
  }

  /**
   * Get SVG element
   */
  getElement(): SVGSVGElement {
    return this.svgElement;
  }

  /**
   * Clean up and remove from DOM
   */
  destroy(): void {
    this.stop();
    if (this.svgElement.parentNode) {
      this.svgElement.parentNode.removeChild(this.svgElement);
    }
    this.pathElements = [];
  }
}

/**
 * Create SVG tracer utility function
 */
export function createSvgTracer(container?: HTMLElement | string, options?: Partial<SVGRendererOptions>) {
  const renderer = new SVGRenderer({ container, ...options });

  return {
    loadSVG: (svgString: string) => renderer.loadSVG(svgString),
    loadPathData: (pathData: PathData) => renderer.loadPathData(pathData),
    animate: (duration: number, timingFunction?: (t: number) => number) =>
      renderer.animate(duration, timingFunction),
    stop: () => renderer.stop(),
    reset: () => renderer.reset(),
    setStrokeColor: (color: string) => renderer.setStrokeColor(color),
    setStrokeWidth: (width: number) => renderer.setStrokeWidth(width),
    getElement: () => renderer.getElement(),
    destroy: () => renderer.destroy(),
    updateProgress: (progress: number) => renderer.updateAllPaths(progress),
  };
}
