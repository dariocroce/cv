/**
 * Anteprima locale del sito generato (nessuna dipendenza).
 * Uso: npm run serve  →  http://localhost:8080/
 * Porta diversa: PORT=3000 npm run serve
 */
import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', 'docs');
const PORT = Number(process.env.PORT) || 8080;
const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.pdf': 'application/pdf',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
};

const server = http.createServer(async (request, response) => {
  try {
    const { pathname } = new URL(request.url, 'http://localhost');
    let file = path.join(ROOT, decodeURIComponent(pathname));
    if (file !== ROOT && !file.startsWith(ROOT + path.sep)) {
      response.writeHead(403).end('Forbidden');
      return;
    }
    let info = await stat(file).catch(() => null);
    if (info && info.isDirectory()) {
      if (!pathname.endsWith('/')) {
        response.writeHead(301, { Location: `${pathname}/` }).end();
        return;
      }
      file = path.join(file, 'index.html');
      info = await stat(file).catch(() => null);
    }
    if (!info) {
      const body = await readFile(path.join(ROOT, '404.html')).catch(() => 'Pagina non trovata');
      response.writeHead(404, { 'Content-Type': TYPES['.html'] }).end(body);
      return;
    }
    response.writeHead(200, {
      'Content-Type': TYPES[path.extname(file).toLowerCase()] || 'application/octet-stream',
      'Cache-Control': 'no-cache',
    });
    response.end(await readFile(file));
  } catch (error) {
    response.writeHead(500).end(String(error));
  }
});

server.listen(PORT, () => {
  console.log(`Anteprima del portfolio: http://localhost:${PORT}/  (Ctrl+C per chiudere)`);
});
