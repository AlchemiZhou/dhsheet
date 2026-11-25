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
  // Older WebViews support FileReader but lack the promise-based Blob methods.
  if (window.Blob && window.FileReader) {
    var readBlob = function (method, blob) {
      return new Promise(function (resolve, reject) {
        var reader = new window.FileReader();
        reader.onload = function () { resolve(reader.result); };
        reader.onerror = function () { reject(reader.error); };
        reader[method](blob);
      });
    };
    var prototype = window.Blob.prototype;
    if (typeof prototype.arrayBuffer !== 'function') {
      Object.defineProperty(prototype, 'arrayBuffer', { configurable: true, writable: true, value: function () {
        return readBlob('readAsArrayBuffer', this);
      } });
    }
    if (typeof prototype.text !== 'function') {
      Object.defineProperty(prototype, 'text', { configurable: true, writable: true, value: function () {
        return readBlob('readAsText', this);
      } });
    }
  }
}());
