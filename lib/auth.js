// Access control for API calls.
// - SITE_PASSWORD gate: a request carrying a valid sign-in cookie is authorized.
// - ACCESS_KEY: when set, other callers must send it in the x-access-key header.
import { timingSafeEqual } from "node:crypto";
import { gateEnabled, hasValidCookie } from "./gate.js";

export function authRequired() {
  return Boolean(process.env.ACCESS_KEY && process.env.ACCESS_KEY.trim());
}

export async function signedIn(req) {
  if (!gateEnabled(process.env)) return false;
  return hasValidCookie(req.headers.cookie, process.env.SITE_PASSWORD.trim());
}

export async function authorized(req) {
  if (await signedIn(req)) return true;
  if (!authRequired()) return true;
  const sent = String(req.headers["x-access-key"] || "");
  const want = process.env.ACCESS_KEY.trim();
  const a = Buffer.from(sent), b = Buffer.from(want);
  return a.length === b.length && timingSafeEqual(a, b);
}
