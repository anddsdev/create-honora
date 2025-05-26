import fs from 'fs-extra';

import path from 'node:path';

import Handlebars from 'handlebars';

import { processEnvContent } from '../utils/parse-env-content';

// Register Handlebars helpers
Handlebars.registerHelper('eq', function (a, b) {
  return a === b;
});

Handlebars.registerHelper('ifCond', function (this: any, v1: any, operator: string, v2: any, options: any) {
  let result = false;

  switch (operator) {
    case '==':
      result = v1 == v2;
      break;
    case '===':
      result = v1 === v2;
      break;
    case '!=':
      result = v1 != v2;
      break;
    case '!==':
      result = v1 !== v2;
      break;
    case '<':
      result = v1 < v2;
      break;
    case '<=':
      result = v1 <= v2;
      break;
    case '>':
      result = v1 > v2;
      break;
    case '>=':
      result = v1 >= v2;
      break;
    case '&&':
      result = v1 && v2;
      break;
    case '||':
      result = v1 || v2;
      break;
    default:
      result = false;
  }

  // If used as block helper, return rendered content
  if (options.fn) {
    return result ? options.fn(this) : options.inverse(this);
  }

  // If used as subexpression, return boolean result
  return result;
});

/**
 * Copies template files and replaces template variables using Handlebars
 * @param templatePath - The path to the template
 * @param targetPath - The path to the target
 * @param variables - The variables to replace in the template
 * @param mergeMode - Whether to merge the template with the target
 */
export async function copyTemplate(
  templatePath: string,
  targetPath: string,
  variables: Record<string, any>,
  mergeMode = false,
): Promise<void> {
  console.log(`Copying from ${templatePath} to ${targetPath}`);
  const files = await fs.readdir(templatePath);
  console.log(`Files found: ${files.join(', ')}`);

  for (const file of files) {
    const sourcePath = path.join(templatePath, file);
    let targetFile = path.join(targetPath, file);
    const stat = await fs.stat(sourcePath);

    if (stat.isDirectory()) {
      console.log(`Creating directory: ${targetFile}`);
      await fs.ensureDir(targetFile);
      await copyTemplate(sourcePath, targetFile, variables, mergeMode);
    } else {
      // Handle template file extensions and renaming
      if (file.endsWith('.hbs')) {
        const baseName = file.replace('.hbs', '');
        targetFile = path.join(targetPath, baseName);
      } else if (file === 'env.example') {
        targetFile = path.join(targetPath, '.env');
      }

      // In merge mode, skip files that already exist to avoid overwriting
      if (mergeMode && (await fs.pathExists(targetFile))) {
        console.log(`Skipping existing file: ${path.basename(targetFile)}`);
        continue;
      }

      let content = await fs.readFile(sourcePath, 'utf-8');

      // Process .env file content
      if (file === 'env.example') {
        content = processEnvContent(content);
      } else if (file.endsWith('.hbs')) {
        // Use Handlebars to process template
        const template = Handlebars.compile(content);
        content = template(variables);
      } else {
        // Replace template variables for non-Handlebars files
        for (const [key, value] of Object.entries(variables)) {
          if (typeof value === 'string') {
            content = content.replace(new RegExp(`{{${key}}}`, 'g'), value);
          }
        }
      }

      await fs.writeFile(targetFile, content);
    }
  }
}

/**
 * Processes environment variables and creates .env file
 * @param targetPath - The target directory path
 * @param envVariables - The environment variables to write
 */
export async function createEnvFile(targetPath: string, envVariables: Record<string, string>): Promise<void> {
  const envPath = path.join(targetPath, '.env');

  // Check if .env already exists
  if (await fs.pathExists(envPath)) {
    // Read existing content
    const existingContent = await fs.readFile(envPath, 'utf-8');
    const existingLines = existingContent.split('\n');
    const existingVars = new Set();

    // Parse existing variables
    for (const line of existingLines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key] = trimmed.split('=');
        if (key) {
          existingVars.add(key.trim());
        }
      }
    }

    // Add new variables that don't exist
    const newLines: string[] = [];
    for (const [key, value] of Object.entries(envVariables)) {
      if (!existingVars.has(key)) {
        newLines.push(`${key}=${value}`);
      }
    }

    if (newLines.length > 0) {
      const updatedContent = existingContent + '\n\n# Additional variables\n' + newLines.join('\n');
      await fs.writeFile(envPath, updatedContent);
    }
  } else {
    // Create new .env file
    const envContent = Object.entries(envVariables)
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');

    await fs.writeFile(envPath, envContent);
  }
}
