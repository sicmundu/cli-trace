# Contributing to CLI-Trace

Thank you for your interest in contributing to CLI-Trace! This document provides guidelines and information for contributors.

## Development Setup

### Prerequisites

- Node.js 18+
- pnpm package manager
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/sicmundu/cli-trace.git
cd cli-trace

# Install dependencies
pnpm install

# Build all packages
pnpm run build

# Start demo site
cd apps/demo-site && pnpm run dev
```

## Project Structure

This is a monorepo managed with pnpm workspaces:

```
cli-trace/
├── packages/
│   ├── core/           # Core utilities and types
│   ├── parser-svg/     # SVG parsing and normalization
│   ├── renderer-web/   # Web renderers (SVG/Canvas)
│   ├── renderer-react/ # React components and hooks
│   └── renderer-tty/   # Terminal renderer (Braille/ANSI)
├── apps/
│   ├── cli/           # Command-line interface
│   └── demo-site/     # Interactive demo site
└── tooling/           # Shared configuration
```

## Development Workflow

### 1. Choose an Issue

- Check the [Issues](https://github.com/sicmundu/cli-trace/issues) page
- Look for issues labeled `good first issue` or `help wanted`
- Comment on the issue to indicate you're working on it

### 2. Create a Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/issue-number-description
```

### 3. Make Changes

- Follow the existing code style
- Write tests for new functionality
- Update documentation if needed
- Ensure TypeScript types are correct

### 4. Test Your Changes

```bash
# Run tests
pnpm run test

# Build all packages
pnpm run build

# Test CLI
cd apps/cli && pnpm run build
node dist/index.js --help

# Test demo site
cd apps/demo-site && pnpm run dev
```

### 5. Commit Your Changes

```bash
git add .
git commit -m "feat: add new feature description"
```

Follow conventional commit format:
- `feat:` - new features
- `fix:` - bug fixes
- `docs:` - documentation changes
- `style:` - code style changes
- `refactor:` - code refactoring
- `test:` - test additions/changes
- `chore:` - maintenance tasks

### 6. Create a Pull Request

- Push your branch to GitHub
- Create a pull request with a clear description
- Reference any related issues
- Wait for code review

## Code Style

### TypeScript

- Use strict type checking
- Prefer interfaces over types for public APIs
- Use descriptive names for types and variables
- Document complex types with JSDoc comments

### JavaScript/React

- Use modern ES6+ syntax
- Prefer functional components and hooks in React
- Use meaningful variable and function names
- Keep functions small and focused

### Testing

- Write unit tests for utility functions
- Test React components with user interactions
- Ensure CLI commands work correctly
- Test across different terminal types when possible

## Package Publishing

When ready to publish new versions:

1. Update version numbers in all package.json files
2. Update CHANGELOG.md with changes
3. Create a git tag: `git tag v1.2.3`
4. Push tag: `git push origin v1.2.3`
5. GitHub Actions will automatically publish to npm

## Documentation

- Keep README.md up to date
- Document new features and APIs
- Provide code examples
- Update TypeScript types documentation

## Reporting Issues

When reporting bugs:

1. Use the issue template
2. Provide clear steps to reproduce
3. Include system information (OS, Node version, terminal)
4. Attach screenshots for UI issues
5. Provide sample code that demonstrates the problem

## Questions?

Feel free to ask questions in the [Discussions](https://github.com/sicmundu/cli-trace/discussions) section or reach out to maintainers.

Thank you for contributing to CLI-Trace!
