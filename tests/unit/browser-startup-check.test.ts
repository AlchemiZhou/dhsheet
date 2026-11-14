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
    location: { origin: 'https://example.com', pathname: '/dhsheet/', reload: vi.fn() },
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
      target: { tagName: 'SCRIPT', src: 'https://example.com/dhsheet/_next/chunk.js' },
    })
    check.expire()
    const panel = document.getElementById('dhsheet-startup-notice')!
    expect(panel.querySelector('textarea')!.value).toContain('SCRIPT_LOAD_FAILED')
    expect(panel.querySelector('textarea')!.value).toContain('LegacyWebView-test')
    expect(panel.textContent).toContain('请勿清除网站数据')
    panel.querySelector('button')!.click()
    expect(check.window.location.reload).toHaveBeenCalledOnce()
    check.events.get('dhsheet:client-ready')?.()
    expect(document.getElementById('dhsheet-startup-notice')).toBeNull()
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
