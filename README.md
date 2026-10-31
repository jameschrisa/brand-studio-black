# Brand Prompt Studio

A creative prompt builder that can read a brand from a website or an image. A model (Claude, OpenAI, Kimi, or any OpenRouter model) extracts the brand essence, visual language, color scheme, and voice, then fills the brief so you can copy an on-brand prompt.

## How it works

```
public/index.html     The app (image brief, analysis panel, motion & captions tab)
api/config.js         Tells the page which providers have keys
api/analyze.js        Runs an analysis: reads the site or image, calls the model
lib/site.js           Fetches a page, pulls copy, CSS colors, fonts, optional screenshot
lib/providers.js      Claude, OpenAI, Kimi, and OpenRouter adapters
lib/brief.js          The analyst prompt and the JSON schema the model returns
server.js             Local server that runs the same handlers
```

API keys stay on the server. The browser never sees them.

When you analyze a **website**, the server reads the HTML and up to five stylesheets. That gives the model exact hex values from CSS color tokens, the font families, headings, button text, and visible copy. With `ENABLE_SCREENSHOT=true`, it also renders the page in headless Chromium and sends the screenshot, so the model sees the layout and imagery too.

When you analyze an **image**, the browser resizes it to 1600px and sends it directly. Image colors are estimates; website analysis gives exact values.

## Motion & captions tab

The second tab builds prompts for AI video shots, animated caption overlays, or both. It uses the brand chips at the top, so the brand name, palette, mood, typography and avoid list flow into the prompt. Pick an angle, shot size and movement (plus an optional second movement), choose a caption style from the live previews, and copy the Full or Compact prompt. The form state is saved in `localStorage` under `promptBuilder.motion.v1`.

Data files in `public/`:

```
camera-data.js        window.CAMERA_LIB: 46 movements, 22 angles, 9 shot sizes
caption-data.js       window.CAPTION_LIB: caption styles with spec, effect class and sample words
caption-preview.css   Animated previews for the caption cards (runs under the .play class)
```

The camera library comes from Kapwing's AI Camera Prompt Guide: https://www.kapwing.com/resources/the-complete-ai-camera-prompt-guide-77-shots-and-movements/

If a data file is missing, the tab shows "library failed to load" for that picker and the rest still works.

## Run locally

Requires Node 20.6 or newer.

```bash
npm install
cp .env.example .env      # add at least one API key
npm run dev               # http://localhost:3000
```

For screenshots locally, set `CHROME_PATH` in `.env` to your installed Chrome. Without it, local URL analysis still works from HTML and CSS alone.

## Deploy to Vercel

```bash
npx vercel                # first deploy, links the project
npx vercel env add ANTHROPIC_API_KEY
npx vercel env add ACCESS_KEY
npx vercel --prod
```

Or import the repo in the Vercel dashboard and add the environment variables under Settings → Environment Variables. `vercel.json` already sets a 120-second limit for analysis and serves the app from `/public`.

**Set `ACCESS_KEY` before sharing the URL.** Without it, anyone who finds the deployment can run analyses on your API credits. The page asks for the key once and remembers it in that browser.

GitHub Pages can't host this version, because it needs a server to hold the keys and fetch other sites. You can still link to the Vercel URL from your GitHub Pages site.

## Providers and models

| Provider | Key | Quick default | Deep default |
|---|---|---|---|
| Claude | `ANTHROPIC_API_KEY` | `claude-haiku-5-5` | `claude-sonnet-5-5` |
| OpenAI | `OPENAI_API_KEY` | `gpt-5.5` | `gpt-5.5` |
| Kimi | `MOONSHOT_API_KEY` | `kimi-k3.1-pro-highspeed` | `kimi-k3.1-pro` |
| OpenRouter | `OPENROUTER_API_KEY` (or `OPEN_ROUTER_KEY`) | `google/gemini-3.8-flash` | `google/gemini-4-argon` |

Every model name can be overridden with an environment variable (see `.env.example`), so you can switch versions without code changes. Providers without a key are shown as unavailable in the menu.

Notes:
- **Codex** is OpenAI's coding agent. For brand and image analysis, use a general GPT model through `OPENAI_*_MODEL`. Codex-tuned models are optimized for code, may not accept images, and may not be offered on the Chat Completions endpoint this app uses.
- **Claude** needs a Console API key (`sk-ant-api03...`). A Claude Code login token (`sk-ant-oat01...`) is rejected by the API.
- **OpenRouter** uses its OpenAI-compatible API, so any vision model it lists works. Set `OPENROUTER_QUICK_MODEL` and `OPENROUTER_DEEP_MODEL` to switch, for example to `anthropic/claude-sonnet-5.5`.
- **Kimi** K3 models reason by default, which is too slow for a web request, so the app turns thinking off. Set `KIMI_THINKING=on` to re-enable it.
- **Kimi** uses Moonshot's OpenAI-compatible API. China-region keys need `MOONSHOT_BASE_URL=https://api.moonshot.cn/v1`.
- **Quick vs Deep:** Quick is fine for palette, typography, and mood. Deep read is better at audience, essence, and voice, where the quick model tends to stay generic.

## Customizing the analysis

Edit `lib/brief.js` to change what the model looks for. The schema in that file is the contract with the page: if you add a field, map it in `applyProfile()` in `public/index.html`.

## Limits

- Sites that block bots, require login, or render everything client-side return thin HTML. Turn on screenshots or upload a screenshot instead.
- Private and local addresses are refused to keep the server from being used to probe internal networks.
- Brand presets and saved brands live in each browser's local storage, not on the server.
