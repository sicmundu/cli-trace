# Changelog

All notable changes to CLI-Trace will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-01-XX

### Added
- **Core Animation Engine**: Complete Bézier curve implementation with arc length parameterization
- **SVG Parser**: Full SVG path data parsing and normalization to cubic Bézier curves
- **Web Renderers**:
  - SVG renderer with stroke-dashoffset animations
  - Canvas renderer with high-DPI support and glow effects
- **React Integration**:
  - `<Trace>` component for easy SVG animations
  - `useTrace` hook for programmatic control
- **Terminal Rendering**:
  - Unicode Braille pattern rendering (2x4 pixel blocks)
  - ANSI color support with automatic capability detection
  - Support for major terminals (iTerm2, Terminal.app, kitty, WezTerm, etc.)
- **CLI Application**:
  - `cli-trace live` - Live terminal animations
  - `cli-trace html` - Export to HTML with embedded animations
  - `cli-trace info` - Terminal capability detection
- **Interactive Demo Site**: Live playground built with Vite and React
- **TypeScript Support**: Full type safety with comprehensive type definitions
- **Monorepo Structure**: pnpm workspaces with proper dependency management
- **GitHub Actions**: Automated publishing workflow

### Technical Features
- **Performance**: Optimized Bézier curve calculations and LUT-based length computation
- **Compatibility**: Works across Web, Node.js, and various terminal environments
- **Modularity**: Clean separation of concerns with independent packages
- **Developer Experience**: Hot reload, TypeScript, comprehensive documentation
- **Accessibility**: Supports prefers-reduced-motion and high contrast modes

### Dependencies
- **Runtime**: Zero production dependencies for core packages
- **Development**: TypeScript, ESLint, Vitest, pnpm
- **Build**: tsup for optimized ESM/CJS builds with type definitions

## [0.1.0] - 2025-01-XX

### Added
- Initial project structure
- Basic SVG parsing
- Core Bézier curve utilities
- Proof of concept implementations

### Changed
- Migrated to monorepo structure
- Updated build system to use pnpm and tsup

### Fixed
- Various TypeScript and build issues
- Improved error handling

---

## Development Notes

This changelog follows semantic versioning. Each release includes:

- **MAJOR** version for incompatible API changes
- **MINOR** version for backwards-compatible functionality additions
- **PATCH** version for backwards-compatible bug fixes

### Contributing to Changelog

When making changes, update this file with:
- New features under "Added"
- Changes in existing functionality under "Changed"
- Bug fixes under "Fixed"
- Security improvements under "Security"

Use present tense for new features ("Add feature") and past tense for fixes ("Fixed bug").
