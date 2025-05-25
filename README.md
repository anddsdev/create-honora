# Create Honora

<p align="center">
  <img src="https://img.shields.io/badge/license-MIT-blue?style=flat-square" alt="license">
  <img src="https://img.shields.io/badge/node-%3E%3D16.20.2-brightgreen?style=flat-square" alt="node version">
  <img src="https://img.shields.io/badge/bun-1.2.14-orange?style=flat-square" alt="bun version">
  <img src="https://img.shields.io/github/stars/anddsdev/create-honora?style=flat-square" alt="github stars">
</p>

<p align="center">
  <strong>A modern CLI tool ecosystem for creating Hono API projects with best practices</strong>
</p>

<p align="center">
  Create production-ready Hono APIs with TypeScript, authentication, logging, and more - all configured and ready to go.
</p>

## 🚀 Quick Start

```bash
# Create a new Hono API project
npx create-honora my-api
cd my-api
npm run dev
```

## 📦 What's Included

This monorepo contains the complete Create Honora ecosystem:

### CLI Tool (`apps/cli`)

The main CLI application that scaffolds new Hono API projects with:

- 🔧 **Interactive Project Setup** - Guided prompts for configuration
- 📝 **TypeScript Support** - Full TypeScript configuration out of the box
- 🔒 **Authentication Options** - Better Auth or JWT implementation
- 📊 **Logging Solutions** - Pino or Hono standard logger
- 🌐 **CORS Support** - Cross-Origin Resource Sharing middleware
- 📋 **Multiple Templates** - Base API and OpenAPI-ready templates
- 📦 **Package Manager Flexibility** - Support for npm, yarn, pnpm, and bun
- ⚡  **Runtime Support** - Node.js, Bun, and Deno compatibility

### Documentation (`docs`)

Comprehensive guides and documentation for:

- Getting started tutorials
- Feature explanations
- API references
- Best practices

## 🏗️ Architecture

```
create-honora/
├── apps/
│   └── cli/              # Main CLI application
│       ├── src/          # CLI source code
│       ├── templates/    # Project templates
│       └── package.json  # CLI package configuration
├── docs/                 # Documentation
├── package.json          # Workspace configuration
└── README.md            # This file
```

