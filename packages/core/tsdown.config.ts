import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: [
    './src/parse.ts',
    './src/equals.ts',
    './src/vue.ts',
    './src/data/*.ts',
    './src/combinators/*.ts',
    './src/multipliers/*.ts',
  ],
  outDir: 'dist',
  format: 'esm',
  outExtensions: () => ({ js: '.mjs', dts: '.d.ts' }),
  dts: true,
  clean: true,
})
