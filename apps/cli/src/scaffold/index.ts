export { copyTemplate, createEnvFile } from './template-copier';
export { handleDirectoryAction, isSafeToOverwrite, createProjectStructure } from './directory-handler';
export { manageDependencies, runSetupSteps } from './dependency-manager';
export { convertProject, postProcessProject } from './project-converter';

import consola from 'consola';

import type { ProjectOptions, TemplateData } from '../types';
import { initializeGit } from '../utils/initialize-git';

import { manageDependencies, runSetupSteps } from './dependency-manager';
import { handleDirectoryAction } from './directory-handler';
import { postProcessProject } from './project-converter';
import { copyTemplate, createEnvFile } from './template-copier';
import { getTemplateConfig, type TemplateType } from './template-resolver';

/**
 * Scaffolds a new Hono project based on the provided options
 * @param options - The options for the project
 * @returns A promise that resolves when the project is scaffolded
 */
export async function scaffoldProject(options: ProjectOptions): Promise<void> {
  const {
    git,
    runtime,
    template,
    typescript,
    projectPath,
    projectName,
    featureOptions,
    packageManager,
    directoryAction,
    installDependencies: installDependenciesFlag,
  } = options;

  await handleDirectoryAction(projectPath, directoryAction);

  const templateConfig = getTemplateConfig(template as TemplateType, featureOptions, runtime);

  consola.info(`Using template: ${template}`);

  const templateData: TemplateData = {
    projectName,
    runtime,
    typescript,
    packageManager,
    featureOptions,
  };

  await copyTemplate(templateConfig.templatePath, projectPath, templateData, directoryAction === 'merge');

  if (Object.keys(templateConfig.envVariables).length > 0) {
    await createEnvFile(projectPath, templateConfig.envVariables);
  }

  await manageDependencies(projectPath, templateConfig, packageManager, installDependenciesFlag);

  await postProcessProject(projectPath, { typescript, runtime });

  if (templateConfig.setupSteps.length > 0) {
    await runSetupSteps(projectPath, templateConfig.setupSteps);
  }

  if (git) {
    await initializeGit(projectPath);
  }

  console.log('✨ Project scaffolded successfully!');
}
