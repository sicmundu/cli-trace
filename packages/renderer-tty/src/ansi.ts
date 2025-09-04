/**
 * ANSI Escape Sequences for Terminal Control
 */

export interface TerminalCapabilities {
  trueColor: boolean;
  ansi256: boolean;
  basicColor: boolean;
  width: number;
  height: number;
  supportsBraille: boolean;
}

// ANSI escape sequence helpers
export const ANSI = {
  // Cursor control
  cursor: {
    hide: '\x1b[?25l',
    show: '\x1b[?25h',
    home: '\x1b[H',
    save: '\x1b[s',
    restore: '\x1b[u',
    moveTo: (row: number, col: number) => `\x1b[${row};${col}H`,
    moveUp: (n: number = 1) => `\x1b[${n}A`,
    moveDown: (n: number = 1) => `\x1b[${n}B`,
    moveRight: (n: number = 1) => `\x1b[${n}C`,
    moveLeft: (n: number = 1) => `\x1b[${n}D`,
  },

  // Screen control
  screen: {
    clear: '\x1b[2J',
    clearLine: '\x1b[2K',
    clearToEnd: '\x1b[0J',
    alternateBuffer: '\x1b[?1049h',
    normalBuffer: '\x1b[?1049l',
  },

  // Colors
  color: {
    reset: '\x1b[0m',
    // Basic colors (16-color)
    black: '\x1b[30m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',
    brightBlack: '\x1b[90m',
    brightRed: '\x1b[91m',
    brightGreen: '\x1b[92m',
    brightYellow: '\x1b[93m',
    brightBlue: '\x1b[94m',
    brightMagenta: '\x1b[95m',
    brightCyan: '\x1b[96m',
    brightWhite: '\x1b[97m',

    // Background colors
    bgBlack: '\x1b[40m',
    bgRed: '\x1b[41m',
    bgGreen: '\x1b[42m',
    bgYellow: '\x1b[43m',
    bgBlue: '\x1b[44m',
    bgMagenta: '\x1b[45m',
    bgCyan: '\x1b[46m',
    bgWhite: '\x1b[47m',

    // 256-color ANSI
    ansi256: (code: number) => `\x1b[38;5;${code}m`,
    ansi256Bg: (code: number) => `\x1b[48;5;${code}m`,

    // True color (24-bit)
    rgb: (r: number, g: number, b: number) => `\x1b[38;2;${r};${g};${b}m`,
    rgbBg: (r: number, g: number, b: number) => `\x1b[48;2;${r};${g};${b}m`,
  },
};

/**
 * Detect terminal capabilities
 */
export function detectTerminalCapabilities(): TerminalCapabilities {
  const env = process.env;

  // Check for true color support
  const trueColor = !!(
    env.COLORTERM === 'truecolor' ||
    env.COLORTERM === '24bit' ||
    env.TERM_PROGRAM === 'iTerm.app' ||
    env.TERM_PROGRAM === 'Apple_Terminal' ||
    env.TERM_PROGRAM === 'Hyper' ||
    env.TERM === 'xterm-256color' && env.COLORTERM
  );

  // Check for 256-color support
  const ansi256 = !!(
    env.TERM === 'xterm-256color' ||
    env.TERM === 'screen-256color' ||
    env.TERM?.includes('256')
  );

  // Get terminal dimensions
  const width = process.stdout.columns || 80;
  const height = process.stdout.rows || 24;

  // Check for Braille support (most modern terminals support it)
  const supportsBraille = !!(
    env.TERM_PROGRAM === 'iTerm.app' ||
    env.TERM_PROGRAM === 'Apple_Terminal' ||
    env.TERM_PROGRAM === 'Hyper' ||
    env.TERM === 'xterm-256color' ||
    env.TERM === 'screen-256color'
  );

  return {
    trueColor,
    ansi256: ansi256 || trueColor,
    basicColor: true, // Most terminals support at least basic colors
    width,
    height,
    supportsBraille,
  };
}

/**
 * Convert hex color to RGB
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  } : null;
}

/**
 * Convert RGB to ANSI 256-color code
 */
export function rgbToAnsi256(r: number, g: number, b: number): number {
  // Standard ANSI 256-color palette approximation
  if (r === g && g === b) {
    // Grayscale
    if (r < 8) return 16;
    if (r > 248) return 231;
    return Math.round(((r - 8) / 247) * 24) + 232;
  }

  // Color cube
  const r6 = Math.round(r / 255 * 5);
  const g6 = Math.round(g / 255 * 5);
  const b6 = Math.round(b / 255 * 5);

  return 16 + (36 * r6) + (6 * g6) + b6;
}

/**
 * Get appropriate color escape sequence based on terminal capabilities
 */
export function getColorEscape(
  color: string,
  capabilities: TerminalCapabilities,
  background: boolean = false
): string {
  const rgb = hexToRgb(color);
  if (!rgb) return '';

  const { r, g, b } = rgb;

  if (capabilities.trueColor) {
    return background ? ANSI.color.rgbBg(r, g, b) : ANSI.color.rgb(r, g, b);
  } else if (capabilities.ansi256) {
    const ansiCode = rgbToAnsi256(r, g, b);
    return background ? ANSI.color.ansi256Bg(ansiCode) : ANSI.color.ansi256(ansiCode);
  } else {
    // Basic 16-color approximation
    const brightness = (r + g + b) / 3;
    if (brightness > 128) {
      return background ? ANSI.color.bgWhite : ANSI.color.white;
    } else {
      return background ? ANSI.color.bgBlack : ANSI.color.black;
    }
  }
}

/**
 * Write to stdout with proper encoding
 */
export function writeToStdout(text: string): void {
  process.stdout.write(text);
}

/**
 * Clear screen and move cursor to home position
 */
export function clearScreen(): void {
  writeToStdout(ANSI.screen.clear + ANSI.cursor.home);
}

/**
 * Hide/show cursor
 */
export function hideCursor(): void {
  writeToStdout(ANSI.cursor.hide);
}

export function showCursor(): void {
  writeToStdout(ANSI.cursor.show);
}

/**
 * Move cursor to specific position
 */
export function moveCursor(row: number, col: number): void {
  writeToStdout(ANSI.cursor.moveTo(row, col));
}

/**
 * Save and restore cursor position
 */
export function saveCursor(): void {
  writeToStdout(ANSI.cursor.save);
}

export function restoreCursor(): void {
  writeToStdout(ANSI.cursor.restore);
}
