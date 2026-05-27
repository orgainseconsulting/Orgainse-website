/**
 * Node sidecar — wraps the Vercel dispatcher (`/app/api/index.js`) in a
 * native HTTP server so the FastAPI process can reverse-proxy every
 * /api/* call into the SAME code that runs on production Vercel.
 *
 * Listens on 127.0.0.1:${SIDECAR_PORT or 8765}. Started/stopped by the
 * Python entrypoint (server.py) so its lifecycle is bound to uvicorn.
 *
 * This file MUST stay tiny — its only job is to assemble a Vercel-style
 * `req`/`res` object pair and call the dispatcher. All business logic
 * lives in /app/api/_handlers/**.
 */
import http from 'node:http';
import { URL, fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';

const PORT = parseInt(process.env.SIDECAR_PORT || '8765', 10);
const HOST = '127.0.0.1';

// Anchor relative to THIS file (/app/backend/sidecar.mjs) → /app/api/index.js
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dispatcherPath = path.resolve(__dirname, '..', 'api', 'index.js');
const { default: dispatcher } = await import(pathToFileURL(dispatcherPath).href);

function parseQuery(u) {
  const q = {};
  for (const [k, v] of u.searchParams.entries()) {
    if (k in q) {
      q[k] = Array.isArray(q[k]) ? [...q[k], v] : [q[k], v];
    } else {
      q[k] = v;
    }
  }
  return q;
}

function collectBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

function buildVercelRes(rawRes) {
  // Vercel handlers expect chainable res.status(n).json(o) / .send(s) / .end()
  const wrapper = {
    statusCode: 200,
    headersSent: false,
    status(code) { rawRes.statusCode = code; this.statusCode = code; return this; },
    setHeader(k, v) { rawRes.setHeader(k, v); return this; },
    getHeader(k) { return rawRes.getHeader(k); },
    removeHeader(k) { rawRes.removeHeader(k); return this; },
    json(obj) {
      if (!rawRes.getHeader('content-type')) {
        rawRes.setHeader('content-type', 'application/json; charset=utf-8');
      }
      rawRes.end(JSON.stringify(obj));
      return this;
    },
    send(payload) {
      if (payload && typeof payload === 'object' && !Buffer.isBuffer(payload)) {
        return this.json(payload);
      }
      rawRes.end(payload);
      return this;
    },
    end(data) { rawRes.end(data); return this; },
    write(chunk) { return rawRes.write(chunk); },
  };
  return wrapper;
}

const server = http.createServer(async (rawReq, rawRes) => {
  try {
    const u = new URL(rawReq.url || '/', `http://${HOST}:${PORT}`);
    const query = parseQuery(u);

    // Body — only parse JSON for content-type application/json.
    const raw = await collectBody(rawReq);
    let body = undefined;
    const ct = String(rawReq.headers['content-type'] || '');
    if (raw.length > 0) {
      if (ct.includes('application/json')) {
        try { body = JSON.parse(raw.toString('utf8')); }
        catch { body = raw.toString('utf8'); }
      } else if (ct.includes('application/x-www-form-urlencoded')) {
        body = Object.fromEntries(new URLSearchParams(raw.toString('utf8')));
      } else {
        body = raw.toString('utf8');
      }
    }

    const vercelReq = {
      method: rawReq.method,
      url: rawReq.url,
      headers: rawReq.headers,
      query,
      body,
      socket: rawReq.socket,
    };
    const vercelRes = buildVercelRes(rawRes);
    await dispatcher(vercelReq, vercelRes);
    if (!rawRes.writableEnded) rawRes.end();
  } catch (e) {
    console.error('[sidecar] dispatcher error:', e);
    if (!rawRes.headersSent) rawRes.statusCode = 500;
    if (!rawRes.writableEnded) {
      rawRes.setHeader('content-type', 'application/json; charset=utf-8');
      rawRes.end(JSON.stringify({ error: 'sidecar internal error', message: e.message }));
    }
  }
});

server.listen(PORT, HOST, () => {
  console.log(`[sidecar] listening on http://${HOST}:${PORT}`);
});

// Graceful shutdown so the parent (uvicorn) can cleanly kill us.
for (const sig of ['SIGTERM', 'SIGINT']) {
  process.on(sig, () => {
    console.log(`[sidecar] received ${sig}, shutting down`);
    server.close(() => process.exit(0));
    setTimeout(() => process.exit(0), 2000).unref();
  });
}
