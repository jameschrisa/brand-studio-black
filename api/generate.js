import { callModel, getProvider, parseJson } from "../lib/providers.js";
import { authorized } from "../lib/auth.js";

const KINDS = ["hooks", "headlines", "captions"];
const CAP = 1500;

const RULES = `Writing rules:
- Plain, specific, concrete language. Lived detail over abstractions.
- No clichés and no hype words (revolutionary, game-changing, unlock, elevate, seamless, transform, journey, landscape, cutting-edge, delve).
- Never use an em dash, an en dash or a horizontal bar. Use a comma, period or colon.
- No "It's not X, it's Y" or "not just X but Y" frames. State the point.
- No semicolons. No emoji unless the brand voice clearly uses them.
- Write in the brand voice. Do not invent facts, numbers or claims the brand has not given. A specific number is fine only when it comes from the brief.
- Return one JSON object only. No prose, no markdown fences.`;

const clean = v => String(v == null ? "" : v).replace(/[\u2013\u2014\u2015]/g, "-").trim().slice(0, CAP);

// Replace dash characters in model output. A spaced dash becomes a comma, an unspaced one a hyphen.
export function stripDashes(s) {
  return String(s == null ? "" : s)
    .replace(/\s*[\u2014\u2015]\s*/g, ", ")
    .replace(/\s+\u2013\s+/g, ", ")
    .replace(/\u2013/g, "-")
    .replace(/,\s*,/g, ",")
    .replace(/\s+/g, " ")
    .trim();
}

const wc = s => String(s).trim().split(/\s+/).filter(Boolean).length;
const num = (v, d, lo, hi) => { const n = parseInt(v, 10); return Number.isFinite(n) ? Math.min(hi, Math.max(lo, n)) : d; };

function brandBlock(brand, ctx) {
  const rows = [
    ["Brand", brand.name], ["Personality", brand.personality], ["Audience", brand.audience],
    ["Brand essence", brand.essence], ["Brand voice", brand.voice], ["Copy rule", brand.copyRule],
    ["Core message", ctx.message], ["Platform and format", ctx.format], ["Desired reaction", ctx.reaction],
    ["Avoid", brand.avoid]
  ];
  return rows.filter(r => r[1]).map(r => `${r[0]}: ${r[1]}`).join("\n");
}

export function buildPrompt(kind, brand, ctx) {
  const base = brandBlock(brand, ctx);
  if (kind === "hooks") {
    const max = num(ctx.maxWords, 7, 2, 14);
    return {
      max,
      system: `You write opening hooks for short ads and social creatives.\n${RULES}`,
      user: `${base}\n\nWrite 6 hooks. Each is ${max} words or fewer. Each uses a different angle, in this order: curiosity, contrast, bold claim, question, "you" benefit, specific number (only from the brief; if the brief has no number, use a concrete detail instead).\nReturn {"options":["...", "...", "...", "...", "...", "..."]}`
    };
  }
  if (kind === "headlines") {
    const max = num(ctx.maxWords, 5, 2, 10);
    return {
      max,
      system: `You write overlay headlines for images and thumbnails.\n${RULES}`,
      user: `${base}\n${ctx.hook ? `Hook already chosen: ${ctx.hook}\n` : ""}\nWrite 6 overlay headlines. Each is ${max} words or fewer, punchy and readable at thumbnail size. Vary the structure. Do not repeat the hook.\nReturn {"options":["...", "...", "...", "...", "...", "..."]}`
    };
  }
  const dur = num(ctx.duration, 8, 2, 60);
  const lineCount = num(Math.round(dur / 1.5), 5, 3, 10);
  let perLine = "a full natural line, up to 9 words";
  let maxWords = 9;
  const words = ctx.words;
  if (words === "1-3") { perLine = "1 to 3 words"; maxWords = 3; }
  else if (words === "4-6") { perLine = "4 to 6 words"; maxWords = 6; }
  else if (words === "Full line") { perLine = "a full natural line, up to 9 words"; }
  else if (ctx.styleWords) { perLine = `the caption style's own pacing (${ctx.styleWords})`; }
  const caseRule = ctx.case === "ALL CAPS" ? "Write every line in ALL CAPS." : ctx.case === "Sentence case" ? "Write every line in sentence case." : "Use natural capitalization.";
  return {
    max: maxWords, lineCount,
    system: `You write on-screen captions for short-form video.\n${RULES}`,
    user: `${base}\n${ctx.scene ? `Scene: ${ctx.scene}\n` : ""}${ctx.captionStyle ? `Caption style: ${ctx.captionStyle}${ctx.captionStylePrompt ? `. ${ctx.captionStylePrompt}` : ""}\n` : ""}Aspect ratio: ${ctx.aspect || "9:16"}\nDuration: ${dur} seconds\nWords on screen: ${words || "Style default"}\n${ctx.existing ? `Existing caption text to rewrite and improve:\n${ctx.existing}\n` : ""}\nWrite 3 different caption options. Each option has exactly ${lineCount} lines, one line per beat, ${perLine} per line. ${caseRule} Each option also has "emphasis": at most one key word per line, each word taken exactly from its lines.\nReturn {"options":[{"lines":["..."],"emphasis":["..."]}, {"lines":[...],"emphasis":[...]}, {"lines":[...],"emphasis":[...]}]}`
  };
}

