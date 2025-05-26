import { multiselect, select } from '@clack/prompts';

import type { FeatureOptions, LoggerChoice, AuthChoice } from '../types.js';

import { promptDatabase } from './database.js';
import { promptORM } from './orm.js';

/**
 * Prompts for feature selection and their specific options
 * @returns The features and their options
 */
export async function promptFeatures(): Promise<FeatureOptions> {
  const features = await multiselect({
    message: 'Which features would you like to include?',
    options: [
      {
        value: 'cors',
        label: 'CORS',
        hint: 'Cross-Origin Resource Sharing middleware',
      },
      {
        value: 'logger',
        label: 'Logger',
        hint: 'Request/Response logging middleware',
      },
      {
        value: 'auth',
        label: 'Authentication',
        hint: 'User authentication system',
      },
      {
        value: 'database',
        label: 'Database',
        hint: 'Database to use for storing data',
      },
      {
        value: 'orm',
        label: 'ORM',
        hint: 'ORM to use for interacting with the database',
      },
    ],
    required: false,
  });

  if (typeof features === 'symbol') {
    throw new Error('Feature selection cancelled');
  }

  const featureOptions: FeatureOptions = {};

  // Prompt for specific options based on selected features
  if (features.includes('logger')) {
    const loggerChoice = await select({
      message: 'Which logging solution would you like to use?',
      options: [
        { value: 'hono-logger', label: 'Hono Logger', hint: 'Built-in Hono logging middleware' },
        { value: 'pino', label: 'Pino', hint: 'Fast JSON logger for Node.js' },
      ],
    });

    if (typeof loggerChoice !== 'symbol') {
      featureOptions.logger = loggerChoice as LoggerChoice;
    }
  }

  if (features.includes('auth')) {
    const authChoice = await select({
      message: 'Which authentication solution would you like to use?',
      options: [
        { value: 'better-auth', label: 'Better Auth', hint: 'Full-featured auth library with social providers' },
        { value: 'jwt', label: 'JWT', hint: 'Simple JWT-based authentication' },
      ],
    });

    if (typeof authChoice !== 'symbol') {
      featureOptions.auth = authChoice as AuthChoice;
    }
  }

  if (features.includes('cors')) {
    featureOptions.cors = true;
  }

  if (features.includes('database')) {
    const databaseChoice = await promptDatabase();
    featureOptions.database = databaseChoice;
  }

  if (features.includes('orm')) {
    const ormChoice = await promptORM();
    featureOptions.orm = ormChoice;
  }

  return featureOptions;
}
