/**
 * React Trace Component
 *
 * A React component for rendering animated stroke paths
 */

import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  TraceSource,
  TraceOptions,
  PathData,
  applyEasing
} from 'cli-trace-core';
import { createPathData } from 'cli-trace-parser-svg';
import { SVGRenderer, CanvasRenderer } from 'cli-trace-renderer-web';

export interface TraceProps {
  /** Source data for the trace */
  source: TraceSource;

  /** Animation options */
  options?: Partial<TraceOptions>;

  /** Renderer type */
  renderer?: 'svg' | 'canvas';

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

  /** CSS class name */
  className?: string;

  /** Inline styles */
  style?: React.CSSProperties;

  /** Callbacks */
  onStart?: () => void;
  onEnd?: () => void;
  onProgress?: (progress: number) => void;
}

export const Trace: React.FC<TraceProps> = ({
  source,
  options = {},
  renderer = 'svg',
  width = 400,
  height = 300,
  background = 'transparent',
  strokeWidth = 2,
  strokeColor = '#000000',
  fillColor = 'none',
  glowEffect = false,
  glowColor = '#ffffff',
  glowIntensity = 0.5,
  autoPlay = true,
  loop = false,
  duration = 2000,
  className,
  style,
  onStart,
  onEnd,
  onProgress,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<SVGRenderer | CanvasRenderer | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  // Initialize renderer
  const initializeRenderer = useCallback(() => {
    if (!containerRef.current) return;

    // Clean up previous renderer
    if (rendererRef.current) {
      rendererRef.current.destroy();
    }

    const commonOptions = {
      container: containerRef.current,
      width,
      height,
      background,
      strokeWidth,
      strokeColor,
      fillColor,
    };

    if (renderer === 'canvas') {
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
    renderer, width, height, background, strokeWidth, strokeColor, fillColor,
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
  const startAnimation = useCallback(async () => {
    if (!rendererRef.current || isPlaying) return;

    setIsPlaying(true);
    if (onStart) onStart();

    try {
      await rendererRef.current.animate(
        duration,
        (t) => applyEasing(t, options.easing || 'linear'),
        (progress) => {
          setProgress(progress);
          if (onProgress) onProgress(progress);
        }
      );

      setIsPlaying(false);
      if (onEnd) onEnd();

      // Auto-loop if enabled
      if (loop) {
        setTimeout(() => startAnimation(), 100); // Small delay before restart
      }
    } catch (error) {
      console.error('Animation error:', error);
      setIsPlaying(false);
    }
  }, [duration, options.easing, loop, isPlaying, onStart, onEnd, onProgress]);

  // Stop animation
  const stopAnimation = useCallback(() => {
    if (rendererRef.current) {
      rendererRef.current.stop();
    }
    setIsPlaying(false);
  }, []);

  // Reset animation
  const resetAnimation = useCallback(() => {
    stopAnimation();
    setProgress(0);
    if (rendererRef.current) {
      rendererRef.current.reset();
    }
  }, [stopAnimation]);

  // Initialize on mount and when dependencies change
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
      startAnimation();
    }
  }, [autoPlay, startAnimation]);

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

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        width: `${width}px`,
        height: `${height}px`,
        position: 'relative',
        overflow: 'hidden',
        ...style,
      }}
    />
  );
};

export default Trace;
