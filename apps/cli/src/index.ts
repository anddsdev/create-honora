import { intro, outro, spinner } from '@clack/prompts';

import consola from 'consola';

import { hideBin } from 'yargs/helpers';

import pc from 'picocolors';

import yargs from 'yargs';

import { collectProjectOptions } from './prompts.js';
import { scaffoldProject } from './scaffold.js';
import type { YargsArgs } from './types.js';

async function main() {
  const startTime = Date.now();

  const args = (await yargs(hideBin(process.argv))
    .scriptName('create-honora')
    .usage('$0 [project-name]', 'Create a Hono API project with best practices')
    .command('$0 [project-name]', 'Create a new Hono project', (yargs) => {
      return yargs.positional('project-name', {
        type: 'string',
        describe: 'Name of the project directory to create',
        default: '.',
      });
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

  try {
    // Collect project options through prompts
    const options = await collectProjectOptions({
      projectName: args.projectName,
      yes: args.yes,
    });

    // Override git option if provided via CLI
    if (args.git === false) {
      options.git = false;
    }

    // Start scaffolding process
    const s = spinner();
    s.start('Creating project structure...');

    await scaffoldProject(options);

    s.stop('Project structure created');

    // Install dependencies if not skipped
    if (!args.skipInstall) {
      s.start('Installing dependencies...');
      // TODO: Implement dependency installation
      s.stop('Dependencies installed');
    }

    const elapsedTime = ((Date.now() - startTime) / 1000).toFixed(2);

    outro(pc.green(`✨ Project created successfully in ${elapsedTime}s!`));

    console.log('\n' + pc.bold('Next steps:'));
    console.log(pc.gray('  cd ') + pc.cyan(options.projectName));
    if (args.skipInstall) {
      console.log(pc.gray('  npm install'));
    }
    console.log(pc.gray('  npm run dev'));
    console.log('\n' + pc.dim('Happy coding! 🚀'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('cancelled')) {
      outro(pc.yellow('Project creation cancelled'));
      process.exit(0);
    }
    throw error;
  }
}

main().catch((err) => {
  consola.error('Aborting installation due to unexpected error...');
  if (err instanceof Error) {
    consola.error(err.stack);
  }

  process.exit(1);
});
