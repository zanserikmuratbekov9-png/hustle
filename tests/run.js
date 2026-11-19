// Проверки сайта HUSTLE. Запуск: npm test
// Что проверяется: сборка актуальна, политика безопасности без 'unsafe-inline' для скриптов,
// сайт открывается без ошибок, демо-проект загружается, все основные инструменты открываются,
// на телефоне работает левое меню и переключатель ролей.
const { chromium, devices } = require('playwright');
const { execSync } = require('child_process');
const fs = require('fs'), path = require('path');
const { start } = require('./server');

let fails = 0;
const ok = (c, msg) => { if (c) console.log('  ✓ ' + msg); else { fails++; console.log('  ✗ ' + msg); } };

// шум, не связанный с кодом сайта: внешние шрифты Google могут быть недоступны там, где запущен тест
const noise = t => /fonts\.g(oogleapis|static)|ERR_TUNNEL|ERR_NAME_NOT_RESOLVED|ERR_INTERNET_DISCONNECTED|Failed to load resource/.test(t);

async function enterDemo(page) {
  await page.evaluate(() => { const b = document.createElement('button'); b.dataset.c = 'landDemo'; document.body.appendChild(b); b.click(); });
  await page.waitForTimeout(600);
  await page.evaluate(() => document.querySelectorAll('#tourM,.onb').forEach(e => { e.hidden = true; e.style.display = 'none'; }));
}
const openTab = (page, k) => page.evaluate(k => { const b = document.createElement('button'); b.dataset.c = 'tab'; b.dataset.k = k; document.body.appendChild(b); b.click(); b.remove(); }, k);

(async () => {
  console.log('Сборка и заголовки');
  try { execSync('node build.js --check', { cwd: path.join(__dirname, '..'), stdio: 'pipe' }); ok(true, 'js/app.js собран из src/app'); }
  catch (e) { ok(false, 'js/app.js не совпадает с src/app (запустите: node build.js)'); }
  const hdr = fs.readFileSync(path.join(__dirname, '..', '_headers'), 'utf8');
  const scriptSrc = (hdr.match(/script-src[^;]*/) || [''])[0];
  ok(!/unsafe-inline|unsafe-eval/.test(scriptSrc), "script-src без 'unsafe-inline' и 'unsafe-eval'");
  ok(/Strict-Transport-Security/.test(hdr), 'включён HSTS');
  const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
  ok(!/<script>(?!\s*<\/script>)/.test(html), 'в index.html нет встроенных скриптов');
  ok(!/\bon(click|error|load)=/.test(html), 'в index.html нет inline-обработчиков');
  const cfg = fs.readFileSync(path.join(__dirname, '..', 'config.js'), 'utf8');
  ok(!/service_role|sb_secret|eyJ[A-Za-z0-9_-]{30,}\.[A-Za-z0-9_-]{30,}\./.test(cfg), 'в config.js нет секретных ключей');

  const { srv, url } = await start(0);
  const browser = await chromium.launch();
  try {
    for (const [label, ctxOpts] of [['Компьютер', { viewport: { width: 1280, height: 800 } }], ['Телефон', devices['iPhone 13']]]) {
      console.log(label);
      const ctx = await browser.newContext(ctxOpts), page = await ctx.newPage();
      const errs = [], reports = [];
      // облако в тестах не используется: запросы к Supabase перехватываются, ошибки в настоящую базу не уходят
      await ctx.route(/supabase\.co/, route => {
        if (/client_errors/.test(route.request().url())) { try { reports.push(JSON.parse(route.request().postData() || '{}')); } catch (e) { reports.push({}); } return route.fulfill({ status: 201, body: '' }); }
        return route.abort();
      });
      page.on('pageerror', e => errs.push('JS: ' + e.message));
      page.on('console', m => { if (m.type() === 'error' && !noise(m.text())) errs.push('console: ' + m.text()); });
      page.on('response', r => { if (r.status() >= 400 && r.url().startsWith(url.replace(/index\.html$/, ''))) errs.push(r.status() + ' ' + r.url()); });
      await page.goto(url); await page.waitForTimeout(700);
      ok(/Снимайте кино командой/.test(await page.innerText('body')), 'лендинг открывается');
      await enterDemo(page);
      ok(/Ночной эфир/.test(await page.innerText('main')), 'демо-проект «Ночной эфир» загружен');
      for (const k of ['home', 'proj', 'script', 'explic', 'kpp', 'budget', 'shots', 'lights', 'callsheet', 'today', 'tasks', 'rentals']) {
        await openTab(page, k); await page.waitForTimeout(200);
        const t = (await page.innerText('main')).trim();
        ok(t.length > 40, 'страница «' + k + '» открывается');
      }
      if (label === 'Телефон') {
        await openTab(page, 'proj');
        await page.click('#menuBtn'); await page.waitForTimeout(350);
        ok(await page.isVisible('.top .tns[data-k="budget"]'), 'левое меню выезжает и показывает инструменты');
        await page.click('.top .rs[data-k="operator"]'); await page.waitForTimeout(300);
        ok(await page.isVisible('.top .tns[data-k="lights"]'), 'смена роли на «Оператор» открывает Светосхему в меню');
        await page.click('.top .tns[data-k="lights"]'); await page.waitForTimeout(400);
        ok(!(await page.evaluate(() => document.body.classList.contains('navopen'))), 'меню закрывается после выбора инструмента');
        ok(await page.isVisible('.lt-mode'), 'на телефоне есть переключатель «План / 3D»');
      } else {
        await page.evaluate(() => { const b = document.createElement('button'); b.dataset.c = 'role'; b.dataset.k = 'director'; document.body.appendChild(b); b.click(); });
        await page.waitForTimeout(300);
        ok((await page.getAttribute('.rs[data-k="director"]', 'aria-pressed')) === 'true', 'переключатель роли в левом меню работает');
      }
      if (label === 'Компьютер') {
        await page.evaluate(() => { location.hash = 'join=SECRETTOKEN1234567890abc'; setTimeout(() => { throw new Error('тестовая-ошибка-мониторинга'); }, 0); });
        await page.waitForTimeout(500);
        errs.length = 0; // тестовая ошибка ожидаема
        const r = reports.find(x => /тестовая-ошибка/.test(x.message || ''));
        ok(!!r, 'ошибка сайта уходит в журнал client_errors');
        ok(r && !JSON.stringify(r).includes('SECRETTOKEN') && !/[#?]/.test(r.page || ''), 'в журнал не попадают токены из адреса (# и ?)');
        ok(r && r.version && r.ua, 'в записи есть версия сайта и браузер');
      }
      ok(errs.length === 0, 'нет ошибок в консоли и недостающих файлов' + (errs.length ? ': ' + [...new Set(errs)].slice(0, 4).join(' | ') : ''));
      await ctx.close();
    }
  } finally { await browser.close(); srv.close(); }
  console.log(fails ? '\nПровалено проверок: ' + fails : '\nВсе проверки пройдены');
  process.exit(fails ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
