import { select } from '@clack/prompts';

import path from 'node:path';

import pc from 'picocolors';

import type { DirectoryConflictAction } from '../types';
import { suggestAlternativeName } from '../utils/validation';

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
