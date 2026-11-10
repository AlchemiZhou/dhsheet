import { afterEach, describe, expect, it, vi } from 'vitest'

const originalEnv = { ...process.env }

async function loadNextConfig(env: Record<string, string | undefined>) {
  vi.resetModules()

  process.env = { ...originalEnv }
  for (const [key, value] of Object.entries(env)) {
    if (value === undefined) {
      delete process.env[key]
    } else {
      process.env[key] = value
    }
  }

  return (await import('../../next.config.mjs')).default
}

afterEach(() => {
  vi.resetModules()
  process.env = { ...originalEnv }
})

describe('Next config', () => {
  it('uses relative asset paths for local export builds', async () => {
    const config = await loadNextConfig({
      GITHUB_ACTIONS: undefined,
      LOCAL_BUILD: 'true',
    })

    expect(config.assetPrefix).toBe('./')
    expect(config.basePath).toBe('')
  })

  it('uses the renamed DHsheet path for Pages assets and navigation', async () => {
    const config = await loadNextConfig({
      GITHUB_ACTIONS: 'true',
      LOCAL_BUILD: undefined,
    })

    expect(config.assetPrefix).toBe('/DHsheet')
    expect(config.basePath).toBe('/DHsheet')
    expect(config.env.NEXT_PUBLIC_BASE_PATH).toBe('/DHsheet')
  })
})
