import { join } from 'node:path';

import fs from 'fs-extra';

import consola from 'consola';

import { dependenciesWithVersions, type AllowedDependencies } from '../constants';
import type { PackageManager } from '../types';

export type AddDepsOptions = {
  dependencies?: AllowedDependencies[];
  devDependencies?: AllowedDependencies[];
  packageManager: PackageManager;
  projectPath: string;
};

/**
 * Adds dependencies and devDependencies to the package.json file
 *
 * @param {AddDepsOptions} options - Options for adding dependencies.
 * @throws {Error} When package.json is not found in projectPath.
 */
export async function addDependencies(options: AddDepsOptions): Promise<void> {
  const { dependencies = [], devDependencies = [], projectPath } = options;

  const packageJsonPath = join(projectPath, 'package.json');

  const exists = await fs.pathExists(packageJsonPath);
  if (!exists) {
    throw new Error(`package.json not found in: ${packageJsonPath}`);
  }

  const packageJson = await fs.readJSON(packageJsonPath);

  packageJson.dependencies = packageJson.dependencies ?? {};
  packageJson.devDependencies = packageJson.devDependencies ?? {};

  const addList = (items: AllowedDependencies[], field: 'dependencies' | 'devDependencies') => {
    for (const name of items) {
      const version = dependenciesWithVersions[name];
      if (!version) {
        consola.warn(`No version found for '${name}' in dependenciesWithVersions`);
        continue;
      }
      if (packageJson[field][name] === version) {
        consola.info(`'${name}@${version}' already exists in ${field}`);
      } else {
        packageJson[field][name] = version;
        consola.success(`Adding '${name}@${version}' to ${field}`);
      }
    }
  };

  addList(dependencies, 'dependencies');
  addList(devDependencies, 'devDependencies');

  await fs.writeJSON(packageJsonPath, packageJson, { spaces: 2 });
  consola.success('package.json updated successfully');
}
