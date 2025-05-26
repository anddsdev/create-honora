import { select } from '@clack/prompts';

import type { ORMChoice } from '../types';

/**
 * Prompts for ORM selection
 * @returns The ORM to use
 */
export async function promptORM(): Promise<ORMChoice> {
  const orm = await select({
    message: 'Which ORM would you like to use?',
    options: [
      { value: 'prisma', label: 'Prisma' },
      { value: 'typeorm', label: 'TypeORM' },
      { value: 'drizzle', label: 'Drizzle' },
      { value: 'mongoose', label: 'Mongoose' },
    ],
    initialValue: 'prisma',
  });

  if (typeof orm === 'symbol') {
    throw new Error('ORM selection cancelled');
  }

  return orm as ORMChoice;
}
