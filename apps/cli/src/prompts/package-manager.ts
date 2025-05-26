import { select } from '@clack/prompts';

import type { PackageManager } from '../types';

/**
 * Prompts for package manager selection (npm, yarn, pnpm, bun)
 * @returns The package manager to use
 */
export async function promptPackageManager(): Promise<PackageManager> {
  const packageManager = await select({
    message: 'Which package manager would you like to use?',
    options: [
      { value: 'npm', label: 'npm' },
      { value: 'yarn', label: 'yarn' },
      { value: 'pnpm', label: 'pnpm' },
      { value: 'bun', label: 'bun' },
    ],
    initialValue: 'npm',
  });

  if (typeof packageManager === 'symbol') {
    throw new Error('Package manager selection cancelled');
  }

  return packageManager as PackageManager;
}
