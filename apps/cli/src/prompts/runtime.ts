import { select } from '@clack/prompts';

import type { Runtime } from '../types.js';

/**
 * Prompts for runtime selection (node, bun)
 * @returns The runtime to use
 */
export async function promptRuntime(): Promise<Runtime> {
  const runtime = await select({
    message: 'Which runtime would you like to use?',
    options: [
      { value: 'node', label: 'Node.js' },
      { value: 'bun', label: 'Bun' },
    ],
    initialValue: 'node',
  });

  if (typeof runtime === 'symbol') {
    throw new Error('Runtime selection cancelled');
  }

  return runtime as Runtime;
}
