// Reads a public web page and returns what a brand analyst would look at:
// copy, headings, exact colors and fonts from the CSS, and (optionally) a screenshot.

const userError = msg => Object.assign(new Error(msg), { status: 400 });

const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Safari/537.36 BrandPromptStudio/1.0";
const MAX_HTML = 1_500_000;
const MAX_CSS = 400_000;

export function validateUrl(raw) {
  let u;
  try { u = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`); }
  catch { throw userError("That doesn't look like a valid URL."); }
  if (!/^https?:$/.test(u.protocol)) throw userError("Only http and https URLs can be analyzed.");
  const h = u.hostname.toLowerCase();
  const privateHost =
    h === "localhost" || h.endsWith(".local") || h.endsWith(".internal") || h === "0.0.0.0" || h === "[::1]" ||
    /^127\./.test(h) || /^10\./.test(h) || /^192\.168\./.test(h) || /^169\.254\./.test(h) ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(h);
  if (privateHost) throw userError("Private and local addresses can't be analyzed.");
  return u;
}

async function fetchText(url, limit, timeoutMs = 10000) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, { headers: { "user-agent": UA, accept: "text/html,text/css,*/*" }, redirect: "follow", signal: ctrl.signal });
    if (!res.ok) throw userError(`The site returned ${res.status}, so it couldn't be read. Try a screenshot instead.`);
    const text = await res.text();
    return { text: text.slice(0, limit), finalUrl: res.url };
  } catch (e) {
    if (e.name === "AbortError") throw userError("The site took too long to respond.");
    throw e;
  } finally { clearTimeout(t); }
}

const decode = s => s.replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&nbsp;/g, " ");
const strip = s => decode(s.replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim();

function meta(html, name) {
  const re = new RegExp(`<meta[^>]+(?:name|property)=["']${name}["'][^>]*>`, "i");
  const tag = (html.match(re) || [])[0];
  if (!tag) return "";
  return decode((tag.match(/content=["']([^"']*)["']/i) || [])[1] || "");
}

function collect(html, tag, max) {
  const out = [];
  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, "gi");
  let m;
  while ((m = re.exec(html)) && out.length < max) {
    const t = strip(m[1]);
    if (t && t.length < 200 && !out.includes(t)) out.push(t);
  }
  return out;
}

function normalizeHex(h) {
  h = h.toLowerCase();
  if (h.length === 4) h = "#" + h.slice(1).split("").map(c => c + c).join("");
  if (h.length === 9) h = h.slice(0, 7); // drop alpha
  return h.length === 7 ? h : null;
}
const toHex = (r, g, b) => "#" + [r, g, b].map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0")).join("");