export function shapeOptions(kind, raw, max) {
  const list = Array.isArray(raw?.options) ? raw.options : [];
  if (kind !== "captions") {
    return list.map(stripDashes).filter(s => s && wc(s) <= max).slice(0, 6);
  }
  const out = [];
  for (const o of list) {
    const lines = (Array.isArray(o?.lines) ? o.lines : []).map(stripDashes).filter(Boolean);
    if (!lines.length || lines.some(l => wc(l) > max)) continue;
    const blob = " " + lines.join(" ").toLowerCase().replace(/[^\p{L}\p{N}'\s-]/gu, " ") + " ";
    const seen = new Set();
    const emphasis = (Array.isArray(o?.emphasis) ? o.emphasis : []).map(stripDashes).filter(w => {
      const k = w.toLowerCase();
      if (!w || seen.has(k) || wc(w) !== 1 || !blob.includes(" " + k + " ")) return false;
      seen.add(k); return true;
    });
    out.push({ lines, emphasis });
  }
  return out.slice(0, 3);
}

export default async function handler(req, res) {
  res.setHeader("cache-control", "no-store");
  if (req.method !== "POST") return res.status(405).json({ error: "Use POST." });
  if (!(await authorized(req))) return res.status(401).json({ error: "Access key missing or incorrect." });

  const { provider = "claude", kind, brand = {}, context = {} } = req.body || {};
  if (!KINDS.includes(kind)) return res.status(400).json({ error: `kind must be one of ${KINDS.join(", ")}.` });
  const p = getProvider(provider);
  if (!p) return res.status(400).json({ error: `Unknown provider "${provider}".` });
  if (!p.configured) return res.status(400).json({ error: `${p.label} isn't configured on the server. Add ${p.keyVar}.` });

  const b = {}, c = {};
  for (const k of ["name", "personality", "audience", "essence", "voice", "copyRule", "avoid"]) b[k] = clean(brand?.[k]);
  for (const k of ["message", "format", "reaction", "hook", "scene", "captionStyle", "captionStylePrompt", "styleWords", "words", "case", "aspect", "existing"]) c[k] = clean(context?.[k]);
  c.maxWords = context?.maxWords; c.duration = context?.duration;

  const { system, user, max } = buildPrompt(kind, b, c);
  const model = p.models.quick;
  const started = Date.now();
  try {
    const raw = parseJson(await callModel(provider, model, system, user, []));
    const options = shapeOptions(kind, raw, max);
    if (!options.length) return res.status(502).json({ error: "The model returned nothing usable. Try again." });
    res.status(200).json({ options, meta: { provider: p.label, model, seconds: Math.round((Date.now() - started) / 100) / 10 } });
  } catch (e) {
    console.error("generate failed:", e);
    res.status(e.status === 400 ? 400 : e.status ? 502 : 500).json({ error: e.message || "Generation failed." });
  }
}
