/* ES5 by design: this must run even if an older engine rejects the app bundle. */
(function () {
  var failure = '';
  var panel;
  var loaded = {};
  function appScript(node) {
    return node && node.tagName === 'SCRIPT' && node.src && node.src.indexOf('/_next/static/') !== -1;
  }
  window.addEventListener('load', function (event) {
    if (appScript(event.target)) {
      loaded[event.target.src] = true;
      refreshPanel();
    }
  }, true);
  function refreshPanel() {
    if (!panel) return;
    var scripts = document.getElementsByTagName('script');
    var pending = [], total = 0;
    for (var i = 0; i < scripts.length; i++) {
      var node = scripts[i];
      if (!appScript(node) || (node.noModule && 'noModule' in document.createElement('script'))) continue;
      total++;
      if (!loaded[node.src]) pending.push(node.src.split('?')[0].split('/').pop());
    }
    panel.querySelector('h2').textContent = failure ? '页面启动遇到错误' : '车卡器仍在启动';
    panel.querySelector('p').textContent = failure
      ? '页面脚本加载或运行失败。可以重新获取最新版页面。'
      : '下载页面脚本可能需要一些时间。你可以继续等待，启动后这条提示会自动关闭。若长时间没有进展，可以重新加载页面。';
    panel.querySelector('textarea').value = (failure || 'STARTUP_WAITING') +
      '\nApp scripts loaded: ' + (total - pending.length) + '/' + total +
      (pending.length ? '\nAwaiting load event: ' + pending.join(', ') : '') +
      '\nBrowser: ' + navigator.userAgent + '\nPage: ' + window.location.origin + window.location.pathname;
  }
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
    refreshPanel();
  }, true);
  window.addEventListener('unhandledrejection', function (event) {
    if (!failure) failure = 'UNHANDLED_REJECTION: ' + describeError(event.reason);
    refreshPanel();
  });
  function removePanel() {
    if (panel && panel.parentNode) panel.parentNode.removeChild(panel);
    panel = null;
  }
  // Handle recovery before the app can intercept clicks during hydration.
  window.addEventListener('click', function (event) {
    if (panel && event.target === panel.querySelector('a') && !event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey) {
      event.preventDefault();
      window.location.replace(event.target.href);
    }
  }, true);
  window.addEventListener('dhsheet:client-ready', removePanel);
  window.setTimeout(function () {
    if (!document.getElementById('dhsheet-client-startup') || document.documentElement.getAttribute('data-dhsheet-client') === 'ready') return;
    panel = document.createElement('section');
    panel.id = 'dhsheet-startup-notice';
    panel.setAttribute('role', 'alert');
    panel.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);box-sizing:border-box;width:90%;max-width:520px;max-height:90vh;overflow:auto;padding:24px;background:#fff;color:#292929;border:1px solid #ccc;border-top:4px solid #873e3e;border-radius:10px;box-shadow:0 12px 60px #0004;z-index:99999;font:16px/1.7 sans-serif;';
    panel.innerHTML = '<h2 style="margin:0 0 12px;font-size:22px"></h2><p></p>' +
      '<p>请勿清除网站数据，以免丢失保存在此浏览器中的角色存档。</p>' +
      '<a style="display:inline-block;text-decoration:none;min-height:44px;box-sizing:border-box;padding:8px 18px;background:#873e3e;color:white;border:0;border-radius:6px;font-size:16px">重新加载页面</a>' +
      '<details style="margin-top:16px"><summary style="cursor:pointer">技术信息（可长按复制）</summary><textarea readonly aria-label="启动诊断信息" style="box-sizing:border-box;width:100%;height:140px;margin-top:10px;font:12px/1.5 monospace"></textarea></details>';
    var retry = panel.querySelector('a');
    try {
      var url = new window.URL(window.location.href);
      url.searchParams.set('dhsheet_retry', String(Date.now()));
      retry.href = url.href;
    } catch (_) {
      retry.href = window.location.pathname + (window.location.search || '?') + '&dhsheet_retry=' + Date.now() + (window.location.hash || '');
    }
    refreshPanel();
    document.body.appendChild(panel);
  }, 15000);
}());
