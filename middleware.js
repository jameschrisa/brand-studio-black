// Vercel Routing Middleware: site password gate. See lib/gate.js.
// Returning undefined lets the request continue to the static file or function.
import { gateEnabled, handleGate } from "./lib/gate.js";

export const config = { matcher: "/:path*" };

export default async function middleware(request) {
  if (!gateEnabled(process.env)) return;
  const res = await handleGate(request, process.env.SITE_PASSWORD.trim());
  if (res) return res;
}
