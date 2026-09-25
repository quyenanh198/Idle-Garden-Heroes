import { defineConfig } from 'vite';

export default defineConfig({
  // Relative base so the build works from any path (e.g. GitHub Pages at /Idle-Garden-Heroes/).
  base: './',
  build: {
    // Phaser alone is ~1.2 MB minified and is already lazy-loaded; keep the warning for anything bigger.
    chunkSizeWarningLimit: 1300,
  },
});
