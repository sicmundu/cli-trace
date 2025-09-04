/**
 * Timeline utilities for animation control
 */

import { TraceOptions, Direction } from './types.js';
import { applyEasing } from './easing.js';

export interface TimelineState {
  startTime: number;
  currentTime: number;
  duration: number;
  loop: boolean;
  direction: Direction;
  isPlaying: boolean;
  isComplete: boolean;
  loopCount: number;
}

/**
 * Create a new timeline state
 */
export function createTimeline(options: TraceOptions): TimelineState {
  return {
    startTime: 0,
    currentTime: 0,
    duration: options.durationMs,
    loop: options.loop || false,
    direction: options.direction || 'forward',
    isPlaying: false,
    isComplete: false,
    loopCount: 0,
  };
}

/**
 * Start the timeline
 */
export function startTimeline(timeline: TimelineState, startTime: number = Date.now()): TimelineState {
  return {
    ...timeline,
    startTime,
    currentTime: startTime,
    isPlaying: true,
    isComplete: false,
  };
}

/**
 * Stop the timeline
 */
export function stopTimeline(timeline: TimelineState): TimelineState {
  return {
    ...timeline,
    isPlaying: false,
  };
}

/**
 * Reset the timeline
 */
export function resetTimeline(timeline: TimelineState): TimelineState {
  return {
    ...timeline,
    currentTime: timeline.startTime,
    isComplete: false,
    loopCount: 0,
  };
}

/**
 * Update timeline state
 */
export function updateTimeline(timeline: TimelineState, currentTime: number): TimelineState {
  if (!timeline.isPlaying) return timeline;

  const elapsed = currentTime - timeline.startTime;
  const totalDuration = timeline.duration;

  let progress: number;
  let isComplete = false;
  let loopCount = timeline.loopCount;

  if (timeline.loop) {
    // Looping animation
    const cycleDuration = totalDuration;
    const cycleTime = elapsed % cycleDuration;
    progress = cycleTime / totalDuration;
    loopCount = Math.floor(elapsed / cycleDuration);
  } else {
    // Single animation
    if (elapsed >= totalDuration) {
      progress = 1;
      isComplete = true;
    } else {
      progress = elapsed / totalDuration;
    }
  }

  // Apply direction
  switch (timeline.direction) {
    case 'reverse':
      progress = 1 - progress;
      break;
    case 'yoyo':
      const cycle = Math.floor(progress * 2);
      progress = cycle % 2 === 0 ? progress * 2 : 2 - progress * 2;
      break;
    case 'forward':
    default:
      // progress remains as is
      break;
  }

  return {
    ...timeline,
    currentTime,
    isComplete,
    loopCount,
  };
}

/**
 * Get normalized progress (0-1) with easing applied
 */
export function getTimelineProgress(
  timeline: TimelineState,
  easing?: import('./types.js').EasingFunction
): number {
  if (!timeline.isPlaying) return 0;

  const elapsed = timeline.currentTime - timeline.startTime;
  const totalDuration = timeline.duration;

  let progress: number;

  if (timeline.loop) {
    const cycleTime = elapsed % totalDuration;
    progress = cycleTime / totalDuration;
  } else {
    progress = Math.min(elapsed / totalDuration, 1);
  }

  // Apply direction
  switch (timeline.direction) {
    case 'reverse':
      progress = 1 - progress;
      break;
    case 'yoyo':
      const cycle = Math.floor(progress * 2);
      progress = cycle % 2 === 0 ? progress * 2 : 2 - progress * 2;
      break;
    case 'forward':
    default:
      break;
  }

  // Apply easing if provided
  if (easing) {
    progress = applyEasing(progress, easing);
  }

  return Math.max(0, Math.min(1, progress));
}

/**
 * Check if timeline is at the beginning
 */
export function isAtStart(timeline: TimelineState): boolean {
  const elapsed = timeline.currentTime - timeline.startTime;
  return elapsed <= 0;
}

/**
 * Check if timeline is at the end (for non-looping animations)
 */
export function isAtEnd(timeline: TimelineState): boolean {
  if (timeline.loop) return false;

  const elapsed = timeline.currentTime - timeline.startTime;
  return elapsed >= timeline.duration;
}

/**
 * Get remaining time in milliseconds
 */
export function getRemainingTime(timeline: TimelineState): number {
  if (timeline.loop) return Infinity;

  const elapsed = timeline.currentTime - timeline.startTime;
  return Math.max(0, timeline.duration - elapsed);
}
