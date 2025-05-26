import path from 'node:path';

import type { ProjectOptions } from './types';

export const defaultConfig: ProjectOptions = {
  projectName: 'my-hono-api',
  projectPath: path.resolve(process.cwd(), 'my-hono-api'),
  template: 'base',
  featureOptions: {
    cors: true,
  },
  packageManager: 'npm',
  runtime: 'node',
  git: true,
  typescript: true,
  installDependencies: true,
};

export const dependenciesWithVersions = {
  // Core framework
  hono: '^4.7.10',

  // Runtime adapters
  '@hono/node-server': '^1.14.2',

  // Logger
  pino: '^9.7.0',
  'pino-pretty': '^13.0.0',

  // Authentication
  'better-auth': '^1.2.8',

  // Database drivers
  sqlite3: '^5.1.7',
  'better-sqlite3': '^11.10.0',
  pg: '^8.16.0',
  mysql2: '^3.14.1',
  mariadb: '^3.5.0',
  mongodb: '^6.16.0',

  // Database types
  '@types/pg': '^8.15.2',
  '@types/better-sqlite3': '^7.6.11',
  '@types/mongoose': '^8.15.0',

  // ORMs
  prisma: '^6.8.2',
  '@prisma/client': '^6.8.2',
  typeorm: '^0.3.24',
  'reflect-metadata': '^0.2.2',
  'drizzle-orm': '^0.43.1',
  'drizzle-kit': '^0.31.1',
  'drizzle-zod': '^0.8.2',
  mongoose: '^8.15.0',

  // TypeScript and build tools
  tsx: '^4.19.4',
  typescript: '^5.8.3',
  'tsc-alias': '^1.8.16',
  '@types/node': '^22.15.21',
  '@types/bun': '^1.2.14',
} as const;

export type AllowedDependencies = keyof typeof dependenciesWithVersions;
