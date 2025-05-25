import type { PackageManager } from '../types.js';

/**
 * Gets the package manager to use
 * @returns The package manager to use
 */
export function getPackageManager(): PackageManager {
  const userAgent = process.env.npm_config_user_agent;

  if (userAgent?.includes('yarn')) {
    return 'yarn';
  }

  if (userAgent?.includes('bun')) {
    return 'bun';
  }

  if (userAgent?.includes('pnpm')) {
    return 'pnpm';
  }

  return 'npm';
}
