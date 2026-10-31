// Provider adapters. Each one takes the same inputs and returns plain text.
// Model names are read from environment variables so they can be changed
// without touching code when providers release new versions.

const env = (k, d) => (process.env[k] && process.env[k].trim()) || d;

export function providerList() {
  return [
    {
      id: "claude",
      label: "Claude",
      keyVar: "ANTHROPIC_API_KEY",
      models: { quick: env("CLAUDE_QUICK_MODEL", "claude-haiku-5-5"), deep: env("CLAUDE_DEEP_MODEL", "claude-sonnet-5-5") }
    },
    {
      id: "openai",
      label: "OpenAI",
      keyVar: "OPENAI_API_KEY",
      models: { quick: env("OPENAI_QUICK_MODEL", "gpt-5.5"), deep: env("OPENAI_DEEP_MODEL", "gpt-5.5") }
    },
    {
      id: "kimi",
      label: "Kimi",
      keyVar: "MOONSHOT_API_KEY",
      models: { quick: env("KIMI_QUICK_MODEL", "kimi-k3.1-pro-highspeed"), deep: env("KIMI_DEEP_MODEL", "kimi-k3.1-pro") }
    },
    {
      id: "openrouter",
      label: "OpenRouter",
      // Accept both spellings of the key name.
      keyVar: env("OPENROUTER_API_KEY") ? "OPENROUTER_API_KEY" : "OPEN_ROUTER_KEY",
      models: { quick: env("OPENROUTER_QUICK_MODEL", "google/gemini-3.8-flash"), deep: env("OPENROUTER_DEEP_MODEL", "google/gemini-4-argon") }
    }
  ].map(p => ({ ...p, configured: Boolean(env(p.keyVar)) }));
}

export function getProvider(id) {
  return providerList().find(p => p.id === id);
}

async function post(url, headers, body, timeoutMs = 55000) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json", ...headers },
      body: JSON.stringify(body),
      signal: ctrl.signal
    });
    const text = await res.text();
    let data;
    try { data = JSON.parse(text); } catch { data = { raw: text }; }
    if (!res.ok) {
      const msg = data?.error?.message || data?.message || data?.raw || res.statusText;
      const err = new Error(`${res.status}: ${String(msg).slice(0, 300)}`);
      err.status = res.status;
      throw err;
    }
    return data;
  } catch (e) {
    if (e.name === "AbortError") throw new Error("The model took too long to respond. Try Quick mode or a smaller image.");
    throw e;
  } finally {
    clearTimeout(t);
  }
}

function splitDataUrl(dataUrl) {
  const m = /^data:(image\/(?:png|jpeg|webp|gif));base64,(.+)$/.exec(dataUrl || "");
  if (!m) throw new Error("Images must be PNG, JPEG, WebP, or GIF data URLs.");
  return { mediaType: m[1], data: m[2] };
}

/**
 * @param {string} providerId  claude | openai | kimi | openrouter
 * @param {string} model
 * @param {string} system      system prompt
 * @param {string} text        user text
 * @param {string[]} images    data URLs
 */
export async function callModel(providerId, model, system, text, images = []) {
  const p = getProvider(providerId);
  if (!p) throw new Error(`Unknown provider "${providerId}".`);
  const key = env(p.keyVar);
  if (!key) throw new Error(`${p.label} isn't configured. Add ${p.keyVar} to the server environment.`);

  if (providerId === "claude") {
    const content = images.map(src => {
      const { mediaType, data } = splitDataUrl(src);
      return { type: "image", source: { type: "base64", media_type: mediaType, data } };
    });
    content.push({ type: "text", text });
    const data = await post(
      "https://api.anthropic.com/v1/messages",
      { "x-api-key": key, "anthropic-version": "2023-06-01" },
      { model, max_tokens: 2500, system, messages: [{ role: "user", content }] }
    );
    return (data.content || []).filter(b => b.type === "text").map(b => b.text).join("\n");
  }

  // OpenAI, Kimi and OpenRouter share the OpenAI-compatible chat completions format.
  const base = providerId === "kimi" ? env("MOONSHOT_BASE_URL", "https://api.moonshot.ai/v1")
    : providerId === "openrouter" ? "https://openrouter.ai/api/v1"
    : "https://api.openai.com/v1";
  const content = [{ type: "text", text }];
  images.forEach(src => { splitDataUrl(src); content.push({ type: "image_url", image_url: { url: src } }); });
  const body = {
    model,
    messages: [{ role: "system", content: system }, { role: "user", content }],
    response_format: { type: "json_object" }
  };
  // Newer OpenAI models take max_completion_tokens; Moonshot takes max_tokens.
  if (providerId === "openai") body.max_completion_tokens = 4000;
  else body.max_tokens = providerId === "openrouter" ? 6000 : 4000;
  // Kimi K3 models reason by default, which blows the time limit and truncates JSON.
  if (providerId === "kimi" && env("KIMI_THINKING", "off") !== "on") body.thinking = { type: "disabled" };

  const headers = { authorization: `Bearer ${key}` };
  if (providerId === "openrouter") Object.assign(headers, { "http-referer": "https://brand-studio-black.vercel.app", "x-title": "Brand Prompt Studio" });
  const data = await post(`${base.replace(/\/$/, "")}/chat/completions`, headers, body);
  return data?.choices?.[0]?.message?.content || "";
}

export function parseJson(text) {
  const clean = String(text || "").replace(/```json|```/g, "").trim();
  const start = clean.indexOf("{");
  const end = clean.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("The model didn't return a brand profile. Try again or switch to Deep mode.");
  return JSON.parse(clean.slice(start, end + 1));
}
