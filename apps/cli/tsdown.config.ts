import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  clean: true,
  shims: true,
  minify: true,
  outDir: 'dist',
  outputOptions(options, format) {
    options.banner = `
     #!/usr/bin/env node
     `;
  },
});
