# Create Honora

<p align="center">
  <img src="https://img.shields.io/npm/v/create-honora?style=flat-square" alt="npm version">
  <img src="https://img.shields.io/npm/dm/create-honora?style=flat-square" alt="npm downloads">
  <img src="https://img.shields.io/badge/license-MIT-blue?style=flat-square" alt="license">
  <img src="https://img.shields.io/badge/node-%3E%3D16.20.2-brightgreen?style=flat-square" alt="node version">
</p>

**Create Honora** is a CLI tool to quickly scaffold Hono API projects with modern best practices, TypeScript support, and customizable features.

## Features

- 🚀 **Quick Setup** - Get a Hono API project running in seconds
- 📦 **Multiple Package Managers** - Support for npm, yarn, pnpm, and bun
- ⚡  **Multiple Runtimes** - Works with Node.js, Bun, and Deno
- 🔧 **Configurable Features** - CORS, Authentication, Logging, and more
- 📝 **TypeScript First** - Built with TypeScript, optional JavaScript support
- 🎯 **Template Variety** - Base API and OpenAPI templates available
- 🔒 **Authentication Ready** - Better Auth and JWT options
- 📊 **Logging Solutions** - Pino and Hono standard logger support
- 🌐 **CORS Support** - Built-in Cross-Origin Resource Sharing middleware
- 📋 **Interactive Prompts** - User-friendly CLI prompts for configuration

## Quick Start

### Using npx (Recommended)

```bash
npx create-honora my-api
cd my-api
npm run dev
```

### Using npm

```bash
npm create honora my-api
cd my-api
npm run dev
```

### Using yarn

```bash
yarn create honora my-api
cd my-api
yarn dev
```

### Using pnpm

```bash
pnpm create honora my-api
cd my-api
pnpm dev
```

### Using bun

```bash
bun create honora my-api
cd my-api
bun dev
```

## Installation

### Global Installation

```bash
npm install -g create-honora
```

Then use it anywhere:

```bash
create-honora my-project
```

## Usage

### Basic Usage

```bash
# Create a new project in the current directory
create-honora

# Create a new project with a specific name
create-honora my-hono-api

# Skip all prompts and use defaults
create-honora my-api --yes

# Skip dependency installation
create-honora my-api --skip-install

# Skip git initialization
create-honora my-api --no-git
```

### CLI Options

| Option           | Description                             | Default           |
| ---------------- | --------------------------------------- | ----------------- |
| `project-name`   | Name of the project directory to create | Current directory |
| `--yes, -y`      | Skip all prompts and use default values | `false`           |
| `--git`          | Initialize a git repository             | `true`            |
| `--skip-install` | Skip the installation of dependencies   | `false`           |
| `--version, -v`  | Show version number                     | -                 |
| `--help, -h`     | Show help                               | -                 |

### Interactive Prompts

When you run `create-honora`, you'll be prompted to configure:

1. **Project Name** - The directory name for your project
2. **Features** - Select from available features:
   - 🌐 **CORS** - Cross-Origin Resource Sharing middleware
   - 📊 **Logger** - Request/Response logging middleware
   - 🔒 **Authentication** - User authentication system
3. **Feature Options**:
   - **Logger**: Choose between Hono Logger or Pino
   - **Authentication**: Choose between Better Auth or JWT
4. **Package Manager** - npm, yarn, pnpm, or bun
5. **Runtime** - Node.js, Bun, or Deno
6. **TypeScript** - Enable/disable TypeScript support

## Project Templates

### Base Template

A minimal Hono API project with:

- Basic routing structure
- Middleware setup
- Development and production scripts
- TypeScript configuration

### OpenAPI Template

An enhanced template that includes:

- OpenAPI/Swagger documentation
- Schema validation
- API documentation generation
- Request/response type safety

## Feature Details

### Authentication Options

#### Better Auth

- Full-featured authentication library
- Social provider support (Google, GitHub, etc.)
- Session management
- Password reset functionality
- Email verification

#### JWT

- Simple JWT-based authentication
- Lightweight implementation
- Custom token handling
- Middleware protection

### Logging Options

#### Hono Logger

- Built-in Hono logging middleware
- Lightweight and fast
- Request/response logging
- Customizable format

#### Pino

- Fast JSON logger for Node.js
- High-performance logging
- Structured logging
- Multiple transport options

## Development

### Building from Source

```bash
git clone https://github.com/anddsdev/create-honora.git
cd create-honora/apps/cli
bun install
bun run build
```

### Local Development

```bash
# Watch mode for development
bun run dev

# Type checking
bun run check-types

# Build for production
bun run build
```

## Requirements

- **Node.js** >= 16.20.2
- **TypeScript** 5.8.3 (peer dependency)

## Examples

### Create a full-featured API

```bash
create-honora my-api
# Select: CORS, Logger (Pino), Authentication (Better Auth)
# Choose: npm, Node.js, TypeScript
```

### Create a minimal API

```bash
create-honora simple-api --yes
# Uses defaults: no extra features, npm, Node.js, TypeScript
```

### Create with specific options

```bash
create-honora enterprise-api --no-git --skip-install
# Creates project without git init and skips dependency installation
```

## Generated Project Structure

```
my-hono-api/
├── src/
│   ├── index.ts          # Main application entry point
│   ├── routes/           # API routes
│   └── middleware/       # Custom middleware
├── package.json          # Project dependencies and scripts
├── tsconfig.json         # TypeScript configuration
├── .gitignore           # Git ignore rules
└── README.md            # Project documentation
```

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup

1. Fork the repository
2. Clone your fork
3. Install dependencies: `bun install`
4. Make your changes
5. Run tests: `bun test`
6. Submit a pull request

## License

MIT © [Create Honora](https://github.com/anddsdev/create-honora/blob/main/apps/cli/LICENSE)

## Support

- 📚 [Documentation](https://github.com/anddsdev/create-honora/wiki)
- 🐛 [Report Issues](https://github.com/anddsdev/create-honora/issues)

## Related

- [Hono](https://hono.dev) - The web framework used by generated projects
- [Better Auth](https://www.better-auth.com) - Authentication library option
- [Pino](https://getpino.io) - Logging library option

---

Made with ❤️ by [Camilo Vargas](https://github.com/anddsdev)
