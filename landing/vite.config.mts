import { defineConfig } from 'vite'
import { randomUUID } from 'node:crypto'

export default defineConfig({
  publicDir: 'public',
  plugins: [{
    name: 'asset-version',
    generateBundle() {
      this.emitFile({ type: 'asset', fileName: 'asset-version.txt', source: randomUUID() })
    },
  }],
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
