import fs from 'fs-extra';

import path from 'path';

import { fileURLToPath } from 'url';

import { execSync } from 'child_process';

import consola from 'consola';

import type { ProjectOptions } from './prompts.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Scaffolds a new Hono project based on the provided options
 */
export async function scaffoldProject(options: ProjectOptions) {
  const { projectPath, projectName, features, typescript, git, directoryAction } = options;

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
  const templateDir = path.join(__dirname, '..', 'templates', 'base');
  await copyTemplate(templateDir, projectPath, { projectName }, directoryAction === 'merge');

  // Apply feature-specific modifications
  await applyFeatures(projectPath, features, typescript);

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
        if (envLine.includes('DATABASE_URL=')) {
          const dbName = projectName ? `${projectName.replace(/[^a-zA-Z0-9]/g, '_')}_db` : 'honora_db';
          return `DATABASE_URL=postgresql://user:password@localhost:5432/${dbName}`;
        }
        if (envLine.includes('JWT_SECRET=')) {
          // Generate a more secure default JWT secret
          const jwtSecret = generateRandomSecret(64);
          return `JWT_SECRET=${jwtSecret}`;
        }
        if (envLine.includes('API_KEY=')) {
          const apiKey = generateRandomSecret(32);
          return `API_KEY=${apiKey}`;
        }
        if (envLine.includes('REDIS_URL=')) {
          return 'REDIS_URL=redis://localhost:6379';
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
 * Copies template files and replaces template variables
 */
async function copyTemplate(
  templatePath: string,
  targetPath: string,
  variables: Record<string, string>,
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
      // Handle env.example -> .env conversion
      if (file === 'env.example') {
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
      }

      // Replace template variables
      for (const [key, value] of Object.entries(variables)) {
        content = content.replace(new RegExp(`{{${key}}}`, 'g'), value);
      }

      await fs.writeFile(targetFile, content);
    }
  }
}

/**
 * Applies selected features to the project
 */
async function applyFeatures(projectPath: string, features: string[], typescript: boolean) {
  const packageJsonPath = path.join(projectPath, 'package.json');
  const packageJson = await fs.readJson(packageJsonPath);

  // Add dependencies based on features
  if (features.includes('compression')) {
    packageJson.dependencies['@hono/compress'] = '^1.0.0';
  }

  if (features.includes('helmet')) {
    packageJson.dependencies['@hono/secure-headers'] = '^1.0.0';
  }

  if (features.includes('validator')) {
    packageJson.dependencies['@hono/zod-validator'] = '^0.2.2';
    packageJson.dependencies['zod'] = '^3.22.4';
  }

  if (features.includes('swagger')) {
    packageJson.dependencies['@hono/swagger-ui'] = '^0.2.2';
    packageJson.dependencies['@hono/zod-openapi'] = '^0.9.8';
  }

  if (features.includes('database')) {
    packageJson.dependencies['@prisma/client'] = '^5.15.0';
    packageJson.devDependencies['prisma'] = '^5.15.0';
    packageJson.scripts['db:generate'] = 'prisma generate';
    packageJson.scripts['db:migrate'] = 'prisma migrate dev';
    packageJson.scripts['db:studio'] = 'prisma studio';
  }

  if (features.includes('auth')) {
    packageJson.dependencies['@hono/jwt'] = '^2.0.0';
    packageJson.dependencies['bcryptjs'] = '^2.4.3';
    if (typescript) {
      packageJson.devDependencies['@types/bcryptjs'] = '^2.4.6';
    }
  }

  if (features.includes('testing')) {
    packageJson.devDependencies['vitest'] = '^1.6.0';
    packageJson.devDependencies['@vitest/ui'] = '^1.6.0';
    packageJson.scripts['test'] = 'vitest';
    packageJson.scripts['test:ui'] = 'vitest --ui';
    packageJson.scripts['test:coverage'] = 'vitest --coverage';
  }

  await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });

  // Create feature-specific files
  await createFeatureFiles(projectPath, features, typescript);
}

/**
 * Creates additional files for selected features
 */
async function createFeatureFiles(projectPath: string, features: string[], typescript: boolean) {
  const srcPath = path.join(projectPath, 'src');

  // Create middleware directory
  if (features.some((f) => ['compression', 'helmet', 'auth'].includes(f))) {
    const middlewarePath = path.join(srcPath, 'middleware');
    await fs.ensureDir(middlewarePath);

    // Create middleware index file
    const middlewareIndexPath = path.join(middlewarePath, typescript ? 'index.ts' : 'index.js');
    const middlewareExports: string[] = [];

    if (features.includes('compression')) {
      middlewareExports.push(`export { compress } from '@hono/compress';`);
    }

    if (features.includes('helmet')) {
      middlewareExports.push(`export { secureHeaders } from '@hono/secure-headers';`);
    }

    if (middlewareExports.length > 0) {
      await fs.writeFile(middlewareIndexPath, middlewareExports.join('\n'));
    }
  }

  // Create Prisma schema if database feature is selected
  if (features.includes('database')) {
    const prismaPath = path.join(projectPath, 'prisma');
    await fs.ensureDir(prismaPath);

    const schemaContent = `// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// Example model
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
`;

    await fs.writeFile(path.join(prismaPath, 'schema.prisma'), schemaContent);
  }

  // Create Dockerfile if Docker feature is selected
  if (features.includes('docker')) {
    const dockerfileContent = `FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

# Production image, copy all the files and run
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 hono

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

USER hono

EXPOSE 3000

ENV PORT 3000

CMD ["node", "dist/index.js"]
`;

    await fs.writeFile(path.join(projectPath, 'Dockerfile'), dockerfileContent);

    const dockerComposeContent = `version: '3.8'

services:
  api:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
    restart: unless-stopped
`;

    await fs.writeFile(path.join(projectPath, 'docker-compose.yml'), dockerComposeContent);
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
