import { mkdtemp, writeFile, readFile, rm } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { createRequire } from 'node:module'
import { runInNewContext } from 'node:vm'
import ts from 'typescript'
import postcss from 'postcss'
import { describe, expect, it } from 'vitest'

const require = createRequire(import.meta.url)
const { prepareEmbeddedStyles } = require('../../scripts/prepare-embedded-styles.js')

describe('embedded HTML export stylesheet generation', () => {
  it('compiles the current utility classes and component CSS before emitting a usable offline module', async () => {
    const directory = await mkdtemp(path.join(os.tmpdir(), 'dhsheet-export-css-'))
    try {
      const source = path.join(directory, 'source.css')
      const component = path.join(directory, 'component.css')
      const output = path.join(directory, 'embedded-styles.ts')
      await writeFile(source, '@tailwind utilities;')
      await writeFile(component, '.reference-sheet { color: theme("colors.gray.800"); }')
      const css = await prepareEmbeddedStyles({ files: [source, component], output,
        config: { content: [{ raw: '<div class="grid grid-cols-6 grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)_minmax(0,1fr)] pb-5"></div>' }] } })
      const rules = postcss.parse(css)
      const columns: string[] = []
      rules.walkDecls('grid-template-columns', declaration => { columns.push(declaration.value) })
      expect(columns).toContain('repeat(6, minmax(0, 1fr))')
      expect(columns).toContain('minmax(0,1.25fr) minmax(0,1fr) minmax(0,1fr)')
      expect(css).not.toContain('theme(')
      const module = ts.transpileModule(await readFile(output, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } })
      const sandbox = { exports: {} as { embeddedStyles?: string } }
      runInNewContext(module.outputText, sandbox)
      expect(sandbox.exports.embeddedStyles).toBe(css)
    } finally { await rm(directory, { recursive: true, force: true }) }
  })

  it('fails before replacing the bundled styles when a source file is missing', async () => {
    const directory = await mkdtemp(path.join(os.tmpdir(), 'dhsheet-export-css-'))
    try {
      const output = path.join(directory, 'embedded-styles.ts')
      await writeFile(output, 'existing styles')
      await expect(prepareEmbeddedStyles({ files: [path.join(directory, 'missing.css')], output })).rejects.toThrow()
      expect(await readFile(output, 'utf8')).toBe('existing styles')
    } finally { await rm(directory, { recursive: true, force: true }) }
  })
})
