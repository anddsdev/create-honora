import { text, select, multiselect, confirm } from '@clack/prompts';

import path from 'node:path';

import pc from 'picocolors';

import { getProjectInfo, showProjectSummary } from './utils/project-name.js';
import { validateProjectName, checkDirectory, suggestAlternativeName } from './utils/validation.js';
import type { DirectoryConflictAction } from './utils/validation.js';

export type Runtime = 'node' | 'bun' | 'deno';
export type PackageManager = 'npm' | 'yarn' | 'pnpm' | 'bun';

export interface FeatureOptions {
  logger?: 'pino' | 'hono-standard';
  auth?: 'better-auth' | 'jwt';
  cors?: boolean;
}

export interface ProjectOptions {
  projectName: string;
  projectPath: string;
  features: string[];
  featureOptions: FeatureOptions;
  packageManager: PackageManager;
  runtime: Runtime;
  typescript: boolean;
  git: boolean;
  installDependencies: boolean;
  directoryAction?: DirectoryConflictAction;
}

/**
 * Prompts for the project name with validation
 * @param defaultName - The default name for the project
 * @returns The project name
 */
export async function promptProjectName(defaultName?: string): Promise<string> {
  let isValid = false;
  let projectName = '';

  while (!isValid) {
    const result = await text({
      message: 'What is your project name?',
      placeholder: defaultName || 'my-hono-api',
      defaultValue: defaultName,
      validate: (value) => {
        const validation = validateProjectName(value);
        if (!validation.isValid) {
          return validation.error!;
        }
      },
    });

    if (typeof result === 'symbol') {
      throw new Error('Project creation cancelled');
    }

    projectName = result;
    isValid = true;
  }

  return projectName;
}

/**
 * Handles directory conflicts
 * @param projectPath - The path to the project
 * @param projectName - The name of the project
 * @returns The action to take and the new path if applicable
 */
export async function handleDirectoryConflict(
  projectPath: string,
  projectName: string,
): Promise<{ action: DirectoryConflictAction; newPath?: string }> {
  const parentDir = path.dirname(projectPath);
  const suggestedName = await suggestAlternativeName(projectName, parentDir);

  const action = await select({
    message: `Directory ${pc.cyan(projectPath)} already exists and is not empty. What would you like to do?`,
    options: [
      {
        value: 'overwrite',
        label: 'Overwrite - Remove existing files and continue',
        hint: 'This will delete all existing files in the directory',
      },
      {
        value: 'merge',
        label: 'Merge - Keep existing files and add new ones',
        hint: 'May cause conflicts with existing files',
      },
      {
        value: 'rename',
        label: `Rename - Use "${suggestedName}" instead`,
        hint: 'Creates a new directory with a different name',
      },
      {
        value: 'cancel',
        label: 'Cancel - Exit without making changes',
      },
    ],
  });

  if (typeof action === 'symbol') {
    return { action: 'cancel' };
  }

  if (action === 'rename') {
    return {
      action: action as DirectoryConflictAction,
      newPath: path.join(parentDir, suggestedName),
    };
  }

  return { action: action as DirectoryConflictAction };
}

/**
 * Prompts for feature selection and their specific options
 */
export async function promptFeatures(): Promise<{ features: string[]; featureOptions: FeatureOptions }> {
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
        { value: 'hono-standard', label: 'Hono Logger', hint: 'Built-in Hono logging middleware' },
        { value: 'pino', label: 'Pino', hint: 'Fast JSON logger for Node.js' },
      ],
    });

    if (typeof loggerChoice !== 'symbol') {
      featureOptions.logger = loggerChoice as 'pino' | 'hono-standard';
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
      featureOptions.auth = authChoice as 'better-auth' | 'jwt';
    }
  }

  if (features.includes('cors')) {
    featureOptions.cors = true;
  }

  return { features, featureOptions };
}

/**
 * Prompts for package manager selection (npm, yarn, pnpm, bun)
 */
