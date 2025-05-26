import { select } from '@clack/prompts';

/**
 * Prompts the user to select a template
 * @returns The selected template
 */
export async function promptTemplate() {
  const template = await select({
    message: 'Select a template',
    options: [
      { value: 'base', label: 'Base', hint: 'A basic Hono API' },
      { value: 'openapi', label: 'OpenAPI', hint: 'An OpenAPI-compliant API' },
    ],
    initialValue: 'base',
  });

  if (typeof template === 'symbol') {
    throw new Error('Template selection cancelled');
  }

  return template;
}
