// Local server: serves /public and runs the same handlers Vercel runs in /api.
// Usage: cp .env.example .env, add a key, then `npm run dev` and open http://localhost:3000
import http from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import { gateEnabled, handleGate } from "./lib/gate.js";

const root = fileURLToPath(new URL("./public/", import.meta.url));
const types = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".svg": "image/svg+xml", ".png": "image/png", ".ico": "image/x-icon", ".json": "application/json" };
const routes = { "/api/analyze": "./api/analyze.js", "/api/config": "./api/config.js" };

function wrap(res) {
  res.status = code => { res.statusCode = code; return res; };
  res.json = obj => { if (!res.getHeader("content-type")) res.setHeader("content-type", "application/json"); res.end(JSON.stringify(obj)); return res; };
  return res;
}

async function readBody(req) {
  const chunks = [];
  let size = 0;
  for await (const c of req) { size += c.length; if (size > 8_000_000) throw new Error("Body too large"); chunks.push(c); }
  const raw = Buffer.concat(chunks).toString("utf8");
  try { return raw ? JSON.parse(raw) : {}; } catch { return {}; }
}

// Same site password gate as middleware.js, applied before routing. Open when SITE_PASSWORD is unset.
async function gate(req, res) {
  if (!gateEnabled(process.env)) return false;
  const host = req.headers.host || "localhost";
  const init = { method: req.method, headers: req.headers };
  if (req.method === "POST" && new URL(req.url, "http://localhost").pathname === "/login") {
    const chunks = [];
    let size = 0;
    for await (const c of req) { size += c.length; if (size > 100_000) break; chunks.push(c); }
    init.body = Buffer.concat(chunks);
  }
  const out = await handleGate(new Request(`http://${host}${req.url}`, init), process.env.SITE_PASSWORD.trim());
  if (!out) return false;
  res.statusCode = out.status;
  const cookies = out.headers.getSetCookie ? out.headers.getSetCookie() : [];
  out.headers.forEach((v, k) => { if (k !== "set-cookie") res.setHeader(k, v); });
  if (cookies.length) res.setHeader("set-cookie", cookies);
  res.end(Buffer.from(await out.arrayBuffer()));
  return true;
}

http.createServer(async (req, res) => {
  const path = new URL(req.url, "http://localhost").pathname;
  try {
    if (await gate(req, res)) return;
    if (routes[path]) {
      req.body = req.method === "POST" ? await readBody(req) : {};
      const mod = await import(routes[path]);
      return await mod.default(req, wrap(res));
    }
    const file = normalize(join(root, path === "/" ? "index.html" : path));
    if (!file.startsWith(root)) { res.statusCode = 403; return res.end(); }
    const data = await readFile(file);
    res.setHeader("content-type", types[extname(file)] || "application/octet-stream");
    res.end(data);
  } catch (e) {
    if (!res.headersSent) { res.statusCode = e.code === "ENOENT" ? 404 : 500; }
    res.end(e.code === "ENOENT" ? "Not found" : "Server error");
    if (e.code !== "ENOENT") console.error(e);
  }
}).listen(process.env.PORT || 3000, () => console.log(`Brand Prompt Studio running at http://localhost:${process.env.PORT || 3000}`));
