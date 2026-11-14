import { readFileSync } from 'node:fs'
import vm from 'node:vm'
import { describe, expect, it, vi } from 'vitest'
import { parse } from 'acorn'

const source = readFileSync('public/browser-compatibility.js', 'utf8')
function load(native: Record<string, unknown> = {}) {
  const window = { setTimeout: vi.fn(), ...native } as Record<string, any>
  vm.runInNewContext(source, { window, Promise, Object, TypeError })
  return window
}

describe('early browser compatibility', () => {
  it('parses before modern dependency syntax is supported', () => {
    expect(() => parse(source, { ecmaVersion: 5 })).not.toThrow()
  })
  it('does not replace native implementations', () => {
    const globalThis = {}, queueMicrotask = vi.fn()
    const result = load({ globalThis, queueMicrotask })
    expect(result.globalThis).toBe(globalThis)
    expect(result.queueMicrotask).toBe(queueMicrotask)
  })
  it('defines the global object before modules evaluate', () => {
    const result = load()
    expect(result.globalThis).toBe(result)
  })
  it('schedules callbacks as microtasks, preserving order', async () => {
    const result = load(), order: string[] = []
    result.queueMicrotask(() => order.push('microtask'))
    order.push('synchronous')
    await Promise.resolve()
    expect(order).toEqual(['synchronous', 'microtask'])
    expect(() => result.queueMicrotask(null)).toThrow(TypeError)
  })
  it('reports callback exceptions instead of suppressing them', async () => {
    const result = load(), error = new Error('callback failed')
    result.queueMicrotask(() => { throw error })
    await Promise.resolve()
    await Promise.resolve()
    const [report] = result.setTimeout.mock.calls[0]
    expect(() => report()).toThrow(error)
  })
})
