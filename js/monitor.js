/* Сбор ошибок сайта в таблицу client_errors (см. supabase/monitoring.sql).
   Отправляется только техническое описание: текст ошибки, файл, строка, версия, браузер.
   Адрес страницы берётся без # и ?, поэтому токены входа и приглашений никуда не уходят.
   Работает, только если в config.js заполнены адрес и публичный ключ Supabase. */
(function () {
  'use strict';
  var C = window.HUSTLE_CONFIG || {};
  var VERSION = '20261116';
  window.HUSTLE_VERSION = VERSION;
  if (!C.SUPABASE_URL || !C.SUPABASE_KEY) return;
  var sent = 0, seen = {};
  var SKIP = /ResizeObserver loop|^Script error\.?$|extension:\/\/|Non-Error promise rejection|NetworkError|Failed to fetch|Load failed|The operation was aborted/i;
  function short(s, n) { s = String(s == null ? '' : s); return s.length > n ? s.slice(0, n) : s; }
  function file(u) { try { return String(u || '').split('?')[0].split('#')[0].split('/').pop(); } catch (e) { return ''; } }
  function clean(stack) { return short(String(stack || '').replace(/https?:\/\/[^\s)]+\//g, '').replace(/[?#][^\s)]*/g, ''), 1800); }
  function report(msg, src, line, col, stack) {
    try {
      msg = short(msg, 480);
      if (!msg || SKIP.test(msg) || SKIP.test(String(src || ''))) return;
      var key = msg + '|' + file(src) + '|' + line;
      if (seen[key] || sent >= 5) return;
      seen[key] = 1; sent++;
      fetch(C.SUPABASE_URL + '/rest/v1/client_errors', {
        method: 'POST',
        headers: { apikey: C.SUPABASE_KEY, Authorization: 'Bearer ' + C.SUPABASE_KEY, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
        body: JSON.stringify({ message: msg, source: short(file(src), 190), line: line | 0, col: col | 0, stack: clean(stack), page: short(location.pathname, 90), ua: short(navigator.userAgent, 290), version: VERSION }),
        keepalive: true
      }).catch(function () {});
    } catch (e) { /* мониторинг не должен ломать сайт */ }
  }
  window.addEventListener('error', function (e) {
    if (e.target && e.target !== window) return; // ошибки загрузки картинок и файлов сюда не входят
    report(e.message, e.filename, e.lineno, e.colno, e.error && e.error.stack);
  });
  window.addEventListener('unhandledrejection', function (e) {
    var r = e.reason;
    report('Promise: ' + (r && r.message ? r.message : r), '', 0, 0, r && r.stack);
  });
})();
