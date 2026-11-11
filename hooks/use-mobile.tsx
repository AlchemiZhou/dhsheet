"use client"

import * as React from "react"
import { MOBILE_BREAKPOINT, isMobileViewportDevice } from "@/lib/mobile-viewport"

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean>(false) // 设置为默认值false避免undefined

  React.useEffect(() => {
    // 根据可用宽度选择布局；触屏笔记本仍可使用桌面布局。
    const updateIsMobile = () => {
      setIsMobile(isMobileViewportDevice(window))
    }

    // 立即执行一次
    updateIsMobile()

    // 监听变化
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      updateIsMobile()
    }
    // Older Safari / Android WebViews expose MediaQueryList.addListener only.
    const modernListener = typeof mql.addEventListener === 'function'
    if (modernListener) mql.addEventListener("change", onChange)
    else mql.addListener(onChange)

    return () => {
      if (modernListener) mql.removeEventListener("change", onChange)
      else mql.removeListener(onChange)
    }
  }, [])

  return isMobile
}
