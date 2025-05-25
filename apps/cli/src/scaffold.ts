import fs from 'fs-extra';

import path from 'path';

import { fileURLToPath } from 'url';


import Handlebars from 'handlebars';

import type { ProjectOptions } from './types.js';
import { processEnvContent } from './utils/parse-env-content.js';
import { convertToJavaScript, renameTypeScriptFiles } from './utils/parse-type-files.js';
import { installDependencies } from './utils/install-dependencies.js';
import { initializeGit } from './utils/initialize-git.js';

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
 * @param options - The options for the project
 * @returns A promise that resolves when the project is scaffolded
 */
export async function scaffoldProject(options: ProjectOptions): Promise<void> {
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
    installDependencies: installDependenciesFlag,
    database,
    orm,
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
  // TODO: Add support for different templates
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

  // Install dependencies if requested
  if (installDependenciesFlag) {
    await installDependencies(projectPath, packageManager);
  }
}



/**
 * Copies template files and replaces template variables using Handlebars
 * @param templatePath - The path to the template
 * @param targetPath - The path to the target
 * @param variables - The variables to replace in the template
 * @param mergeMode - Whether to merge the template with the target
 */
async function copyTemplate(
  templatePath: string,
  targetPath: string,
  variables: Record<string, any>,
  mergeMode = false,
): Promise<void> {
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
 * Creates additional files for selected features
 * @param projectPath - The path to the project
 * @param featureOptions - The options for the features
 * @param typescript - Whether the project is using TypeScript
 */
async function createFeatureFiles(projectPath: string, featureOptions: any, typescript: boolean): Promise<void> {
  const srcPath = path.join(projectPath, 'src');

  // Create auth route if auth feature is selected
  if (featureOptions.auth) {
    await fs.ensureDir(path.join(srcPath, 'routes'));
    const authRouteFile = path.join(srcPath, 'routes', `auth.${typescript ? 'ts' : 'js'}`);
    // TODO: Implement auth feature using better-auth and fix this example usage JWT
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



