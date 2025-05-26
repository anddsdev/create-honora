import fs from 'fs-extra';

import path from 'node:path';

import type { DirectoryConflictAction } from '../types';

/**
 * Handles directory actions based on the conflict resolution
 * @param projectPath - The path to the project directory
 * @param action - The action to take (overwrite, merge, etc.)
 */
export async function handleDirectoryAction(projectPath: string, action?: DirectoryConflictAction): Promise<void> {
  if (!action) {
    // Ensure directory exists
    await fs.ensureDir(projectPath);
    return;
  }

  switch (action) {
    case 'overwrite':
      await overwriteDirectory(projectPath);
      break;
    case 'merge':
      // Just ensure the directory exists, files will be handled during copy
      await fs.ensureDir(projectPath);
      break;
    case 'rename':
      // This should have been handled at the prompt level
      await fs.ensureDir(projectPath);
      break;
    case 'cancel':
      throw new Error('Directory action cancelled');
    default:
      await fs.ensureDir(projectPath);
      break;
  }
}

/**
 * Removes all files except .git folder to preserve git history
 * @param projectPath - The path to the project directory
 */
async function overwriteDirectory(projectPath: string): Promise<void> {
  // Ensure the directory exists first
  await fs.ensureDir(projectPath);

  // Get all files and folders in the directory
  const files = await fs.readdir(projectPath);

  for (const file of files) {
    // Preserve .git folder to maintain git history
    if (file !== '.git') {
      const filePath = path.join(projectPath, file);
      await fs.remove(filePath);
    }
  }
}

/**
 * Checks if a directory is safe to overwrite
 * @param projectPath - The path to check
 * @returns Whether the directory is safe to overwrite
 */
export async function isSafeToOverwrite(projectPath: string): Promise<boolean> {
  try {
    const stats = await fs.stat(projectPath);
    if (!stats.isDirectory()) {
      return false;
    }

    const files = await fs.readdir(projectPath);

    // Consider it safe if it's empty or only contains .git
    return files.length === 0 || (files.length === 1 && files[0] === '.git');
  } catch {
    // Directory doesn't exist, safe to create
    return true;
  }
}

/**
 * Creates necessary subdirectories for a project structure
 * @param projectPath - The base project path
 * @param subdirectories - Array of subdirectory paths to create
 */
export async function createProjectStructure(projectPath: string, subdirectories: string[] = []): Promise<void> {
  // Ensure base directory exists
  await fs.ensureDir(projectPath);

  // Create subdirectories
  for (const subdir of subdirectories) {
    const subdirPath = path.join(projectPath, subdir);
    await fs.ensureDir(subdirPath);
  }
}
