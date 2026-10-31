import { providerList } from "../lib/providers.js";
import { authRequired } from "../lib/auth.js";

export default function handler(req, res) {
  res.setHeader("cache-control", "no-store");
  res.status(200).json({
    authRequired: authRequired(),
    screenshot: String(process.env.ENABLE_SCREENSHOT).toLowerCase() === "true",
    providers: providerList().map(({ id, label, configured, models }) => ({ id, label, configured, models }))
  });
}
