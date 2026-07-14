import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: [
    './src/index.ts',
    './src/equals.ts',
    './src/vue.ts',
    './src/data/*.ts',
  ],
  outDir: 'dist',
  format: 'esm',
  outExtensions: () => ({ js: '.mjs', dts: '.d.ts' }),
  dts: true,
  clean: true,
})
