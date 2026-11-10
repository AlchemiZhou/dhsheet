import { describe, expect, it } from "vitest"
import { getViewportMetaContent, isMobileViewportDevice } from "@/lib/mobile-viewport"
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

  it("does not lock browser pinch zoom", () => {
    expect(viewport.userScalable).toBe(true)
    expect(viewport.maximumScale ?? 5).toBeGreaterThan(1)
  })
})
