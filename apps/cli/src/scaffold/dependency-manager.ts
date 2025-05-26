import type { TemplateConfig, PackageManager } from '../types';
import { addDependencies } from '../utils/add-dependencies';
import { installDependencies } from '../utils/install-dependencies';

/**
 * Installs all dependencies for the project based on template configuration
 * @param projectPath - The path to the project
 * @param templateConfig - The template configuration with dependencies
 * @param packageManager - The package manager to use
 * @param installFlag - Whether to install dependencies
 */
export async function manageDependencies(
  projectPath: string,
  templateConfig: TemplateConfig,
  packageManager: PackageManager,
  installFlag: boolean,
): Promise<void> {
  if (templateConfig.additionalDependencies.length > 0 || templateConfig.devDependencies.length > 0) {
    await addDependencies({
      projectPath,
      packageManager,
      dependencies: templateConfig.additionalDependencies as any[],
      devDependencies: templateConfig.devDependencies as any[],
    });
  }

  if (installFlag) {
    await installDependencies(projectPath, packageManager);
  }
}

/**
 * Runs setup steps specified in the template configuration
 * @param projectPath - The path to the project
 * @param setupSteps - Array of command strings to execute
 */
export async function runSetupSteps(projectPath: string, setupSteps: string[]): Promise<void> {
  const { spawn } = await import('node:child_process');

  for (const step of setupSteps) {
    console.log(`Running setup step: ${step}`);

    try {
      await new Promise((resolve, reject) => {
        const [command, ...args] = step.split(' ');
        const child = spawn(command, args, {
          cwd: projectPath,
          stdio: 'inherit',
          shell: true,
        });

        child.on('close', (code) => {
          if (code === 0) {
            resolve(void 0);
          } else {
            reject(new Error(`Setup step "${step}" failed with code ${code}`));
          }
        });

        child.on('error', (error) => {
          reject(error);
        });
      });
    } catch (error) {
      console.warn(`Warning: Setup step "${step}" failed:`, error);
    }
  }
}
