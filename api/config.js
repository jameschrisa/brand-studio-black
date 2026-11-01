import { providerList } from "../lib/providers.js";
import { gateEnabled } from "../lib/gate.js";
import { authRequired, signedIn } from "../lib/auth.js";

export default async function handler(req, res) {
  const guest = await signedIn(req);
  res.setHeader("cache-control", "no-store");
  res.status(200).json({
    authRequired: guest ? false : authRequired(),
    gate: gateEnabled(process.env),
    screenshot: String(process.env.ENABLE_SCREENSHOT).toLowerCase() === "true",
    providers: providerList().map(({ id, label, configured, models }) => ({ id, label, configured, models }))
  });
}
