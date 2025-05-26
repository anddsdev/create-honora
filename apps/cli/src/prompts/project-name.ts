import { text } from '@clack/prompts';

import { validateProjectName } from '../utils/validation.js';

/**
 * Prompts for the project name with validation
 * @param defaultName - The default name for the project
 * @returns The project name
 */
export async function promptProjectName(defaultName?: string): Promise<string> {
  let isValid = false;
  let projectName = '';

  while (!isValid) {
    const result = await text({
      message: 'What is your project name?',
      placeholder: defaultName || 'my-hono-api',
      defaultValue: defaultName,
      validate: (value) => {
        const validation = validateProjectName(value);
        if (!validation.isValid) {
          return validation.error!;
        }
      },
    });

    if (typeof result === 'symbol') {
      throw new Error('Project creation cancelled');
    }

    projectName = result;
    isValid = true;
  }

  return projectName;
}
