// Site password gate. Web APIs only, so it runs in Vercel Routing Middleware and in Node 20+.
// The password lives only in the SITE_PASSWORD environment variable.
const COOKIE = "bps_gate";
const LABEL = "bps-gate-v1";
const MAX_AGE = 2592000;
const enc = new TextEncoder();

export function gateEnabled(env) {
  return Boolean(env && typeof env.SITE_PASSWORD === "string" && env.SITE_PASSWORD.trim());
}

export async function tokenFor(password) {
  const key = await globalThis.crypto.subtle.importKey("raw", enc.encode(String(password)), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await globalThis.crypto.subtle.sign("HMAC", key, enc.encode(LABEL));
  return [...new Uint8Array(sig)].map(b => b.toString(16).padStart(2, "0")).join("");
}

function same(a, b) {
  const x = String(a), y = String(b);
  let diff = x.length ^ y.length;
  const n = Math.max(x.length, y.length);
  for (let i = 0; i < n; i++) diff |= (x.charCodeAt(i) || 0) ^ (y.charCodeAt(i) || 0);
  return diff === 0;
}

function readCookie(header, name) {
  for (const part of String(header || "").split(";")) {
    const i = part.indexOf("=");
    if (i > -1 && part.slice(0, i).trim() === name) return part.slice(i + 1).trim();
  }
  return "";
}

export async function hasValidCookie(cookieHeader, password) {
  if (!password) return false;
  const got = readCookie(cookieHeader, COOKIE);
  if (!got) return false;
  return same(got, await tokenFor(password));
}

function cookieHeader(value, maxAge, secure) {
  return `${COOKIE}=${value}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${secure ? "; Secure" : ""}`;
}

const MARK = '<svg class="mark" viewBox="0 0 24 24" aria-hidden="true"><rect width="24" height="24" rx="5" fill="#000"/><clipPath id="bpsmk"><rect x="0" y="5.6" width="24" height="12.8"/></clipPath><g clip-path="url(#bpsmk)" fill="none" stroke="#E5B76A" stroke-width="2.9" stroke-miterlimit="10"><path d="M4 4.4 17.6 12 4 19.6"/><path d="M20 4.4 6.4 12 20 19.6"/></g></svg>';

export function loginPage({ error } = {}) {
  const err = error ? `<p class="err" role="alert">${String(error).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]))}</p>` : "";
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>Brand Prompt Studio</title>
<meta name="color-scheme" content="light">
<meta name="robots" content="noindex">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600&display=swap" rel="stylesheet">
<style>
:root{--bg:#ffffff;--bg-2:#fafafa;--line:#ebebeb;--line-2:#d9d9d9;--fg:#000000;--fg-2:#4d4d4d;--fg-3:#8f8f8f;--blue:#0070f3;--red:#c4132f;--sans:"Geist",-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif}
*,*::before,*::after{box-sizing:border-box}
html,body{margin:0;min-height:100%;background:var(--bg);color:var(--fg);font-family:var(--sans);font-size:14px;line-height:1.5;-webkit-font-smoothing:antialiased}
body{min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px 16px}
button,input{font:inherit;color:inherit}
:focus-visible{outline:2px solid var(--blue);outline-offset:2px;border-radius:6px}
.card{width:100%;max-width:380px;border:1px solid var(--line);border-radius:12px;padding:28px 24px;background:var(--bg)}
.mark{width:36px;height:36px;display:block;margin-bottom:16px}
h1{font-size:22px;line-height:1.2;letter-spacing:-.03em;font-weight:600;margin:0 0 6px}
p{margin:0 0 20px;color:var(--fg-2)}
label{display:block;font-weight:500;margin-bottom:6px}
input[type=password]{width:100%;height:40px;padding:0 12px;border:1px solid var(--line-2);border-radius:8px;background:var(--bg)}
input[type=password]:focus{border-color:var(--blue)}
button{width:100%;height:40px;margin-top:14px;border:0;border-radius:8px;background:#000;color:#fff;font-weight:500;cursor:pointer}
button:hover{background:#222}
.err{color:var(--red);margin:10px 0 0;font-size:13px}
</style>
</head>
<body>
<main class="card">
  ${MARK}
  <h1>Brand Prompt Studio</h1>
  <p>Enter the guest password to continue.</p>
  <form method="post" action="/login">
    <label for="password">Password</label>
    <input id="password" name="password" type="password" autocomplete="current-password" autofocus required>
    ${err}
    <button type="submit">Enter</button>
  </form>
</main>
</body>
</html>`;
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

function html(body, status) {
  return new Response(body, { status, headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" } });
}

// Returns a Response to send, or null to let the request through.
export async function handleGate(request, password) {
  const url = new URL(request.url);
  const path = url.pathname;
  const secure = !(url.protocol === "http:" && (url.hostname === "localhost" || url.hostname === "127.0.0.1"));
  const method = request.method.toUpperCase();
  const authed = await hasValidCookie(request.headers.get("cookie"), password);

  if (path === "/logout") {
    return new Response(null, { status: 303, headers: { location: "/login", "set-cookie": cookieHeader("", 0, secure), "cache-control": "no-store" } });
  }
  if (path === "/login") {
    if (method === "POST") {
      let given = "";
      try { given = new URLSearchParams(await request.text()).get("password") || ""; } catch {}
      const ok = same(await tokenFor(given), await tokenFor(password));
      if (ok) {
        return new Response(null, { status: 303, headers: { location: "/", "set-cookie": cookieHeader(await tokenFor(password), MAX_AGE, secure), "cache-control": "no-store" } });
      }
      await sleep(400);
      return html(loginPage({ error: "That password is not right. Try again." }), 401);
    }
    if (authed) return new Response(null, { status: 303, headers: { location: "/", "cache-control": "no-store" } });
    return html(loginPage(), 200);
  }
  if (authed) return null;
  if (path === "/favicon.svg" && (method === "GET" || method === "HEAD")) return null;
  if (path.startsWith("/api/") || path === "/api" || method !== "GET") {
    return new Response(JSON.stringify({ error: "Sign in first." }), { status: 401, headers: { "content-type": "application/json", "cache-control": "no-store" } });
  }
  return html(loginPage(), 401);
}
