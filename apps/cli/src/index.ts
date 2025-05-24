import { intro } from '@clack/prompts';

import consola from 'consola';

import { hideBin } from 'yargs/helpers';

import pc from 'picocolors';

import yargs from 'yargs';

import type { YargsArgs } from './types';

async function main() {
  const startTime = Date.now();

  const args = (await yargs(hideBin(process.argv))
    .scriptName('create-honora')
    .usage('$0 <command> [args]', 'Create a Hono API project with best practices')
    .positional('project-directory', {
      type: 'string',
      describe: 'The directory to create the project in',
      default: process.cwd(),
    })
    .options('yes', {
      type: 'boolean',
      describe: 'Skip all the prompts and use default values',
      default: false,
    })
    .options('git', {
      type: 'boolean',
      describe: 'Initialize a git repository',
      default: true,
    })
    .options('skip-install', {
      type: 'boolean',
      describe: 'Skip the installation of dependencies',
      default: false,
    })
    .completion()
    .recommendCommands()
    .version('0.0.1')
    .alias('v', 'version')
    .help()
    .alias('h', 'help')
    .strict()
    .wrap(null)
    .parse()) as unknown as YargsArgs;

  intro(pc.yellow('Creating a new Honora API project'));

  const elapsedTime = ((Date.now() - startTime) / 1000).toFixed(2);
  consola.success(`Project created in ${elapsedTime}s`);
}

main().catch((err) => {
  consola.error('Aborting installation due to unexpected error...');
  if (err instanceof Error) {
    consola.error(err.stack);
  }

  process.exit(1);
});
