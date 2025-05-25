import fs from 'fs';

import path from 'path';

import { promisify } from 'util';

const readdir = promisify(fs.readdir);

/**
 * Validates if a project name is valid for the operating system
 * @param name - The project name to validate
 * @returns An object with isValid boolean and optional error message
 */
export function validateProjectName(name: string): { isValid: boolean; error?: string } {
  // Check if name is empty
  if (!name || name.trim().length === 0) {
    return { isValid: false, error: 'Project name cannot be empty' };
  }

  // Check length (npm package name limit)
  if (name.length > 214) {
    return { isValid: false, error: 'Project name must be less than 214 characters' };
  }

  // Check for invalid characters based on OS
  const invalidChars = getInvalidCharsForOS();
  const invalidCharPattern = new RegExp(`[${invalidChars.map((c) => `\\${c}`).join('')}]`);

  if (invalidCharPattern.test(name)) {
    return {
      isValid: false,
      error: `Project name contains invalid characters: ${invalidChars.join(', ')}`,
    };
  }

  // Check for reserved names on Windows
  if (process.platform === 'win32') {
    const reservedNames = [
      'CON',
      'PRN',
      'AUX',
      'NUL',
      'COM1',
      'COM2',
      'COM3',
      'COM4',
      'COM5',
      'COM6',
      'COM7',
      'COM8',
      'COM9',
      'LPT1',
      'LPT2',
      'LPT3',
      'LPT4',
      'LPT5',
      'LPT6',
      'LPT7',
      'LPT8',
      'LPT9',
    ];

    const upperName = name.toUpperCase();
    if (reservedNames.includes(upperName) || reservedNames.some((reserved) => upperName.startsWith(reserved + '.'))) {
      return { isValid: false, error: 'Project name is a reserved Windows filename' };
    }
  }

  // Check npm naming conventions
  if (!/^[a-z0-9]/.test(name)) {
    return { isValid: false, error: 'Project name must start with a lowercase letter or digit' };
  }

  if (!/^[a-z0-9._-]+$/.test(name)) {
    return {
      isValid: false,
      error: 'Project name can only contain lowercase letters, digits, dots, hyphens, and underscores',
    };
  }

  return { isValid: true };
}

/**
 * Gets invalid characters based on the operating system
 * @returns An array of invalid characters
 */
function getInvalidCharsForOS(): string[] {
  const common = ['/', '\0'];

  if (process.platform === 'win32') {
    return [...common, '\\', ':', '*', '?', '"', '<', '>', '|'];
  }

  return common;
}

/**
 * Checks if a directory exists and if it's empty
 * @param dirPath - The directory path to check
 * @returns Object with exists and isEmpty properties
 */
export async function checkDirectory(dirPath: string): Promise<{ exists: boolean; isEmpty: boolean }> {
  try {
    const stats = await fs.promises.stat(dirPath);

    if (!stats.isDirectory()) {
      throw new Error(`${dirPath} exists but is not a directory`);
    }

    const files = await readdir(dirPath);
    // Ignore common hidden files that don't indicate a project
    const significantFiles = files.filter((file) => !isIgnorableFile(file));

    return {
      exists: true,
      isEmpty: significantFiles.length === 0,
    };
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      return { exists: false, isEmpty: true };
    }
    throw error;
  }
}

/**
 * Determines if a file should be ignored when checking if directory is empty
 * @param filename - The filename to check
 * @returns Whether the file should be ignored
 */
function isIgnorableFile(filename: string): boolean {
  const ignorableFiles = ['.DS_Store', 'Thumbs.db', '.git', '.gitkeep', '.gitignore', 'desktop.ini'];

  return ignorableFiles.includes(filename);
}

/**
 * Suggests a new project name if the current one exists
 * @param baseName - The original project name
 * @param parentDir - The parent directory
 * @returns A suggested alternative name
 */
export async function suggestAlternativeName(baseName: string, parentDir: string): Promise<string> {
  let counter = 1;
  let newName = baseName;

  while (await directoryExists(path.join(parentDir, newName))) {
    newName = `${baseName}-${counter}`;
    counter++;
  }

  return newName;
}

/**
 * Checks if a directory exists
 */
async function directoryExists(dirPath: string): Promise<boolean> {
  try {
    const stats = await fs.promises.stat(dirPath);
    return stats.isDirectory();
  } catch {
    return false;
  }
}
