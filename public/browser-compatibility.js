/* ES5: run before framework/dependency chunks, including their module bodies. */
(function () {
  if (typeof window.globalThis === 'undefined') {
    Object.defineProperty(window, 'globalThis', { configurable: true, writable: true, value: window });
  }
  if (typeof window.queueMicrotask !== 'function') {
    window.queueMicrotask = function (callback) {
      if (typeof callback !== 'function') throw new TypeError('queueMicrotask callback must be a function');
      Promise.resolve().then(callback).catch(function (error) {
        window.setTimeout(function () { throw error; }, 0);
      });
    };
  }
}());
