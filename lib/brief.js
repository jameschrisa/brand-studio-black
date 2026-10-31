export const STYLES = [
  "Editorial 3D render", "Bold flat graphic", "Cinematic photo", "Minimal studio product shot",
  "Textured collage", "Abstract gradient forms", "Isometric illustration", "Documentary photo"
];

export const SYSTEM = `You are a senior brand strategist and art director. You study a brand's website or imagery and write down its brand essence, visual language, color scheme, and voice so a designer can create new marketing creative that feels unmistakably on-brand.

Rules:
- Describe what is actually there. Do not invent claims, products, or audiences the evidence doesn't support; when you infer, keep it plausible and modest.
- Prefer exact hex values from the supplied CSS data when they exist. When reading colors from an image only, give your best estimate.
- Pick 3 to 6 palette colors and give each a role: background, text, primary, secondary, or accent.
- Write in plain, specific language. No marketing filler such as "innovative", "seamless", "cutting-edge", or "elevate".
- Return only one JSON object matching the schema. No prose, no markdown fences.

Schema:
{
  "brandName": string,
  "personality": string,            // exactly 3 adjectives, comma separated
  "audience": string,               // who they serve and what those people care about, one sentence
  "essence": string,                // the brand's core idea and feeling, 1 to 2 sentences
  "voice": {
    "summary": string,              // how the brand sounds, one sentence
    "traits": string[],             // 3 to 5 short traits, e.g. "plainspoken", "dry wit"
    "doSay": string[],              // 2 to 4 example phrases in the brand's voice
    "avoid": string[]               // 2 to 4 things the voice never does
  },
  "palette": [ { "name": string, "hex": "#rrggbb", "role": string } ],
  "typography": string,             // typefaces or their character, weight, case, spacing
  "style": string,                  // choose the closest of: ${STYLES.join(", ")}; or a short custom phrase if none fit
  "mood": string,                   // 2 to 4 words
  "motif": string,                  // a recurring visual device, or "" if none
  "imagery": string,                // what the photography or illustration shows and how it is treated
  "composition": string,            // layout habits: whitespace, alignment, density, grid
  "adjectives": string[],           // 4 to 6 single-word visual descriptors
  "avoid": string,                  // visual clichés that would feel off-brand, comma separated
  "camera": { "mode": "photo" | "render" | "graphic", "shot": string, "lens": string, "light": string },
  "notes": string                   // one sentence on confidence or what the evidence lacked
}`;

export function buildUserText({ site, notes, hasImage, depth }) {
  const parts = [];
  if (site) {
    parts.push(`Analyze the website at ${site.url}.`);
    if (site.screenshot) parts.push("The attached image is a screenshot of the top of the page.");
    parts.push("", "PAGE DATA");
    parts.push(`Title: ${site.title || "(none)"}`);
    if (site.siteName) parts.push(`Site name: ${site.siteName}`);
    if (site.description) parts.push(`Description: ${site.description}`);
    if (site.themeColor) parts.push(`Theme color: ${site.themeColor}`);
    if (site.headings.length) parts.push(`Headings: ${site.headings.join(" | ")}`);
    if (site.ctas.length) parts.push(`Buttons and short links: ${site.ctas.join(" | ")}`);
    if (site.fonts.length) parts.push(`Fonts found in CSS: ${site.fonts.join(", ")}`);
    if (site.cssVariables.length) parts.push(`CSS color tokens: ${site.cssVariables.join("; ")}`);
    if (site.colors.length) parts.push(`Most used CSS colors (hex x uses): ${site.colors.map(c => `${c.hex} x${c.uses}`).join(", ")}`);
    parts.push("", "Visible copy (truncated):", site.text);
    parts.push("", "Ignore pure utility colors (pure black, white, grays) unless they clearly define the brand.");
  } else if (hasImage) {
    parts.push("Analyze the attached image. It may be a website screenshot, an ad, packaging, or a social post. Infer the brand behind it.");
  }
  if (notes) parts.push("", `Extra context from the user: ${notes}`);
  if (depth === "deep") parts.push("", "Take extra care with the audience, essence, and voice. Look for what makes this brand different from its category, not what it shares with it.");
  parts.push("", "Return the JSON object now.");
  return parts.join("\n");
}
