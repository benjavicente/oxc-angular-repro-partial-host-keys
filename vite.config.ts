import { angular } from '@oxc-angular/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [angular({ tsconfig: 'tsconfig.json', compilationMode: 'partial' })],
  build: {
    minify: false,
    lib: { entry: 'src/index.ts', formats: ['es'], fileName: (_format, name) => `${name}.mjs` },
    rolldownOptions: { external: [/^@angular\//] },
  },
})
