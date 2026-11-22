// Static preview server for generated email templates. Run: node email-previews/serve.js
const http = require('http');
const fs = require('fs');
const path = require('path');

const dir = __dirname;
const pages = fs.readdirSync(dir).filter((f) => f.endsWith('.html'));

const indexHtml = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>H&B Trade — Email Previews</title>
<style>body{font-family:'Segoe UI',sans-serif;background:#e2e8f0;margin:0;padding:40px}h1{color:#0f172a}.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:16px}
a.card{display:block;background:#fff;border-radius:12px;padding:18px 20px;text-decoration:none;color:#0f172a;box-shadow:0 4px 14px rgba(15,23,42,.1);transition:transform .15s}
a.card:hover{transform:translateY(-3px)}a.card b{display:block;font-size:15px;margin-bottom:4px}a.card span{color:#64748b;font-size:12px}</style></head>
<body><h1>H&amp;B Trade — Email Template Previews</h1><p style="color:#475569">All ${pages.length} transactional email designs. Click to preview.</p>
<div class="grid">${pages.map((p) => `<a class="card" href="/${p}"><b>${p.replace('.html', '')}</b><span>Open preview &rarr;</span></a>`).join('')}</div></body></html>`;

http
  .createServer((req, res) => {
    let u = decodeURIComponent(req.url.split('?')[0]);
    if (u === '/' || u === '') {
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.end(indexHtml);
    }
    const safe = path.normalize(u).replace(/^(\.\.[/\\])+/, '');
    const filePath = path.join(dir, safe);
    if (!filePath.startsWith(dir) || !fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
      res.statusCode = 404;
      return res.end('Not found');
    }
    res.setHeader('Content-Type', filePath.endsWith('.html') ? 'text/html; charset=utf-8' : 'application/octet-stream');
    res.end(fs.readFileSync(filePath));
  })
  .listen(4577, () => console.log('Email previews: http://localhost:4577'));