export async function promptPackageManager(): Promise<'npm' | 'yarn' | 'pnpm' | 'bun'> {
  const packageManager = await select({
    message: 'Which package manager would you like to use?',
    options: [
      { value: 'npm', label: 'npm' },
      { value: 'yarn', label: 'Yarn' },
      { value: 'pnpm', label: 'pnpm' },
      { value: 'bun', label: 'Bun' },
    ],
    initialValue: 'npm',
  });

  if (typeof packageManager === 'symbol') {
    throw new Error('Package manager selection cancelled');
  }

  return packageManager as 'npm' | 'yarn' | 'pnpm' | 'bun';
}

/**
 * Prompts for runtime selection (node, bun, deno)
 */
export async function promptRuntime(): Promise<'node' | 'bun' | 'deno'> {
  const runtime = await select({
    message: 'Which runtime would you like to use?',
    options: [
      { value: 'node', label: 'Node.js' },
      { value: 'bun', label: 'Bun' },
      { value: 'deno', label: 'Deno' },
    ],
    initialValue: 'node',
  });

  if (typeof runtime === 'symbol') {
    throw new Error('Runtime selection cancelled');
  }

  return runtime as 'node' | 'bun' | 'deno';
}

/**
 * Prompts for TypeScript usage
 */
export async function promptTypeScript(): Promise<boolean> {
  const useTypeScript = await confirm({
    message: 'Would you like to use TypeScript?',
    initialValue: true,
  });

  if (typeof useTypeScript === 'symbol') {
    throw new Error('TypeScript selection cancelled');
  }

  return useTypeScript;
}

/**
 * Main prompt flow for collecting project options
 * @param args - The arguments for the project
 * @returns The collected project options
 */
export async function collectProjectOptions(args: { projectName?: string; yes?: boolean }): Promise<ProjectOptions> {
  // Get and validate project information
  const projectInfo = getProjectInfo(args.projectName);
  let { projectName, projectPath, isCurrentDirectory } = projectInfo;

  // Show project summary
  if (!args.yes) {
    showProjectSummary(projectName, projectPath, isCurrentDirectory);
  }

  // Check directory status
  const dirStatus = await checkDirectory(projectPath);

  let finalProjectPath = projectPath;
  let finalProjectName = projectName;

  // Handle directory conflicts
  let directoryAction: DirectoryConflictAction | undefined;
  if (dirStatus.exists && !dirStatus.isEmpty) {
    const conflict = await handleDirectoryConflict(projectPath, finalProjectName);

    if (conflict.action === 'cancel') {
      throw new Error('Project creation cancelled');
    }

    directoryAction = conflict.action;
    if (conflict.action === 'rename' && conflict.newPath) {
      finalProjectPath = conflict.newPath;
      finalProjectName = path.basename(finalProjectPath);
    }
  } else {
    // Prompt for project name if not using defaults and creating in current directory
    if (!args.yes && args.projectName === '.') {
      finalProjectName = await promptProjectName(finalProjectName);
      if (finalProjectName !== projectName) {
        finalProjectPath = path.join(path.dirname(projectPath), finalProjectName);
      }
    }
  }

  // Use defaults if --yes flag is provided
  if (args.yes) {
    return {
      projectName: finalProjectName,
      projectPath: finalProjectPath,
      features: [],
      featureOptions: {},
      packageManager: 'npm',
      runtime: 'node',
      typescript: true,
      git: true,
      installDependencies: true,
      directoryAction,
    };
  }

  // Interactive prompts
  const { features, featureOptions } = await promptFeatures();
  const typescript = await promptTypeScript();
  const packageManager = await promptPackageManager();
  const runtime = await promptRuntime();

  const git = await confirm({
    message: 'Initialize a Git repository?',
    initialValue: true,
  });

  const installDependencies = await confirm({
    message: 'Install dependencies?',
    initialValue: true,
  });

  return {
    projectName: finalProjectName,
    projectPath: finalProjectPath,
    features,
    featureOptions,
    packageManager,
    runtime,
    typescript,
    git: typeof git === 'symbol' ? true : git,
    installDependencies: typeof installDependencies === 'symbol' ? true : installDependencies,
    directoryAction,
  };
}
