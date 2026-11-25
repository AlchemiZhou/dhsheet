import { readFileSync } from 'node:fs'
import vm from 'node:vm'
import { afterEach, describe, expect, it, vi } from 'vitest'

function loadCheck() {
  const pending=document.createElement('div');pending.id='dhsheet-client-startup';document.body.appendChild(pending)
  const events = new Map<string, (event?: unknown) => void>()
  const timers: Array<() => void> = []
  const window = {
    addEventListener: (name: string, callback: () => void) => events.set(name, callback),
    setTimeout: (callback: () => void) => timers.push(callback),
    URL,
    location: { href: 'https://example.com/dhsheet/', replace: vi.fn(), origin: 'https://example.com', pathname: '/dhsheet/', reload: vi.fn() },
  }
  vm.runInNewContext(readFileSync('public/startup-check.js', 'utf8'), {
    window,
    document,
    navigator: { userAgent: 'LegacyWebView-test' },
  })
  return { events, expire: () => timers[0](), window }
}
afterEach(() => {
  document.getElementById('dhsheet-client-startup')?.remove()
  document.documentElement.removeAttribute('data-dhsheet-client')
  document.getElementById('dhsheet-startup-notice')?.remove()
})
describe('independent startup diagnostics', () => {
  it('does not show on routes without the home startup placeholder',()=>{
    const check=loadCheck();document.getElementById('dhsheet-client-startup')!.remove();check.expire()
    expect(document.getElementById('dhsheet-startup-notice')).toBeNull()
  })
  it('does not show recovery controls after successful hydration', () => {
    const check = loadCheck()
    document.documentElement.setAttribute('data-dhsheet-client', 'ready')
    check.expire()
    expect(document.getElementById('dhsheet-startup-notice')).toBeNull()
  })
  it('reports blocked app scripts, offers an explicit reload and clears after delayed startup', () => {
    const check = loadCheck()
    check.events.get('error')?.({
      target: { tagName: 'SCRIPT', src: 'https://example.com/dhsheet/_next/static/chunks/app.js' },
    })
    check.expire()
    const panel = document.getElementById('dhsheet-startup-notice')!
    expect(panel.querySelector('textarea')!.value).toContain('SCRIPT_LOAD_FAILED')
    expect(panel.querySelector('textarea')!.value).toContain('LegacyWebView-test')
    expect(panel.textContent).toContain('请勿清除网站数据')
    check.events.get('click')?.({ target: panel.querySelector('a'), preventDefault: vi.fn() })
    expect(check.window.location.replace).toHaveBeenCalledOnce()
    check.events.get('dhsheet:client-ready')?.()
    expect(document.getElementById('dhsheet-startup-notice')).toBeNull()
  })
  it('tracks slow script downloads, then shows a failure only if one arrives', () => {
    const script = document.createElement('script')
    script.src = 'https://example.com/dhsheet/_next/static/chunks/app.js'
    document.head.appendChild(script)
    try {
      const check = loadCheck()
      check.events.get('error')?.({ target: { tagName: 'SCRIPT', src: 'https://metrics.example/analytics.js' } })
      check.expire()
      const panel = document.getElementById('dhsheet-startup-notice')!
      const details = panel.querySelector('textarea')!
      expect(panel.querySelector('h2')?.textContent).toBe('车卡器仍在启动')
      expect(details.value).toContain('0/1')
      expect(details.value).toContain('app.js')
      check.events.get('load')?.({ target: script })
      expect(details.value).toContain('1/1')
      check.events.get('error')?.({ message: 'late runtime error' })
      expect(details.value).toContain('RUNTIME_ERROR: late runtime error')
      expect(panel.querySelector('h2')?.textContent).toBe('页面启动遇到错误')
    } finally {
      script.remove()
    }
  })
  it('retries on the same origin while retaining the query and fragment', () => {
    const check = loadCheck()
    const replace = vi.fn()
    Object.assign(check.window, { URL })
    Object.assign(check.window.location, { href: 'https://example.com/dhsheet/?x=1#card', replace })
    check.expire()
    check.events.get('click')?.({ target: document.querySelector('#dhsheet-startup-notice a'), preventDefault: vi.fn() })
    const target = new URL(replace.mock.calls[0][0])
    expect(target.origin + target.pathname).toBe('https://example.com/dhsheet/')
    expect(target.searchParams.get('x')).toBe('1')
    expect(target.searchParams.get('dhsheet_retry')).toMatch(/^\d+$/)
    expect(target.hash).toBe('#card')
  })
  it('retains unhandled promise failures and their stack without suppressing the event', () => {
    const check = loadCheck()
    const preventDefault = vi.fn()
    check.events.get('unhandledrejection')?.({ reason: { message: 'Missing browser API', stack: 'Missing browser API\n at dependency.js:10' }, preventDefault })
    check.expire()
    expect(document.querySelector<HTMLTextAreaElement>('#dhsheet-startup-notice textarea')!.value).toContain('UNHANDLED_REJECTION: Missing browser API\n at dependency.js:10')
    expect(preventDefault).not.toHaveBeenCalled()
  })
})
