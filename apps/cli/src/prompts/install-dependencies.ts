import { confirm } from '@clack/prompts';

export async function promptInstallDependencies() {
  const installDependencies = await confirm({
    message: 'Install dependencies?',
    initialValue: true,
  });

  if (typeof installDependencies === 'symbol') {
    throw new Error('Install dependencies cancelled');
  }

  return installDependencies;
}
