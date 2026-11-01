/* Color grade tab: canvas preview engine, preset picker and prompt builder. */
(function () {
  "use strict";
  var LIB = window.GRADE_LIB;
  var root = document.getElementById("gradeRoot");
  if (!LIB || !root) return;

  var PRESETS = LIB.presets, CATS = LIB.categories;
  var byId = {};
  PRESETS.forEach(function (p) { byId[p.id] = p; });

  var MAX_EDGE = 1000, THUMB_W = 300;
  var SAMPLES = {
    portrait: { src: "grade-portrait.jpg", label: "Portrait" },
    landscape: { src: "grade-landscape.jpg", label: "Landscape" }
  };
  var STORE_KEY = "bps.grade.v1";

  /* ---------------------------------------------------------------- engine */

  function clamp01(x) { return x < 0 ? 0 : x > 1 ? 1 : x; }
  function smooth(t) { t = clamp01(t); return t * t * (3 - 2 * t); }
  function lumOf(c) { return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; }

  function noise(i) {
    var h = Math.imul(i ^ 0x9e3779b9, 0x85ebca6b);
    h ^= h >>> 13; h = Math.imul(h, 0xc2b2ae35); h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  }

  function buildLUTs(p) {
    var ex = Math.pow(2, p.exp || 0), con = p.con || 0, lift = p.lift || 0;
    var white = p.white == null ? 1 : p.white, rgb = p.rgb || {};
    var luts = [new Float32Array(256), new Float32Array(256), new Float32Array(256)];
    var names = ["r", "g", "b"];
    for (var ch = 0; ch < 3; ch++) {
      var pts = rgb[names[ch]] || [0, 0.5, 1];
      var a = pts[0], b = pts[1], c = pts[2], lut = luts[ch];
      for (var i = 0; i < 256; i++) {
        var y = (i / 255) * ex;
        if (y > 0.8) y = 0.8 + 0.2 * Math.tanh((y - 0.8) / 0.2);
        y = clamp01(y);
        var s = y * y * (3 - 2 * y);
        y = clamp01(y + (s - y) * con);
        y = a * 2 * (y - 0.5) * (y - 1) - 4 * b * y * (y - 1) + 2 * c * y * (y - 0.5);
        y = clamp01(y);
        if (lift >= 0) y = lift + y * (1 - lift);
        else y = (y + lift) / (1 + lift);
        lut[i] = clamp01(y * white);
      }
    }
    return luts;
  }

  function buildGradient(duo) {
    var g = new Float32Array(256 * 3), st = duo.stops;
    for (var i = 0; i < 256; i++) {
      var t = i / 255, k = 0;
      while (k < st.length - 2 && t > st[k + 1][0]) k++;
      var s0 = st[k], s1 = st[k + 1];
      var u = clamp01((t - s0[0]) / Math.max(1e-6, s1[0] - s0[0]));
      for (var c = 0; c < 3; c++) g[i * 3 + c] = s0[1][c] + (s1[1][c] - s0[1][c]) * u;
    }
    return g;
  }

  function chromaVec(col) { var y = lumOf(col); return [col[0] - y, col[1] - y, col[2] - y]; }

  function boxBlur(src, w, h, r) {
    var tmp = new Float32Array(w * h), out = new Float32Array(w * h), x, y, sum, n = 2 * r + 1;
    for (y = 0; y < h; y++) {
      var row = y * w; sum = 0;
      for (x = -r; x <= r; x++) sum += src[row + Math.min(w - 1, Math.max(0, x))];
      for (x = 0; x < w; x++) {
        tmp[row + x] = sum / n;
        sum += src[row + Math.min(w - 1, x + r + 1)] - src[row + Math.max(0, x - r)];
      }
    }
    for (x = 0; x < w; x++) {
      sum = 0;
      for (y = -r; y <= r; y++) sum += tmp[Math.min(h - 1, Math.max(0, y)) * w + x];
      for (y = 0; y < h; y++) {
        out[y * w + x] = sum / n;
        sum += tmp[Math.min(h - 1, y + r + 1) * w + x] - tmp[Math.max(0, y - r) * w + x];
      }
    }
    return out;
  }

  function gradeImageData(src, p) {
    var w = src.width, h = src.height, n = w * h, sd = src.data;
    var out = new ImageData(w, h), od = out.data, x, y, i;

    if (p.ca) {
      var cd = new Uint8ClampedArray(sd), shift = p.ca * w, cx = (w - 1) / 2, cy = (h - 1) / 2;
      for (y = 0; y < h; y++) {
        for (x = 0; x < w; x++) {
          var nx = (x - cx) / cx, ny = (y - cy) / cy, o = (y * w + x) * 4;
          var rx = Math.min(w - 1, Math.max(0, Math.round(x - nx * shift)));
          var ry = Math.min(h - 1, Math.max(0, Math.round(y - ny * shift)));
          var bx = Math.min(w - 1, Math.max(0, Math.round(x + nx * shift)));
          var by = Math.min(h - 1, Math.max(0, Math.round(y + ny * shift)));
          cd[o] = sd[(ry * w + rx) * 4];
          cd[o + 2] = sd[(by * w + bx) * 4 + 2];
        }
      }
      sd = cd;
    }

    var luts = buildLUTs(p), lr = luts[0], lg = luts[1], lb = luts[2];
    var sat = p.sat == null ? 1 : p.sat, vib = p.vib || 0, hues = p.hue || [], rot = p.rot || 0;
    var needHue = hues.length > 0 || rot !== 0;
    var duo = p.duo, grad = duo ? buildGradient(duo) : null, duoAmt = duo ? duo.amt : 0;
    var sp = p.split, shV = sp ? chromaVec(sp.sh) : null, hiV = sp ? chromaVec(sp.hi) : null;
    var shA = sp ? sp.shA : 0, hiA = sp ? sp.hiA : 0, bal = sp ? sp.bal || 0 : 0;
    var tint = p.tint, tV = tint ? chromaVec(tint.c) : null, tA = tint ? tint.a : 0;
    var wash = p.wash, wA = wash ? wash.a : 0;
    var post = p.post ? p.post - 1 : 0;
    var vig = p.vig || 0, grain = p.grain || 0, clar = p.clarity || 0;
    var blur = null, lumSrc = null;
    if (clar) {
      lumSrc = new Float32Array(n);
      for (i = 0; i < n; i++) lumSrc[i] = (0.2126 * sd[i * 4] + 0.7152 * sd[i * 4 + 1] + 0.0722 * sd[i * 4 + 2]) / 255;
      blur = boxBlur(lumSrc, w, h, Math.max(2, Math.round(Math.max(w, h) * 0.012)));
    }
    var nxs = new Float32Array(w);
    for (x = 0; x < w; x++) { var t = (x / (w - 1) - 0.5) * 2; nxs[x] = t * t; }

    for (y = 0; y < h; y++) {
      var nyy = ((y / (h - 1) - 0.5) * 2); nyy *= nyy;
      for (x = 0; x < w; x++) {
        i = y * w + x;
        var o4 = i * 4;
        var r = lr[sd[o4]], g = lg[sd[o4 + 1]], b = lb[sd[o4 + 2]];
        var mx = r > g ? (r > b ? r : b) : (g > b ? g : b);
        var mn = r < g ? (r < b ? r : b) : (g < b ? g : b);
        var c = mx - mn;
        var Y = 0.2126 * r + 0.7152 * g + 0.0722 * b;

        var m = sat, ang = rot;
        if (needHue && c > 0.002) {
          var hd;
          if (mx === r) hd = ((g - b) / c) % 6; else if (mx === g) hd = (b - r) / c + 2; else hd = (r - g) / c + 4;
          hd *= 60; if (hd < 0) hd += 360;
          var gate = Math.min(1, c * 5), add = 0;
          for (var k = 0; k < hues.length; k++) {
            var hu = hues[k], d = Math.abs(hd - hu.h); if (d > 180) d = 360 - d;
            if (d < hu.w) {
              var wt = 0.5 * (1 + Math.cos(Math.PI * d / hu.w)) * gate;
              add += wt * (hu.s - 1); ang += wt * (hu.shift || 0);
            }
          }
          m = sat * Math.max(0, 1 + add);
        }
        if (vib) m *= 1 + vib * (1 - Math.min(1, c * 2));

        if (ang) {
          var rad = ang * 0.0174533, cs = Math.cos(rad), sn = Math.sin(rad);
          var yy = 0.299 * r + 0.587 * g + 0.114 * b;
          var ii = 0.596 * r - 0.274 * g - 0.322 * b, qq = 0.211 * r - 0.523 * g + 0.312 * b;
          var i2 = ii * cs - qq * sn, q2 = ii * sn + qq * cs;
          r = yy + 0.956 * i2 + 0.621 * q2; g = yy - 0.272 * i2 - 0.647 * q2; b = yy - 1.106 * i2 + 1.703 * q2;
        }
        r = Y + (r - Y) * m; g = Y + (g - Y) * m; b = Y + (b - Y) * m;
        r = r < 0 ? 0 : r > 1 ? 1 : r; g = g < 0 ? 0 : g > 1 ? 1 : g; b = b < 0 ? 0 : b > 1 ? 1 : b;

        if (grad) {
          var yi = (0.2126 * r + 0.7152 * g + 0.0722 * b) * 255 | 0;
          if (yi > 255) yi = 255;
          r += (grad[yi * 3] - r) * duoAmt; g += (grad[yi * 3 + 1] - g) * duoAmt; b += (grad[yi * 3 + 2] - b) * duoAmt;
        }
        if (sp) {
          var Y3 = 0.2126 * r + 0.7152 * g + 0.0722 * b, Yb = Y3 - bal * 0.3;
          if (Yb < 0) Yb = 0; else if (Yb > 1) Yb = 1;
          var ws = (1 - Yb) * (1 - Yb) * shA, wh = Yb * Yb * hiA;
          r += shV[0] * ws + hiV[0] * wh; g += shV[1] * ws + hiV[1] * wh; b += shV[2] * ws + hiV[2] * wh;
        }
        if (tint) { r += tV[0] * tA; g += tV[1] * tA; b += tV[2] * tA; }
        if (wash) { r += (wash.c[0] - r) * wA; g += (wash.c[1] - g) * wA; b += (wash.c[2] - b) * wA; }
        if (clar) {
          var Yc = lumSrc[i], dl = (Yc - blur[i]) * clar * 4 * Yc * (1 - Yc) * 2;
          r += dl; g += dl; b += dl;
        }
        if (post) {
          r = Math.round(clamp01(r) * post) / post; g = Math.round(clamp01(g) * post) / post; b = Math.round(clamp01(b) * post) / post;
        }
        if (vig) {
          var r2 = (nxs[x] + nyy) * 0.5, tv = (r2 - 0.25) / 0.75;
          if (tv > 0) { if (tv > 1) tv = 1; var f = 1 - vig * tv * tv * (3 - 2 * tv); r *= f; g *= f; b *= f; }
        }
        if (grain) {
          var Yg = 0.2126 * r + 0.7152 * g + 0.0722 * b;
          var nz = (noise(i) + noise(i ^ 0x5bd1e995) - 1) * grain * (0.45 + 1.1 * Yg * (1 - Yg) * 2);
          r += nz; g += nz; b += nz;
        }
        od[o4] = r * 255; od[o4 + 1] = g * 255; od[o4 + 2] = b * 255; od[o4 + 3] = 255;
      }
    }
    return out;
  }

  function gradeToCanvas(srcData, p) {
    var cv = document.createElement("canvas");
    cv.width = srcData.width; cv.height = srcData.height;
    var cx = cv.getContext("2d");
    cx.putImageData(gradeImageData(srcData, p), 0, 0);
    if (p.bloom && "filter" in cx) {
      var tmp = document.createElement("canvas");
      tmp.width = cv.width; tmp.height = cv.height;
      var tx = tmp.getContext("2d");
      tx.filter = "blur(" + Math.max(2, Math.round(cv.width * p.bloom.r)) + "px) brightness(0.95) contrast(1.7)";
      tx.drawImage(cv, 0, 0);
      cx.globalCompositeOperation = "screen"; cx.globalAlpha = p.bloom.a;
      cx.drawImage(tmp, 0, 0);
      cx.globalCompositeOperation = "source-over"; cx.globalAlpha = 1;
    }
    return cv;
  }

  /* ----------------------------------------------------------------- state */

  var state = { preset: PRESETS[0].id, intensity: 100, sample: "portrait", subject: "", view: "full", cat: "all", split: 50 };
  try {
    var saved = JSON.parse(localStorage.getItem(STORE_KEY) || "null");
    if (saved) {
      if (byId[saved.preset]) state.preset = saved.preset;
      if (typeof saved.intensity === "number") state.intensity = Math.max(0, Math.min(100, Math.round(saved.intensity)));
      if (saved.sample === "portrait" || saved.sample === "landscape") state.sample = saved.sample;
      if (typeof saved.subject === "string") state.subject = saved.subject.slice(0, 200);
    }
  } catch (e) {}
  function save() {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify({
        preset: state.preset, intensity: state.intensity,
        sample: state.sample === "upload" ? "portrait" : state.sample, subject: state.subject
      }));
    } catch (e) {}
  }

  var refs = {}, ref = null, uploadN = 0;
  var gradedCache = new Map(), thumbCache = new Map();

  /* -------------------------------------------------------------------- UI */

  var ICON_COPY = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>';
  root.innerHTML =
    '<div class="gr-main">' +
    '<section class="panel gr-left" aria-label="Preview">' +
      '<div class="panel-head"><h2>Color grade</h2><span class="meta">Sample photos from Unsplash</span></div>' +
      '<div class="gr-stagewrap" id="grDrop">' +
        '<div class="gr-stage" id="grStage">' +
          '<canvas id="grCanvas" width="10" height="10" aria-label="Before and after preview"></canvas>' +
          '<span class="gr-tag l">Original</span><span class="gr-tag r">Graded</span>' +
          '<div class="gr-split" id="grSplit" role="slider" tabindex="0" aria-label="Compare original and graded" aria-valuemin="0" aria-valuemax="100" aria-valuenow="50">' +
            '<span class="gr-grip"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 7-5 5 5 5M15 7l5 5-5 5"/></svg></span>' +
          '</div>' +
          '<div class="gr-busy" id="grBusy" hidden>Loading</div>' +
        '</div>' +
      '</div>' +
      '<div class="gr-ctl">' +
        '<div class="gr-row">' +
          '<div class="seg" id="grSeg" role="group" aria-label="Reference image">' +
            '<button type="button" data-v="portrait" aria-pressed="false">Portrait</button>' +
            '<button type="button" data-v="landscape" aria-pressed="false">Landscape</button>' +
            '<button type="button" data-v="upload" aria-pressed="false">Your image</button>' +
          '</div>' +
          '<button type="button" class="btn" id="grUpload">Upload image</button>' +
          '<input type="file" id="grFile" accept="image/png,image/jpeg,image/webp" hidden>' +
        '</div>' +
        '<div class="gr-hint" id="grNote">Drag the handle to compare. Drop or paste an image to use your own (PNG, JPEG or WebP, kept in this tab only).</div>' +
        '<div class="gr-int"><label for="grInt">Intensity</label><input type="range" id="grInt" min="0" max="100" step="1"><output id="grIntOut" for="grInt"></output></div>' +
      '</div>' +
    '</section>' +
    '<div class="gr-col">' +
      '<section class="panel" aria-label="Presets">' +
        '<div class="panel-head"><h2>Presets</h2><span class="meta" id="grCount"></span></div>' +
        '<div class="gr-filters"><div class="chips" id="grChips" role="group" aria-label="Category"></div></div>' +
        '<div class="gr-scroll" id="grGrid"></div>' +
      '</section>' +
      '<section class="panel" aria-label="Prompt">' +
        '<div class="panel-head">' +
          '<div class="tabs" role="tablist" id="grTabs" aria-label="Prompt length">' +
            '<button class="tab" role="tab" aria-selected="true" data-view="full">Full prompt</button>' +
            '<button class="tab" role="tab" aria-selected="false" data-view="compact">Compact</button>' +
          '</div>' +
          '<button type="button" class="btn primary" id="grCopy">' + ICON_COPY + '<span>Copy prompt</span></button>' +
        '</div>' +
        '<div class="gr-subj"><label for="grSubj">Subject or scene (optional)</label>' +
          '<input type="text" id="grSubj" maxlength="200" placeholder="A founder portrait in a sunlit studio" autocomplete="off"></div>' +
        '<pre id="grOut" aria-live="polite"></pre>' +
      '</section>' +
    '</div></div>';

  var $ = function (id) { return document.getElementById(id); };
  var el = {
    canvas: $("grCanvas"), stage: $("grStage"), split: $("grSplit"), busy: $("grBusy"), note: $("grNote"),
    seg: $("grSeg"), upload: $("grUpload"), file: $("grFile"), int: $("grInt"), intOut: $("grIntOut"),
    chips: $("grChips"), grid: $("grGrid"), count: $("grCount"), tabs: $("grTabs"), copy: $("grCopy"),
    subj: $("grSubj"), out: $("grOut"), drop: $("grDrop")
  };
  var ctx = el.canvas.getContext("2d");
  var NOTE_DEFAULT = el.note.textContent;

  // Category chips
  var chipList = [{ id: "all", name: "All" }].concat(CATS);
  el.chips.innerHTML = chipList.map(function (c) {
    return '<button type="button" class="chip" data-v="' + c.id + '" aria-pressed="' + (c.id === state.cat) + '">' + c.name + "</button>";
  }).join("");

  // Preset grid
  var cardEls = {};
  var gridHTML = CATS.map(function (cat) {
    var items = PRESETS.filter(function (p) { return p.category === cat.id; });
    return '<div class="gr-group" data-cat="' + cat.id + '"><h3>' + cat.name + '</h3><div class="gr-grid">' +
      items.map(function (p) {
        return '<button type="button" class="gr-card" data-id="' + p.id + '" aria-pressed="false" title="' + p.description.replace(/"/g, "&quot;") + '">' +
          '<span class="gr-th"><canvas width="4" height="3"></canvas><span class="gr-tick"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12 5 5 9-10"/></svg></span></span>' +
          '<span class="gr-cn">' + p.name + '</span><span class="gr-cd">' + p.description + "</span></button>";
      }).join("") + "</div></div>";
  }).join("");
  el.grid.innerHTML = gridHTML;
  el.grid.querySelectorAll(".gr-card").forEach(function (b) { cardEls[b.dataset.id] = b; });

  /* ------------------------------------------------------------- reference */

  function fitSize(w, h) {
    var s = Math.min(1, MAX_EDGE / Math.max(w, h));
    return [Math.max(1, Math.round(w * s)), Math.max(1, Math.round(h * s))];
  }

  function makeRef(id, img) {
    var sz = fitSize(img.naturalWidth || img.width, img.naturalHeight || img.height);
    var cv = document.createElement("canvas");
    cv.width = sz[0]; cv.height = sz[1];
    var c = cv.getContext("2d", { willReadFrequently: true });
    c.imageSmoothingQuality = "high";
    c.drawImage(img, 0, 0, sz[0], sz[1]);
    var tw = Math.min(THUMB_W, sz[0]), th = Math.max(1, Math.round(sz[1] * tw / sz[0]));
    var tc = document.createElement("canvas");
    tc.width = tw; tc.height = th;
    var t2 = tc.getContext("2d", { willReadFrequently: true });
    t2.imageSmoothingQuality = "high";
    t2.drawImage(cv, 0, 0, tw, th);
    return { id: id, canvas: cv, data: c.getImageData(0, 0, sz[0], sz[1]), tdata: t2.getImageData(0, 0, tw, th), w: sz[0], h: sz[1], tw: tw, th: th };
  }

  function loadSample(id) {
    if (refs[id]) return Promise.resolve(refs[id]);
    return new Promise(function (resolve, reject) {
      var img = new Image();
      img.onload = function () { refs[id] = makeRef(id, img); resolve(refs[id]); };
      img.onerror = function () { reject(new Error("Could not load " + id)); };
      img.src = SAMPLES[id].src;
    });
  }

  function showNote(msg, isErr) {
    el.note.textContent = msg || NOTE_DEFAULT;
    el.note.classList.toggle("err", !!isErr);
  }

  function useFile(file) {
    if (!file) return;
    if (!/^image\/(png|jpe?g|webp)$/i.test(file.type)) { showNote("That file type is not supported. Use PNG, JPEG or WebP.", true); return; }
    var url = URL.createObjectURL(file), img = new Image();
    img.onload = function () {
      URL.revokeObjectURL(url);
      try {
        if (refs.upload) purgeRef(refs.upload.id);
        uploadN++;
        refs.upload = makeRef("up" + uploadN, img);
        showNote("");
        setSample("upload");
      } catch (e) { showNote("That image could not be read.", true); }
    };
    img.onerror = function () { URL.revokeObjectURL(url); showNote("That image could not be read.", true); };
    img.src = url;
  }

  function purgeRef(id) {
    [gradedCache, thumbCache].forEach(function (m) {
      Array.from(m.keys()).forEach(function (k) { if (k.indexOf(id + "|") === 0) m.delete(k); });
    });
  }

  function setSample(s) {
    if (s === "upload" && !refs.upload) { el.file.click(); return; }
    state.sample = s;
    syncSeg();
    save();
    el.busy.hidden = false;
    var p = s === "upload" ? Promise.resolve(refs.upload) : loadSample(s);
    p.then(function (r) {
      if (state.sample !== s) return;
      ref = r;
      el.busy.hidden = true;
      sizeStage();
      renderMain();
      queueThumbs();
    }, function () { el.busy.hidden = true; showNote("The sample image did not load.", true); });
  }

  function syncSeg() {
    el.seg.querySelectorAll("button").forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.v === state.sample)); });
  }

  function sizeStage() {
    if (!ref) return;
    el.canvas.width = ref.w; el.canvas.height = ref.h;
    var maxH = 620;
    el.stage.style.width = "min(100%, " + Math.round(maxH * ref.w / ref.h) + "px)";
    el.canvas.style.aspectRatio = ref.w + " / " + ref.h;
    var th = Math.round(THUMB_W * ref.h / ref.w);
    Object.keys(cardEls).forEach(function (id) {
      var cv = cardEls[id].querySelector("canvas");
      cv.width = ref.tw; cv.height = ref.th;
    });
  }

  /* ------------------------------------------------------------- rendering */

  function gradedFor(r, p) {
    var key = r.id + "|" + p.id, g = gradedCache.get(key);
    if (!g) {
      g = gradeToCanvas(r.data, p.params);
      gradedCache.set(key, g);
      if (gradedCache.size > 8) gradedCache.delete(gradedCache.keys().next().value);
    }
    return g;
  }

  function draw(g) {
    if (!ref) return;
    var W = ref.w, H = ref.h;
    ctx.globalAlpha = 1;
    ctx.drawImage(ref.canvas, 0, 0);
    var sx = Math.round(W * state.split / 100);
    if (sx < W && g) {
      ctx.save();
      ctx.beginPath(); ctx.rect(sx, 0, W - sx, H); ctx.clip();
      ctx.globalAlpha = state.intensity / 100;
      ctx.drawImage(g, 0, 0);
      ctx.restore();
    }
    ctx.globalAlpha = 1;
  }

  var curGraded = null;
  function renderMain() {
    if (!ref) return;
    curGraded = gradedFor(ref, byId[state.preset]);
    draw(curGraded);
    moveSplit();
  }
  function redrawOnly() { if (curGraded) { draw(curGraded); moveSplit(); } }

  function moveSplit() {
    el.split.style.left = state.split + "%";
    el.split.setAttribute("aria-valuenow", String(Math.round(state.split)));
    el.stage.classList.toggle("no-l", state.split < 14);
    el.stage.classList.toggle("no-r", state.split > 86);
  }

  // Thumbnails, generated a few at a time so the page stays responsive.
  var thumbToken = 0;
  function paintThumb(id) {
    var key = ref.id + "|" + id, t = thumbCache.get(key);
    if (!t) { t = gradeToCanvas(ref.tdata, byId[id].params); thumbCache.set(key, t); }
    var cv = cardEls[id].querySelector("canvas");
    cv.getContext("2d").drawImage(t, 0, 0);
  }
  function queueThumbs() {
    var token = ++thumbToken, r = ref;
    var ids = PRESETS.map(function (p) { return p.id; });
    var vis = ids.filter(function (id) { return !cardEls[id].closest(".gr-group").hidden; });
    var rest = ids.filter(function (id) { return vis.indexOf(id) < 0; });
    var queue = vis.concat(rest);
    // Show cached ones immediately.
    queue = queue.filter(function (id) {
      if (thumbCache.has(r.id + "|" + id)) { paintThumb(id); return false; }
      return true;
    });
    (function pump() {
      if (token !== thumbToken || r !== ref) return;
      var t0 = performance.now();
      while (queue.length && performance.now() - t0 < 10) paintThumb(queue.shift());
      if (queue.length) setTimeout(pump, 6);
    })();
  }

  /* ---------------------------------------------------------------- prompt */

  function strengthWord(v) { return v <= 33 ? "subtle" : v <= 74 ? "moderate" : "full strength"; }

  function buildPrompt(view) {
    var p = byId[state.preset], v = state.intensity, subj = state.subject.trim().replace(/[.\s]+$/, "");
    var word = strengthWord(v);
    if (view === "compact") {
      var s = p.name + " color grade: " + p.short + ", " + word + " (" + v + "%)";
      if (p.skin) s += ", natural skin tones";
      s += ".";
      if (subj) s += " Subject: " + subj + ".";
      return s;
    }
    var parts = ["Color grade: " + p.name + ".", p.prompt];
    if (v <= 33) parts.push("Apply it at subtle strength (" + v + "%), so the original color stays clearly visible underneath.");
    else if (v <= 74) parts.push("Apply it at moderate strength (" + v + "%), blending the grade with the original color.");
    else parts.push("Apply it at full strength (" + v + "%).");
    if (p.skin) parts.push("Keep skin tones natural.");
    if (subj) parts.push("Subject: " + subj + ". Grade this scene without changing its content or composition.");
    return parts.join(" ");
  }

  function renderPrompt() { el.out.textContent = buildPrompt(state.view); }

  /* ------------------------------------------------------------ interaction */

  function syncCards() {
    Object.keys(cardEls).forEach(function (id) { cardEls[id].setAttribute("aria-pressed", String(id === state.preset)); });
  }
  function syncFilter() {
    var shown = 0;
    el.grid.querySelectorAll(".gr-group").forEach(function (g) {
      var on = state.cat === "all" || g.dataset.cat === state.cat;
      g.hidden = !on;
      if (on) shown += g.querySelectorAll(".gr-card").length;
    });
    el.chips.querySelectorAll(".chip").forEach(function (c) { c.setAttribute("aria-pressed", String(c.dataset.v === state.cat)); });
    el.count.textContent = shown + " of " + PRESETS.length;
  }

  function selectPreset(id) {
    if (!byId[id]) return;
    state.preset = id;
    syncCards(); renderPrompt(); save();
    setTimeout(function () { if (state.preset === id) renderMain(); }, 0);
  }

  el.grid.addEventListener("click", function (e) {
    var b = e.target.closest(".gr-card");
    if (b) selectPreset(b.dataset.id);
  });
  el.chips.addEventListener("click", function (e) {
    var b = e.target.closest(".chip");
    if (!b) return;
    state.cat = b.dataset.v;
    syncFilter();
    el.grid.scrollTop = 0;
    if (ref) queueThumbs();
  });
  el.seg.addEventListener("click", function (e) {
    var b = e.target.closest("button");
    if (b) setSample(b.dataset.v);
  });
  el.upload.addEventListener("click", function () { el.file.click(); });
  el.file.addEventListener("change", function () { useFile(el.file.files[0]); el.file.value = ""; });

  el.int.value = state.intensity;
  function syncInt() { el.intOut.textContent = state.intensity + "%"; el.int.style.setProperty("--p", state.intensity + "%"); }
  syncInt();
  el.int.addEventListener("input", function () {
    state.intensity = +el.int.value; syncInt(); renderPrompt(); redrawOnly(); save();
  });

  el.subj.value = state.subject;
  el.subj.addEventListener("input", function () { state.subject = el.subj.value; renderPrompt(); save(); });

  el.tabs.addEventListener("click", function (e) {
    var b = e.target.closest(".tab");
    if (!b) return;
    state.view = b.dataset.view;
    el.tabs.querySelectorAll(".tab").forEach(function (t) { t.setAttribute("aria-selected", String(t === b)); });
    renderPrompt();
  });

  var copyTimer = null;
  el.copy.addEventListener("click", function () {
    var text = el.out.textContent, label = el.copy.querySelector("span");
    function done() {
      label.textContent = "Copied";
      clearTimeout(copyTimer);
      copyTimer = setTimeout(function () { label.textContent = "Copy prompt"; }, 1400);
    }
    function fallback() {
      var ta = document.createElement("textarea");
      ta.value = text; ta.setAttribute("readonly", ""); ta.style.cssText = "position:fixed;top:0;left:-9999px;opacity:0";
      document.body.appendChild(ta); ta.select();
      try { document.execCommand("copy"); } catch (e) {}
      document.body.removeChild(ta); done();
    }
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done, fallback);
    else fallback();
  });

  // Split handle: pointer drag on the stage, arrow keys on the handle.
  var dragging = false;
  function splitFromEvent(e) {
    var r = el.stage.getBoundingClientRect();
    state.split = Math.max(0, Math.min(100, (e.clientX - r.left) / r.width * 100));
    redrawOnly();
  }
  el.stage.addEventListener("pointerdown", function (e) {
    if (e.button !== undefined && e.button > 0) return;
    dragging = true;
    try { el.stage.setPointerCapture(e.pointerId); } catch (err) {}
    splitFromEvent(e); el.split.focus({ preventScroll: true }); e.preventDefault();
  });
  el.stage.addEventListener("pointermove", function (e) { if (dragging) splitFromEvent(e); });
  function endDrag() { dragging = false; }
  el.stage.addEventListener("pointerup", endDrag);
  el.stage.addEventListener("pointercancel", endDrag);
  el.split.addEventListener("keydown", function (e) {
    var step = e.shiftKey ? 10 : 2, k = e.key, v = state.split;
    if (k === "ArrowLeft" || k === "ArrowDown") v -= step;
    else if (k === "ArrowRight" || k === "ArrowUp") v += step;
    else if (k === "Home") v = 0;
    else if (k === "End") v = 100;
    else return;
    state.split = Math.max(0, Math.min(100, v));
    redrawOnly(); e.preventDefault();
  });

  // Drop and paste
  function panelVisible() { var p = document.getElementById("panel-grade"); return p && !p.hidden; }
  ["dragenter", "dragover"].forEach(function (t) {
    el.drop.addEventListener(t, function (e) { e.preventDefault(); el.drop.classList.add("over"); });
  });
  ["dragleave", "drop"].forEach(function (t) {
    el.drop.addEventListener(t, function (e) { e.preventDefault(); el.drop.classList.remove("over"); });
  });
  el.drop.addEventListener("drop", function (e) {
    var f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
    if (f) useFile(f);
  });
  document.addEventListener("paste", function (e) {
    if (!panelVisible() || !e.clipboardData) return;
    var files = e.clipboardData.files;
    if (files && files.length && /^image\//.test(files[0].type)) { e.preventDefault(); useFile(files[0]); }
  });

  /* ------------------------------------------------------------------ boot */

  var started = false;
  function start() {
    if (started) return;
    started = true;
    syncCards(); syncFilter(); syncSeg(); renderPrompt(); moveSplit();
    var s = state.sample;
    state.sample = "";
    setSample(s);
  }
  document.addEventListener("apptab", function (e) { if (e.detail === "grade") start(); });
  function check() { if (panelVisible()) start(); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", check); else check();
  setTimeout(check, 0);
  setTimeout(check, 300);

  window.__gradeDebug = { state: state, gradeImageData: gradeImageData, gradeToCanvas: gradeToCanvas, presets: PRESETS, getRef: function () { return ref; } };
})();
