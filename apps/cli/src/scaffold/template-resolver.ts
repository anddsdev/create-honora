import path from 'node:path';

import type { FeatureOptions, TemplateConfig, Runtime } from '../types';

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
    additionalDependencies: [],
    devDependencies: [],
    setupSteps: [],
    envVariables: {},
  };

  // Add runtime-specific dependencies
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
    switch (features.database) {
      case 'postgresql':
        baseConfig.additionalDependencies.push('pg');
        baseConfig.devDependencies.push('@types/pg');
        baseConfig.envVariables.DATABASE_URL = 'postgresql://user:password@localhost:5432/dbname';
        break;
      case 'mysql':
        baseConfig.additionalDependencies.push('mysql2');
        baseConfig.envVariables.DATABASE_URL = 'mysql://user:password@localhost:3306/dbname';
        break;
      case 'mariadb':
        baseConfig.additionalDependencies.push('mariadb');
        baseConfig.envVariables.DATABASE_URL = 'mariadb://user:password@localhost:3306/dbname';
        break;
      case 'mongodb':
        baseConfig.additionalDependencies.push('mongodb');
        baseConfig.envVariables.MONGODB_URI = 'mongodb://localhost:27017/dbname';
        break;
      case 'sqlite':
        baseConfig.additionalDependencies.push('better-sqlite3');
        baseConfig.devDependencies.push('@types/better-sqlite3');
        baseConfig.envVariables.DATABASE_URL = 'file:./database.db';
        break;
      default:
        break;
    }
  }

  if (features?.orm) {
    switch (features.orm) {
      case 'prisma':
        baseConfig.additionalDependencies.push('@prisma/client');
        baseConfig.devDependencies.push('prisma');
        const manager = runtime === 'node' ? 'npx' : 'bunx';
        baseConfig.setupSteps.push(`${manager} prisma generate`);
        break;
      case 'typeorm':
        baseConfig.additionalDependencies.push('typeorm', 'reflect-metadata');
        break;
      case 'drizzle':
        baseConfig.additionalDependencies.push('drizzle-orm');
        baseConfig.devDependencies.push('drizzle-kit');
        break;
      case 'mongoose':
        baseConfig.additionalDependencies.push('mongoose');
        baseConfig.devDependencies.push('@types/mongoose');
        break;
      default:
        break;
    }
  }

  return baseConfig;
}
