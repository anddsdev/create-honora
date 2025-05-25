export type YargsArgs = {
  projectName: string;

  yes: boolean;
  git: boolean;
  skipInstall: boolean;
  runtime: 'node' | 'bun';
  packageManager: 'npm' | 'yarn' | 'pnpm' | 'bun';
  $0: string;
  _: (string | number)[];
  $: (string | number)[];
};

export type Runtime = 'node' | 'bun';
export type PackageManager = 'npm' | 'yarn' | 'pnpm' | 'bun';
export type AuthChoice = 'better-auth' | 'jwt';
export type LoggerChoice = 'pino' | 'hono-standard';

export type DirectoryConflictAction = 'overwrite' | 'merge' | 'rename' | 'cancel';

export type FeatureOptions = {
  logger?: LoggerChoice;
  auth?: AuthChoice;
  cors?: boolean;
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
