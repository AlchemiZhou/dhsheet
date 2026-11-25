# Browser startup compatibility

The UI uses `MediaQueryList.addListener/removeListener` only when the event-listener API is absent. This supports older WebViews without changing the responsive breakpoint. Both paths unsubscribe on unmount; tests cover resize and cleanup. Remove the legacy path only when supported browsers all implement the modern API.

Character image projection uses `@ungap/structured-clone`, already present in the dependency graph and now a direct dependency. Native cloning remains preferred. The compatibility path runs only where native `structuredClone` is absent, preserves undefined properties and structured values, and still rejects non-cloneable data. It never replaces a failed save with empty/default data. Failures continue through the storage boundary's existing error reporting. Remove it when native cloning is a minimum browser requirement.

Theme validation uses `Object.prototype.hasOwnProperty.call`, avoiding an unnecessary new API dependency.

Card-instance IDs use the existing `uuid` dependency's v4 generator. Where `crypto.randomUUID` is absent, it uses secure random bytes; it still fails if no secure random source exists. The `cardinst_` prefix and UUID format are unchanged.

`public/startup-check.js` is an independent ES5 script, inlined in the document head before application chunks to capture failures before hydration. If the home placeholder is still mounted after 15 seconds, it shows progress for pending application scripts. A script failure, runtime error or rejected promise is reported separately. Failed optional script downloads are ignored. A later client-ready event dismisses the notice. The retry link reloads the same origin with a fresh query parameter and keeps character storage. No-JavaScript browsers receive a noscript message.

Compatibility checks simulate missing APIs and blocked app chunks in Chromium. They do not establish support for every legacy browser engine or for networks that cannot reach GitHub Pages.

## Published dependency syntax and early APIs

The explicit Browserslist target includes Chromium 70, Firefox 67 and Safari 12. Dependencies that shipped ES2020 syntax (`uuid`, Dexie, Zod, Tailwind Merge, selected Radix internals, Motion and markdown-editor packages) are compiled for that same target with `transpilePackages`. The production build parses **every emitted browser chunk**, including lazy editor chunks, as ES2019 and fails with `BROWSER_SYNTAX_UNSUPPORTED` before publication if optional chaining or other later syntax leaks through again. This verifies syntax, not every device's APIs or network access.

`public/browser-compatibility.js` is an ES5 head prelude, executed before framework chunks. It supplies `globalThis` only if absent and supplies `queueMicrotask` using Promise microtasks only if absent. Callback failures remain observable as asynchronous errors. The pinned `abortcontroller-polyfill` head script provides abort signals and abortable-fetch semantics only when native support is unavailable/incomplete. Native implementations remain preferred; no character state is replaced, migrated differently or discarded. These paths can be removed once all supported browsers have these APIs. Unit tests cover feature detection/order/error delivery; browser checks disable APIs before any chunks load and exercise selection, reload and fetch cancellation.

Some privacy-restricted WebViews expose `navigator.serviceWorker` but throw `SecurityError` when read or when registering. Worker retirement is optional to opening the character editor, so synchronous and asynchronous registration failures are logged with `[ServiceWorkerLifecycle]` and isolated from React effects. They do not trigger reloads, wipe caches or touch stored characters. Tests cover absent support, rejected registration, a throwing getter and a synchronous exception. Remove this isolation only when supported environments guarantee worker access.

Startup diagnostics also capture unhandled promise rejections and error stacks locally; there is no automatic reporting or storage clearing. Device/brand-specific success still requires testing on those actual browsers.

Older target engines may have FileReader but lack the promise-based Blob text and binary readers. The head prelude supplies only the missing methods for portrait hydration and file imports. Read failures reject the promise. The mobile PDF renderer uses standard append/remove DOM operations, and offers a Blob download if the browser cannot construct or share a File. Remove the Blob fallbacks when every supported engine implements both readers. The browser-compatibility and PDF dialog tests cover these paths.

## Domain ribbon identifiers

Domain flags use fixed 37 × 58px boxes, source PNG artwork and SVG level text. Their geometry does not require CSS aspect-ratio, masks, remote fonts or flex-gap. PNG avoids WebP decoding requirements for these identifiers; cached older app chunks retain their existing WebP URLs. HTML export preserves original ribbon bytes instead of passing them through the general WebP canvas encoder. Other illustration formats retain their existing behavior.

Failed or unavailable flag images render a solid SVG fallback with domain text and level retained. Pale Bone/Splendor artwork uses dark numbers; fallback frames use white numbers. Artwork preference and character save schemas are unchanged.

Validation includes desktop scaling, six viewport widths, missing image requests, missing early APIs and opaque offline HTML. The older-API simulation also removes support for addEventListener's signal option when removing AbortController; combining polyfilled signals with a modern native signal brand check is not an accurate old-browser simulation. Actual Firefox/WebKit installation was blocked by the environment's download policy, so those engines and physical Safari/Android vendor browsers are not claimed as tested. Detailed results are under testing/domain-ribbons.
