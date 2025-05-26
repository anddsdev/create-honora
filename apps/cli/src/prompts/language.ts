import { confirm } from '@clack/prompts';

/**
 * Prompts for TypeScript usage
 * @returns Whether to use TypeScript
 */
export async function promptLanguage(): Promise<boolean> {
  const useTypeScript = await confirm({
    message: 'Would you like to use TypeScript?',
    initialValue: true,
  });

  if (typeof useTypeScript === 'symbol') {
    throw new Error('Language selection cancelled (TypeScript or JavaScript)');
  }

  return useTypeScript;
}
