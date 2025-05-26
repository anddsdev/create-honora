export { promptProjectName } from './project-name.js';
export { handleDirectoryConflict } from './directory-conflict.js';
export { promptFeatures } from './features.js';
export { promptPackageManager } from './package-manager.js';
export { promptRuntime } from './runtime.js';
export { promptLanguage } from './language.js';
export { promptDatabase } from './database.js';
export { promptORM } from './orm.js';

import { confirm } from '@clack/prompts';

import path from 'node:path';

import { defaultConfig } from '../constants.js';
import type { DirectoryConflictAction, ProjectOptions } from '../types.js';
import { getProjectInfo, showProjectSummary } from '../utils/project-name.js';
import { checkDirectory } from '../utils/validation.js';

import { handleDirectoryConflict } from './directory-conflict.js';
import { promptFeatures } from './features.js';
import { promptGit } from './git.js';
import { promptInstallDependencies } from './install-dependencies.js';
import { promptLanguage } from './language.js';
import { promptPackageManager } from './package-manager.js';
import { promptProjectName } from './project-name.js';
import { promptRuntime } from './runtime.js';

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
  if (args.yes) return defaultConfig;

  // Interactive prompts
  const featureOptions = await promptFeatures();
  const typescript = await promptLanguage();
  const packageManager = await promptPackageManager();
  const runtime = await promptRuntime();

  const git = await promptGit();

  const installDependencies = await promptInstallDependencies();

  return {
    projectName: finalProjectName,
    projectPath: finalProjectPath,
    featureOptions,
    packageManager,
    runtime,
    typescript,
    git: typeof git === 'symbol' ? true : git,
    installDependencies: typeof installDependencies === 'symbol' ? true : installDependencies,
    directoryAction,
  };
}