This project uses a monorepo structure with [Bun workspaces](https://bun.sh/docs/install/workspaces) for efficient development and package management.

## 🛠️ Development

### Prerequisites

- **Node.js** >= 16.20.2
- **Bun** >= 1.2.14 (recommended)
- **Git**

### Setup

1. **Clone the repository**:

```bash
git clone https://github.com/anddsdev/create-honora.git
cd create-honora
```

2. **Install dependencies**:

```bash
bun install
```

3. **Development workflow**:

```bash
# Navigate to CLI directory
cd apps/cli

# Start development mode
bun run dev

# Build the CLI
bun run build

# Test locally
npm link
create-honora test-project
```

### Project Structure

- **`apps/cli/`** - The main CLI application
  - **`src/`** - TypeScript source code
  - **`templates/`** - Project scaffolding templates
  - **`dist/`** - Built JavaScript output
- **`docs/`** - Documentation and guides
- **`package.json`** - Workspace configuration and scripts

## 📋 Features

### 🎯 Templates

#### Base Template

- Clean Hono API structure
- TypeScript configuration
- Development and production scripts
- Basic middleware setup

#### OpenAPI Template

- OpenAPI/Swagger documentation
- Schema validation
- Auto-generated API docs
- Type-safe request/response handling

### 🔐 Authentication

#### Better Auth

- Social providers (Google, GitHub, etc.)
- Session management
- Password reset flows
- Email verification

#### JWT

- Lightweight token-based auth
- Custom middleware
- Token validation
- Refresh token support

### 📊 Logging

#### Hono Logger

- Built-in Hono middleware
- Fast and lightweight
- Customizable formats
- Request/response logging

#### Pino

- High-performance JSON logger
- Structured logging
- Multiple transports
- Production-ready

### 📦 Package Managers

Full support for modern package managers:

- **npm** - The standard Node.js package manager
- **yarn** - Fast, reliable, and secure dependency management
- **pnpm** - Efficient disk space usage with symlinks
- **bun** - Ultra-fast JavaScript runtime and package manager

### ⚡ Runtimes

Deploy your APIs on your preferred runtime:

- **Node.js** - The standard JavaScript runtime
- **Bun** - Fast all-in-one JavaScript runtime
- **Deno** - Secure runtime with TypeScript support

## 📚 Documentation

### Quick Links

- 📖 [CLI Documentation](apps/cli/README.md)
- 🤝 [Contributing Guide](apps/cli/CONTRIBUTING.md)
- 📝 [API Reference](docs/api-reference.md)
- 🎮 [Examples](docs/examples.md)

### Guides

- [Getting Started](docs/getting-started.md)
- [Project Templates](docs/templates.md)
- [Authentication Setup](docs/authentication.md)
- [Deployment Guide](docs/deployment.md)

## 🤝 Contributing

We welcome contributions from the community! Please see our [Contributing Guide](apps/cli/CONTRIBUTING.md) for details on:

- Development setup
- Coding standards
- Testing procedures
- Pull request process

### Ways to Contribute

- 🐛 **Bug Reports** - Help us identify and fix issues
- 💡 **Feature Requests** - Suggest new functionality
- 📝 **Documentation** - Improve guides and examples
- 🔧 **Code Contributions** - Add features or fix bugs
- 🧪 **Testing** - Help us test new releases

## 📊 Stats

- **CLI Downloads**: Check [npm stats](https://www.npmjs.com/package/create-honora)
- **GitHub Stars**: Support the project by starring the repository
- **Community**: Join discussions in [GitHub Discussions](https://github.com/anddsdev/create-honora/discussions)

## 🛣️ Roadmap

### Current Version (v0.1.x)

- ✅ Basic CLI scaffolding
- ✅ TypeScript support
- ✅ Multiple package managers
- ✅ Authentication options
- ✅ Logging solutions

### Upcoming Features

- 🔄 **Database Integration** - Prisma, Drizzle ORM support
- 🔄 **Testing Setup** - Jest, Vitest configuration
- 🔄 **Docker Support** - Containerization templates
- 🔄 **CI/CD Templates** - GitHub Actions, GitLab CI
- 🔄 **Monitoring** - Health checks and metrics
- 🔄 **Rate Limiting** - Built-in rate limiting middleware

## 🌟 Showcase

Projects built with Create Honora:

> Share your project with us! Open an issue or discussion to feature your API.

## 🆘 Support

### Getting Help

- 📚 [Documentation](https://github.com/anddsdev/create-honora/wiki)
- 💬 [GitHub Discussions](https://github.com/anddsdev/create-honora/discussions)
- 🐛 [Issue Tracker](https://github.com/anddsdev/create-honora/issues)
- 📧 Contact: [Camilo Vargas](https://github.com/anddsdev)

### Community

- Follow updates on [GitHub](https://github.com/anddsdev/create-honora)
- Join discussions about Hono and API development
- Share your experiences and help others

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](apps/cli/LICENSE) file for details.

## 🙏 Acknowledgments

- **[Hono](https://hono.dev)** - The amazing web framework that powers generated APIs
- **[Better Auth](https://www.better-auth.com)** - Modern authentication library
- **[Pino](https://getpino.io)** - Fast JSON logger for Node.js
- **[Bun](https://bun.sh)** - Fast JavaScript runtime and package manager

## 👤 Author

**Camilo Vargas**

- GitHub: [@anddsdev](https://github.com/anddsdev)
- Project: [Create Honora](https://github.com/anddsdev/create-honora)

---

<p align="center">
  <strong>Made with ❤️ for the Hono community</strong>
</p>

<p align="center">
  ⭐ Star this project if you find it helpful!
</p>
