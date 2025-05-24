export type YargsArgs = {
  projectName: string;

  yes: boolean;
  git: boolean;
  skipInstall: boolean;

  $0: string;
  _: (string | number)[];
  $: (string | number)[];
};
