import path from 'path';
import { validateProjectName } from './validation.js';

/**
 * Extracts and validates project name from command arguments
 * @param projectName - The project name from CLI arguments
 * @returns Object with the validated project name and project path
 */
export function getProjectInfo(projectName?: string) {
  // If no project name provided or it's ".", use current directory
  if (!projectName || projectName === '.') {
    const currentDir = process.cwd();
    const currentDirName = path.basename(currentDir);

    // Validate current directory name
    const validation = validateProjectName(currentDirName);
    if (!validation.isValid) {
      throw new Error(`Current directory name "${currentDirName}" is not valid: ${validation.error}`);
    }

    return {
      projectName: currentDirName,
      projectPath: currentDir,
      isCurrentDirectory: true,
    };
  }

  // Validate provided project name
  const validation = validateProjectName(projectName);
  if (!validation.isValid) {
    throw new Error(`Project name "${projectName}" is not valid: ${validation.error}`);
  }

  return {
    projectName,
    projectPath: path.resolve(process.cwd(), projectName),
    isCurrentDirectory: false,
  };
}

/**
 * Shows project creation summary
 */
export function showProjectSummary(projectName: string, projectPath: string, isCurrentDirectory: boolean) {
  console.log('\n📋 Project Summary:');
  console.log(`   Name: ${projectName}`);
  console.log(`   Path: ${projectPath}`);
  console.log(`   Location: ${isCurrentDirectory ? 'Current directory' : 'New directory'}`);
}
