import "@testing-library/jest-dom/vitest"
import { fireEvent, render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { MobileExperienceNotice } from "../mobile-experience-notice"
import {
  getMobileExperienceNoticeDismissed,
  setCardDisplayMode,
  setMobileExperienceNoticeDismissed,
  APP_PREFERENCES_STORAGE_KEY,
} from "@/lib/app-preferences"

describe("mobile experience notice", () => {
  beforeEach(() => localStorage.clear())
  it("shows only after a mobile layout is detected and acknowledges the current visit", () => {
    const acknowledge = vi.fn()
    const { rerender } = render(<MobileExperienceNotice isMobile={false} onAcknowledge={acknowledge} />)
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
    rerender(<MobileExperienceNotice isMobile onAcknowledge={acknowledge} />)
    expect(screen.getByRole("dialog", { name: "使用电脑，体验更完整" })).toBeInTheDocument()
    fireEvent.click(screen.getByRole("button", { name: "知道了，继续使用" }))
    expect(acknowledge).toHaveBeenCalledTimes(1)
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
    expect(getMobileExperienceNoticeDismissed()).toBe(false)
    rerender(<MobileExperienceNotice isMobile={false} onAcknowledge={acknowledge} />)
    rerender(<MobileExperienceNotice isMobile onAcknowledge={acknowledge} />)
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
  })
  it("remembers do-not-remind after remounting and other preference updates", () => {
    const { unmount } = render(<MobileExperienceNotice isMobile onAcknowledge={() => {}} />)
    fireEvent.click(screen.getByRole("button", { name: "不再提醒" }))
    expect(getMobileExperienceNoticeDismissed()).toBe(true)
    setCardDisplayMode("text")
    unmount()
    render(<MobileExperienceNotice isMobile onAcknowledge={() => {}} />)
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
    expect(getMobileExperienceNoticeDismissed()).toBe(true)
  })
  it("defaults to showing the notice for old or invalid preferences", () => {
    expect(getMobileExperienceNoticeDismissed()).toBe(false)
    setMobileExperienceNoticeDismissed(true)
    const data = JSON.parse(localStorage.getItem(APP_PREFERENCES_STORAGE_KEY)!)
    data.ui.mobileExperienceNoticeDismissed = "true"
    localStorage.setItem(APP_PREFERENCES_STORAGE_KEY, JSON.stringify(data))
    expect(getMobileExperienceNoticeDismissed()).toBe(false)
    setMobileExperienceNoticeDismissed(false)
    expect(getMobileExperienceNoticeDismissed()).toBe(false)
  })
})
