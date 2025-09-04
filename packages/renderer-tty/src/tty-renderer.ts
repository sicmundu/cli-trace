/**
 * TTY Renderer for CLI-Trace
 *
 * Renders animated stroke paths in terminal using ANSI escape sequences and Braille patterns
 */

import {
  TraceSource,
  TraceOptions,
  PathData,
  Point,
  applyEasing
} from 'cli-trace-core';
import { createPathData } from 'cli-trace-parser-svg';
import {
  TerminalCapabilities,
  detectTerminalCapabilities,
  getColorEscape,
  writeToStdout,
  clearScreen,
  hideCursor,
  showCursor,
  moveCursor,
  ANSI
} from './ansi.js';
import {
  imageToBraille,
  renderBrailleGrid,
  pathToBrailleGrid,
  pixelsToBraille,
  brailleChar
} from './braille.js';

export interface TTYRendererOptions {
  width?: number;
  height?: number;
  mode?: 'braille' | 'box' | 'block';
  colorMode?: 'truecolor' | 'ansi256' | 'basic' | 'mono';
  strokeColor?: string;
  backgroundColor?: string;
  frameRate?: number;
  doubleBuffer?: boolean;
}

export class TTYRenderer {
  private capabilities: TerminalCapabilities;
  private options: Required<TTYRendererOptions>;
  private pathData: PathData[] = [];
  private frameBuffer: string = '';
  private backBuffer: string = '';
  private isPlaying = false;
  private animationId?: NodeJS.Timeout;

  constructor(options: TTYRendererOptions = {}) {
    this.capabilities = detectTerminalCapabilities();
    this.options = {
      width: this.capabilities.width,
      height: this.capabilities.height,
      mode: 'braille',
      colorMode: this.capabilities.trueColor ? 'truecolor' :
                 this.capabilities.ansi256 ? 'ansi256' : 'basic',
      strokeColor: '#ffffff',
      backgroundColor: '#000000',
      frameRate: 30,
      doubleBuffer: true,
      ...options
    };

    // Adjust dimensions for Braille mode
    if (this.options.mode === 'braille') {
      this.options.width = Math.floor(this.options.width / 2) * 2;
      this.options.height = Math.floor(this.options.height / 4) * 4;
    }
  }

  /**
   * Load path data for rendering
   */
  loadPathData(pathData: PathData): void {
    this.pathData.push(pathData);
  }

  /**
   * Load SVG string and parse paths
   */
  loadSVG(svgString: string): void {
    const pathStrings = this.extractPathsFromSVG(svgString);
    const pathDataArray = pathStrings.map(pathString => createPathData(pathString));
    this.pathData.push(...pathDataArray);
  }

  /**
   * Load source data
   */
  loadSource(source: TraceSource): void {
    if (source.svg) {
      this.loadSVG(source.svg);
    } else if (source.paths) {
      const pathDataArray = source.paths.map(pathString => createPathData(pathString));
      this.pathData.push(...pathDataArray);
    }
  }

