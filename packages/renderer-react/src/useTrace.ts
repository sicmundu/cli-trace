/**
 * useTrace Hook
 *
 * A React hook for programmatic control of trace animations
 */

import { useRef, useEffect, useState, useCallback } from 'react';
import {
  TraceSource,
  TraceOptions,
  applyEasing
} from 'cli-trace-core';
import { createPathData } from 'cli-trace-parser-svg';
import { SVGRenderer, CanvasRenderer } from 'cli-trace-renderer-web';

export interface UseTraceOptions {
  /** Source data for the trace */
  source: TraceSource;

  /** Animation options */
  options?: Partial<TraceOptions>;

  /** Renderer type */
  renderer?: 'svg' | 'canvas';

  /** Container element */
  container?: HTMLElement | string;

  /** Container width */
  width?: number;

  /** Container height */
  height?: number;

  /** Background color */
  background?: string;

  /** Stroke width */
  strokeWidth?: number;

  /** Stroke color */
  strokeColor?: string;

  /** Fill color */
  fillColor?: string;

  /** Enable glow effect (Canvas only) */
  glowEffect?: boolean;

  /** Glow color */
  glowColor?: string;

  /** Glow intensity */
  glowIntensity?: number;

  /** Auto-play animation on mount */
  autoPlay?: boolean;

  /** Loop animation */
  loop?: boolean;

  /** Animation duration in milliseconds */
  duration?: number;
}

export interface UseTraceReturn {
  /** Current animation progress (0-1) */
  progress: number;

  /** Whether animation is currently playing */
  isPlaying: boolean;

  /** Whether animation is complete */
  isComplete: boolean;

  /** Start animation */
  play: () => Promise<void>;

  /** Stop animation */
  stop: () => void;

  /** Reset animation to beginning */
  reset: () => void;

  /** Set animation progress manually */
  setProgress: (progress: number) => void;

  /** Update stroke color */
  setStrokeColor: (color: string) => void;

  /** Update stroke width */
  setStrokeWidth: (width: number) => void;

  /** Get renderer instance */
  getRenderer: () => SVGRenderer | CanvasRenderer | null;
}

export const useTrace = (options: UseTraceOptions): UseTraceReturn => {
  const {
    source,
    options: traceOptions = {},
    renderer: rendererType = 'svg',
    container,
    width = 400,
    height = 300,
    background = 'transparent',
    strokeWidth = 2,
    strokeColor = '#000000',
    fillColor = 'none',
    glowEffect = false,
    glowColor = '#ffffff',
    glowIntensity = 0.5,
    autoPlay = false,
    loop = false,
    duration = 2000,
  } = options;

  const rendererRef = useRef<SVGRenderer | CanvasRenderer | null>(null);
  const [progress, setProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  // Initialize renderer
  const initializeRenderer = useCallback(() => {
    // Clean up previous renderer
    if (rendererRef.current) {
      rendererRef.current.destroy();
    }

    const commonOptions = {
      container,
      width,
      height,
      background,
      strokeWidth,
      strokeColor,
      fillColor,
    };

    if (rendererType === 'canvas') {
      rendererRef.current = new CanvasRenderer({
        ...commonOptions,
        glowEffect,
        glowColor,
        glowIntensity,
      });
    } else {
      rendererRef.current = new SVGRenderer(commonOptions);
    }

    // Load source data
    loadSourceData();
  }, [
    rendererType, container, width, height, background,
    strokeWidth, strokeColor, fillColor,
    glowEffect, glowColor, glowIntensity
  ]);

  // Load source data into renderer
  const loadSourceData = useCallback(() => {
    if (!rendererRef.current) return;

    if (source.svg) {
      // Load from SVG string
      if (rendererRef.current instanceof SVGRenderer) {
        rendererRef.current.loadSVG(source.svg);
      } else {
        // For Canvas, we need to parse SVG first
        const pathStrings = extractPathsFromSVG(source.svg);
        const pathDataArray = pathStrings.map(pathString => createPathData(pathString));
        (rendererRef.current as CanvasRenderer).loadPathDataArray(pathDataArray);
      }
    } else if (source.paths) {
      // Load from path strings
      const pathDataArray = source.paths.map(pathString => createPathData(pathString));

      if (rendererRef.current instanceof SVGRenderer) {
        pathDataArray.forEach(pathData => rendererRef.current!.loadPathData(pathData));
      } else {
        (rendererRef.current as CanvasRenderer).loadPathDataArray(pathDataArray);
      }
    }
  }, [source]);

  // Start animation
  const play = useCallback(async (): Promise<void> => {
    if (!rendererRef.current || isPlaying) return;

    setIsPlaying(true);
    setIsComplete(false);

    try {
      await rendererRef.current.animate(
        duration,
        (t) => applyEasing(t, traceOptions.easing || 'linear'),
        (progress) => {
          setProgress(progress);
        }
      );

      setIsPlaying(false);
      setIsComplete(true);

      // Auto-loop if enabled
      if (loop) {
        setTimeout(() => play(), 100);
      }
    } catch (error) {
      console.error('Animation error:', error);
      setIsPlaying(false);
    }
  }, [duration, traceOptions.easing, loop, isPlaying]);

  // Stop animation
  const stop = useCallback(() => {
    if (rendererRef.current) {
      rendererRef.current.stop();
    }
    setIsPlaying(false);
  }, []);

  // Reset animation
  const reset = useCallback(() => {
    stop();
    setProgress(0);
    setIsComplete(false);
    if (rendererRef.current) {
      rendererRef.current.reset();
    }
  }, [stop]);

  // Set progress manually
  const setProgressManually = useCallback((newProgress: number) => {
    const clampedProgress = Math.max(0, Math.min(1, newProgress));
    setProgress(clampedProgress);

    if (rendererRef.current) {
      if (rendererRef.current instanceof SVGRenderer) {
        rendererRef.current.updateAllPaths(clampedProgress);
      } else {
        (rendererRef.current as CanvasRenderer).render(clampedProgress);
      }
    }
  }, []);

  // Set stroke color
  const setStrokeColor = useCallback((color: string) => {
    if (rendererRef.current) {
      rendererRef.current.setStrokeColor(color);
    }
  }, []);

  // Set stroke width
  const setStrokeWidth = useCallback((width: number) => {
    if (rendererRef.current) {
      rendererRef.current.setStrokeWidth(width);
    }
  }, []);

  // Get renderer instance
  const getRenderer = useCallback(() => rendererRef.current, []);

  // Initialize on mount
  useEffect(() => {
    initializeRenderer();

    return () => {
      if (rendererRef.current) {
        rendererRef.current.destroy();
      }
    };
  }, [initializeRenderer]);

  // Auto-play on mount
  useEffect(() => {
    if (autoPlay && rendererRef.current) {
      play();
    }
  }, [autoPlay, play]);

  // Extract paths from SVG string (helper function)
  const extractPathsFromSVG = (svgString: string): string[] => {
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
  };

  return {
    progress,
    isPlaying,
    isComplete,
    play,
    stop,
    reset,
    setProgress: setProgressManually,
    setStrokeColor,
    setStrokeWidth,
    getRenderer,
  };
};
