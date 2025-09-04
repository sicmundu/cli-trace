# CLI-Trace SVG Parser

SVG path parsing and normalization utilities for CLI-Trace library.

## Installation

```bash
npm install cli-trace-parser-svg
```

## Features

- Parse SVG path data into normalized segments
- Convert complex paths to Bézier curves
- Support for all SVG path commands (M, L, H, V, C, S, Q, T, A, Z)
- TypeScript support with full type definitions
- Lightweight and fast parsing

## Usage

### Basic Path Parsing

```typescript
import { parseSvgPath, createPathData } from 'cli-trace-parser-svg';

// Parse SVG path string
const pathData = parseSvgPath('M 10 10 L 20 20 C 30 30 40 40 50 50');

console.log(pathData.segments);
// Array of normalized path segments
```

### Create Path Data from SVG

```typescript
import { createPathData } from 'cli-trace-parser-svg';

const svgContent = `<svg>
  <path d="M 0 0 L 100 0 L 100 100 L 0 100 Z"/>
</svg>`;

const pathData = createPathData(svgContent);
```

### Working with Path Segments

```typescript
import { parseSvgPath, PathSegmentType } from 'cli-trace-parser-svg';

const pathData = parseSvgPath('M 0 0 L 100 100 Q 150 150 200 100');

pathData.segments.forEach(segment => {
  switch (segment.type) {
    case PathSegmentType.MoveTo:
      console.log('Move to:', segment.endPoint);
      break;
    case PathSegmentType.LineTo:
      console.log('Line to:', segment.endPoint);
      break;
    case PathSegmentType.QuadraticCurve:
      console.log('Quadratic curve:', segment.controlPoint, segment.endPoint);
      break;
  }
});
```

## Supported SVG Path Commands

- `M` - Move to
- `L` - Line to
- `H` - Horizontal line to
- `V` - Vertical line to
- `C` - Cubic Bézier curve
- `S` - Smooth cubic Bézier curve
- `Q` - Quadratic Bézier curve
- `T` - Smooth quadratic Bézier curve
- `A` - Elliptical arc
- `Z` - Close path

## API Reference

### Functions

- `parseSvgPath(pathString)` - Parse SVG path string into PathData
- `createPathData(svgContent)` - Extract and parse path data from SVG content
- `normalizePathSegments(segments)` - Normalize path segments for consistent processing

### Types

- `PathData` - Parsed path data with segments array
- `PathSegment` - Individual path segment
- `PathSegmentType` - Enumeration of segment types
- `Point` - 2D point coordinates

## Dependencies

This package requires `cli-trace-core` for Bézier curve calculations.

## Repository

[GitHub Repository](https://github.com/sicmundu/cli-trace)

## License

MIT
