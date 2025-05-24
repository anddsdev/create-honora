import { text, select, multiselect, confirm } from '@clack/prompts';

import path from 'node:path';

import pc from 'picocolors';

import { validateProjectName, checkDirectory, suggestAlternativeName } from './utils/validation.js';
import type { DirectoryConflictAction } from './utils/validation.js';

export interface ProjectOptions {
  projectName: string;
  projectPath: string;
  features: string[];
  packageManager: 'npm' | 'yarn' | 'pnpm' | 'bun';
  typescript: boolean;
  git: boolean;
}

/**
 * Prompts for the project name with validation
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
 * Prompts for feature selection
 */
export async function promptFeatures(): Promise<string[]> {
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
        value: 'compression',
        label: 'Compression',
        hint: 'Response compression (gzip/brotli)',
      },
      {
        value: 'helmet',
        label: 'Security Headers',
        hint: 'Helmet-like security headers',
      },
      {
        value: 'validator',
        label: 'Validation',
        hint: 'Request validation with Zod',
      },
      {
        value: 'swagger',
        label: 'Swagger/OpenAPI',
        hint: 'API documentation with Swagger UI',
      },
      {
        value: 'database',
        label: 'Database',
        hint: 'Database setup with Prisma ORM',
      },
      {
        value: 'auth',
        label: 'Authentication',
        hint: 'JWT authentication setup',
      },
      {
        value: 'testing',
        label: 'Testing',
        hint: 'Jest/Vitest testing setup',
      },
      {
        value: 'docker',
        label: 'Docker',
        hint: 'Dockerfile and docker-compose.yml',
      },
    ],
    initialValues: ['cors', 'logger'],
    required: false,
  });

  if (typeof features === 'symbol') {
    throw new Error('Feature selection cancelled');
  }

  return features;
}

/**
 * Prompts for package manager selection
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
 * Main prompt flow
 */
export async function collectProjectOptions(args: {
  projectDirectory?: string;
  yes?: boolean;
}): Promise<ProjectOptions> {
  // Determine project path and name
  const projectPath = path.resolve(args.projectDirectory || process.cwd());
  const defaultProjectName = path.basename(projectPath);

  // Check directory status
  const dirStatus = await checkDirectory(projectPath);

  let finalProjectPath = projectPath;
  let projectName = defaultProjectName;

  // Handle directory conflicts
  if (dirStatus.exists && !dirStatus.isEmpty) {
    const conflict = await handleDirectoryConflict(projectPath, defaultProjectName);

    if (conflict.action === 'cancel') {
      throw new Error('Project creation cancelled');
    }

    if (conflict.action === 'rename' && conflict.newPath) {
      finalProjectPath = conflict.newPath;
      projectName = path.basename(finalProjectPath);
    }
  } else {
    // Prompt for project name if not using defaults
    if (!args.yes) {
      projectName = await promptProjectName(defaultProjectName);
      if (projectName !== defaultProjectName) {
        finalProjectPath = path.join(path.dirname(projectPath), projectName);
      }
    }
  }

  // Use defaults if --yes flag is provided
  if (args.yes) {
    return {
      projectName,
      projectPath: finalProjectPath,
      features: ['cors', 'logger'],
      packageManager: 'npm',
      typescript: true,
      git: true,
    };
  }

  // Interactive prompts
  const features = await promptFeatures();
  const typescript = await promptTypeScript();
  const packageManager = await promptPackageManager();

  const git = await confirm({
    message: 'Initialize a Git repository?',
    initialValue: true,
  });

  return {
    projectName,
    projectPath: finalProjectPath,
    features,
    packageManager,
    typescript,
    git: typeof git === 'symbol' ? true : git,
  };
}
