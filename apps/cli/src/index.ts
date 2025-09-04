#!/usr/bin/env node

/**
 * CLI-Trace Command Line Interface
 */

import { Command } from 'commander';
import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';
import { ttyTrace } from 'cli-trace-renderer-tty';
import { SVGRenderer, createSvgTracer } from 'cli-trace-renderer-web';
import { TraceSource } from 'cli-trace-core';

const program = new Command();

program
  .name('cli-trace')
  .description('Animated stroke tracing for web and terminal')
  .version('0.1.0');

// Live command
program
  .command('live')
  .description('Live terminal rendering of SVG animation')
  .option('-s, --svg <file>', 'SVG file path')
  .option('-p, --path <path>', 'SVG path data string')
  .option('-d, --duration <ms>', 'Animation duration in milliseconds', '2000')
  .option('-l, --loop', 'Loop animation')
  .option('-m, --mode <mode>', 'Render mode (braille, box, block)', 'braille')
  .option('-c, --color <color>', 'Stroke color (hex)', '#ffffff')
  .option('-b, --background <color>', 'Background color (hex)', '#000000')
  .option('-w, --width <px>', 'Terminal width')
  .option('-h, --height <px>', 'Terminal height')
  .action(async (options) => {
    try {
      const source = await getSourceFromOptions(options);

      await ttyTrace(source, {
        durationMs: parseInt(options.duration),
        loop: options.loop,
        mode: options.mode as any,
        strokeColor: options.color,
        backgroundColor: options.background,
        width: options.width ? parseInt(options.width) : undefined,
        height: options.height ? parseInt(options.height) : undefined,
      });

      console.log(chalk.green('Animation completed!'));
    } catch (error) {
      console.error(chalk.red('Error:'), error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });

// Export command
program
  .command('export')
  .description('Export animation to video or GIF')
  .option('-s, --svg <file>', 'SVG file path')
  .option('-p, --path <path>', 'SVG path data string')
  .option('-o, --out <file>', 'Output file path')
  .option('-d, --duration <ms>', 'Animation duration in milliseconds', '2000')
  .option('-w, --width <px>', 'Output width', '1920')
  .option('-h, --height <px>', 'Output height', '1080')
  .option('-f, --fps <fps>', 'Frame rate', '30')
  .option('-e, --easing <easing>', 'Easing function', 'linear')
  .option('-c, --color <color>', 'Stroke color (hex)', '#000000')
  .option('-b, --background <color>', 'Background color (hex)', '#ffffff')
  .action(async (options) => {
    try {
      console.log(chalk.blue('Exporting animation...'));

      // For now, we'll create an HTML file that can be used with puppeteer
      // Full export functionality will be implemented in the exporter package
      const source = await getSourceFromOptions(options);
      const htmlContent = generateExportHTML(source, options);

      const outputPath = options.out || 'output.html';
      await fs.writeFile(outputPath, htmlContent);

      console.log(chalk.green(`HTML export saved to: ${outputPath}`));
      console.log(chalk.yellow('Note: Full video/GIF export requires puppeteer setup'));
    } catch (error) {
      console.error(chalk.red('Error:'), error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });

// HTML command
program
  .command('html')
  .description('Generate HTML snippet with embedded animation')
  .option('-s, --svg <file>', 'SVG file path')
  .option('-p, --path <path>', 'SVG path data string')
  .option('-o, --out <file>', 'Output HTML file path')
  .option('-d, --duration <ms>', 'Animation duration in milliseconds', '2000')
  .option('-w, --width <px>', 'Canvas width', '800')
  .option('-h, --height <px>', 'Canvas height', '600')
  .option('-c, --color <color>', 'Stroke color (hex)', '#000000')
  .option('-b, --background <color>', 'Background color (hex)', '#ffffff')
  .option('-t, --preset <preset>', 'Animation preset', 'simple')
  .action(async (options) => {
    try {
      const source = await getSourceFromOptions(options);
      const htmlContent = generateHTMLSnippet(source, options);

      const outputPath = options.out || 'trace.html';
      await fs.writeFile(outputPath, htmlContent);

      console.log(chalk.green(`HTML snippet saved to: ${outputPath}`));
    } catch (error) {
      console.error(chalk.red('Error:'), error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });

// Info command
program
  .command('info')
  .description('Show system information and capabilities')
  .action(() => {
    const { detectTerminalCapabilities } = require('cli-trace-renderer-tty');

    const caps = detectTerminalCapabilities();

    console.log(chalk.bold('CLI-Trace System Information'));
    console.log('='.repeat(40));
    console.log(`Terminal Size: ${caps.width}x${caps.height}`);
    console.log(`True Color: ${caps.trueColor ? chalk.green('✓') : chalk.red('✗')}`);
    console.log(`256 Colors: ${caps.ansi256 ? chalk.green('✓') : chalk.red('✗')}`);
    console.log(`Basic Colors: ${caps.basicColor ? chalk.green('✓') : chalk.red('✗')}`);
    console.log(`Braille Support: ${caps.supportsBraille ? chalk.green('✓') : chalk.red('✗')}`);
    console.log('');
    console.log(chalk.dim('For best results, use a terminal with true color support'));
  });

// Helper function to get source from options
async function getSourceFromOptions(options: any): Promise<TraceSource> {
  if (options.svg) {
    const svgPath = path.resolve(options.svg);
    const svgContent = await fs.readFile(svgPath, 'utf-8');
    return { svg: svgContent };
  } else if (options.path) {
    return { paths: [options.path] };
  } else {
    throw new Error('Must specify either --svg or --path option');
  }
}

// Generate HTML for export
function generateExportHTML(source: TraceSource, options: any): string {
  return `<!DOCTYPE html>
<html>
<head>
  <title>CLI-Trace Export</title>
  <style>
    body { margin: 0; background: ${options.background}; }
    canvas { display: block; }
  </style>
</head>
<body>
  <canvas id="trace-canvas" width="${options.width}" height="${options.height}"></canvas>

  <script type="module">
    import { CanvasRenderer } from 'https://unpkg.com/cli-trace-renderer-web@0.1.0/dist/index.mjs';
    import { createPathData } from 'https://unpkg.com/cli-trace-parser-svg@0.1.0/dist/index.mjs';

    const canvas = document.getElementById('trace-canvas');
    const ctx = canvas.getContext('2d');

    // Create renderer
    const renderer = new CanvasRenderer({
      container: canvas,
      width: ${options.width},
      height: ${options.height},
      background: '${options.background}',
      strokeColor: '${options.color}',
    });

    // Load source data
    ${source.svg ? `
    const svgString = \`${source.svg.replace(/`/g, '\\`')}\`;
    renderer.loadSVG(svgString);
    ` : `
    const pathData = createPathData('${source.paths?.[0] || ''}');
    renderer.loadPathData(pathData);
    `}

    // Animate
    renderer.animate(${options.duration}, (t) => t).then(() => {
      console.log('Animation complete');
    });
  </script>
</body>
</html>`;
}

// Generate HTML snippet
function generateHTMLSnippet(source: TraceSource, options: any): string {
  return `<!DOCTYPE html>
<html>
<head>
  <title>CLI-Trace Animation</title>
  <style>
    body {
      margin: 0;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: ${options.background};
      font-family: Arial, sans-serif;
    }
    .container {
      text-align: center;
    }
    canvas {
      border: 1px solid #ccc;
      box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    }
  </style>
</head>
<body>
  <div class="container">
    <h2>CLI-Trace Animation</h2>
    <canvas id="trace-canvas" width="${options.width}" height="${options.height}"></canvas>
    <p>Duration: ${options.duration}ms</p>
  </div>

  <script type="module">
    import { CanvasRenderer } from 'https://unpkg.com/cli-trace-renderer-web@0.1.0/dist/index.mjs';
    import { createPathData } from 'https://unpkg.com/cli-trace-parser-svg@0.1.0/dist/index.mjs';

    const canvas = document.getElementById('trace-canvas');
    const renderer = new CanvasRenderer({
      container: canvas,
      width: ${options.width},
      height: ${options.height},
      background: '${options.background}',
      strokeColor: '${options.color}',
    });

    // Load and animate
    ${source.svg ? `
    renderer.loadSVG(\`${source.svg.replace(/`/g, '\\`')}\`);
    ` : `
    const pathData = createPathData('${source.paths?.[0] || ''}');
    renderer.loadPathData(pathData);
    `}

    renderer.animate(${options.duration}, (t) => t, (progress) => {
      // Update progress display
      document.querySelector('p').textContent = \`Progress: \${(progress * 100).toFixed(1)}%\`;
    });
  </script>
</body>
</html>`;
}

// Handle unhandled errors
process.on('uncaughtException', (error) => {
  console.error(chalk.red('Uncaught Exception:'), error instanceof Error ? error.message : String(error));
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error(chalk.red('Unhandled Rejection at:'), promise, 'reason:', reason);
  process.exit(1);
});

// Parse command line arguments
program.parse();
