# Browser startup compatibility

The UI uses `MediaQueryList.addListener/removeListener` only when the event-listener API is absent. This supports older WebViews without changing the responsive breakpoint. Both paths unsubscribe on unmount; tests cover resize and cleanup. Remove the legacy path only when supported browsers all implement the modern API.

Character image projection uses `@ungap/structured-clone`, already present in the dependency graph and now a direct dependency. Native cloning remains preferred. The compatibility path runs only where native `structuredClone` is absent, preserves undefined properties and structured values, and still rejects non-cloneable data. It never replaces a failed save with empty/default data. Failures continue through the storage boundary's existing error reporting. Remove it when native cloning is a minimum browser requirement.

Theme validation uses `Object.prototype.hasOwnProperty.call`, avoiding an unnecessary new API dependency.

Card-instance IDs use the existing `uuid` dependency's v4 generator. Where `crypto.randomUUID` is absent, it uses secure random bytes; it still fails if no secure random source exists. The `cardinst_` prefix and UUID format are unchanged.

`public/startup-check.js` is an independent ES5 script, inlined in the document head before application chunks to capture failures before hydration. If the home-page startup placeholder remains and hydration has not reached the client-ready marker after 15 seconds, it displays a startup failure panel and local technical details (`STARTUP_TIMEOUT`, optionally `SCRIPT_LOAD_FAILED` / `RUNTIME_ERROR`, user agent and page path). It performs no storage writes, clearing, automatic reload or remote reporting. A later client-ready event removes the panel. Tests cover script failures, normal and delayed startup. No-JavaScript browsers receive a noscript message.

Compatibility checks simulate missing APIs and blocked app chunks in Chromium. They do not establish support for every legacy browser engine or for networks that cannot reach GitHub Pages.
