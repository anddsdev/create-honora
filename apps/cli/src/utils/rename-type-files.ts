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
