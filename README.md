# CLI-Trace

Animated stroke tracing for web and terminal. Create beautiful SVG animations with a unified API across different platforms.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)

## Installation

CLI-Trace is available on npm. Choose the package that fits your needs:

### Core Package
```bash
npm install cli-trace-core
```

### Web Rendering
```bash
npm install cli-trace-renderer-web
```

### React Components
```bash
npm install cli-trace-renderer-react
```

### Terminal Rendering
```bash
npm install cli-trace-renderer-tty
```

### CLI Application
```bash
npm install -g cli-trace-cli
```

### Complete Monorepo
```bash
git clone https://github.com/sicmundu/cli-trace.git
cd cli-trace
npm install
```

## Features

- SVG Stroke Animation - Beautiful animated path tracing
- Multi-Platform - Web (SVG/Canvas), Terminal (ANSI/Braille), React
- High Performance - Optimized Bézier curve calculations
- TypeScript - Full type safety and excellent DX
- Terminal Rendering - Unicode Braille patterns and ANSI colors
- Modular Architecture - Use only what you need
- Interactive Demo - Live playground and examples

## Quick Start

### Web (Vanilla JavaScript)

```javascript
import { createSvgTracer } from 'cli-trace-renderer-web';

const tracer = createSvgTracer('#container', {
  durationMs: 2000,
  easing: 'easeInOutCubic'
});

tracer.loadSVG('<svg>...</svg>');
```

### React

```tsx
import { Trace } from 'cli-trace-renderer-react';

<Trace
  source={{ svg: svgString }}
  options={{ durationMs: 1500, loop: true }}
  width={400}
  height={300}
/>
```

### Terminal

```bash
# Install CLI
npm install -g cli-trace-cli

# Live animation
cli-trace live --svg logo.svg --duration 2000 --loop

# Export to HTML
cli-trace html --svg logo.svg --out animation.html
```

## Packages

This monorepo contains several packages:

- **`cli-trace-core`** - Core utilities and types
- **`cli-trace-parser-svg`** - SVG parsing and path normalization
- **`cli-trace-renderer-web`** - Web renderers (SVG/Canvas)
- **`cli-trace-renderer-react`** - React components and hooks
- **`cli-trace-renderer-tty`** - Terminal renderer with Braille/ANSI
- **`cli-trace-cli`** - Command-line interface
- **`cli-trace-demo-site`** - Interactive playground

## Installation

```bash
# Install all packages
pnpm install

# Build all packages
pnpm run build

# Start demo site
cd apps/demo-site && pnpm run dev
```

## Usage Examples

### Basic SVG Animation

```javascript
import { SVGRenderer } from 'cli-trace-renderer-web';

const renderer = new SVGRenderer({
  container: document.getElementById('animation'),
  width: 400,
  height: 300
});

// Load and animate SVG
const pathElement = renderer.loadSVG(svgContent);
await renderer.animate(2000);
```

### Terminal Animation

```javascript
import { ttyTrace } from 'cli-trace-renderer-tty';

await ttyTrace(
  { svg: svgContent },
  { durationMs: 3000, mode: 'braille', loop: true }
);
```

### React Hook

```tsx
import { useTrace } from 'cli-trace-renderer-react';

function AnimatedLogo() {
  const { progress, isPlaying, play, stop } = useTrace({
    source: { svg: logoSvg },
    duration: 2000,
    loop: true,
  });

  return (
    <div>
      <canvas id="logo-canvas" width="400" height="300" />
      <button onClick={isPlaying ? stop : play}>
        {isPlaying ? 'Stop' : 'Play'}
      </button>
      <p>Progress: {(progress * 100).toFixed(1)}%</p>
    </div>
  );
}
```

## API Reference

### Core Types

```typescript
interface TraceSource {
  svg?: string;
  paths?: string[];
  text?: { value: string; fontUrl?: string };
}

interface TraceOptions {
  durationMs: number;
  delayMs?: number;
  loop?: boolean;
  easing?: EasingFunction;
  direction?: 'forward' | 'reverse' | 'yoyo';
  strokeWidth?: number;
}
```

### Web Renderer

```typescript
const tracer = createSvgTracer(container, options);
await tracer.animate(duration, easing);
```

### React Component

```tsx
<Trace source={source} options={options} renderer="canvas" />
```

### CLI Commands

```bash
cli-trace live --svg file.svg --duration 2000
cli-trace export --svg file.svg --out video.mp4
cli-trace html --svg file.svg --out snippet.html
cli-trace info
```

## Terminal Support

CLI-Trace automatically detects terminal capabilities:

- **True Color**: 16M colors (if supported)
- **256 Colors**: Extended ANSI palette
- **Basic Colors**: 16-color ANSI
- **Braille**: Unicode Braille patterns for high-res graphics
- **Box Drawing**: ASCII box characters as fallback

Supported terminals:
- iTerm2, Terminal.app, kitty, WezTerm
- Alacritty, GNOME Terminal, Konsole
- Windows Terminal, Hyper

## Customization

### Easing Functions

```javascript
import { easings } from 'cli-trace-core';

const customEasing = [0.25, 0.1, 0.25, 1]; // Cubic bezier
```

### Animation Presets

```javascript
const presets = {
  simple: { durationMs: 2000, easing: 'linear' },
  bounce: { durationMs: 1500, easing: 'easeOutBounce' },
  glow: { durationMs: 3000, easing: 'easeInOutCubic' },
};
```

## Development

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm run build

# Run tests
pnpm run test

# Start demo site
pnpm --filter cli-trace-demo-site run dev

# Build CLI
pnpm --filter cli-trace-cli run build
```

## Roadmap

- [x] Core animation engine
- [x] SVG parsing and normalization
- [x] Web renderers (SVG/Canvas)
- [x] React integration
- [x] Terminal rendering (Braille/ANSI)
- [x] CLI application
- [x] Interactive demo site
- [ ] Video/GIF export (Puppeteer + FFmpeg)
- [ ] Animation presets
- [ ] Vue/Svelte components
- [ ] WebWorker optimization
- [ ] Advanced easing functions

## Contributing

Contributions welcome! Please see our [Contributing Guide](CONTRIBUTING.md).

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Acknowledgments

- SVG path parsing inspired by existing libraries
- Braille rendering techniques from terminal graphics projects
- Animation easing functions based on standard CSS specifications
