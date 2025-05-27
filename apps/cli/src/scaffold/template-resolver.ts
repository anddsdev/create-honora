import path from 'node:path';

import type { FeatureOptions, TemplateConfig, Runtime, DatabaseChoice, ORMChoice } from '../types';

/**
 * Template types available in the system
 */
export type TemplateType = 'base' | 'openapi';

/**
 * Gets the template directory path for the given template type
 * @param templateType - The type of template to get
 * @returns The path to the template directory
 */
export function getTemplatePath(templateType: TemplateType): string {
  // When running from dist/, we need to go up one level to reach the templates
  const templatesBaseDir = path.join(__dirname, '..', 'templates', 'api');

  switch (templateType) {
    case 'base':
      return path.join(templatesBaseDir, 'base');
    case 'openapi':
      return path.join(templatesBaseDir, 'openapi');
    default:
      return path.join(templatesBaseDir, 'base');
  }
}

/**
 * Gets the database template directory path for the given ORM and database combination
 * @param orm - The ORM being used
 * @param database - The database being used
 * @returns The path to the database template directory, or null if no template exists
 */
export function getDatabaseTemplatePath(orm: ORMChoice, database: DatabaseChoice): string | null {
  if (orm === 'none' || database === 'none') {
    return null;
  }

  // When running from dist/, we need to go up one level to reach the templates
  const templatesBaseDir = path.join(__dirname, '..', 'templates', 'db');

  const databaseMap: Record<DatabaseChoice, string | null> = {
    postgresql: 'postgres',
    mysql: 'mysql',
    mariadb: 'mysql', // MariaDB uses the same template as MySQL
    sqlite: 'sqlite',
    mongodb: 'mongodb',
    none: null,
  };

  switch (orm) {
    case 'drizzle':
      const databaseDir = databaseMap[database];
      if (!databaseDir) {
        return null;
      }
      return path.join(templatesBaseDir, 'drizzle', databaseDir);
    case 'prisma':
      // Prisma uses a single src directory with Handlebars templates
      return path.join(templatesBaseDir, 'prisma', 'src');
    case 'typeorm':
      // Future: return path.join(templatesBaseDir, 'typeorm', databaseDir, 'src');
      return null;
    case 'mongoose':
      // Future: return path.join(templatesBaseDir, 'mongoose', 'mongodb', 'src');
      return null;
    default:
      return null;
  }
}

/**
 * Configures database-specific dependencies and environment variables
 * @param config - The template configuration
 * @param database - The database being used
 */
function configureDatabaseDependencies(config: TemplateConfig, database: DatabaseChoice): void {
  const databaseConfigs = {
    postgresql: {
      envVar: 'DATABASE_URL',
      envValue: 'postgresql://user:password@localhost:5432/dbname',
    },
    mysql: {
      envVar: 'DATABASE_URL',
      envValue: 'mysql://user:password@localhost:3306/dbname',
    },
    mariadb: {
      envVar: 'DATABASE_URL',
      envValue: 'mariadb://user:password@localhost:3306/dbname',
    },
    mongodb: {
      envVar: 'DATABASE_URL',
      envValue: 'mongodb://localhost:27017/dbname',
    },
    sqlite: {
      envVar: 'DATABASE_URL',
      envValue: 'file:./database.db',
    },
    none: null,
  };

  const dbConfig = databaseConfigs[database];
  if (!dbConfig) return;

  config.envVariables[dbConfig.envVar] = dbConfig.envValue;
}

/**
 * Configures ORM-specific dependencies and setup steps
 * @param config - The template configuration
 * @param orm - The ORM being used
 * @param runtime - The runtime being used
 */
function configureORMDependencies(config: TemplateConfig, orm: ORMChoice, runtime: Runtime): void {
  const pkgManager = runtime === 'node' ? 'npx' : 'bunx';

  const ormConfigs = {
    prisma: {
      deps: ['@prisma/client'],
      devDeps: ['prisma'],
      setupSteps: [`${pkgManager} prisma generate`],
    },
    typeorm: {
      deps: ['typeorm', 'reflect-metadata'],
      devDeps: [],
      setupSteps: [],
    },
    drizzle: {
      deps: ['drizzle-orm'],
      devDeps: ['drizzle-kit'],
      setupSteps: [`${pkgManager} drizzle-kit generate`, `${pkgManager} drizzle-kit migrate`],
    },
    mongoose: {
      deps: ['mongoose'],
      devDeps: ['@types/mongoose'],
      setupSteps: [],
    },
    none: {
      deps: [],
      devDeps: [],
      setupSteps: [],
    },
  };

  const ormConfig = ormConfigs[orm];
  if (!ormConfig) return;

  config.additionalDependencies.push(...ormConfig.deps);
  config.devDependencies.push(...ormConfig.devDeps);
  config.setupSteps.push(...ormConfig.setupSteps);
}

/**
 * Gets the template configuration including additional dependencies and setup steps
 * @param templateType - The type of template
 * @param features - The features selected
 * @param runtime - The runtime being used
 * @returns The template configuration
 */
export function getTemplateConfig(
  templateType: TemplateType,
  features: FeatureOptions | undefined,
  runtime: Runtime,
): TemplateConfig {
  const baseConfig: TemplateConfig = {
    templateType,
    runtime,
    templatePath: getTemplatePath(templateType),
    databaseTemplatePath: null,
    additionalDependencies: [],
    devDependencies: [],
    setupSteps: [],
    envVariables: {},
  };

  if (features?.database && features?.orm) {
    baseConfig.databaseTemplatePath = getDatabaseTemplatePath(features.orm, features.database);
  }

  if (runtime === 'node') {
    baseConfig.additionalDependencies.push('@hono/node-server');
  }

  if (features?.logger) {
    if (features.logger === 'pino') {
      baseConfig.additionalDependencies.push('pino', 'pino-pretty');
    }
  }

  if (features?.auth) {
    if (features.auth === 'better-auth') {
      baseConfig.additionalDependencies.push('better-auth');
      baseConfig.envVariables.BETTER_AUTH_SECRET = 'your-secret-key-here';
      baseConfig.envVariables.BETTER_AUTH_URL = 'http://localhost:3000 #Base URL of your app';
    } else if (features.auth === 'jwt') {
      baseConfig.envVariables.JWT_SECRET = 'your-jwt-secret-here';
    }
  }

  if (features?.database) {
    configureDatabaseDependencies(baseConfig, features.database);
  }

  if (features?.orm) {
    configureORMDependencies(baseConfig, features.orm, runtime);
  }

  return baseConfig;
}
