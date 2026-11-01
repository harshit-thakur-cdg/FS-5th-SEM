"use strict";
// No npm dependencies: Node serves the frontend and forwards API requests to Spring Boot.
const http = require('node:http');
const https = require('node:https');
const fs = require('node:fs');
const path = require('node:path');
const { pipeline } = require('node:stream');

const port = Number(process.env.FRONTEND_PORT || 3000);
const host = process.env.FRONTEND_HOST || '127.0.0.1';
const target = new URL(process.env.API_TARGET || 'http://127.0.0.1:8080');

if (!['http:', 'https:'].includes(target.protocol)) {
  throw new Error('API_TARGET must be HTTP or HTTPS');
}

const root = path.resolve(__dirname, 'public');
const mime = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.json': 'application/json; charset=utf-8'
};

function json(res, status, message) {
  if (!res.headersSent) {
    res.writeHead(status, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message }));
  } else {
    res.destroy();
  }
}

const server = http.createServer((req, res) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Cache-Control', 'no-store');

  let pathname;
  try {
    pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  } catch {
    return json(res, 400, 'Invalid request URL');
  }

  if (pathname === '/api' || pathname.startsWith('/api/') || pathname === '/actuator/health') {
    const headers = { ...req.headers, host: target.host };
    delete headers.connection;
    const transport = target.protocol === 'https:' ? https : http;
    const upstream = transport.request({
      protocol: target.protocol,
      hostname: target.hostname,
      port: target.port,
      path: req.url,
      method: req.method,
      headers
    }, reply => {
      res.writeHead(reply.statusCode, reply.headers);
      pipeline(reply, res, () => {});
    });

    upstream.setTimeout(10000, () => upstream.destroy(new Error('Backend timeout')));
    upstream.on('error', () => json(res, 502, 'Backend unavailable. Ensure Spring Boot is running on port 8080, then refresh.'));
    req.on('aborted', () => upstream.destroy());
    req.pipe(upstream);
    return;
  }

  if (!['GET', 'HEAD'].includes(req.method)) {
    res.setHeader('Allow', 'GET, HEAD');
    return json(res, 405, 'Method not allowed');
  }

  const file = path.resolve(root, '.' + (pathname === '/' ? '/index.html' : pathname));
  if (!file.startsWith(root + path.sep) || pathname.includes('\0')) {
    return json(res, 403, 'Forbidden');
  }

  fs.stat(file, (error, stat) => {
    if (error || !stat.isFile()) {
      return json(res, 404, 'File not found');
    }
    res.writeHead(200, {
      'Content-Type': mime[path.extname(file)] || 'application/octet-stream',
      'Content-Length': stat.size
    });
    if (req.method === 'HEAD') return res.end();
    pipeline(fs.createReadStream(file), res, () => {});
  });
});

server.on('error', error => {
  console.error('Frontend server failed to start:', error.message);
  process.exit(1);
});

server.listen(port, host, () => {
  console.log('\n======================================================');
  console.log('  CanaryDock | Harshit Thakur | UID: 23BAI70435');
  console.log(`  Frontend Console: http://localhost:${port}`);
  console.log(`  Backend Upstream: ${target.origin}`);
  console.log('======================================================\n');
});
