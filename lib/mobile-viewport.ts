export const A4_VIEWPORT_WIDTH = Math.round(210 * (96 / 25.4))
export const MOBILE_BREAKPOINT = 1024

export function getViewportMetaContent(_isMobile: boolean): string {
  return "width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes"
}

export function isMobileViewportDevice(win: Window): boolean {
  return win.innerWidth < MOBILE_BREAKPOINT
}
