#!/usr/bin/env node

// Compile export styles BEFORE Next.js bundles embedded-styles.ts. Extracting
// them only after a build leaves that build's HTML exporter one version behind.
const fs = require('fs/promises')
const path = require('path')
const postcss = require('postcss')
const tailwindcss = require('tailwindcss')
const { processCSS, generateTypeScriptModule } = require('./extract-css')

async function findCSSFiles(directory) {
  const entries = await fs.readdir(directory, { withFileTypes: true })
  const nested = await Promise.all(entries.map(entry => {
    const file = path.join(directory, entry.name)
    return entry.isDirectory() ? findCSSFiles(file) : entry.name.endsWith('.css') ? [file] : []
  }))
  return nested.flat().sort()
}

async function prepareEmbeddedStyles(options = {}) {
  const root = options.root ?? path.join(__dirname, '..')
  const files = options.files ?? [path.join(root, 'app/globals.css'), ...await findCSSFiles(path.join(root, 'components'))]
  const config = options.config ?? path.join(root, 'tailwind.config.ts')
  const output = options.output ?? path.join(root, 'lib/embedded-styles.ts')
  const source = (await Promise.all(files.map(file => fs.readFile(file, 'utf8')))).join('\n')
  const compiled = await postcss([tailwindcss(config)]).process(source, { from: files[0], map: false })
  const css = processCSS(compiled.css, false).replace(/[ \t]+$/gm, '')
  await fs.mkdir(path.dirname(output), { recursive: true })
  await fs.writeFile(output, generateTypeScriptModule(css), 'utf8')
  return css
}

if (require.main === module) {
  prepareEmbeddedStyles().then(css => console.log(`Prepared current embedded export styles: ${(css.length / 1024).toFixed(2)} KiB`))
    .catch(error => { console.error(error); process.exitCode = 1 })
}

module.exports = { prepareEmbeddedStyles }
