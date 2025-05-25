import fs from 'fs-extra';

import path from 'path';

import { fileURLToPath } from 'url';

import { execSync } from 'child_process';

import consola from 'consola';
import Handlebars from 'handlebars';

import type { ProjectOptions } from './prompts.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

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
 * Scaffolds a new Hono project based on the provided options
 */
export async function scaffoldProject(options: ProjectOptions) {
  const {
    projectPath,
    projectName,
    features,
    featureOptions,
    packageManager,
    runtime,
    typescript,
    git,
    directoryAction,
  } = options;

  // Handle directory action if needed
  if (directoryAction === 'overwrite') {
    // Remove all files except .git folder to preserve git history
    const files = await fs.readdir(projectPath);
    for (const file of files) {
      if (file !== '.git') {
        await fs.remove(path.join(projectPath, file));
      }
    }
  }

  // Create project directory
  await fs.ensureDir(projectPath);

  // Copy base template
  const templateDir = path.join(__dirname, '..', 'templates', 'api', 'base');
  const templateData = {
    projectName,
    runtime,
    typescript,
    packageManager,
    featureOptions,
  };
  await copyTemplate(templateDir, projectPath, templateData, directoryAction === 'merge');

  // Create additional feature-specific files
  await createFeatureFiles(projectPath, featureOptions, typescript);

  // Convert to JavaScript if needed
  if (!typescript) {
    await convertToJavaScript(projectPath);
  }

  // Initialize git repository if requested
  if (git) {
    await initializeGit(projectPath);
  }
}

/**
 * Generates a random secret for environment variables
 */
function generateRandomSecret(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Processes environment file content to provide default values
 */
function processEnvContent(content: string, projectName?: string): string {
  // Remove comments and provide default values
  return content
    .split('\n')
    .map((line) => {
      const trimmed = line.trim();

      // Keep existing key=value pairs as-is
      if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
        return line;
      }

      // Convert commented environment variables to actual values
      if (trimmed.startsWith('# ') && trimmed.includes('=')) {
        const envLine = trimmed.substring(2); // Remove '# '

        // Provide default values for common environment variables
        if (envLine.includes('JWT_SECRET=')) {
          // Generate a more secure default JWT secret
          const jwtSecret = generateRandomSecret(64);
          return `JWT_SECRET=${jwtSecret}`;
        }
        if (envLine.includes('API_KEY=')) {
          const apiKey = generateRandomSecret(32);
          return `API_KEY=${apiKey}`;
        }

        // Default: return the line uncommented
        return envLine;
      }

      // Keep comments and empty lines
      return line;
    })
    .join('\n');
}

/**
 * Copies template files and replaces template variables using Handlebars
 */
async function copyTemplate(
  templatePath: string,
  targetPath: string,
  variables: Record<string, any>,
  mergeMode = false,
) {
  const files = await fs.readdir(templatePath);

  for (const file of files) {
    const sourcePath = path.join(templatePath, file);
    let targetFile = path.join(targetPath, file);
    const stat = await fs.stat(sourcePath);

    if (stat.isDirectory()) {
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
        content = processEnvContent(content, variables.projectName);
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
 * Creates additional files for selected features
 */
async function createFeatureFiles(projectPath: string, featureOptions: any, typescript: boolean) {
  const srcPath = path.join(projectPath, 'src');

  // Create auth route if auth feature is selected
  if (featureOptions.auth) {
    await fs.ensureDir(path.join(srcPath, 'routes'));
    const authRouteFile = path.join(srcPath, 'routes', `auth.${typescript ? 'ts' : 'js'}`);

    if (featureOptions.auth === 'jwt') {
      const authContent = `
import { Hono } from 'hono';
import { jwt } from '@hono/jwt';
import bcrypt from 'bcryptjs';

export const authRouter = new Hono();

// Login endpoint
authRouter.post('/login', async (c) => {
  const { email, password } = await c.req.json();
  
  // TODO: Implement user lookup from database
  // const user = await getUserByEmail(email);
  
  // For demo purposes
  const user = { id: 1, email: 'demo@example.com', password: 'hashedpassword' };
  
  if (!user || !await bcrypt.compare(password, user.password)) {
    return c.json({ error: 'Invalid credentials' }, 401);
  }
  
  const token = await jwt.sign({ userId: user.id }, process.env.JWT_SECRET!);
  return c.json({ token });
});

// Protected route example
authRouter.get('/profile', jwt({ secret: process.env.JWT_SECRET! }), async (c) => {
  const payload = c.get('jwtPayload');
  return c.json({ userId: payload.userId });
});`;
      await fs.writeFile(authRouteFile, authContent);
    }
  }
}

/**
 * Converts TypeScript files to JavaScript
 */
async function convertToJavaScript(projectPath: string) {
  // Remove TypeScript configuration
  await fs.remove(path.join(projectPath, 'tsconfig.json'));

  // Update package.json
  const packageJsonPath = path.join(projectPath, 'package.json');
  const packageJson = await fs.readJson(packageJsonPath);

  // Remove TypeScript dependencies
  delete packageJson.devDependencies['@types/node'];
  delete packageJson.devDependencies['@typescript-eslint/eslint-plugin'];
  delete packageJson.devDependencies['@typescript-eslint/parser'];
  delete packageJson.devDependencies['typescript'];

  // Update scripts to use .js extensions
  packageJson.scripts.dev = 'node --watch src/index.js';
  packageJson.scripts.build = 'echo "No build step required for JavaScript"';
  packageJson.scripts.start = 'node src/index.js';
  packageJson.scripts.lint = 'eslint src --ext .js';

  await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });

  // Rename .ts files to .js
  await renameTypeScriptFiles(projectPath);
}

/**
 * Recursively renames .ts files to .js
 */
async function renameTypeScriptFiles(dir: string) {
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
 */
function removeTypeAnnotations(content: string): string {
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
 * Initializes a git repository
 */
async function initializeGit(projectPath: string) {
  try {
    execSync('git init', { cwd: projectPath, stdio: 'ignore' });
    execSync('git add -A', { cwd: projectPath, stdio: 'ignore' });
    execSync('git commit -m "Initial commit from create-honora"', {
      cwd: projectPath,
      stdio: 'ignore',
    });
  } catch (error) {
    consola.warn('Failed to initialize git repository');
  }
}
