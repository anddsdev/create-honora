# Contributing to Create Honora

Thank you for your interest in contributing to Create Honora! 🎉

This guide will help you get started with contributing to the project. We welcome contributions of all kinds, from bug reports and feature requests to code contributions and documentation improvements.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Making Changes](#making-changes)
- [Testing](#testing)
- [Submitting Changes](#submitting-changes)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Issue Reporting](#issue-reporting)
- [Feature Requests](#feature-requests)
- [Release Process](#release-process)

## Code of Conduct

By participating in this project, you agree to abide by our Code of Conduct. Please treat all community members with respect and create a welcoming environment for everyone.

## Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** >= 16.20.2
- **Bun** (recommended package manager)
- **Git**
- **TypeScript** knowledge (helpful but not required)

### Fork and Clone

1. Fork the repository on GitHub
2. Clone your fork locally:

```bash
git clone https://github.com/YOUR_USERNAME/create-honora.git
cd create-honora
```

3. Add the original repository as upstream:

```bash
git remote add upstream https://github.com/anddsdev/create-honora.git
```

## Development Setup

1. **Install dependencies** for the entire workspace:

```bash
bun install
```

2. **Navigate to the CLI directory**:

```bash
cd apps/cli
```

3. **Start development mode**:

```bash
bun run dev
```

This will start the TypeScript compiler in watch mode, automatically rebuilding when you make changes.

4. **Test your changes locally**:

```bash
# Link the CLI globally for testing
npm link

# Test the CLI
create-honora test-project

# Unlink when done
npm unlink -g create-honora
```

## Project Structure

```
create-honora/
├── apps/
│   └── cli/                 # CLI application
│       ├── src/
│       │   ├── index.ts     # Main entry point
│       │   ├── prompts.ts   # User interaction prompts
│       │   ├── scaffold.ts  # Project scaffolding logic
│       │   ├── types.ts     # TypeScript type definitions
│       │   └── utils/       # Utility functions
│       ├── templates/       # Project templates
│       │   └── api/         # API templates
│       ├── package.json
│       └── README.md
├── docs/                    # Documentation
├── package.json             # Workspace configuration
└── README.md               # Main project README
```

## Making Changes

### Branch Naming

Create descriptive branch names using the following pattern:

- `feat/feature-description` - New features
- `fix/bug-description` - Bug fixes
- `docs/update-description` - Documentation updates
- `refactor/code-improvement` - Code refactoring
- `test/test-description` - Test additions/improvements

### Development Workflow

1. **Create a new branch**:

```bash
git checkout -b feat/your-feature-name
```

2. **Make your changes** following our coding standards

3. **Test your changes** thoroughly:

```bash
# Type checking
bun run check-types

# Build the project
bun run build

# Test the CLI manually
```

4. **Commit your changes** following our [commit guidelines](#commit-guidelines)

5. **Push to your fork**:

```bash
git push origin feat/your-feature-name
```

6. **Create a Pull Request** on GitHub

## Testing

### Manual Testing

Since this is a CLI tool, manual testing is crucial:

1. **Test different scenarios**:

   - New project creation
   - Different feature combinations
   - Various package managers
   - Error handling (invalid project names, existing directories)

2. **Test on different environments**:

   - Different operating systems (Windows, macOS, Linux)
   - Different Node.js versions
   - Different terminals

3. **Verify generated projects**:
   - Ensure generated projects compile
   - Check that all selected features work correctly
   - Verify package.json dependencies are correct

## Submitting Changes

### Pull Request Process

1. **Ensure your PR**:

   - Has a clear title and description
   - References any related issues
   - Includes tests for new functionality
   - Updates documentation if needed
   - Follows our coding standards

2. **PR Template**:

```markdown
## Description

Brief description of what this PR does

## Changes Made

- List of changes made
- Another change

## Testing

- [ ] Manually tested the CLI
- [ ] Tested on different operating systems
- [ ] Verified generated projects work correctly

## Related Issues

Fixes #issue_number
```

3. **Review Process**:
   - At least one maintainer must approve the PR
   - All checks must pass
   - Address any requested changes promptly

## Coding Standards

### TypeScript

- **Use TypeScript** for all new code
- **Define proper types** for all functions and variables
- **Avoid `any` type** unless absolutely necessary
- **Use strict mode** settings

### Code Style

- **Formatting**: Use Prettier (configuration included)
- **Linting**: Follow ESLint rules
- **Naming conventions**:
  - `camelCase` for variables and functions
  - `PascalCase` for types and interfaces
  - `kebab-case` for file names
  - `SCREAMING_SNAKE_CASE` for constants

### File Organization

- **Keep files focused** - One main concern per file
- **Use clear, descriptive names** for files and directories
- **Export/import explicitly** - Avoid default exports when possible
- **Group related functionality** in directories

### Error Handling

- **Provide helpful error messages** to users
- **Handle edge cases** gracefully
- **Use proper error types** instead of generic errors
- **Log errors appropriately** for debugging

## Commit Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/) specification:

### Format

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Examples

```bash
feat(cli): add support for Deno runtime
fix(prompts): handle cancelled prompts gracefully
docs(readme): update installation instructions
refactor(scaffold): improve template handling logic
```

## Issue Reporting

### Bug Reports

When reporting bugs, please include:

1. **Environment information**:

   - Operating system and version
   - Node.js version
   - Package manager and version
   - Create Honora version

2. **Steps to reproduce**:

   - Exact commands run
   - Expected behavior
   - Actual behavior

3. **Additional context**:
   - Error messages or logs
   - Screenshots if applicable
   - Any workarounds found

### Bug Report Template

```markdown
**Environment:**

- OS: [e.g., Windows 11, macOS 13, Ubuntu 22.04]
- Node.js: [e.g., 18.17.0]
- Package Manager: [e.g., npm 9.6.7]
- Create Honora: [e.g., 0.1.0-alpha.1]

**Steps to Reproduce:**

1. Run `create-honora my-app`
2. Select specific options...
3. See error

**Expected Behavior:**
Project should be created successfully

**Actual Behavior:**
Error occurs: [error message]

**Additional Context:**
[Any additional information, logs, or screenshots]
```

## Feature Requests

We welcome feature requests! Please:

1. **Search existing issues** to avoid duplicates
2. **Provide clear use cases** for the feature
3. **Explain the expected behavior** in detail
4. **Consider implementation complexity** and alternatives

### Feature Request Template

```markdown
**Feature Description:**
Clear description of the feature

**Use Case:**
Why is this feature needed? What problem does it solve?

**Proposed Solution:**
How do you envision this working?

**Alternatives Considered:**
Any alternative solutions you've considered

**Additional Context:**
Any other context, mockups, or examples
```

## Release Process

### Version Numbering

We use [Semantic Versioning](https://semver.org/):

- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes (backward compatible)

### Release Steps

1. **Update version** in `package.json`
2. **Update CHANGELOG.md** with release notes
3. **Create release commit**: `chore(release): bump version to x.y.z`
4. **Create git tag**: `git tag -a vx.y.z -m "Release vx.y.z"`
5. **Push changes and tags**: `git push origin main --tags`
6. **Publish to npm**: `npm publish`
7. **Create GitHub release** with release notes

## Questions and Support

If you have questions about contributing:

- 💬 [Start a discussion](https://github.com/anddsdev/create-honora/discussions)
- 📧 Contact the maintainers
- 📚 Check the [documentation](https://github.com/anddsdev/create-honora/wiki)

## Recognition

All contributors will be recognized in our README.md and release notes. Thank you for helping make Create Honora better! 🙏

---

Happy coding! 🚀
