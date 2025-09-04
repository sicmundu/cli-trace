/**
 * Braille Pattern Rendering
 *
 * Converts pixel data to Braille characters for high-resolution terminal graphics
 */

export interface BrailleOptions {
  width: number;
  height: number;
  threshold?: number;
  invert?: boolean;
}

// Braille patterns (Unicode block U+2800 to U+28FF)
// Each pattern represents a 2x4 grid of dots
const BRAILLE_PATTERNS = [
  0x2800, // ⠀ (empty)
  // Single dots
  0x2801, // ⠁
  0x2802, // ⠂
  0x2804, // ⠄
  0x2840, // ⡀
  0x2880, // ⢀
  0x2820, // ⠠
  0x2810, // ⠐
  0x2808, // ⠈

  // Add more patterns as needed...
];

/**
 * Convert Braille pattern index to Unicode character
 */
export function brailleChar(pattern: number): string {
  return String.fromCharCode(0x2800 + pattern);
}

/**
 * Convert 2x4 pixel grid to Braille pattern
 */
export function pixelsToBraille(pixels: boolean[][]): number {
  if (pixels.length !== 2 || pixels[0].length !== 4) {
    throw new Error('Pixels must be a 2x4 grid');
  }

  let pattern = 0;

  // Braille dot mapping:
  // 0 3
  // 1 4
  // 2 5
  // 6 7

  const dotMapping = [
    [0, 0], // dot 0 (top-left)
    [1, 0], // dot 1 (middle-left)
    [0, 1], // dot 2 (bottom-left)
    [0, 2], // dot 3 (top-middle)
    [1, 2], // dot 4 (middle-middle)
    [0, 3], // dot 5 (bottom-middle)
    [1, 1], // dot 6 (top-right)
    [1, 3], // dot 7 (bottom-right)
  ];

  for (let dot = 0; dot < 8; dot++) {
    const [x, y] = dotMapping[dot];
    if (pixels[x][y]) {
      pattern |= (1 << dot);
    }
  }

  return pattern;
}

/**
 * Convert image data to Braille grid
 */
export function imageToBraille(
  imageData: ImageData | Uint8ClampedArray,
  options: BrailleOptions
): string[][] {
  // Ensure we have a typed array for consistent access
  const data = imageData instanceof ImageData ? imageData.data : imageData;
  const { width, height, threshold = 128, invert = false } = options;

  // Calculate Braille grid dimensions
  const brailleWidth = Math.ceil(width / 2);
  const brailleHeight = Math.ceil(height / 4);

  const grid: string[][] = [];

  for (let by = 0; by < brailleHeight; by++) {
    const row: string[] = [];

    for (let bx = 0; bx < brailleWidth; bx++) {
      // Extract 2x4 pixel block
      const pixels: boolean[][] = [[], []];

      for (let x = 0; x < 2; x++) {
        for (let y = 0; y < 4; y++) {
          const pixelX = bx * 2 + x;
          const pixelY = by * 4 + y;

          if (pixelX < width && pixelY < height) {
            const pixelIndex = (pixelY * width + pixelX) * 4;
            const r = data[pixelIndex];
            const g = data[pixelIndex + 1];
            const b = data[pixelIndex + 2];

            // Convert to grayscale and apply threshold
            const gray = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
            const isOn = invert ? gray < threshold : gray > threshold;

            pixels[x][y] = isOn;
          } else {
            pixels[x][y] = false;
          }
        }
      }

      const pattern = pixelsToBraille(pixels);
      row.push(brailleChar(pattern));
    }

    grid.push(row);
  }

  return grid;
}

/**
 * Render Braille grid to terminal
 */
export function renderBrailleGrid(grid: string[][]): string {
  return grid.map(row => row.join('')).join('\n');
}

/**
 * Create Braille pattern from simple pixel array
 */
export function createBraillePattern(pixels: number[][]): string {
  const pattern = pixelsToBraille(pixels.map(row => row.map(p => p > 0)));
  return brailleChar(pattern);
}

/**
 * Predefined Braille patterns for common shapes
 */
export const BRAILLE_SHAPES = {
  // Basic patterns
  empty: createBraillePattern([
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ]),

  full: createBraillePattern([
    [1, 1, 1, 1],
    [1, 1, 1, 1],
  ]),

  // Lines
  horizontal: createBraillePattern([
    [0, 1, 0, 1],
    [0, 0, 0, 0],
  ]),

  vertical: createBraillePattern([
    [1, 0, 1, 0],
    [0, 0, 0, 0],
  ]),

  // Corners
  topLeft: createBraillePattern([
    [1, 1, 0, 0],
    [1, 0, 0, 0],
  ]),

  topRight: createBraillePattern([
    [1, 1, 0, 0],
    [0, 1, 0, 0],
  ]),

  bottomLeft: createBraillePattern([
    [1, 0, 0, 0],
    [1, 1, 0, 0],
  ]),

  bottomRight: createBraillePattern([
    [0, 1, 0, 0],
    [1, 1, 0, 0],
  ]),

  // Diagonals
  diagonal1: createBraillePattern([
    [1, 0, 0, 1],
    [0, 0, 0, 0],
  ]),

  diagonal2: createBraillePattern([
    [0, 0, 1, 0],
    [0, 1, 0, 0],
  ]),
};

/**
 * Convert path coordinates to Braille grid
 */
export function pathToBrailleGrid(
  points: Array<{ x: number; y: number }>,
  gridWidth: number,
  gridHeight: number,
  strokeWidth: number = 1
): boolean[][] {
  const grid: boolean[][] = Array(gridWidth).fill(null).map(() =>
    Array(gridHeight).fill(false)
  );

  // Simple line drawing algorithm (Bresenham-like)
  for (let i = 1; i < points.length; i++) {
    const p1 = points[i - 1];
    const p2 = points[i];

    const x1 = Math.round(p1.x);
    const y1 = Math.round(p1.y);
    const x2 = Math.round(p2.x);
    const y2 = Math.round(p2.y);

    const dx = Math.abs(x2 - x1);
    const dy = Math.abs(y2 - y1);
    const sx = x1 < x2 ? 1 : -1;
    const sy = y1 < y2 ? 1 : -1;
    let err = dx - dy;

    let x = x1;
    let y = y1;

    while (true) {
      // Draw pixel with stroke width
      for (let sx = -strokeWidth; sx <= strokeWidth; sx++) {
        for (let sy = -strokeWidth; sy <= strokeWidth; sy++) {
          const px = x + sx;
          const py = y + sy;

          if (px >= 0 && px < gridWidth && py >= 0 && py < gridHeight) {
            grid[px][py] = true;
          }
        }
      }

      if (x === x2 && y === y2) break;

      const e2 = 2 * err;
      if (e2 > -dy) {
        err -= dy;
        x += sx;
      }
      if (e2 < dx) {
        err += dx;
        y += sy;
      }
    }
  }

  return grid;
}
