# {{projectName}}

A modern REST API built with Hono.

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm, yarn, or pnpm

### Installation

```bash
# Install dependencies
npm install

# Environment variables are already configured in .env
# Customize them as needed for your project
```

### Development

```bash
# Run in development mode with hot reload
npm run dev
```

### Production

```bash
# Build the project
npm run build

# Start production server
npm start
```

## Project Structure

```
├── src/
│   ├── index.ts          # Application entry point
│   ├── routes/           # API routes
│   │   ├── api.ts       # Main API routes
│   │   └── health.ts    # Health check endpoints
│   ├── middleware/       # Custom middleware
│   ├── services/        # Business logic
│   └── utils/           # Utility functions
├── dist/                # Compiled output
└── package.json
```

## API Endpoints

### Health Check
- `GET /health` - Service health status
- `GET /health/ping` - Simple ping endpoint

### API Routes
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create new user

## Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## Environment Variables

The `.env` file is automatically created with default values. Key variables include:

- `NODE_ENV` - Application environment (development/production)
- `PORT` - Server port (default: 3000)
- `DATABASE_URL` - Database connection string (if using database features)
- `JWT_SECRET` - Secret key for JWT authentication (auto-generated)
- `API_KEY` - General API key (auto-generated)

**Important**: Change the auto-generated secrets before deploying to production!

## License

MIT 