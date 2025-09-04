# CLI-Trace Demo Site

Interactive playground and demonstration site for CLI-Trace library showcasing web-based stroke animations.

## Installation

```bash
npm install cli-trace-demo-site
```

## Features

- Interactive SVG animation playground
- Live preview of stroke animations
- Multiple easing function examples
- Customizable animation parameters
- Responsive design for all screen sizes
- TypeScript support with full type definitions
- Built with Vite for fast development

## Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Usage

### Basic Demo

The demo site provides an interactive interface for:

1. **SVG Upload** - Load your own SVG files or use built-in examples
2. **Animation Control** - Adjust duration, easing, and stroke properties
3. **Live Preview** - See animations in real-time
4. **Code Generation** - Export animation code for your projects

### Built-in Examples

The demo includes several example animations:

- **Geometric Shapes** - Circles, squares, triangles
- **Logos and Icons** - Common brand elements
- **Hand-drawn Paths** - Organic, artistic strokes
- **Complex Animations** - Multi-path sequences

## API Integration

The demo site demonstrates how to integrate CLI-Trace into web applications:

### Using React Components

```tsx
import { Trace } from 'cli-trace-renderer-react';

function MyAnimation() {
  return (
    <Trace
      source={svgContent}
      duration={2000}
      easing="easeOutCubic"
      strokeWidth={3}
      strokeColor="#007acc"
    />
  );
}
```

### Using Web Renderer

```javascript
import { SVGRenderer } from 'cli-trace-renderer-web';

const renderer = new SVGRenderer(document.getElementById('animation'));
await renderer.animate(3000, (progress) => progress);
```

### Custom Easing

```javascript
import { applyEasing, easings } from 'cli-trace-core';

// Built-in easing
const linear = applyEasing(0.5, easings.linear);
const cubic = applyEasing(0.5, easings.easeOutCubic);

// Custom easing
const elastic = applyEasing(0.5, (t) => {
  return t === 0 ? 0 : t === 1 ? 1 :
    Math.pow(2, -10 * t) * Math.sin((t - 0.1) * 5 * Math.PI) + 1;
});
```

## Demo Features

### Animation Controls

- **Duration Slider** - Adjust animation length from 100ms to 10 seconds
- **Easing Selector** - Choose from 20+ built-in easing functions
- **Stroke Properties** - Customize width, color, and style
- **Playback Controls** - Play, pause, restart animations

### SVG Editor

- **Live Editing** - Modify SVG code and see changes instantly
- **Path Highlighting** - Visual feedback for path segments
- **Validation** - Real-time SVG syntax checking
- **Import/Export** - Load from file or save to disk

### Performance Metrics

- **Frame Rate** - Real-time FPS monitoring
- **Render Time** - Animation performance metrics
- **Memory Usage** - Browser resource monitoring
- **Compatibility Check** - Browser feature detection

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Project Structure

```
demo-site/
├── src/
│   ├── components/     # React components
│   ├── hooks/         # Custom React hooks
│   ├── utils/         # Utility functions
│   ├── examples/      # Built-in SVG examples
│   ├── styles/        # CSS stylesheets
│   └── types/         # TypeScript definitions
├── public/            # Static assets
├── index.html         # Main HTML file
├── vite.config.ts     # Vite configuration
└── package.json       # Dependencies and scripts
```

## Development

### Adding New Examples

Add SVG files to `src/examples/` and update `src/examples/index.ts`:

```typescript
export const examples = {
  'my-example': {
    name: 'My Example',
    svg: '<svg>...</svg>',
    description: 'Description of the example'
  }
};
```

### Custom Components

Create reusable animation components in `src/components/`:

```tsx
import { Trace } from 'cli-trace-renderer-react';

interface AnimatedIconProps {
  name: string;
  size?: number;
  color?: string;
}

export function AnimatedIcon({ name, size = 24, color = '#000' }: AnimatedIconProps) {
  const svgContent = getIconSvg(name);

  return (
    <Trace
      source={svgContent}
      duration={1500}
      strokeColor={color}
      style={{ width: size, height: size }}
    />
  );
}
```

## Building

### Development Build

```bash
npm run dev
```

Starts development server with hot reload at `http://localhost:5173`

### Production Build

```bash
npm run build
```

Creates optimized production build in `dist/` directory

### Preview Production Build

```bash
npm run preview
```

Serves production build locally for testing

## Dependencies

This demo requires:
- `cli-trace-core` for animation utilities
- `cli-trace-renderer-web` for web rendering
- `cli-trace-renderer-react` for React components
- `cli-trace-parser-svg` for SVG parsing

## Deployment

### Static Hosting

The demo can be deployed to any static hosting service:

```bash
npm run build
# Upload contents of dist/ to your hosting provider
```

### Supported Platforms

- Netlify
- Vercel
- GitHub Pages
- AWS S3 + CloudFront
- Firebase Hosting

## Contributing

### Adding Features

1. Fork the repository
2. Create a feature branch
3. Add your changes
4. Test thoroughly
5. Submit a pull request

### Reporting Issues

Use GitHub Issues to report bugs or request features. Include:
- Browser and version
- Operating system
- Steps to reproduce
- Expected vs actual behavior

## Repository

[GitHub Repository](https://github.com/sicmundu/cli-trace)

## License

MIT
