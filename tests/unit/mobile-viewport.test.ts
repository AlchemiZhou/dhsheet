import { describe, expect, it } from "vitest"
import { getViewportMetaContent, isMobileViewportDevice, prefersPDFFileExport } from "@/lib/mobile-viewport"
import { viewport } from "@/app/layout"

describe("mobile viewport scaling", () => {
  it("uses the real device width on mobile so forms remain readable", () => {
    expect(getViewportMetaContent(true)).toBe(
      "width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes",
    )
  })

  it("keeps the normal responsive viewport on desktop", () => {
    expect(getViewportMetaContent(false)).toBe(
      "width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes",
    )
  })

  it("uses the available width rather than touch support for tablet and desktop layout", () => {
    expect(isMobileViewportDevice({ innerWidth: 390 } as Window)).toBe(true)
    expect(isMobileViewportDevice({ innerWidth: 1023 } as Window)).toBe(true)
    expect(isMobileViewportDevice({ innerWidth: 1024, ontouchstart: null } as unknown as Window)).toBe(false)
    expect(isMobileViewportDevice({ innerWidth: 1440 } as Window)).toBe(false)
  })

  it.each([
    [390, 'iPhone', 'iPhone', 5, true],
    [1366, 'Macintosh', 'MacIntel', 5, true],
    [1024, 'iPad', 'iPad', 5, true],
    [1280, 'Android', 'Linux', 5, true],
    [1440, 'Macintosh', 'MacIntel', 0, false],
    [1366, 'Windows', 'Win32', 5, false],
  ] as const)('routes PDF export at %ipx on %s to the appropriate destination', (innerWidth, userAgent, platform, maxTouchPoints, expected) => {
    const win = { innerWidth, navigator: { userAgent, platform, maxTouchPoints } } as Window
    expect(prefersPDFFileExport(win)).toBe(expected)
  })

  it("does not lock browser pinch zoom", () => {
    expect(viewport.userScalable).toBe(true)
    expect(viewport.maximumScale ?? 5).toBeGreaterThan(1)
  })
})
