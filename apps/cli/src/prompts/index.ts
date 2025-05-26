export { promptProjectName } from './project-name';
export { handleDirectoryConflict } from './directory-conflict';
export { promptFeatures } from './features';
export { promptPackageManager } from './package-manager';
export { promptRuntime } from './runtime';
export { promptLanguage } from './language';
export { promptDatabase } from './database';
export { promptORM } from './orm';

import { confirm } from '@clack/prompts';

import path from 'node:path';

import { defaultConfig } from '../constants';
import type { DirectoryConflictAction, ProjectOptions } from '../types';
import { getProjectInfo, showProjectSummary } from '../utils/project-name';
import { checkDirectory } from '../utils/validation';

import { handleDirectoryConflict } from './directory-conflict';
import { promptFeatures } from './features';
import { promptLanguage } from './language';
import { promptPackageManager } from './package-manager';
import { promptProjectName } from './project-name';
import { promptRuntime } from './runtime';

/**
 * Main prompt flow for collecting project options
 * @param args - The arguments for the project
 * @returns The collected project options
 */
export async function collectProjectOptions(args: {
  template: string;
  projectName?: string;
  yes?: boolean;
}): Promise<ProjectOptions> {
  const projectInfo = getProjectInfo(args.projectName);
  let { projectName, projectPath, isCurrentDirectory } = projectInfo;

  if (!args.yes) {
    showProjectSummary(projectName, projectPath, isCurrentDirectory);
  }

  const dirStatus = await checkDirectory(projectPath);

  let finalProjectPath = projectPath;
  let finalProjectName = projectName;

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
      ...defaultConfig,
      directoryAction,
      projectName: finalProjectName,
      projectPath: finalProjectPath,
      template: args.template,
    };
  }

  // Interactive prompts
  const featureOptions = await promptFeatures();
  const typescript = await promptLanguage();
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
    runtime,
    typescript,
    featureOptions,
    packageManager,
    directoryAction,
    template: args.template,
    projectName: finalProjectName,
    projectPath: finalProjectPath,
    git: typeof git === 'symbol' ? true : git,
    installDependencies: typeof installDependencies === 'symbol' ? true : installDependencies,
  };
}
