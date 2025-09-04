# CLI-Trace CLI

Command-line interface for CLI-Trace library providing terminal-based stroke animations and utilities.

## Installation

```bash
npm install -g cli-trace-cli
# or
npm install cli-trace-cli
```

## Usage

```bash
cli-trace [command] [options]
```

## Commands

### Live Animation

Animate SVG files in the terminal:

```bash
cli-trace live path/to/file.svg
cli-trace live --svg '<svg><path d="M 0 0 L 100 100"/></svg>'
```

**Options:**
- `--duration, -d` - Animation duration in milliseconds (default: 2000)
- `--width, -w` - Terminal width (default: auto-detect)
- `--height, -h` - Terminal height (default: auto-detect)
- `--fps` - Frames per second (default: 30)
- `--color-mode` - Color mode: mono, 16color, 256color, truecolor (default: auto-detect)

### Export to HTML

Export animation as interactive HTML file:

```bash
cli-trace html input.svg output.html
```

**Options:**
- `--duration, -d` - Animation duration (default: 2000)
- `--width` - Canvas width (default: 800)
- `--height` - Canvas height (default: 600)
- `--background` - Background color (default: white)
- `--stroke-width` - Stroke width (default: 2)
- `--stroke-color` - Stroke color (default: black)

### Export Animation

Export animation as various formats:

```bash
cli-trace export input.svg output.json
cli-trace export input.svg output.gif --format gif
```

**Options:**
- `--format, -f` - Export format: json, gif, mp4 (default: json)
- `--duration, -d` - Animation duration (default: 2000)
- `--fps` - Frames per second for video export (default: 30)

### Information

Display information about SVG file:

```bash
cli-trace info path/to/file.svg
```

Shows:
- File size and dimensions
- Number of paths and segments
- Estimated animation complexity
- Terminal compatibility information

### Help

```bash
cli-trace --help
cli-trace live --help
cli-trace html --help
```

## Examples

### Basic Animation

```bash
# Animate SVG file
cli-trace live examples/heart.svg

# Animate inline SVG
cli-trace live --svg '<svg viewBox="0 0 100 100"><path d="M 50 20 C 30 20 20 40 20 50 C 20 60 30 80 50 80 C 70 80 80 60 80 50 C 80 40 70 20 50 20 Z"/></svg>'
```

### Export to Web

```bash
# Create interactive HTML
cli-trace html logo.svg logo.html --stroke-color "#007acc" --duration 3000

# Export animation data
cli-trace export animation.svg data.json
```

### Terminal Configuration

```bash
# Force specific terminal size
cli-trace live file.svg --width 120 --height 40

# Use 256 colors
cli-trace live file.svg --color-mode 256color

# High frame rate for smooth animation
cli-trace live file.svg --fps 60
```

## Configuration

Create a `.clitracerc` file in your project root:

```json
{
  "defaultDuration": 2500,
  "defaultFps": 30,
  "defaultColorMode": "truecolor",
  "exportDirectory": "./exports"
}
```

## Supported File Formats

- **SVG** - Scalable Vector Graphics
- **JSON** - CLI-Trace animation data
- **HTML** - Interactive web animations
- **GIF** - Animated GIF export (planned)
- **MP4** - Video export (planned)

## Terminal Requirements

### Minimum Requirements

- Terminal with Unicode support
- Node.js 18.0.0 or higher
- 80x24 terminal size minimum

### Recommended

- Modern terminal with true color support
- 120x40 terminal size or larger
- 60 FPS capable terminal

## Error Handling

The CLI provides helpful error messages:

```bash
# File not found
cli-trace live nonexistent.svg
# Error: File not found: nonexistent.svg

# Invalid SVG
cli-trace live invalid.xml
# Error: Invalid SVG format

# Terminal too small
cli-trace live large.svg
# Warning: Terminal size (80x24) may be too small for optimal display
```

## Integration

### With Build Tools

```bash
# In package.json scripts
{
  "scripts": {
    "animate": "cli-trace live assets/logo.svg",
    "export-web": "cli-trace html assets/logo.svg dist/logo.html"
  }
}
```

### Programmatic Usage

```javascript
const { exec } = require('child_process');

exec('cli-trace live animation.svg --duration 5000', (error, stdout, stderr) => {
  if (error) {
    console.error('Animation failed:', error);
    return;
  }
  console.log('Animation completed');
});
```

## Dependencies

This package requires:
- `cli-trace-core` for animation utilities
- `cli-trace-parser-svg` for SVG parsing
- `cli-trace-renderer-tty` for terminal rendering

## Contributing

Found a bug or want to contribute? See the main CLI-Trace repository for contribution guidelines.

## Repository

[GitHub Repository](https://github.com/sicmundu/cli-trace)

## License

MIT
