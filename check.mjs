// Compares the `host` of `ɵɵngDeclareDirective` emitted by @oxc-angular/vite
// (partial mode) with ngc (partial mode), then links the oxc output with
// Angular's own linker to show the effect.
import { readFileSync } from 'node:fs'
import { transformAsync } from '@babel/core'
import linker from '@angular/compiler-cli/linker/babel'

const declaredHost = (code) =>
  code.match(/ɵɵngDeclareDirective\(\{[\s\S]*?host: (\{[\s\S]*?\}\s*\})/)?.[1]
    .replace(/\s+/g, ' ')

const oxc = readFileSync('dist/index.mjs', 'utf8')
const ngc = readFileSync('ngc-out/index.js', 'utf8')
console.log('ngc partial host:            ', declaredHost(ngc))
console.log('@oxc-angular/vite partial host:', declaredHost(oxc))

const linked = await transformAsync(oxc, {
  filename: 'index.mjs',
  configFile: false,
  babelrc: false,
  plugins: [linker],
})
console.log('\nAngular linker output for the oxc declaration:')
for (const line of linked.code.split('\n')) {
  if (/ɵɵ(listener|attribute|domProperty|property)\(/.test(line)) {
    console.log('  ' + line.trim())
  }
}
