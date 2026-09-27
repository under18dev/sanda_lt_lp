import { defineConfig } from 'vite'

export default defineConfig({
  publicDir: 'public',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: 'src/client.tsx',
      output: {
        entryFileNames: 'assets/client.js',
        assetFileNames: (assetInfo) => assetInfo.name === 'client.css' ? 'assets/app.css' : 'assets/[name][extname]',
      },
    },
  },
})
