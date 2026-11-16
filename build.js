// Сборка: склеивает src/app/*.js (по порядку номеров) в js/app.js.
// Код не меняется, только объединяется внутри одной функции, как раньше.
// Запуск: node build.js   (проверка без записи: node build.js --check)
const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, 'src', 'app');
const parts = fs.readdirSync(dir).filter(f => f.endsWith('.js')).sort();
const body = parts.map(f => fs.readFileSync(path.join(dir, f), 'utf8')).join('');
const out = "/* ФАЙЛ СОБИРАЕТСЯ АВТОМАТИЧЕСКИ из src/app/*.js командой: node build.js. Правьте исходники в src/app, а не этот файл. */\n(function(){\n'use strict';\n" + body + '})();\n';
const target = path.join(__dirname, 'js', 'app.js');
if (process.argv.includes('--check')) {
  const cur = fs.existsSync(target) ? fs.readFileSync(target, 'utf8') : '';
  if (cur !== out) { console.error('js/app.js не совпадает с src/app. Запустите: node build.js'); process.exit(1); }
  console.log('js/app.js актуален (' + parts.length + ' файлов)');
} else {
  fs.writeFileSync(target, out);
  console.log('Собрано js/app.js из ' + parts.length + ' файлов, ' + out.split('\n').length + ' строк');
}
