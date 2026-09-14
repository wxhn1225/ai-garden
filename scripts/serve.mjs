import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';

const root = path.resolve('out');
if (!fs.existsSync(path.join(root, 'index.html'))) throw new Error('Run pnpm build before preview.');
const { basePath } = JSON.parse(fs.readFileSync(path.join(root, 'site-config.json'), 'utf8'));
const types = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.mjs': 'text/javascript',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.wasm': 'application/wasm',
  '.txt': 'text/plain; charset=utf-8',
  '.woff2': 'font/woff2',
};
const server = http.createServer((req, res) => {
  try {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    if (basePath && pathname === '/') {
      res.writeHead(302, { Location: `${basePath}/` });
      res.end();
      return;
    }
    if (basePath && pathname !== basePath && !pathname.startsWith(`${basePath}/`)) {
      res.writeHead(404);
      res.end('Not found');
      return;
    }
    const relative = pathname.slice(basePath.length).replace(/^\/+/, '');
    let file = path.resolve(root, relative);
    if (file !== root && !file.startsWith(`${root}${path.sep}`)) {
      res.writeHead(403);
      res.end();
      return;
    }
    if (fs.existsSync(file) && fs.statSync(file).isDirectory()) {
      if (!pathname.endsWith('/')) {
        res.writeHead(301, { Location: `${pathname}/` });
        res.end();
        return;
      }
      file = path.join(file, 'index.html');
    }
    const found = fs.existsSync(file) && fs.statSync(file).isFile();
    if (!found) file = path.join(root, '404.html');
    res.writeHead(found ? 200 : 404, {
      'Content-Type': types[path.extname(file)] || 'application/octet-stream',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
    });
    if (req.method === 'HEAD') res.end();
    else fs.createReadStream(file).pipe(res);
  } catch {
    res.writeHead(400);
    res.end('Bad request');
  }
});
server.listen(Number(process.env.PORT) || 4173, '127.0.0.1', () =>
  console.log(`Preview: http://127.0.0.1:${server.address().port}${basePath}/`),
);
