# CLI-Trace Core

Core utilities for CLI-Trace library providing Bézier curve calculations, timeline management, and easing functions.

## Installation

```bash
npm install cli-trace-core
```

## Features

- Bézier curve calculations and manipulation
- Timeline management for animations
- Built-in easing functions
- TypeScript support with full type definitions
- Lightweight and zero dependencies

## Usage

### Bézier Curves

```typescript
import { BezierCurve, Point } from 'cli-trace-core';

// Create a cubic Bézier curve
const curve = new BezierCurve([
  { x: 0, y: 0 },
  { x: 25, y: 100 },
  { x: 75, y: 100 },
  { x: 100, y: 0 }
]);

// Get point at t = 0.5
const point = curve.getPointAt(0.5);
console.log(point); // { x: 50, y: 75 }
```

### Easing Functions

```typescript
import { applyEasing, easings } from 'cli-trace-core';

// Apply linear easing
const easedValue = applyEasing(0.5, easings.linear);

// Apply custom easing function
const customEased = applyEasing(0.5, (t) => t * t);
```

### Timeline

```typescript
import { Timeline } from 'cli-trace-core';

const timeline = new Timeline();

// Add keyframes
timeline.addKeyframe(0, { x: 0, y: 0 });
timeline.addKeyframe(1000, { x: 100, y: 100 });

// Get value at time 500ms
const value = timeline.getValueAt(500);
```

## API Reference

### Classes

- `BezierCurve` - Represents a Bézier curve
- `Timeline` - Manages animation keyframes

### Functions

- `applyEasing(t, easingFunction)` - Apply easing function to progress value
- `easings` - Collection of built-in easing functions

### Types

- `Point` - 2D point with x, y coordinates
- `CubicBezierCurve` - Cubic Bézier curve definition
- `QuadraticBezierCurve` - Quadratic Bézier curve definition
- `EasingFunction` - Function that takes progress (0-1) and returns eased value

## License

MIT
