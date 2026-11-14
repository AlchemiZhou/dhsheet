import { mkdtempSync, writeFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'

const { checkBrowserBuild } = require('../../scripts/check-browser-build.js')
const fixtures: string[] = []
function chunk(code?: string) {
  const dir = mkdtempSync(join(tmpdir(), 'browser-chunks-'))
  fixtures.push(dir)
  if (code) writeFileSync(join(dir, 'dependency.js'), code)
  return dir
}
afterEach(() => { for (const dir of fixtures.splice(0)) rmSync(dir, { recursive: true, force: true }) })
describe('published dependency syntax guard', () => {
  it('accepts an older-engine-compatible bundle', () => {
    expect(checkBrowserBuild(chunk('var value = item == null ? fallback : item.value;'))).toBe(1)
  })
  it.each(['item?.value', 'item ?? fallback'])('rejects uncompiled dependency syntax: %s', (code) => {
    expect(() => checkBrowserBuild(chunk(code))).toThrow('BROWSER_SYNTAX_UNSUPPORTED')
  })
  it('does not report an empty build as compatible', () => {
    expect(() => checkBrowserBuild(chunk())).toThrow('BROWSER_BUILD_EMPTY')
  })
})
