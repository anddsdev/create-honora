import { select } from '@clack/prompts';

import type { DatabaseChoice } from '../types.js';

/**
 * Prompts for database selection
 * @returns The database to use
 */
export async function promptDatabase(): Promise<DatabaseChoice> {
  const database = await select({
    message: 'Which database would you like to use?',
    options: [
      { value: 'sqlite', label: 'SQLite' },
      { value: 'postgresql', label: 'PostgreSQL' },
      { value: 'mysql', label: 'MySQL' },
      { value: 'mariadb', label: 'MariaDB' },
      { value: 'mongodb', label: 'MongoDB' },
    ],
    initialValue: 'sqlite',
  });

  if (typeof database === 'symbol') {
    throw new Error('Database selection cancelled');
  }

  return database as DatabaseChoice;
}
