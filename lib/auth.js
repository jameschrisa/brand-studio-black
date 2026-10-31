// Optional shared access key. When ACCESS_KEY is set, every API call must send it
// in the x-access-key header, so a deployed copy can't spend your model credits.
import { timingSafeEqual } from "node:crypto";

export function authRequired() {
  return Boolean(process.env.ACCESS_KEY && process.env.ACCESS_KEY.trim());
}

export function authorized(req) {
  if (!authRequired()) return true;
  const sent = String(req.headers["x-access-key"] || "");
  const want = process.env.ACCESS_KEY.trim();
  const a = Buffer.from(sent), b = Buffer.from(want);
  return a.length === b.length && timingSafeEqual(a, b);
}
