// Links the partial declarations of both builds with Angular's own linker
// (`@angular/compiler-cli/linker/babel`, the one the Angular CLI applies to
// partially compiled libraries) and writes the results to `linked/`.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { transformAsync } from '@babel/core'
import linker from '@angular/compiler-cli/linker/babel'

mkdirSync('linked', { recursive: true })
for (const [input, output] of [
  ['dist/index.mjs', 'linked/oxc.mjs'],
  ['ngc-out/index.js', 'linked/ngc.mjs'],
]) {
  const { code } = await transformAsync(readFileSync(input, 'utf8'), {
    filename: input,
    configFile: false,
    babelrc: false,
    plugins: [linker],
  })
  writeFileSync(output, code)
  console.log(`linked ${input} -> ${output}`)
}
