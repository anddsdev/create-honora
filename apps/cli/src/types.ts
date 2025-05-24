export type YargsArgs = {
  projectName: string;

  yes: boolean;
  git: boolean;
  skipInstall: boolean;
  runtime: 'node' | 'bun' | 'deno';
  packageManager: 'npm' | 'yarn' | 'pnpm' | 'bun';
  $0: string;
  _: (string | number)[];
  $: (string | number)[];
};
