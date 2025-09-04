# CLI-Trace React Renderer

React components for CLI-Trace library providing declarative stroke animations.

## Installation

```bash
npm install cli-trace-renderer-react
```

## Features

- Declarative React components for stroke animations
- Custom hooks for animation control
- Integration with existing React applications
- TypeScript support with full type definitions
- Zero additional dependencies (peer dependencies only)
- Server-side rendering compatible

## Usage

### Basic Trace Component

```tsx
import { Trace } from 'cli-trace-renderer-react';

function MyComponent() {
  const svgContent = `<svg viewBox="0 0 100 100">
    <path d="M 10 10 L 90 10 L 90 90 L 10 90 Z" stroke="#007acc" fill="none"/>
  </svg>`;

  return (
    <Trace
      source={svgContent}
      duration={2000}
      strokeWidth={2}
      strokeColor="#007acc"
    />
  );
}
```

### Using Custom Hook

```tsx
import { useTrace } from 'cli-trace-renderer-react';

function AnimatedComponent() {
  const { elementRef, startAnimation, stopAnimation, isAnimating } = useTrace({
    duration: 3000,
    easing: 'easeInOutCubic',
    autoStart: false
  });

  return (
    <div>
      <svg ref={elementRef} viewBox="0 0 200 200">
        <path d="M 20 20 L 180 20 L 180 180 L 20 180 Z" stroke="#000" fill="none"/>
      </svg>
      <button onClick={isAnimating ? stopAnimation : startAnimation}>
        {isAnimating ? 'Stop' : 'Start'} Animation
      </button>
    </div>
  );
}
```

### Advanced Configuration

```tsx
import { Trace } from 'cli-trace-renderer-react';

function AdvancedExample() {
  return (
    <Trace
      source={{
        type: 'svg',
        content: '<path d="M 0 50 Q 25 0 50 50 T 100 50" stroke="#ff6b6b" fill="none"/>'
      }}
      duration={4000}
      easing="easeOutElastic"
      strokeWidth={3}
      strokeColor="#ff6b6b"
      fillColor="transparent"
      onAnimationStart={() => console.log('Animation started')}
      onAnimationEnd={() => console.log('Animation ended')}
      onProgress={(progress) => console.log('Progress:', progress)}
    />
  );
}
```

## API Reference

### Components

#### Trace

Main component for rendering stroke animations.

**Props:**
- `source` - SVG content string or path data object
- `duration` - Animation duration in milliseconds (default: 2000)
- `easing` - Easing function name or custom function (default: 'linear')
- `strokeWidth` - Stroke width (default: 1)
- `strokeColor` - Stroke color (default: '#000000')
- `fillColor` - Fill color (default: 'transparent')
- `autoStart` - Auto-start animation on mount (default: true)
- `loop` - Loop animation (default: false)
- `onAnimationStart` - Callback when animation starts
- `onAnimationEnd` - Callback when animation ends
- `onProgress` - Callback with progress value (0-1)

### Hooks

#### useTrace

Custom hook for manual animation control.

**Parameters:**
```typescript
interface UseTraceOptions {
  duration?: number;
  easing?: string | EasingFunction;
  autoStart?: boolean;
  onStart?: () => void;
  onEnd?: () => void;
  onProgress?: (progress: number) => void;
}
```

**Returns:**
```typescript
interface UseTraceReturn {
  elementRef: React.RefObject<HTMLElement>;
  startAnimation: () => Promise<void>;
  stopAnimation: () => void;
  isAnimating: boolean;
  progress: number;
}
```

## Supported Source Formats

### SVG String

```tsx
<Trace source="<svg><path d='M 0 0 L 100 100'/></svg>" />
```

### SVG File Path

```tsx
<Trace source="/path/to/file.svg" />
```

### Path Data Object

```tsx
<Trace source={{
  type: 'path',
  data: 'M 0 0 L 100 100'
}} />
```

## Styling

The component supports custom styling through CSS classes and inline styles:

```tsx
<Trace
  source={svgContent}
  className="my-trace-animation"
  style={{ width: '300px', height: '200px' }}
/>
```

## TypeScript Support

Full TypeScript support with comprehensive type definitions:

```typescript
import { TraceProps, UseTraceOptions, UseTraceReturn } from 'cli-trace-renderer-react';

// All props and return values are fully typed
```

## Peer Dependencies

- `react` >= 16.8.0
- `react-dom` >= 16.8.0

## Dependencies

This package requires:
- `cli-trace-core` for animation utilities
- `cli-trace-renderer-web` for rendering logic
- `cli-trace-parser-svg` for SVG parsing

## Browser Support

Same as `cli-trace-renderer-web`:
- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Repository

[GitHub Repository](https://github.com/sicmundu/cli-trace)

## License

MIT
