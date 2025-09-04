# CLI-Trace TTY Renderer

Terminal rendering utilities for CLI-Trace library providing Braille and ANSI text-based animations.

## Installation

```bash
npm install cli-trace-renderer-tty
```

## Features

- Braille pattern rendering for smooth terminal graphics
- ANSI color support for 16-color, 256-color, and true color terminals
- Double buffering for flicker-free animations
- Automatic terminal capability detection
- TypeScript support with full type definitions
- Cross-platform terminal support

## Usage

### Basic Terminal Animation

```typescript
import { ttyTrace } from 'cli-trace-renderer-tty';

// Animate SVG in terminal
await ttyTrace('<svg><path d="M 0 0 L 10 0 L 10 10 L 0 10 Z"/></svg>', {
  duration: 2000,
  width: 80,
  height: 24
});
```

### Custom Terminal Options

```typescript
import { ttyTrace, TTYRendererOptions } from 'cli-trace-renderer-tty';

const options: TTYRendererOptions = {
  width: 120,
  height: 30,
  fps: 30,
  colorMode: '256color',
  backgroundChar: '.',
  foregroundChar: '#',
  invert: false,
  threshold: 128
};

await ttyTrace(svgContent, options);
```

### Using Renderer Directly

```typescript
import { TTYRenderer } from 'cli-trace-renderer-tty';

// Create renderer
const renderer = new TTYRenderer({
  width: 100,
  height: 25,
  colorMode: 'truecolor'
});

// Load and animate
await renderer.loadSvg(svgContent);
await renderer.animate(3000, (progress) => progress);
```

## API Reference

### Functions

#### ttyTrace

Main function for terminal animation.

**Parameters:**
- `source` - SVG content string or path data
- `options` - Animation options (optional)

**Returns:** Promise that resolves when animation completes

### Classes

#### TTYRenderer

Terminal renderer class for advanced control.

**Constructor options:**
```typescript
interface TTYRendererOptions {
  width?: number;        // Terminal width (default: auto-detect)
  height?: number;       // Terminal height (default: auto-detect)
  fps?: number;         // Frames per second (default: 30)
  colorMode?: 'mono' | '16color' | '256color' | 'truecolor';
  backgroundChar?: string;  // Background character (default: ' ')
  foregroundChar?: string;  // Foreground character (default: '█')
  invert?: boolean;     // Invert colors (default: false)
  threshold?: number;   // Brightness threshold 0-255 (default: 128)
  doubleBuffer?: boolean;  // Use double buffering (default: true)
}
```

**Methods:**
- `loadSvg(svgContent)` - Load SVG content for rendering
- `animate(duration, easingFunction)` - Start animation
- `renderFrame(progress)` - Render specific frame
- `clear()` - Clear terminal
- `getTerminalSize()` - Get current terminal dimensions

## Supported Terminal Types

### Braille Rendering

Uses Unicode Braille patterns for smooth, high-resolution terminal graphics:

```
⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏
```

### ANSI Color Modes

- **Monochrome** - Simple text characters
- **16-color** - Basic ANSI colors
- **256-color** - Extended color palette
- **True Color** - 24-bit RGB colors

## Terminal Compatibility

### Automatic Detection

The library automatically detects terminal capabilities:

```typescript
import { detectTerminalCapabilities } from 'cli-trace-renderer-tty';

const capabilities = detectTerminalCapabilities();
console.log(capabilities.colorMode);  // 'truecolor', '256color', etc.
console.log(capabilities.width);      // Terminal width
console.log(capabilities.height);     // Terminal height
```

### Manual Configuration

Override automatic detection:

```typescript
const renderer = new TTYRenderer({
  width: 120,
  height: 40,
  colorMode: '256color'
});
```

## Performance Optimization

### Double Buffering

Enabled by default to prevent flicker during animations:

```typescript
const renderer = new TTYRenderer({
  doubleBuffer: true  // Default: true
});
```

### Frame Rate Control

Adjust animation smoothness:

```typescript
await ttyTrace(svgContent, {
  fps: 60,  // Higher FPS for smoother animation
  duration: 2000
});
```

## Examples

### Simple Animation

```bash
node -e "
const { ttyTrace } = require('cli-trace-renderer-tty');
ttyTrace('<svg><circle cx=\"10\" cy=\"10\" r=\"8\"/></svg>');
"
```

### Custom Colors

```typescript
await ttyTrace('<svg><rect width="20" height="10"/></svg>', {
  colorMode: 'truecolor',
  foregroundChar: '█',
  backgroundChar: '░'
});
```

### Progress Callback

```typescript
await ttyTrace(svgContent, {
  onProgress: (progress) => {
    console.log(\`Animation progress: \${Math.round(progress * 100)}%\`);
  }
});
```

## Error Handling

```typescript
try {
  await ttyTrace(svgContent, options);
} catch (error) {
  if (error.code === 'ENOTTY') {
    console.error('Not running in a terminal');
  } else {
    console.error('Animation failed:', error.message);
  }
}
```

## Dependencies

This package requires:
- `cli-trace-core` for animation utilities
- `cli-trace-parser-svg` for SVG parsing

## Platform Support

- Linux terminals
- macOS Terminal.app
- Windows Command Prompt (limited)
- Windows Terminal
- Most SSH clients

## License

MIT
