/* Color grade library. params drive the canvas preview in grade.js.
   Colors are [r,g,b] in 0-1. rgb curves are output levels at input 0, 0.5, 1. */
window.GRADE_LIB = {
  categories: [
    { id: "cinematic", name: "Cinematic & Hollywood Styles" },
    { id: "analog", name: "Analog & Vintage Film Styles" },
    { id: "moody", name: "Moody & Atmospheric Styles" },
    { id: "vibrant", name: "Vibrant & Modern Styles" },
    { id: "clean", name: "Clean & Editorial Styles" }
  ],
  presets: [
    // Cinematic & Hollywood
    {
      id: "orange-teal", name: "Orange and Teal", category: "cinematic",
      description: "Shifting shadows into deep teal and highlights into warm amber/orange for a high-contrast blockbuster look.",
      short: "teal shadows, amber highlights, strong contrast",
      prompt: "Push the shadows into deep teal and the highlights into warm amber, with strong midtone contrast and a clean, slightly lifted black point. Keep saturation moderate so the two hues carry the image.",
      skin: true,
      params: { con: 0.4, sat: 1.05, vib: 0.1, lift: 0.015,
        split: { sh: [0.0, 0.5, 0.58], shA: 0.62, hi: [1.0, 0.62, 0.22], hiA: 0.55, bal: 0 },
        vig: 0.12 }
    },
    {
      id: "bleach-bypass", name: "Bleach Bypass", category: "cinematic",
      description: "Reducing saturation while maximizing contrast and grain to replicate a gritty, militaristic war film aesthetic.",
      short: "low saturation, hard contrast, heavy grain",
      prompt: "Cut saturation to about 40 percent and raise contrast hard, so shadows sink to near black and highlights stay bright and slightly chalky. Add coarse, visible film grain and a faint cool-gray cast over the whole frame.",
      params: { sat: 0.38, con: 1.0, exp: -0.05, lift: -0.04, grain: 0.085, vig: 0.28,
        tint: { c: [0.55, 0.62, 0.7], a: 0.08 } }
    },
    {
      id: "technicolor", name: "Technicolor 3-Strip", category: "cinematic",
      description: "Injecting hyper-vibrant, deeply saturated primary reds, greens, and blues for a classic 1950s Hollywood look.",
      short: "saturated primary reds, greens and blues",
      prompt: "Saturate the primaries hard: lipstick reds, emerald greens and deep cobalt blues, with a clean white point and rich, dense midtones. Keep contrast moderate and the shadows slightly warm, like a 1950s three-strip print.",
      skin: true,
      params: { sat: 1.35, vib: 0.2, con: 0.3, exp: 0.05, lift: 0.01,
        hue: [{ h: 0, w: 45, s: 1.5 }, { h: 125, w: 55, s: 1.3 }, { h: 225, w: 55, s: 1.0 }],
        split: { sh: [0.6, 0.3, 0.2], shA: 0.2, hi: [1, 0.88, 0.65], hiA: 0.3, bal: 0 },
        grain: 0.015 }
    },
    {
      id: "neo-noir", name: "Neo-Noir", category: "cinematic",
      description: "Utilizing deep, crushed blacks, extreme contrast, and a heavy monochromatic or dark blue cast for suspenseful undertones.",
      short: "crushed blacks, extreme contrast, dark blue cast",
      prompt: "Crush the blacks and push contrast to the extreme, leaving only small pools of light. Desaturate to about 30 percent and wash shadows and midtones in a dark steel blue, with cool, dim highlights and light grain.",
      params: { sat: 0.14, con: 0.95, exp: -0.4, lift: -0.09, grain: 0.04, vig: 0.5,
        split: { sh: [0.1, 0.25, 0.42], shA: 0.5, hi: [0.6, 0.72, 0.85], hiA: 0.2, bal: -0.1 },
        tint: { c: [0.3, 0.45, 0.65], a: 0.06 } }
    },
    {
      id: "western-sepia", name: "Western Sepia", category: "cinematic",
      description: "Applying a warm, dusty brown and ochre tint with lifted shadows to evoke a dry, vintage desert climate.",
      short: "dusty brown and ochre tint, lifted shadows",
      prompt: "Tint the whole frame dusty brown and ochre, with shadows lifted into a dry, faded brown instead of black. Hold saturation around 55 percent, keep contrast low to moderate, and let highlights go warm cream with light grain.",
      params: { sat: 0.55, con: 0.12, lift: 0.085, white: 0.97, grain: 0.04, vig: 0.3,
        tint: { c: [0.86, 0.6, 0.24], a: 0.42 },
        split: { sh: [0.55, 0.32, 0.12], shA: 0.3, hi: [1, 0.85, 0.55], hiA: 0.25, bal: 0 } }
    },
    // Analog & Vintage
    {
      id: "kodak-portra", name: "Kodak Portra", category: "analog",
      description: "Emphasizing soft, warm skin tones, gentle pastel colors, and a slightly overexposed, low-contrast profile.",
      short: "soft warm skin, pastel color, airy low contrast",
      prompt: "Expose about half a stop bright with low contrast and open, gently lifted shadows. Keep colors soft and pastel with warm peach skin tones, a faint cream cast in the highlights and fine, even grain.",
      skin: true,
      params: { exp: 0.28, con: -0.18, sat: 0.86, vib: 0.2, lift: 0.035, white: 0.985, grain: 0.03,
        split: { sh: [0.5, 0.72, 0.66], shA: 0.14, hi: [1, 0.82, 0.62], hiA: 0.3, bal: 0.1 },
        tint: { c: [1, 0.78, 0.6], a: 0.06 } }
    },
    {
      id: "fuji-velvia", name: "Fuji Velvia", category: "analog",
      description: "Boosting rich, high-contrast saturation, particularly in vibrant greens, deep blues, and intense landscape tones.",
      short: "rich saturation, vivid greens and deep blues",
      prompt: "Boost saturation hard with high contrast, concentrating on vivid greens, deep blues and intense earth tones. Keep blacks dense, highlights clean and neutral, and the grain very fine, as on slide film.",
      params: { sat: 1.3, vib: 0.1, con: 0.5, lift: -0.02, grain: 0.012,
        hue: [{ h: 125, w: 55, s: 1.55 }, { h: 215, w: 55, s: 1.5 }, { h: 20, w: 40, s: 1.15 }] }
    },
    {
      id: "polaroid-70s", name: "1970s Polaroid", category: "analog",
      description: "Adding faded, yellow-green tinted highlights, heavily lifted/washed shadows, and heavy chromatic aberration.",
      short: "faded yellow-green highlights, washed shadows, color fringing",
      prompt: "Lift the shadows heavily into a washed, muddy teal-gray and tint the highlights faded yellow-green. Lower saturation, soften contrast, add visible color fringing toward the frame edges, a soft vignette and a light layer of grain.",
      params: { sat: 0.78, con: -0.12, lift: 0.15, white: 0.94, grain: 0.045, vig: 0.38, ca: 0.0075,
        rgb: { b: [0.04, 0.44, 0.8] },
        split: { sh: [0.25, 0.5, 0.45], shA: 0.3, hi: [0.82, 0.92, 0.35], hiA: 0.45, bal: 0 } }
    },
    {
      id: "cross-process", name: "Cross-Processed (X-Pro)", category: "analog",
      description: "Deliberately cross-processing film to cause extreme color shifts, like green shadows and yellow highlights.",
      short: "green shadows, yellow highlights, skewed channel curves",
      prompt: "Cross-process the image with skewed channel curves: green-cyan shadows, yellow highlights, and magenta-leaning midtones. Contrast is high and saturation pushed, with a hard color shift instead of a natural balance.",
      params: { sat: 1.2, con: 0.45,
        rgb: { r: [0.02, 0.4, 1.0], g: [0.1, 0.56, 0.98], b: [0.12, 0.34, 0.66] },
        split: { sh: [0.1, 0.65, 0.35], shA: 0.32, hi: [1, 0.9, 0.2], hiA: 0.3, bal: 0 }, grain: 0.02 }
    },
    {
      id: "agfa-vista", name: "Agfa Vista", category: "analog",
      description: "Creating a nostalgic look characterized by bright, punchy blues, strong red tones, and high-latitude film grain.",
      short: "punchy blues, strong reds, visible grain",
      prompt: "Make blues bright and punchy and reds strong and slightly warm, with a bright exposure and medium-high contrast. Add visible, slightly coarse grain and a faint warm cast in the midtones, like consumer color negative film.",
      params: { sat: 1.1, con: 0.32, exp: 0.05, lift: 0.025, grain: 0.1,
        hue: [{ h: 0, w: 40, s: 1.45 }, { h: 220, w: 50, s: 1.2 }],
        tint: { c: [1, 0.75, 0.5], a: 0.14 },
        split: { sh: [0.15, 0.3, 0.6], shA: 0.1, hi: [1, 0.85, 0.6], hiA: 0.25, bal: 0 } }
    },
    // Moody & Atmospheric
    {
      id: "dark-moody", name: "Dark Moody", category: "moody",
      description: "Pulling down the exposure, desaturating non-essential tones, and casting a heavy forest green or dark gray wash.",
      short: "low exposure, muted tones, forest green wash",
      prompt: "Pull exposure down about a stop and a half and desaturate to roughly half, leaving a heavy forest-green wash through the shadows and midtones. Keep blacks deep, highlights dim and contained, and add a strong vignette.",
      params: { exp: -0.75, con: 0.35, sat: 0.55, lift: 0.01, vig: 0.55, grain: 0.025,
        wash: { c: [0.06, 0.19, 0.12], a: 0.28 },
        split: { sh: [0.05, 0.4, 0.2], shA: 0.5, hi: [0.75, 0.85, 0.7], hiA: 0.15, bal: 0 } }
    },
    {
      id: "cyberpunk-neon", name: "Cyberpunk Neon", category: "moody",
      description: "Drenching the scene in electric magenta, cyan, and deep violet hues against ink-black shadows.",
      short: "electric magenta and cyan, deep violet, ink-black shadows",
      prompt: "Drench the scene in electric magenta and cyan with deep violet through the shadows, over ink-black blacks and hard contrast. Add a soft glow on the brightest lights and keep skin and surfaces lit by colored neon, not natural light.",
      params: { sat: 1.3, con: 0.65, exp: -0.2, lift: -0.06, vig: 0.35, bloom: { a: 0.35, r: 0.012 },
        rgb: { g: [0, 0.34, 0.95], b: [0, 0.45, 0.95] }, hue: [{ h: 215, w: 55, s: 0.6, shift: 70 }],
        split: { sh: [0.5, 0.0, 0.8], shA: 0.8, hi: [1.0, 0.1, 0.75], hiA: 0.4, bal: -0.1 } }
    },
    {
      id: "nordic-noir", name: "Nordic Noir", category: "moody",
      description: "Using cold, desaturated tones dominant in frosty blues, pale whites, and stark, minimal gray contrasts.",
      short: "cold desaturated blues, pale whites, flat gray contrast",
      prompt: "Make the palette cold and desaturated: frosty blue-gray shadows, pale near-white highlights and flat, overcast gray midtones. Keep contrast restrained and clean, with almost no warm color anywhere in the frame.",
      params: { sat: 0.4, con: 0.2, exp: 0.05, lift: 0.025, white: 0.985, grain: 0.02,
        rgb: { r: [0, 0.44, 0.96], b: [0.03, 0.56, 1.0] },
        split: { sh: [0.25, 0.45, 0.8], shA: 0.4, hi: [0.8, 0.9, 1.0], hiA: 0.3, bal: 0 },
        tint: { c: [0.5, 0.7, 1], a: 0.12 } }
    },
    {
      id: "sepia-wash", name: "Sepia Wash", category: "moody",
      description: "Dropping all color data in favor of an antique, monochromatic golden-brown gradient with soft contrast.",
      short: "monochrome golden-brown, soft contrast",
      prompt: "Remove all original color and map the image to a single golden-brown gradient: dark umber shadows, amber midtones, cream highlights. Keep contrast soft with slightly lifted blacks, light grain and gently darkened corners.",
      params: { con: -0.1, lift: 0.025, grain: 0.035, vig: 0.35,
        duo: { amt: 1, stops: [[0, [0.15, 0.08, 0.03]], [0.5, [0.6, 0.4, 0.19]], [1, [0.98, 0.9, 0.7]]] } }
    },
    {
      id: "gothic-crimson", name: "Gothic Crimson", category: "moody",
      description: "Isolating and saturating deep blood-red tones while desaturating greens and blues into a dark, charcoal palette.",
      short: "deep blood red isolated, everything else charcoal",
      prompt: "Isolate the reds and push them to a deep blood crimson, while desaturating every other hue into dark charcoal and slate. Darken the exposure, crush the blacks and keep a heavy vignette so the red is the only color left.",
      params: { sat: 0.07, con: 0.65, exp: -0.4, lift: -0.05, vig: 0.5, grain: 0.03,
        hue: [{ h: 358, w: 40, s: 16 }],
        split: { sh: [0.45, 0.0, 0.04], shA: 0.45, hi: [0.8, 0.75, 0.75], hiA: 0.05, bal: 0 } }
    },
    // Vibrant & Modern
    {
      id: "high-key-pastel", name: "High-Key Pastel", category: "vibrant",
      description: "Flooding the image with bright light, keeping exposure high, and tuning colors to soft, dreamy pastel hues.",
      short: "bright high exposure, soft dreamy pastels",
      prompt: "Raise exposure by about a stop with very low contrast, so shadows are open and nearly all tones sit in the upper range. Soften colors into light pastels with a faint pink-lavender cast and a gentle glow on the highlights.",
      skin: true,
      params: { exp: 0.7, con: -0.4, sat: 0.72, vib: 0.1, lift: 0.085, white: 0.995, bloom: { a: 0.4, r: 0.016 },
        tint: { c: [1, 0.82, 0.9], a: 0.1 },
        split: { sh: [0.7, 0.6, 0.95], shA: 0.2, hi: [1, 0.9, 0.85], hiA: 0.12, bal: 0 } }
    },
    {
      id: "vaporwave", name: "Vaporwave Aesthetic", category: "vibrant",
      description: "Replicating a 1990s retro-futurism with saturated pastel pinks, purples, and vibrant sky blues.",
      short: "pastel pinks and purples, vivid sky blue",
      prompt: "Grade toward saturated pastel pink and purple, with sky blues kept bright and cyan-leaning. Lift the blacks into soft violet, keep contrast gentle, and add a faint glow so the image looks like a 1990s retro-futurist poster.",
      params: { sat: 1.15, con: 0.1, lift: 0.07, exp: 0.05, bloom: { a: 0.25, r: 0.012 },
        hue: [{ h: 200, w: 45, s: 1.3 }, { h: 320, w: 45, s: 1.3 }],
        split: { sh: [0.55, 0.2, 0.85], shA: 0.6, hi: [1, 0.55, 0.8], hiA: 0.5, bal: 0.05 },
        rgb: { g: [0.02, 0.44, 0.96] } }
    },
    {
      id: "golden-hour", name: "Golden Hour Glow", category: "vibrant",
      description: "Infusing the entire frame with deep honey, amber, and rich golden yellow tones with long, soft shadows.",
      short: "honey and amber tones, soft warm shadows, glow",
      prompt: "Infuse the whole frame with honey, amber and rich golden-yellow light, with warm brown shadows that stay soft instead of going black. Raise exposure slightly, keep contrast gentle and add a low glow around the brightest areas.",
      skin: true,
      params: { exp: 0.12, con: 0.15, sat: 1.1, lift: 0.02, vig: 0.22, bloom: { a: 0.3, r: 0.014 },
        tint: { c: [1, 0.6, 0.2], a: 0.3 },
        split: { sh: [0.65, 0.3, 0.08], shA: 0.35, hi: [1, 0.75, 0.3], hiA: 0.35, bal: 0 } }
    },
    {
      id: "pop-art", name: "Pop Art Pop", category: "vibrant",
      description: "Maxing out the saturation slider on all primary colors for a flat, comic-book-inspired palette.",
      short: "maximum saturation, flat posterized primaries",
      prompt: "Max out saturation on every primary and reduce the image to a flat, posterized palette of a few tones per channel, like a comic-book print. Use hard contrast, clean bright whites and black with no soft gradients.",
      params: { sat: 2.2, con: 0.6, exp: -0.2, post: 4 }
    },
    {
      id: "tropical-punch", name: "Tropical Punch", category: "vibrant",
      description: "Enhancing turquoise blues, emerald greens, and fiery coral pinks for a hyper-vibrant vacation look.",
      short: "turquoise, emerald and coral pink, hyper-vibrant",
      prompt: "Push blues toward turquoise, greens toward emerald and warm reds toward fiery coral pink, with high saturation and a bright, sunny exposure. Keep contrast punchy and whites clean.",
      skin: true,
      params: { exp: 0.1, sat: 1.28, vib: 0.2, con: 0.3,
        hue: [{ h: 215, w: 50, s: 1.1, shift: -55 }, { h: 125, w: 50, s: 1.45, shift: 22 }, { h: 5, w: 40, s: 1.5, shift: -10 }] }
    },
    // Clean & Editorial
    {
      id: "minimalist-matte", name: "Minimalist Matte", category: "clean",
      description: "Flattening the dynamic range by lifting the black point into soft gray and muting distracting background colors.",
      short: "lifted gray black point, muted colors, flat range",
      prompt: "Flatten the dynamic range: lift the black point into soft gray, pull the highlights down slightly and cut contrast. Mute saturation to about 55 percent so no background color competes, with no grain and a neutral cast.",
      skin: true,
      params: { sat: 0.55, con: -0.28, lift: 0.17, white: 0.93, exp: 0.05 }
    },
    {
      id: "corporate-clean", name: "Corporate Clean", category: "clean",
      description: "Balancing whites perfectly with subtle blue shadows and crisp, realistic mid-tones for a professional look.",
      short: "neutral whites, subtle blue shadows, crisp realistic midtones",
      prompt: "Set a neutral white balance with true white highlights, add a subtle blue tone to the shadows only and keep midtones crisp and realistic. Use moderate contrast and natural saturation, with no grain and no stylized color.",
      skin: true,
      params: { exp: 0.08, con: 0.25, sat: 0.97, clarity: 0.28,
        split: { sh: [0.2, 0.38, 0.72], shA: 0.24, hi: [1, 1, 1], hiA: 0, bal: 0 } }
    },
    {
      id: "earthy-bohemian", name: "Earthy Bohemian", category: "clean",
      description: "Warming up the image with terracotta, olive greens, sand tones, and slightly desaturated cool colors.",
      short: "terracotta, olive, sand, muted cool colors",
      prompt: "Warm the image toward terracotta, sand and olive, with greens shifted yellow and gentler, and blues and cyans noticeably desaturated. Lift the blacks slightly, keep contrast soft and let highlights go warm cream.",
      skin: true,
      params: { sat: 0.88, con: 0.1, lift: 0.045, white: 0.98, grain: 0.02,
        hue: [{ h: 125, w: 55, s: 0.75, shift: -28 }, { h: 215, w: 55, s: 0.5 }, { h: 20, w: 35, s: 1.15 }],
        tint: { c: [0.85, 0.5, 0.28], a: 0.2 },
        split: { sh: [0.5, 0.3, 0.18], shA: 0.2, hi: [1, 0.88, 0.65], hiA: 0.2, bal: 0 } }
    },
    {
      id: "hc-mono", name: "High-Contrast Monochrome", category: "clean",
      description: "Stripping all color to leave stark, punchy whites and ink-black shadows with zero gray mud.",
      short: "black and white, stark whites, ink-black shadows",
      prompt: "Convert to pure black and white with no tint. Set the black point to true black and the white point to clean white, with steep midtone contrast so there is no flat gray mud, and keep fine detail in the textures.",
      params: { con: 1.1, lift: -0.1, white: 1.1, exp: 0.05, grain: 0.03,
        duo: { amt: 1, stops: [[0, [0, 0, 0]], [1, [1, 1, 1]]] } }
    },
    {
      id: "editorial-crisp", name: "Editorial Crisp", category: "clean",
      description: "Enhancing mid-tone micro-contrast, cooling the highlights slightly, and keeping skin tones perfectly neutral.",
      short: "sharp midtone contrast, slightly cool highlights, neutral skin",
      prompt: "Add midtone micro-contrast for crisp texture, cool the highlights slightly, and keep saturation near natural. Hold skin tones neutral and accurate, black point clean and the overall look sharp, not stylized.",
      skin: true,
      params: { con: 0.28, exp: 0.05, sat: 0.95, clarity: 0.6,
        split: { sh: [0.5, 0.5, 0.5], shA: 0, hi: [0.72, 0.87, 1.0], hiA: 0.16, bal: 0 } }
    }
  ]
};
