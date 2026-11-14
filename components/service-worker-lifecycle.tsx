"use client"

import { useEffect } from "react"

/** Keep the published worker URL reachable so existing installations can retire safely. */
export function ServiceWorkerLifecycle() {
  useEffect(() => {
    if (!("serviceWorker" in navigator) || !["http:", "https:"].includes(window.location.protocol)) return

    const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? ""
    // Privacy modes and embedded browsers can expose the property but throw on
    // access or registration. Worker retirement must not prevent opening saves.
    const reportFailure = (error: unknown) => {
      console.error("[ServiceWorkerLifecycle] Failed to retire legacy worker:", error)
    }
    try {
      navigator.serviceWorker
        .register(`${basePath}/sw.js`, { updateViaCache: "none" })
        .catch(reportFailure)
    } catch (error) {
      reportFailure(error)
    }
  }, [])

  return null
}
