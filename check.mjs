// Prints the partial `host` declarations of both builds and the host binding
// instructions Angular's linker generates from each (run `link.mjs` first).
import { readFileSync } from 'node:fs'

const declaredHost = (file) =>
  readFileSync(file, 'utf8')
    .match(/ɵɵngDeclareDirective\(\{[\s\S]*?host: (\{[\s\S]*?\}\s*\})/)?.[1]
    .replace(/\s+/g, ' ')

const hostInstructions = (file) =>
  readFileSync(file, 'utf8')
    .split('\n')
    .filter((line) => /ɵɵ(listener|attribute|domProperty|property)\(/.test(line))
    .map((line) => '    ' + line.trim())
    .join('\n')

console.log('Partial declaration (input of the linker):')
console.log('  ngc:              ', declaredHost('ngc-out/index.js'))
console.log('  @oxc-angular/vite:', declaredHost('dist/index.mjs'))
console.log('\nLinked host bindings:')
console.log('  ngc:\n' + hostInstructions('linked/ngc.mjs'))
console.log('  @oxc-angular/vite:\n' + hostInstructions('linked/oxc.mjs'))