function extractCss(css) {
  const colors = new Map();
  const bump = (hex, w = 1) => { if (hex) colors.set(hex, (colors.get(hex) || 0) + w); };

  for (const m of css.matchAll(/#(?:[0-9a-f]{8}|[0-9a-f]{6}|[0-9a-f]{3})\b/gi)) bump(normalizeHex(m[0]));
  for (const m of css.matchAll(/rgba?\(\s*(\d{1,3})[\s,]+(\d{1,3})[\s,]+(\d{1,3})/gi)) bump(toHex(+m[1], +m[2], +m[3]));

  // Custom properties are usually the real brand tokens, so weight them higher.
  const vars = [];
  for (const m of css.matchAll(/(--[\w-]+)\s*:\s*(#[0-9a-f]{3,8})\b/gi)) {
    const hex = normalizeHex(m[2]);
    if (hex) { bump(hex, 5); const v = `${m[1]}: ${hex}`; if (vars.length < 25 && !vars.includes(v)) vars.push(v); }
  }

  const fonts = new Map();
  for (const m of css.matchAll(/font-family\s*:\s*([^;}{]+)/gi)) {
    const first = m[1].split(",")[0].replace(/["']/g, "").trim();
    if (first && !/^var\(|inherit|initial|unset/i.test(first)) fonts.set(first, (fonts.get(first) || 0) + 1);
  }
  return { colors, fonts, vars };
}

async function screenshot(url) {
  if (String(process.env.ENABLE_SCREENSHOT).toLowerCase() !== "true") return null;
  let browser;
  try {
    const puppeteer = (await import("puppeteer-core")).default;
    let launch;
    if (process.env.CHROME_PATH) {
      launch = { executablePath: process.env.CHROME_PATH, headless: true, args: ["--no-sandbox"] };
    } else {
      const chromium = (await import("@sparticuz/chromium")).default;
      launch = { executablePath: await chromium.executablePath(), headless: "shell", args: await puppeteer.defaultArgs({ args: chromium.args, headless: "shell" }) };
    }
    browser = await puppeteer.launch({ ...launch, defaultViewport: { width: 1440, height: 900, deviceScaleFactor: 1 } });
    const page = await browser.newPage();
    await page.setUserAgent(UA);
    await page.goto(url, { waitUntil: "networkidle2", timeout: 20000 }).catch(() => {});
    await new Promise(r => setTimeout(r, 800));
    const shot = await page.screenshot({ type: "jpeg", quality: 72, clip: { x: 0, y: 0, width: 1440, height: 1600 }, captureBeyondViewport: true });
    return `data:image/jpeg;base64,${Buffer.from(shot).toString("base64")}`;
  } catch (e) {
    console.warn("Screenshot skipped:", e.message);
    return null;
  } finally {
    if (browser) await browser.close().catch(() => {});
  }
}

export async function readSite(rawUrl) {
  const u = validateUrl(rawUrl);
  const [{ text: html, finalUrl }, shot] = await Promise.all([fetchText(u.href, MAX_HTML), screenshot(u.href)]);

  // Inline styles plus up to five linked stylesheets.
  let css = (html.match(/<style[^>]*>[\s\S]*?<\/style>/gi) || []).join("\n");
  css += "\n" + (html.match(/style=["'][^"']+["']/gi) || []).join(";");
  const links = [...html.matchAll(/<link[^>]+rel=["']?stylesheet["']?[^>]*>/gi)]
    .map(m => (m[0].match(/href=["']([^"']+)["']/i) || [])[1])
    .filter(Boolean)
    .slice(0, 5)
    .map(h => { try { return new URL(decode(h), finalUrl).href; } catch { return null; } })
    .filter(Boolean);
  const sheets = await Promise.allSettled(links.map(h => fetchText(h, MAX_CSS, 6000)));
  sheets.forEach(s => { if (s.status === "fulfilled") css += "\n" + s.value.text; });

  const googleFonts = [...html.matchAll(/fonts\.googleapis\.com\/css2?\?([^"'\s>]+)/gi)]
    .flatMap(m => [...decode(m[1]).matchAll(/family=([^&:]+)/g)].map(f => decodeURIComponent(f[1].replace(/\+/g, " "))));

  const { colors, fonts, vars } = extractCss(css);
  const topColors = [...colors.entries()].sort((a, b) => b[1] - a[1]).slice(0, 14).map(([hex, n]) => ({ hex, uses: n }));
  const topFonts = [...new Set([...googleFonts, ...[...fonts.entries()].sort((a, b) => b[1] - a[1]).map(f => f[0])])].slice(0, 8);

  const body = (html.match(/<body[\s\S]*<\/body>/i) || [html])[0]
    .replace(/<(script|style|noscript|svg|template)[\s\S]*?<\/\1>/gi, " ");

  return {
    url: finalUrl,
    title: strip((html.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [])[1] || ""),
    description: meta(html, "description") || meta(html, "og:description"),
    siteName: meta(html, "og:site_name"),
    themeColor: meta(html, "theme-color"),
    headings: [...collect(html, "h1", 4), ...collect(html, "h2", 10)],
    ctas: [...collect(html, "button", 8), ...collect(html, "a", 60).filter(t => t.split(" ").length <= 5)].slice(0, 14),
    text: strip(body).slice(0, 3500),
    colors: topColors,
    cssVariables: vars,
    fonts: topFonts,
    screenshot: shot
  };
}
