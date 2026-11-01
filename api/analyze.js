import { callModel, getProvider, parseJson } from "../lib/providers.js";
import { readSite } from "../lib/site.js";
import { SYSTEM, buildUserText } from "../lib/brief.js";
import { authorized } from "../lib/auth.js";

const MAX_IMAGE_CHARS = 6_000_000; // about 4.4 MB of base64

export default async function handler(req, res) {
  res.setHeader("cache-control", "no-store");
  if (req.method !== "POST") return res.status(405).json({ error: "Use POST." });
  if (!(await authorized(req))) return res.status(401).json({ error: "Access key missing or incorrect." });

  const { provider = "claude", depth = "quick", url = "", image = "", notes = "" } = req.body || {};
  const p = getProvider(provider);
  if (!p) return res.status(400).json({ error: `Unknown provider "${provider}".` });
  if (!p.configured) return res.status(400).json({ error: `${p.label} isn't configured on the server. Add ${p.keyVar}.` });
  if (!url && !image) return res.status(400).json({ error: "Add a URL or an image to analyze." });
  if (image && image.length > MAX_IMAGE_CHARS) return res.status(413).json({ error: "That image is too large. Use one under 4 MB." });

  const model = depth === "deep" ? p.models.deep : p.models.quick;
  const started = Date.now();

  try {
    const site = url ? await readSite(url) : null;
    const images = [];
    if (image) images.push(image);
    if (site?.screenshot) images.push(site.screenshot);

    const text = buildUserText({ site, notes: String(notes).slice(0, 1000), hasImage: images.length > 0, depth });
    const raw = await callModel(provider, model, SYSTEM, text, images);
    const profile = parseJson(raw);

    res.status(200).json({
      profile,
      meta: {
        provider: p.label,
        model,
        seconds: Math.round((Date.now() - started) / 100) / 10,
        source: site ? site.url : "image",
        usedScreenshot: Boolean(site?.screenshot),
        cssColors: site ? site.colors.slice(0, 8).map(c => c.hex) : [],
        fonts: site ? site.fonts : []
      }
    });
  } catch (e) {
    console.error("analyze failed:", e);
    res.status(e.status === 400 ? 400 : e.status ? 502 : 500).json({ error: e.message || "Analysis failed." });
  }
}
