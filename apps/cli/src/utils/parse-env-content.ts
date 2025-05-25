import { generateRandomSecret } from './generate-random-secret';

/**
 * Processes environment file content to provide default values
 * @param content - The content of the environment file
 * @returns The processed environment file content
 */
export function processEnvContent(content: string): string {
  // Remove comments and provide default values
  return content
    .split('\n')
    .map((line) => {
      const trimmed = line.trim();

      // Keep existing key=value pairs as-is
      if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
        return line;
      }

      // Convert commented environment variables to actual values
      if (trimmed.startsWith('# ') && trimmed.includes('=')) {
        const envLine = trimmed.substring(2); // Remove '# '

        // Provide default values for common environment variables
        if (envLine.includes('JWT_SECRET=')) {
          // Generate a more secure default JWT secret
          const jwtSecret = generateRandomSecret(64);
          return `JWT_SECRET=${jwtSecret}`;
        }
        if (envLine.includes('API_KEY=')) {
          const apiKey = generateRandomSecret(32);
          return `API_KEY=${apiKey}`;
        }

        // Default: return the line uncommented
        return envLine;
      }

      // Keep comments and empty lines
      return line;
    })
    .join('\n');
}
