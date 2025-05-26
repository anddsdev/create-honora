import { confirm } from '@clack/prompts';

export async function promptGit() {
  const git = await confirm({
    message: 'Would you like to initialize a git repository?',
    initialValue: true,
  });

  if (typeof git === 'symbol') {
    throw new Error('Git initialization cancelled');
  }

  return git;
}
