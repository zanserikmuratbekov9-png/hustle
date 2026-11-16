// Локальный сервер для тестов: отдаёт сайт с теми же заголовками безопасности, что и на хостинге (_headers).
const http = require('http'), fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..');
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.ttf': 'font/ttf', '.xml': 'application/xml', '.txt': 'text/plain' };
function start(port = 0) {
  const hdr = fs.readFileSync(path.join(root, '_headers'), 'utf8');
  const csp = (hdr.match(/Content-Security-Policy:\s*(.+)/) || [])[1];
  const srv = http.createServer((q, r) => {
    let u = decodeURIComponent(q.url.split('?')[0]); if (u.endsWith('/')) u += 'index.html';
    const f = path.join(root, u);
    if (!f.startsWith(root) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end('not found'); }
    r.writeHead(200, { 'Content-Type': types[path.extname(f)] || 'application/octet-stream', 'Content-Security-Policy': csp });
    fs.createReadStream(f).pipe(r);
  });
  return new Promise(ok => srv.listen(port, () => ok({ srv, url: 'http://localhost:' + srv.address().port + '/index.html' })));
}
module.exports = { start };
if (require.main === module) start(8765).then(s => console.log(s.url));
