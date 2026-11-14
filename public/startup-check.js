/* ES5 by design: this must run even if an older engine rejects the app bundle. */
(function () {
  var failure = '';
  var panel;
  function describeError(error) {
    if (!error) return 'Unknown rejection';
    return String(error.stack || error.message || error).slice(0, 3000);
  }
  window.addEventListener('error', function (event) {
    if (failure) return;
    if (event.target && event.target.tagName === 'SCRIPT') {
      failure = 'SCRIPT_LOAD_FAILED: ' + (event.target.src || 'unknown script');
    } else if (event.message) {
      failure = 'RUNTIME_ERROR: ' + event.message + (event.error ? '\n' + describeError(event.error) : '');
    }
  }, true);
  window.addEventListener('unhandledrejection', function (event) {
    if (!failure) failure = 'UNHANDLED_REJECTION: ' + describeError(event.reason);
  });
  function removePanel() {
    if (panel && panel.parentNode) panel.parentNode.removeChild(panel);
  }
  window.addEventListener('dhsheet:client-ready', removePanel);
  window.setTimeout(function () {
    if (!document.getElementById('dhsheet-client-startup') || document.documentElement.getAttribute('data-dhsheet-client') === 'ready') return;
    panel = document.createElement('section');
    panel.id = 'dhsheet-startup-notice';
    panel.setAttribute('role', 'alert');
    panel.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);box-sizing:border-box;width:90%;max-width:520px;max-height:90vh;overflow:auto;padding:24px;background:#fff;color:#292929;border:1px solid #ccc;border-top:4px solid #873e3e;border-radius:10px;box-shadow:0 12px 60px #0004;z-index:99999;font:16px/1.7 sans-serif;';
    panel.innerHTML = '<h2 style="margin:0 0 12px;font-size:22px">页面启动未完成</h2>' +
      '<p>浏览器可能未能加载或运行页面脚本。请先刷新；若仍停在这里，请尝试更新浏览器或换用能正常打开的浏览器。</p>' +
      '<p>请勿清除网站数据，以免丢失保存在此浏览器中的角色存档。</p>' +
      '<button type="button" style="min-height:44px;padding:8px 18px;background:#873e3e;color:white;border:0;border-radius:6px;font-size:16px">重新加载页面</button>' +
      '<details style="margin-top:16px"><summary style="cursor:pointer">技术信息（可长按复制）</summary><textarea readonly aria-label="启动诊断信息" style="box-sizing:border-box;width:100%;height:140px;margin-top:10px;font:12px/1.5 monospace"></textarea></details>';
    panel.querySelector('button').onclick = function () { window.location.reload(); };
    panel.querySelector('textarea').value = 'STARTUP_TIMEOUT\n' + (failure || 'No script error captured') + '\n' +
      'Browser: ' + navigator.userAgent + '\n' + 'Page: ' + window.location.origin + window.location.pathname;
    document.body.appendChild(panel);
  }, 15000);
}());
