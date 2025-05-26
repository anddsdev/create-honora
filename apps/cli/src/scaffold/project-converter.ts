import type { Runtime } from '../types';
import { convertToJavaScript } from '../utils/parse-type-files';

/**
 * Converts the project based on the selected configuration
 * @param projectPath - The path to the project
 * @param typescript - Whether to use TypeScript
 */
export async function convertProject(projectPath: string, typescript: boolean): Promise<void> {
  // Convert to JavaScript if TypeScript is disabled
  if (!typescript) {
    await convertToJavaScript(projectPath);
  }
}

/**
 * Applies post-processing steps to the project
 * @param projectPath - The path to the project
 * @param options - Conversion options
 * @param options.typescript - Whether to use TypeScript
 * @param options.runtime - The runtime to use
 * @returns A promise that resolves when the project is post-processed
 */
export async function postProcessProject(
  projectPath: string,
  options: {
    typescript: boolean;
    runtime: Runtime;
  },
): Promise<void> {
  // Convert to JavaScript if needed
  await convertProject(projectPath, options.typescript);

  // Apply runtime-specific optimizations
  if (options.runtime === 'bun') {
    await optimizeForBun(projectPath);
  } else {
    await optimizeForNode(projectPath);
  }
}

/**
 * Applies Bun-specific optimizations
 * @param projectPath - The path to the project
 */
async function optimizeForBun(projectPath: string): Promise<void> {
  // Add Bun-specific configurations
  // This could include removing Node.js specific dependencies
  // or adding Bun-specific scripts
  console.log('Applying Bun optimizations...');
}

/**
 * Applies Node.js-specific optimizations
 * @param projectPath - The path to the project
 */
async function optimizeForNode(projectPath: string): Promise<void> {
  // Add Node.js-specific configurations
  console.log('Applying Node.js optimizations...');
}
