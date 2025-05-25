export type Runtime = 'node' | 'bun';
export type PackageManager = 'npm' | 'yarn' | 'pnpm' | 'bun';
export type AuthChoice = 'better-auth' | 'jwt';
export type LoggerChoice = 'pino' | 'hono-logger';

export type DirectoryConflictAction = 'overwrite' | 'merge' | 'rename' | 'cancel';

export type DatabaseChoice = 'sqlite' | 'postgresql' | 'mysql' | 'mariadb' | 'mongodb' | 'none';
export type ORMChoice = 'prisma' | 'typeorm' | 'drizzle' | 'mongoose' | 'none';

export type FeatureOptions = {
  logger?: LoggerChoice;
  auth?: AuthChoice;
  cors?: boolean;
  database?: DatabaseChoice;
  orm?: ORMChoice;
};

export type TemplateData = {
  projectName: string;
  runtime: Runtime;
  typescript: boolean;
  packageManager: PackageManager;
  featureOptions: FeatureOptions;
};

export type YargsArgs = {
  projectName: string;

  yes: boolean;
  git: boolean;
  skipInstall: boolean;
  runtime: Runtime;
  packageManager: PackageManager;
  $0: string;
  _: (string | number)[];
  $: (string | number)[];
};

export type ProjectOptions = {
  projectName: string;
  projectPath: string;
  features: string[];
  featureOptions: FeatureOptions;
  packageManager: PackageManager;
  runtime: Runtime;

  typescript: boolean;
  git: boolean;
  installDependencies: boolean;
  directoryAction?: DirectoryConflictAction;
};
