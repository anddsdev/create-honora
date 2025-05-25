import consola from 'consola';

import { execSync } from 'child_process';

/**
 * Initializes a git repository
 * @param projectPath - The path to the project
 * @returns A promise that resolves when the git repository is initialized
 */
export async function initializeGit(projectPath: string): Promise<void> {
  try {
    execSync('git init', { cwd: projectPath, stdio: 'ignore' });
    execSync('git add -A', { cwd: projectPath, stdio: 'ignore' });
    execSync('git commit -m "Initial commit from create-honora"', {
      cwd: projectPath,
      stdio: 'ignore',
    });
  } catch (error) {
    consola.warn('Failed to initialize git repository');
  }
}
