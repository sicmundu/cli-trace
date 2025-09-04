/**
 * TTY Trace Function
 *
 * Convenient function for rendering SVG traces in terminal
 */

import { TraceSource, TraceOptions } from '@cli-trace/core';
import { TTYRenderer, TTYRendererOptions } from './tty-renderer.js';

/**
 * Render SVG trace animation in terminal
 */
export async function ttyTrace(
  source: TraceSource,
  options: Partial<TraceOptions & TTYRendererOptions> = {}
): Promise<void> {
  const {
    durationMs = 2000,
    easing = 'linear',
    loop = false,
    mode = 'braille',
    colorMode = 'truecolor',
    strokeColor = '#ffffff',
    backgroundColor = '#000000',
    width,
    height,
    frameRate = 30,
    ...rendererOptions
  } = options;

  const renderer = new TTYRenderer({
    mode,
    colorMode,
    strokeColor,
    backgroundColor,
    width,
    height,
    frameRate,
    ...rendererOptions,
  });

  // Load source data
  renderer.loadSource(source);

  // Start animation
  await renderer.animate(
    durationMs,
    (t) => {
      // Simple easing application (could be enhanced)
      if (easing === 'easeInOutCubic') {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      }
      return t;
    },
    undefined,
    () => {
      if (!loop) {
        renderer.reset();
      }
    }
  );
}

/**
 * Create TTY renderer instance
 */
export function createTTYRenderer(options?: TTYRendererOptions): TTYRenderer {
  return new TTYRenderer(options);
}

/**
 * Get terminal capabilities
 */
export function getTerminalCapabilities() {
  const { detectTerminalCapabilities } = require('./ansi.js');
  return detectTerminalCapabilities();
}
