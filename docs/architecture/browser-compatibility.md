# Browser startup compatibility

The UI uses `MediaQueryList.addListener/removeListener` only when the event-listener API is absent. This supports older WebViews without changing the responsive breakpoint. Both paths unsubscribe on unmount; tests cover resize and cleanup. Remove the legacy path only when supported browsers all implement the modern API.

Character image projection uses `@ungap/structured-clone`, already present in the dependency graph and now a direct dependency. Native cloning remains preferred. The compatibility path runs only where native `structuredClone` is absent, preserves undefined properties and structured values, and still rejects non-cloneable data. It never replaces a failed save with empty/default data. Failures continue through the storage boundary's existing error reporting. Remove it when native cloning is a minimum browser requirement.

Theme validation uses `Object.prototype.hasOwnProperty.call`, avoiding an unnecessary new API dependency.

Card-instance IDs use the existing `uuid` dependency's v4 generator. Where `crypto.randomUUID` is absent, it uses secure random bytes; it still fails if no secure random source exists. The `cardinst_` prefix and UUID format are unchanged.

`public/startup-check.js` is an independent ES5 script, inlined in the document head before application chunks to capture failures before hydration. If the home-page startup placeholder remains and hydration has not reached the client-ready marker after 15 seconds, it displays a startup failure panel and local technical details (`STARTUP_TIMEOUT`, optionally `SCRIPT_LOAD_FAILED` / `RUNTIME_ERROR`, user agent and page path). It performs no storage writes, clearing, automatic reload or remote reporting. A later client-ready event removes the panel. Tests cover script failures, normal and delayed startup. No-JavaScript browsers receive a noscript message.

Compatibility checks simulate missing APIs and blocked app chunks in Chromium. They do not establish support for every legacy browser engine or for networks that cannot reach GitHub Pages.

## Published dependency syntax and early APIs

The explicit Browserslist target includes Chromium 70, Firefox 67 and Safari 12. Dependencies that shipped ES2020 syntax (`uuid`, Dexie, Zod, Tailwind Merge, selected Radix internals, Motion and markdown-editor packages) are compiled for that same target with `transpilePackages`. The production build parses **every emitted browser chunk**, including lazy editor chunks, as ES2019 and fails with `BROWSER_SYNTAX_UNSUPPORTED` before publication if optional chaining or other later syntax leaks through again. This verifies syntax, not every device's APIs or network access.

`public/browser-compatibility.js` is an ES5 head prelude, executed before framework chunks. It supplies `globalThis` only if absent and supplies `queueMicrotask` using Promise microtasks only if absent. Callback failures remain observable as asynchronous errors. The pinned `abortcontroller-polyfill` head script provides abort signals and abortable-fetch semantics only when native support is unavailable/incomplete. Native implementations remain preferred; no character state is replaced, migrated differently or discarded. These paths can be removed once all supported browsers have these APIs. Unit tests cover feature detection/order/error delivery; browser checks disable APIs before any chunks load and exercise selection, reload and fetch cancellation.

Some privacy-restricted WebViews expose `navigator.serviceWorker` but throw `SecurityError` when read or when registering. Worker retirement is optional to opening the character editor, so synchronous and asynchronous registration failures are logged with `[ServiceWorkerLifecycle]` and isolated from React effects. They do not trigger reloads, wipe caches or touch stored characters. Tests cover absent support, rejected registration, a throwing getter and a synchronous exception. Remove this isolation only when supported environments guarantee worker access.

Startup diagnostics also capture unhandled promise rejections and error stacks locally; there is no automatic reporting or storage clearing. Device/brand-specific success still requires testing on those actual browsers.
