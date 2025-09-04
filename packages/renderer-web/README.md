# CLI-Trace Web Renderer

Web rendering components for CLI-Trace library providing SVG and Canvas-based stroke animations.

## Installation

```bash
npm install cli-trace-renderer-web
```

## Features

- SVG stroke animation using stroke-dashoffset
- Canvas-based rendering for complex animations
- High-DPI display support
- Smooth animation with requestAnimationFrame
- TypeScript support with full type definitions
- Browser compatibility (modern browsers)

## Usage

### SVG Stroke Animation

```typescript
import { SVGRenderer, createSvgTracer } from 'cli-trace-renderer-web';

// Create SVG renderer
const renderer = new SVGRenderer(svgElement);

// Load and animate path
const pathData = await createSvgTracer(svgContent);
await renderer.animate(2000, (progress) => progress);
```

### Canvas Rendering

```typescript
import { CanvasRenderer } from 'cli-trace-renderer-web';

// Create canvas renderer
const renderer = new CanvasRenderer(canvasElement, {
  width: 800,
  height: 600,
  backgroundColor: '#ffffff'
});

// Animate custom path
await renderer.animate(3000, (progress) => {
  const points = calculatePathPoints(progress);
  renderer.clear();
  renderer.drawPath(points);
});
```

### Advanced Animation Control

```typescript
import { SVGRenderer, TraceOptions } from 'cli-trace-renderer-web';

const options: TraceOptions = {
  duration: 2000,
  easing: 'easeOutCubic',
  strokeWidth: 2,
  strokeColor: '#007acc',
  fillColor: 'transparent'
};

const renderer = new SVGRenderer(svgElement, options);
await renderer.animate();
```

## API Reference

### Classes

- `SVGRenderer` - Renders animations using SVG stroke-dashoffset
- `CanvasRenderer` - Renders animations on HTML5 Canvas
- `TraceOptions` - Configuration options for rendering

### Functions

- `createSvgTracer(svgContent)` - Create tracer from SVG content
- `createPathData(svgString)` - Parse SVG path data

### Options

- `duration` - Animation duration in milliseconds
- `easing` - Easing function name or custom function
- `strokeWidth` - Stroke width for path rendering
- `strokeColor` - Stroke color (hex, rgb, or named color)
- `fillColor` - Fill color for path
- `backgroundColor` - Background color for canvas
- `highDPI` - Enable high-DPI rendering (default: true)

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Dependencies

This package requires:
- `cli-trace-core` for animation utilities
- `cli-trace-parser-svg` for SVG parsing

## Examples

### Simple SVG Animation

```html
<svg id="my-svg" viewBox="0 0 100 100">
  <path d="M 10 10 L 90 10 L 90 90 L 10 90 Z" stroke="#000" fill="none"/>
</svg>
```

```typescript
const svgElement = document.getElementById('my-svg');
const renderer = new SVGRenderer(svgElement);
await renderer.animate(1000, (t) => t);
```

### Canvas Animation

```html
<canvas id="my-canvas" width="400" height="300"></canvas>
```

```typescript
const canvas = document.getElementById('my-canvas') as HTMLCanvasElement;
const renderer = new CanvasRenderer(canvas);

await renderer.animate(2000, (progress) => {
  const x = progress * 300;
  const y = 150 + Math.sin(progress * Math.PI * 2) * 50;
  renderer.drawCircle(x, y, 10);
});
```

## Repository

[GitHub Repository](https://github.com/sicmundu/cli-trace)

## License

MIT
