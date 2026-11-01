import { callModel, getProvider, parseJson } from "../lib/providers.js";
import { authorized } from "../lib/auth.js";
import { stripDashes } from "./generate.js";

const MAX_IMAGE_CHARS = 6_000_000; // about 4.4 MB of base64
const KEYS = ["subject", "hair", "face", "top", "neckwear", "gloves", "belt", "bottoms", "footwear"];
const CAP = 220;

// Safety net: the client joins values with commas, so a value with commas reads badly.
function dropCommas(s) {
  const parts = s.split(/\s*,\s*(?:and\s+)?/).map(x => x.trim()).filter(Boolean);
  if (parts.length < 2) return s;
  if (parts.length === 2) return parts.join(" and ");
  return parts[0] + " with " + parts.slice(1, -1).join(" and ") + " and " + parts[parts.length - 1];
}

const SYSTEM = `You are a character designer writing a wardrobe and appearance breakdown for a character turnaround sheet.
Describe only what is visible or stated. Where the photo or description does not show something (for example footwear on a waist-up photo), invent something plausible and consistent with the rest of the outfit and description.
If the input is a photo of a real person, describe appearance neutrally. Do not name anyone, do not guess identity, and an age range is fine.
Each value is ONE short noun phrase of at most about 12 words, with NO commas. Join details with "with" or "and", for example "a camel trench coat with wide lapels over a charcoal blazer". Include colors and materials. Never use dashes of any kind (no em dashes, en dashes or hyphen separators).
Wardrobe values start with "a" or "an", or with a plural noun, whichever reads naturally.
Never mention items that are absent (never write "no tie"). Leave a key as an empty string only if it truly cannot apply.
Return one JSON object only, with these string keys:
subject: who or what the character is, as a short noun phrase with build and age range (for example "a man in his thirties with an athletic build"). Weave in the user's description (role or genre) naturally, not as a clause after a comma
hair: hair style and color
face: face shape, skin, makeup and facial features
top: top or jacket
neckwear: neckwear and accessories
gloves: gloves or handwear
belt: belt and waist details
bottoms: pants or bottoms
footwear: footwear
No markdown, no commentary.`;

export default async function handler(req, res) {
  res.setHeader("cache-control", "no-store");
  if (req.method !== "POST") return res.status(405).json({ error: "Use POST." });
  if (!(await authorized(req))) return res.status(401).json({ error: "Access key missing or incorrect." });

  const { provider = "claude", description = "", image = "" } = req.body || {};
  const p = getProvider(provider);
  if (!p) return res.status(400).json({ error: `Unknown provider "${provider}".` });
  if (!p.configured) return res.status(400).json({ error: `${p.label} isn't configured on the server. Add ${p.keyVar}.` });
  const desc = String(description || "").trim().slice(0, 2000);
  if (!desc && !image) return res.status(400).json({ error: "Describe the character or add a photo." });
  if (image && image.length > MAX_IMAGE_CHARS) return res.status(413).json({ error: "That image is too large. Use one under 4 MB." });

  const model = image ? p.models.deep : p.models.quick;
  const started = Date.now();

  try {
    const text = (desc ? `Character description from the user:\n${desc}\n\n` : "") +
      (image ? "A reference photo of the subject is attached.\n\n" : "") +
      "Return the JSON object now.";
    const raw = await callModel(provider, model, SYSTEM, text, image ? [image] : []);
    const o = parseJson(raw) || {};
    const fields = {};
    for (const k of KEYS) fields[k] = dropCommas(stripDashes(o[k])).slice(0, CAP).trim();

    res.status(200).json({
      fields,
      meta: { provider: p.label, model, seconds: Math.round((Date.now() - started) / 100) / 10 }
    });
  } catch (e) {
    console.error("character failed:", e);
    res.status(e.status === 400 ? 400 : e.status ? 502 : 500).json({ error: e.message || "Couldn't fill the fields." });
  }
}
