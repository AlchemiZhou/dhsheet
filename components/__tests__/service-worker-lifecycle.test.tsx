import { cleanup, render } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"
import { ServiceWorkerLifecycle } from "../service-worker-lifecycle"

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
  vi.unstubAllEnvs()
  vi.unstubAllGlobals()
})

function mockServiceWorker() {
  const worker = new EventTarget()
  const register = vi.fn().mockResolvedValue({})
  vi.stubGlobal("navigator", { serviceWorker: Object.assign(worker, { register }) })
  return { worker, register }
}

describe("ServiceWorkerLifecycle", () => {
  it.each(["", "/DaggerHeart-CharacterSheet"])("updates the legacy worker under base path %s", (basePath) => {
    vi.stubEnv("NEXT_PUBLIC_BASE_PATH", basePath)
    const { register } = mockServiceWorker()
    render(<ServiceWorkerLifecycle />)
    expect(register).toHaveBeenCalledWith(`${basePath}/sw.js`, { updateViaCache: "none" })
  })

  it("does not reload when an older worker reports a chunk failure", () => {
    const { worker } = mockServiceWorker()
    const reload = vi.spyOn(window.location, "reload").mockImplementation(() => {})
    render(<ServiceWorkerLifecycle />)
    worker.dispatchEvent(new MessageEvent("message", { data: { type: "CHUNK_LOAD_ERROR" } }))
    expect(reload).not.toHaveBeenCalled()
  })

  it("works without service worker support", () => {
    vi.stubGlobal("navigator", {})
    expect(() => render(<ServiceWorkerLifecycle />)).not.toThrow()
  })
})

describe('restricted browser service workers', () => {
  it('keeps rendering when reading the worker property throws', () => {
    const error = new DOMException('Worker blocked by browser', 'SecurityError')
    const log = vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.stubGlobal('navigator', Object.defineProperty({}, 'serviceWorker', { get() { throw error } }))
    expect(() => render(<ServiceWorkerLifecycle />)).not.toThrow()
    expect(log).toHaveBeenCalledWith(expect.stringContaining('ServiceWorkerLifecycle'), error)
  })
  it('handles synchronous registration errors without a reload', () => {
    const error = new DOMException('Registration blocked', 'SecurityError')
    const log = vi.spyOn(console, 'error').mockImplementation(() => {})
    const register = vi.fn(() => { throw error })
    vi.stubGlobal('navigator', { serviceWorker: { register } })
    expect(() => render(<ServiceWorkerLifecycle />)).not.toThrow()
    expect(log).toHaveBeenCalledWith(expect.stringContaining('ServiceWorkerLifecycle'), error)
  })
  it('handles rejected registration without a reload', async () => {
    const error = new Error('Worker registration rejected')
    const log = vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.stubGlobal('navigator', { serviceWorker: { register: vi.fn().mockRejectedValue(error) } })
    render(<ServiceWorkerLifecycle />)
    await Promise.resolve()
    expect(log).toHaveBeenCalledWith(expect.stringContaining('ServiceWorkerLifecycle'), error)
  })
})