  /**
   * Extract path data from SVG string
   */
  private extractPathsFromSVG(svgString: string): string[] {
    const paths: string[] = [];
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
   * Render frame at specific progress
   */
  render(progress: number): void {
    let output = '';

    if (this.options.mode === 'braille') {
      output = this.renderBrailleFrame(progress);
    } else if (this.options.mode === 'box') {
      output = this.renderBoxFrame(progress);
    } else {
      output = this.renderBlockFrame(progress);
    }

    // Add color escape sequences
    const strokeColor = getColorEscape(this.options.strokeColor, this.capabilities);
    const bgColor = getColorEscape(this.options.backgroundColor, this.capabilities, true);

    output = bgColor + strokeColor + output + ANSI.color.reset;

    // Update buffers for double buffering
    if (this.options.doubleBuffer) {
      this.backBuffer = output;

      // Only write if content changed
      if (this.backBuffer !== this.frameBuffer) {
        clearScreen();
        moveCursor(1, 1);
        writeToStdout(this.backBuffer);
        this.frameBuffer = this.backBuffer;
      }
    } else {
      writeToStdout(output);
    }
  }

  /**
   * Render frame using Braille patterns
   */
  private renderBrailleFrame(progress: number): string {
    const { width, height } = this.options;
    const grid: boolean[][] = Array(width).fill(null).map(() =>
      Array(height).fill(false)
    );

    // Draw all paths
    this.pathData.forEach(pathData => {
      this.drawPathToGrid(pathData, grid, progress, width, height);
    });

    // Convert to Braille
    const brailleGrid: string[][] = [];
    const brailleWidth = Math.ceil(width / 2);
    const brailleHeight = Math.ceil(height / 4);

    for (let by = 0; by < brailleHeight; by++) {
      const row: string[] = [];

      for (let bx = 0; bx < brailleWidth; bx++) {
        const pixels: boolean[][] = [[], []];

        for (let x = 0; x < 2; x++) {
          for (let y = 0; y < 4; y++) {
            const pixelX = bx * 2 + x;
            const pixelY = by * 4 + y;

            pixels[x][y] = pixelX < width && pixelY < height
              ? grid[pixelX][pixelY]
              : false;
          }
        }

        const pattern = pixelsToBraille(pixels);
        row.push(brailleChar(pattern));
      }

      brailleGrid.push(row);
    }

    return renderBrailleGrid(brailleGrid);
  }

  /**
   * Render frame using box drawing characters
   */
  private renderBoxFrame(progress: number): string {
    const { width, height } = this.options;
    const grid: boolean[][] = Array(width).fill(null).map(() =>
      Array(height).fill(false)
    );

    // Draw all paths
    this.pathData.forEach(pathData => {
      this.drawPathToGrid(pathData, grid, progress, width, height);
    });

    // Convert to box characters
    const lines: string[] = [];

    for (let y = 0; y < height; y++) {
      let line = '';

      for (let x = 0; x < width; x++) {
        line += grid[x][y] ? '█' : ' ';
      }

      lines.push(line);
    }

    return lines.join('\n');
  }

  /**
   * Render frame using block characters
   */
  private renderBlockFrame(progress: number): string {
    const { width, height } = this.options;
    const grid: boolean[][] = Array(width).fill(null).map(() =>
      Array(height).fill(false)
    );

    // Draw all paths
    this.pathData.forEach(pathData => {
      this.drawPathToGrid(pathData, grid, progress, width, height);
    });

    // Convert to block characters (simplified)
    const lines: string[] = [];

    for (let y = 0; y < height; y++) {
      let line = '';

      for (let x = 0; x < width; x++) {
        line += grid[x][y] ? '█' : ' ';
      }

      lines.push(line);
    }

    return lines.join('\n');
  }

  /**
   * Draw path to pixel grid
   */
  private drawPathToGrid(
    pathData: PathData,
    grid: boolean[][],
    progress: number,
    gridWidth: number,
    gridHeight: number
  ): void {
    const segments = pathData.segments;
    const totalLength = pathData.totalLength;
    let currentLength = 0;

    for (const segment of segments) {
      if (!segment.curve) continue;

      const segmentLength = this.approximateSegmentLength(segment);
      const segmentStartProgress = currentLength / totalLength;
      const segmentEndProgress = (currentLength + segmentLength) / totalLength;

      if (progress >= segmentStartProgress) {
        if (progress >= segmentEndProgress) {
          // Draw full segment
          this.drawFullSegment(segment, grid, gridWidth, gridHeight);
        } else {
          // Draw partial segment
          const segmentProgress = (progress - segmentStartProgress) /
                                (segmentEndProgress - segmentStartProgress);
          this.drawPartialSegment(segment, grid, segmentProgress, gridWidth, gridHeight);
        }
      }

      currentLength += segmentLength;
    }
  }

  /**
   * Approximate segment length
   */
  private approximateSegmentLength(segment: any): number {
    if (!segment.curve) return 0;

    // Simple approximation based on start and end points
    const start = segment.points[0];
    const end = segment.points[segment.points.length - 1];

    const dx = end.x - start.x;
    const dy = end.y - start.y;

    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Draw full segment to grid
   */
  private drawFullSegment(
    segment: any,
    grid: boolean[][],
    gridWidth: number,
    gridHeight: number
  ): void {
    if (!segment.points || segment.points.length < 2) return;

    // Simple line drawing
    for (let i = 1; i < segment.points.length; i++) {
      const p1 = segment.points[i - 1];
      const p2 = segment.points[i];

      this.drawLine(p1, p2, grid, gridWidth, gridHeight);
    }
  }

  /**
   * Draw partial segment to grid
   */
  private drawPartialSegment(
    segment: any,
    grid: boolean[][],
    progress: number,
    gridWidth: number,
    gridHeight: number
  ): void {
    if (!segment.points || segment.points.length < 2) return;

    const totalPoints = segment.points.length;
    const endIndex = Math.max(1, Math.floor(totalPoints * progress));

    for (let i = 1; i <= endIndex && i < segment.points.length; i++) {
      const p1 = segment.points[i - 1];
      const p2 = segment.points[i];

      this.drawLine(p1, p2, grid, gridWidth, gridHeight);
    }
  }

  /**
   * Draw line between two points using Bresenham's algorithm
   */
  private drawLine(
    p1: Point,
    p2: Point,
    grid: boolean[][],
    gridWidth: number,
    gridHeight: number
  ): void {
    const x1 = Math.round(p1.x);
    const y1 = Math.round(p1.y);
    const x2 = Math.round(p2.x);
    const y2 = Math.round(p2.y);

    const dx = Math.abs(x2 - x1);
    const dy = Math.abs(y2 - y1);
    const sx = x1 < x2 ? 1 : -1;
    const sy = y1 < y2 ? 1 : -1;
    let err = dx - dy;

    let x = x1;
    let y = y1;

    while (true) {
      if (x >= 0 && x < gridWidth && y >= 0 && y < gridHeight) {
        grid[x][y] = true;
      }

      if (x === x2 && y === y2) break;

      const e2 = 2 * err;
      if (e2 > -dy) {
        err -= dy;
        x += sx;
      }
      if (e2 < dx) {
        err += dx;
        y += sy;
      }
    }
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

      hideCursor();

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
          this.animationId = setTimeout(animateFrame, 1000 / this.options.frameRate);
        } else {
          this.isPlaying = false;
          showCursor();
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
      clearTimeout(this.animationId);
      this.animationId = undefined;
    }
    showCursor();
  }

  /**
   * Reset renderer
   */
  reset(): void {
    this.stop();
    clearScreen();
    this.frameBuffer = '';
    this.backBuffer = '';
  }

  /**
   * Get terminal capabilities
   */
  getCapabilities(): TerminalCapabilities {
    return this.capabilities;
  }

  /**
   * Get current options
   */
  getOptions(): TTYRendererOptions {
    return this.options;
  }
}
