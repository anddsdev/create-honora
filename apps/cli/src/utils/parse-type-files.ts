import fs from 'fs-extra';

import path from 'node:path';

/**
 * Recursively renames .ts files to .js
 * @param dir - The directory to rename the files in
 * @returns A promise that resolves when the files are renamed
 */
export async function renameTypeScriptFiles(dir: string): Promise<void> {
  const files = await fs.readdir(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = await fs.stat(filePath);

    if (stat.isDirectory()) {
      await renameTypeScriptFiles(filePath);
    } else if (file.endsWith('.ts')) {
      const newPath = filePath.replace(/\.ts$/, '.js');

      // Read content and remove type annotations
      let content = await fs.readFile(filePath, 'utf-8');
      content = removeTypeAnnotations(content);

      await fs.writeFile(newPath, content);
      await fs.remove(filePath);
    }
  }
}

/**
 * Basic removal of TypeScript type annotations
 * @param content - The content to remove the type annotations from
 * @returns The content with the type annotations removed
 */
export function removeTypeAnnotations(content: string): string {
  // Remove import type statements
  content = content.replace(/import\s+type\s+{[^}]+}\s+from\s+['"][^'"]+['"];?\n?/g, '');

  // Remove type annotations from parameters and variables
  content = content.replace(/:\s*[A-Z]\w*(\[])?/g, '');
  content = content.replace(/:\s*string(\[])?/g, '');
  content = content.replace(/:\s*number(\[])?/g, '');
  content = content.replace(/:\s*boolean(\[])?/g, '');
  content = content.replace(/:\s*any(\[])?/g, '');
  content = content.replace(/:\s*void/g, '');

  // Remove generic type parameters
  content = content.replace(/<[A-Z]\w*>/g, '');

  // Remove interface and type declarations
  content = content.replace(/^(export\s+)?(interface|type)\s+\w+\s*{[^}]+}\n?/gm, '');

  return content;
}

/**
 * Converts TypeScript files to JavaScript
 * @param projectPath - The path to the project
 * @returns A promise that resolves when the TypeScript files are converted to JavaScript
 */
export async function convertToJavaScript(projectPath: string): Promise<void> {
  // Remove TypeScript configuration
  await fs.remove(path.join(projectPath, 'tsconfig.json'));

  // Update package.json
  const packageJsonPath = path.join(projectPath, 'package.json');
  const packageJson = await fs.readJson(packageJsonPath);

  // Remove TypeScript dependencies
  delete packageJson.devDependencies['@types/node'];
  delete packageJson.devDependencies['typescript'];

  // Update scripts to use .js extensions
  packageJson.scripts.dev = 'node --watch src/index.js';
  packageJson.scripts.build = 'echo "No build step required for JavaScript"';
  packageJson.scripts.start = 'node src/index.js';

  await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });

  // Rename .ts files to .js
  await renameTypeScriptFiles(projectPath);
}
