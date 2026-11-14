/* Guard emitted dependencies too: TypeScript/browser targets do not cover them automatically. */
const { readdirSync, readFileSync } = require('node:fs')
const { join } = require('node:path')
const { parse } = require('acorn')

function checkBrowserBuild(root) {
  let count = 0
  function visit(directory) {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const file = join(directory, entry.name)
      if (entry.isDirectory()) visit(file)
      else if (entry.name.endsWith('.js')) {
        try {
          parse(readFileSync(file, 'utf8'), { ecmaVersion: 2019, sourceType: 'script' })
        } catch (error) {
          throw new Error(`BROWSER_SYNTAX_UNSUPPORTED: ${file}: ${error.message}`)
        }
        count += 1
      }
    }
  }
  visit(root)
  if (!count) throw new Error(`BROWSER_BUILD_EMPTY: ${root}`)
  return count
}

if (require.main === module) {
  console.log(`Browser syntax verified: ${checkBrowserBuild(join(process.cwd(), 'out/_next/static/chunks'))} chunks (ES2019).`)
}
module.exports = { checkBrowserBuild }
