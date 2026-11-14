# Browser startup compatibility repair

A report of the generic client-side exception and the startup-timeout panel prompted this check. Those screenshots do not identify the exact device failure; the conditions below are independently reproducible.

## Reproduced failures

- Disabling `globalThis`, `queueMicrotask` or `AbortController` before bundle evaluation prevents the existing application from starting or completing initialization.
- A `SecurityError` from reading `navigator.serviceWorker` or synchronously registering its worker escapes the existing React effect and produces the generic client-side Application error.
- The previous exported chunks include optional chaining/nullish coalescing from uncompiled dependencies. An ES2019 parser rejects 12 of the 40 browser chunks, including a shared UI chunk. Changing the TypeScript target alone does not transform those dependency files.

## Fix

Compile the affected dependencies for the configured Browserslist target. Include feature-detected early compatibility for the three missing APIs before framework modules run. Catch and log optional worker-retirement failures without reloading the page or changing stored characters. Keep package versions locked; the only new runtime dependency is `abortcontroller-polyfill@1.7.8`, and `acorn@8.15.0` becomes an explicit development dependency for the production syntax guard.

Both production build commands now check all exported browser chunks and reject syntax later than ES2019, including lazy card-editor chunks. Startup diagnostics retain unhandled promise failures and error stacks locally.

## Validation

- 25 focused tests cover early API compatibility, native implementation preservation, callback error delivery, optional-worker exceptions, existing cloning/UUID compatibility, startup diagnostics, and the emitted-syntax guard.
- Production static export with the GitHub Pages `/dhsheet` base path, including TypeScript checking.
- All 41 final exported chunks pass the ES2019 syntax guard. All three early head scripts parse as ES5.
- Chromium browser flows at a 390 × 844 touch viewport and a 1440 × 1000 desktop viewport. Six scenarios: normal phone, multiple missing APIs together, a throwing worker getter, synchronous registration failure, rejected registration, normal desktop. Each exercises startup, profession selection, save/reload, profession-domain filtering, abortable fetch, and an actual HTML download containing the selected profession.

These are simulated capability restrictions in current Chromium, not Huawei/vivo/Quark real-device results. Neither successful local tests nor a user-agent string establish that the original reporter's device is fixed. A successful deployment and reopening on the affected device are still needed for that conclusion. Network access to GitHub Pages is a separate concern.
