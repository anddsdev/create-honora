import consola from 'consola';

import { execSync } from 'child_process';

/**
 * Installs dependencies
 * @param projectPath - The path to the project
 * @param packageManager - The package manager to use
 * @returns A promise that resolves when the dependencies are installed
 */
export async function installDependencies(projectPath: string, packageManager: string): Promise<void> {
  try {
    execSync(`${packageManager} install`, { cwd: projectPath, stdio: 'inherit' });
  } catch (error) {
    consola.error('Failed to install dependencies');
  }
}
