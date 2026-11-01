// Camera tab: interactive isometric visualizer of camera angles, shot sizes and movements.
// Three.js is loaded lazily from a pinned CDN build the first time the tab opens.
const THREE_URL = 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

const root = document.getElementById('camera3dRoot');
let started = false;
let api = null; // set once the scene exists, exposes requestRender

function panelVisible() {
  return !!root && root.offsetParent !== null;
}

function boot() {
  if (!root) return;
  if (started) {
    if (api) api.requestRender();
    return;
  }
  started = true;
  init().catch((err) => {
    console.error('camera3d', err);
    root.innerHTML = '<div class="panel c3"><div class="panel-head"><h2>Camera</h2></div><p class="c3-fail">The 3D view could not load. Check your connection and reload the page.</p></div>';
    started = false;
  });
}

document.addEventListener('apptab', (e) => {
  if (e.detail === 'camera') {
    // wait one frame so the panel is laid out
    requestAnimationFrame(boot);
  }
});
if (root) {
  if (panelVisible()) boot();
  else if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => { if (panelVisible()) boot(); });
  }
}

// ---------------------------------------------------------------------------
// helpers
const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
const lerp = (a, b, t) => a + (b - a) * t;
const sm = (x) => { x = clamp(x, 0, 1); return x * x * (3 - 2 * x); };
const hold = (s) => sm((s - 0.15) / 0.7);
const bump = (x) => (x > 0 && x < 1 ? 4 * x * (1 - x) : 0);
const D2R = Math.PI / 180;
const wrap180 = (a) => { a = ((a + 180) % 360 + 360) % 360 - 180; return a; };
const noise = (t, k) => Math.sin(t * 7.1 + k * 1.7) * 0.5 + Math.sin(t * 13.7 + k * 2.3) * 0.3 + Math.sin(t * 23.3 + k * 4.1) * 0.2;

const FOV = 40;
const RING = 1.6; // radius of the walking circle
const WALK = 14;

// ---------------------------------------------------------------------------
// shot size and angle presets

// visible subject height (world units) each size is meant to frame
const SIZE_H = {
  'Extreme wide shot': 12.4,
  'Wide shot': 4.5,
  'Full shot': 2.2,
  'Medium wide / cowboy': 1.3,
  'Medium shot': 1.0,
  'Medium close-up': 0.6,
  'Close-up': 0.35,
  'Extreme close-up': 0.12,
  'Insert / macro': 0.07
};
const SIZE_SHORT = {
  'Extreme wide shot': 'Extreme wide',
  'Wide shot': 'Wide shot',
  'Full shot': 'Full shot',
  'Medium wide / cowboy': 'Medium wide',
  'Medium shot': 'Medium shot',
  'Medium close-up': 'Medium close-up',
  'Close-up': 'Close-up',
  'Extreme close-up': 'Extreme close-up',
  'Insert / macro': 'Insert'
};
const TAN_HALF = Math.tan(FOV * D2R / 2);
const hToDist = (h) => h / (2 * TAN_HALF);

// target height follows distance so zooming always frames the sensible part of the body
const TY_STOPS = [[22, 0.9], [6, 1.0], [3, 1.05], [1.8, 1.2], [1.4, 1.32], [0.85, 1.46], [0.5, 1.6], [0.17, 1.67], [0.08, 1.67]];
function autoTy(dist) {
  const l = Math.log(dist);
  for (let i = 0; i < TY_STOPS.length - 1; i++) {
    const a = TY_STOPS[i], b = TY_STOPS[i + 1];
    if (dist <= a[0] && dist >= b[0]) {
      const t = (l - Math.log(a[0])) / (Math.log(b[0]) - Math.log(a[0]));
      return lerp(a[1], b[1], t);
    }
  }
  return dist > 22 ? 0.9 : 1.67;
}

// angle presets: az (deg, 0 = in front of the face), el (deg) or cy (camera height), roll, dist
const ANGLE = {
  "Bird's-eye view": { az: 20, el: 60, dist: 8 },
  'Dutch tilt': { az: 20, cy: 1.6, roll: 18 },
  'Establishing angle': { az: 35, el: 16, dist: 14 },
  'Extreme Dutch tilt': { az: 20, cy: 1.6, roll: 40 },
  'Eye level': { az: 0, cy: 1.6, roll: 0 },
  'From behind': { az: 180, cy: 1.6 },
  'Ground level': { az: 0, cy: 0.15 },
  'Hero angle': { az: 15, el: -16, dist: 3.2 },
  'High angle': { az: 15, el: 30 },
  'Hip level': { az: 0, cy: 0.95 },
  'Low angle': { az: 12, el: -24, dist: 3.2 },
  'Over-the-shoulder': { az: 22, cy: 1.55, dist: 2.1, ty: 1.5, ghost: 'ots' },
  'Overhead / top-down': { az: 0, el: 86, dist: 6.5, ty: 0.9 },
  'Point of view (POV)': { az: 0, cy: 1.55, dist: 2.6, ty: 1.5, ghost: 'pov' },
  Profile: { az: 90, cy: 1.6 },
  'Reverse angle': { az: 145, cy: 1.6 },
  'Shoulder level': { az: 0, cy: 1.45 },
  Single: { az: 0, cy: 1.6 },
  'Three-quarter': { az: 45, cy: 1.6 },
  'Two-shot': { az: 0, cy: 1.5, dist: 4.8, ghost: 'two' },
  'Upside down': { az: 0, cy: 1.6, roll: 180 },
  "Worm's-eye view": { az: 15, el: -55, dist: 2.4, ty: 1.5 }
};

const DEFAULT_POSE = () => ({ az: 0, el: 5.7, dist: hToDist(SIZE_H['Wide shot']), roll: 0, ty: 1.0, tx: 0, fov: FOV, cy: 1.6, autoTy: true });

// ---------------------------------------------------------------------------
// movements. Each fn(u, s, t, base) returns offsets applied on top of the user's pose.
// u: loop phase 0..1, s: eased ping pong 0..1..0, t: seconds.
//   azA elA distM distA fovM rollA  adjust the orbit pose
//   off [x y z] / loc [r u f]       move camera and look point together (world / camera local)
//   posLoc [r u f]                  move the camera only (look point stays)
//   yaw pitch                       rotate the look direction in place
//   sub (angle on the walking ring) subject walks, rel = camera keeps pose relative to heading
//   set {az el dist ty}             override the pose
//   abs {pos look}                  full override
//   shake, blur, fade, tod, tilt    effects
const MV = {
  'Static shot': { T: 4, fn: () => ({}) },

  'Pan right': { T: 5, fn: (u, s) => ({ yaw: -28 * (2 * hold(s) - 1) }) },
  'Pan left': { T: 5, fn: (u, s) => ({ yaw: 28 * (2 * hold(s) - 1) }) },
  'Whip pan right': { T: 3, fn: (u) => ({ yaw: -75 * (sm((u - 0.3) / 0.1) - sm((u - 0.8) / 0.1)), blur: 18 * (bump((u - 0.3) / 0.1) + bump((u - 0.8) / 0.1)) }) },
  'Whip pan left': { T: 3, fn: (u) => ({ yaw: 75 * (sm((u - 0.3) / 0.1) - sm((u - 0.8) / 0.1)), blur: 18 * (bump((u - 0.3) / 0.1) + bump((u - 0.8) / 0.1)) }) },
  'Tilt up': { T: 5, fn: (u, s) => ({ pitch: 17 * (2 * hold(s) - 1) }) },
  'Tilt down': { T: 5, fn: (u, s) => ({ pitch: -17 * (2 * hold(s) - 1) }) },

  'Fast zoom in': { T: 2.6, fn: (u, s) => ({ fovM: 1 - 0.68 * hold(s) }) },
  'Fast zoom out': { T: 2.6, fn: (u, s) => ({ fovM: 1 + 0.9 * hold(s) }) },
  'Slow zoom in': { T: 9, fn: (u, s) => ({ fovM: 1 - 0.45 * s }) },
  'Slow zoom out': { T: 9, fn: (u, s) => ({ fovM: 1 + 0.55 * s }) },
  'Crash zoom in': { T: 3, fn: (u, s) => { const q = sm((s - 0.45) / 0.12); return { fovM: 1 - 0.8 * q, shake: 0.02 * q, blur: 10 * q }; } },
  'Crash zoom out': { T: 3, fn: (u, s) => { const q = sm((s - 0.45) / 0.12); return { fovM: 1 + 1.4 * q, shake: 0.02 * q, blur: 10 * q }; } },

  'Dolly in': { T: 5, fn: (u, s) => ({ distM: 1 - 0.62 * hold(s) }) },
  'Dolly out': { T: 5, fn: (u, s) => ({ distM: 1 + 0.9 * hold(s) }) },
  'Tracking shot': { T: 12, fn: (u) => ({ sub: u * 2 * Math.PI }) },
  'Side tracking': { T: 12, fn: (u) => ({ sub: u * 2 * Math.PI, rel: true, set: { az: 90, el: 2 } }) },
  'Vehicle tracking': { T: 6, fn: (u, s, t) => ({ sub: u * 2 * Math.PI, rel: true, set: { az: 100, el: 6, dist: 5.5, ty: 0.9 }, shake: 0.012, fovM: 0.9 }) },
  'Chase shot': { T: 8, fn: (u) => ({ sub: u * 2 * Math.PI, rel: true, set: { az: 180, el: 14, dist: 2.6, ty: 1.3 }, shake: 0.008 }) },
  'Follow shot / over-the-shoulder': { T: 12, fn: (u) => ({ sub: u * 2 * Math.PI, rel: true, set: { az: 170, el: 6, dist: 1.8, ty: 1.45 }, posLoc: [0.3, 0.1, 0] }) },
  'Reverse tracking / walk-and-talk': { T: 12, fn: (u) => ({ sub: u * 2 * Math.PI, rel: true, set: { az: 0, el: 3, dist: 2.7, ty: 1.4 } }) },
  'Low tracking': { T: 12, fn: (u) => ({ sub: u * 2 * Math.PI, rel: true, set: { az: 55, el: -3, dist: 2.4, ty: 0.5 } }) },

  'Truck left': { T: 6, fn: (u, s) => ({ loc: [2.8 * (1 - 2 * hold(s)), 0, 0] }) },
  'Truck right': { T: 6, fn: (u, s) => ({ loc: [2.8 * (2 * hold(s) - 1), 0, 0] }) },
  'Pedestal up': { T: 5, fn: (u, s) => ({ off: [0, 1.0 * (2 * hold(s) - 1), 0] }) },
  'Pedestal down': { T: 5, fn: (u, s) => ({ off: [0, -1.0 * (2 * hold(s) - 1), 0] }) },
  'Slider left': { T: 5, fn: (u, s) => ({ posLoc: [1.0 * (1 - 2 * hold(s)), 0, 0] }) },
  'Slider right': { T: 5, fn: (u, s) => ({ posLoc: [1.0 * (2 * hold(s) - 1), 0, 0] }) },
  'Arc left': { T: 6, fn: (u, s) => ({ azA: 38 * (1 - 2 * hold(s)) }) },
  'Arc right': { T: 6, fn: (u, s) => ({ azA: 38 * (2 * hold(s) - 1) }) },
  'Orbit clockwise': { T: 12, fn: (u) => ({ azA: -360 * u }) },
  'Orbit counterclockwise': { T: 12, fn: (u) => ({ azA: 360 * u }) },
  'Push past / pass-by shot': {
    T: 6,
    fn: (u) => {
      const z = lerp(6.5, -3.2, u);
      const q = sm((u - 0.35) / 0.3);
      return { abs: { pos: [1.3, 1.35, z], look: [lerp(0, 1.0, q), 1.3, lerp(0, z - 4, q)] }, fade: sm((u - 0.92) / 0.08) + sm((0.06 - u) / 0.06) };
    }
  },

  'First-person view': {
    T: 16,
    fn: (u) => {
      const th = u * 2 * Math.PI;
      const hx = Math.cos(th), hz = -Math.sin(th);
      const bob = 0.03 * Math.sin(th * WALK * 2);
      const px = RING * Math.sin(th) + hx * 0.12, pz = RING * Math.cos(th) + hz * 0.12;
      return { sub: th, abs: { pos: [px, 1.6 + bob, pz], look: [px + hx * 3, 1.5 + bob * 2, pz + hz * 3] } };
    }
  },
  'Handheld shot': { T: 6, fn: () => ({ shake: 0.04 }) },

  'Crane up': { T: 6, fn: (u, s) => ({ posLoc: [0, 3.2 * hold(s), 0.4 * hold(s)] }) },
  'Crane down': { T: 6, fn: (u, s) => ({ posLoc: [0, 3.2 * (1 - hold(s)), 0.4 * (1 - hold(s))] }) },
  'Drone pull back': { T: 7, fn: (u, s) => ({ distM: 1 + 1.7 * hold(s), elA: 24 * hold(s) }) },
  'Drone push in': { T: 7, fn: (u, s) => ({ distM: 1.9 - 1.45 * hold(s), elA: 24 * (1 - hold(s)), shake: 0.006 }) },
  'Helicopter shot': { T: 16, fn: (u, s, t, b) => ({ azA: 360 * u, set: { el: 30, dist: Math.max(b.dist, 3.5) * 1.8 }, shake: 0.01 }) },

  'Body-mounted camera / Snorricam': { T: 12, fn: (u) => ({ sub: u * 2 * Math.PI, rel: true, set: { az: 0, el: 6, dist: 0.95, ty: 1.55 }, shake: 0.006 }) },
  'Pass through objects': {
    T: 6,
    prop: 'gate',
    fn: (u) => ({ abs: { pos: [0, 1.4, lerp(7.5, 1.0, u)], look: [0, 1.45, 0] }, fade: sm((u - 0.93) / 0.07) + sm((0.07 - u) / 0.07) })
  },
  'Tilt shift': { T: 6, fn: (u, s, t, b) => ({ set: { el: Math.max(b.el, 32), dist: Math.max(b.dist, 3) * 1.4 }, posLoc: [0.7 * (2 * hold(s) - 1), 0, 0], tilt: true }) },
  'Time lapse': { T: 10, prop: 'sun', fn: (u, s) => ({ tod: s }) },
  'Earth zoom out': { T: 8, fn: (u, s) => ({ distM: Math.pow(16, hold(s)), elA: 55 * hold(s) }) },
  'Infinite zoom': { T: 8, fn: (u) => ({ distM: Math.pow(0.05, u), fade: sm((u - 0.88) / 0.12) }) }
};

// ---------------------------------------------------------------------------
async function init() {
  const THREE = await import(THREE_URL);
  const LIB = window.CAMERA_LIB || { moves: [], angles: [], sizes: [] };
  const byTitle = (arr) => Object.fromEntries(arr.map((x) => [x.title, x]));
  const sizesBy = byTitle(LIB.sizes), anglesBy = byTitle(LIB.angles), movesBy = byTitle(LIB.moves);

  // ---- DOM ----
  const opt = (v, label, extra = '') => `<option value="${escapeHtml(v)}"${extra}>${escapeHtml(label || v)}</option>`;
  const cats = [];
  LIB.moves.forEach((m) => { if (!cats.includes(m.category)) cats.push(m.category); });
  const moveOpts = '<option value="">None</option>' + cats.map((c) =>
    `<optgroup label="${escapeHtml(c)}">${LIB.moves.filter((m) => m.category === c).map((m) => opt(m.title)).join('')}</optgroup>`).join('');
  const angleOpts = '<option value="" disabled hidden>Custom</option>' + LIB.angles.map((a) => opt(a.title)).join('');
  const sizeOpts = '<option value="" disabled hidden>Custom</option>' + LIB.sizes.map((a) => opt(a.title)).join('');

  root.innerHTML = `
  <section class="panel c3" aria-labelledby="c3Title">
    <div class="panel-head"><h2 id="c3Title">Camera</h2><span class="meta" id="c3Reads" aria-live="polite"></span></div>
    <div class="c3-body">
      <div class="c3-controls">
        <div><label for="c3Size">Shot size</label><select id="c3Size">${sizeOpts}</select></div>
        <div><label for="c3Angle">Angle</label><select id="c3Angle">${angleOpts}</select></div>
        <div><label for="c3Move">Movement</label><select id="c3Move">${moveOpts}</select></div>
        <div class="c3-btns">
          <button type="button" class="btn primary" id="c3Play" disabled>Play</button>
          <button type="button" class="btn" id="c3Reset">Reset</button>
        </div>
      </div>
      <div class="c3-stage" id="c3Stage" tabindex="0" role="img" aria-label="Camera preview">
        <canvas id="c3Canvas"></canvas>
        <div class="c3-inset" id="c3Inset">
          <div class="c3-view" id="c3View">
            <svg class="c3-thirds" viewBox="0 0 3 3" preserveAspectRatio="none" aria-hidden="true">
              <path d="M1 0V3M2 0V3M0 1H3M0 2H3" vector-effect="non-scaling-stroke"/>
            </svg>
            <div class="c3-tilt" id="c3Tilt" hidden></div>
            <div class="c3-blur" id="c3Blur"></div>
            <div class="c3-fade" id="c3Fade"></div>
            <span class="c3-size" id="c3SizeTag"></span>
          </div>
        </div>
        <div class="c3-hintbar" id="c3HintBar">Drag to orbit the camera. Scroll to zoom. Shift-drag turns the view.</div>
      </div>
      <div class="c3-zoom" role="group" aria-label="Zoom">
        <span class="c3-zlabel" id="c3ZoomLabel">Zoom</span>
        <button type="button" class="btn c3-step" id="c3ZoomOut" aria-label="Zoom out">&minus;</button>
        <input type="range" id="c3Zoom" min="0" max="1" step="0.001" value="0.3" aria-labelledby="c3ZoomLabel">
        <button type="button" class="btn c3-step" id="c3ZoomIn" aria-label="Zoom in">+</button>
      </div>
      <div class="c3-info">
        <div class="c3-hints" id="c3Hints"></div>
        <div class="c3-out">
          <label for="c3Prompt">Camera prompt</label>
          <textarea id="c3Prompt" readonly rows="5"></textarea>
          <div class="c3-copyrow"><button type="button" class="btn primary" id="c3Copy">Copy camera prompt</button></div>
        </div>
      </div>
    </div>
  </section>`;

  const $ = (id) => document.getElementById(id);
  const el = {
    size: $('c3Size'), angle: $('c3Angle'), move: $('c3Move'), play: $('c3Play'), reset: $('c3Reset'),
    stage: $('c3Stage'), canvas: $('c3Canvas'), inset: $('c3Inset'), view: $('c3View'),
    sizeTag: $('c3SizeTag'), tilt: $('c3Tilt'), blur: $('c3Blur'), fade: $('c3Fade'), hintbar: $('c3HintBar'),
    zoom: $('c3Zoom'), zin: $('c3ZoomIn'), zout: $('c3ZoomOut'), hints: $('c3Hints'), prompt: $('c3Prompt'),
    copy: $('c3Copy'), reads: $('c3Reads')
  };

  // ---- three setup ----
  const renderer = new THREE.WebGLRenderer({ canvas: el.canvas, antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  const BG_DAY = new THREE.Color('#f1eee8');
  scene.background = BG_DAY.clone();
  scene.fog = new THREE.Fog(BG_DAY.clone(), 40, 220);

  const hemi = new THREE.HemisphereLight(0xffffff, 0xd9d2c6, 1.9);
  scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xffffff, 2.3);
  sun.position.set(5, 9, 6);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  const sc = sun.shadow.camera;
  sc.left = -9; sc.right = 9; sc.top = 9; sc.bottom = -9; sc.near = 1; sc.far = 40;
  sun.shadow.bias = -0.0005;
  sun.shadow.normalBias = 0.03;
  scene.add(sun);

  const mat = (color, extra = {}) => new THREE.MeshStandardMaterial({ color, flatShading: true, roughness: 0.92, metalness: 0, ...extra });
  const GOLD = '#E5B76A';
  const matFloor = mat('#e7e2d8');
  const matStage = mat('#efe9de');
  const matWall = mat('#e8e2d5');
  const matGold = mat(GOLD, { roughness: 0.6 });
  const matDark = mat('#1d1d1f', { roughness: 0.7 });

  const shadowed = (m, cast = true, recv = true) => { m.castShadow = cast; m.receiveShadow = recv; return m; };

  // floor, stage, grid
  const floor = shadowed(new THREE.Mesh(new THREE.PlaneGeometry(900, 900), matFloor), false, true);
  floor.rotation.x = -Math.PI / 2;
  scene.add(floor);
  const stage = shadowed(new THREE.Mesh(new THREE.CylinderGeometry(5, 5, 0.05, 40), matStage), false, true);
  stage.position.y = 0.025;
  scene.add(stage);
  const grid = new THREE.GridHelper(40, 40, 0xcfc9bc, 0xe0dbd0);
  grid.position.y = 0.055;
  grid.material.transparent = true;
  grid.material.opacity = 0.55;
  scene.add(grid);

  // floor mark under the subject
  const mark = new THREE.Group();
  for (const r of [Math.PI / 4, -Math.PI / 4]) {
    const b = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.01, 0.045), matGold);
    b.rotation.y = r; b.position.y = 0.058; mark.add(b);
  }
  scene.add(mark);

  // backdrop
  const backdrop = new THREE.Group();
  const wall = shadowed(new THREE.Mesh(new THREE.BoxGeometry(10, 4.6, 0.14), matWall), true, true);
  wall.position.set(0, 2.3, -3.4);
  backdrop.add(wall);
  const trim = new THREE.Mesh(new THREE.BoxGeometry(10.02, 0.1, 0.16), matGold);
  trim.position.set(0, 0.35, -3.4); backdrop.add(trim);
  const trim2 = new THREE.Mesh(new THREE.BoxGeometry(10.02, 0.06, 0.16), matDark);
  trim2.position.set(0, 4.6, -3.4); backdrop.add(trim2);
  for (const x of [-5, 5]) {
    const leg = shadowed(new THREE.Mesh(new THREE.BoxGeometry(0.14, 4.6, 0.5), matDark), true, true);
    leg.position.set(x, 2.3, -3.3); backdrop.add(leg);
  }
  scene.add(backdrop);

  // gate prop for "pass through objects"
  const gate = new THREE.Group();
  for (const x of [-0.95, 0.95]) {
    const p = shadowed(new THREE.Mesh(new THREE.BoxGeometry(0.16, 2.4, 0.2), matDark));
    p.position.set(x, 1.2, 3); gate.add(p);
  }
  const beam = shadowed(new THREE.Mesh(new THREE.BoxGeometry(2.06, 0.16, 0.2), matDark));
  beam.position.set(0, 2.4, 3); gate.add(beam);
  const beamG = new THREE.Mesh(new THREE.BoxGeometry(2.06, 0.05, 0.22), matGold);
  beamG.position.set(0, 2.28, 3); gate.add(beamG);
  gate.visible = false;
  scene.add(gate);

  // figure builder
  function makeFigure(bodyColor, opts = {}) {
    const g = new THREE.Group();
    const body = mat(bodyColor);
    const parts = {};
    const add = (parent, geo, m, x, y, z) => { const me = shadowed(new THREE.Mesh(geo, m)); me.position.set(x, y, z); parent.add(me); return me; };
    // legs
    for (const [name, x] of [['legL', -0.1], ['legR', 0.1]]) {
      const pivot = new THREE.Group(); pivot.position.set(x, 0.9, 0);
      add(pivot, new THREE.CylinderGeometry(0.075, 0.055, 0.86, 6), body, 0, -0.43, 0);
      add(pivot, new THREE.BoxGeometry(0.11, 0.07, 0.24), matDark, 0, -0.87, 0.05);
      g.add(pivot); parts[name] = pivot;
    }
    add(g, new THREE.BoxGeometry(0.34, 0.16, 0.2), body, 0, 0.93, 0);
    const torso = add(g, new THREE.CylinderGeometry(0.2, 0.15, 0.6, 6), body, 0, 1.22, 0);
    torso.scale.z = 0.62; parts.torso = torso;
    // gold stripe down the back, marks which way is behind
    add(g, new THREE.BoxGeometry(0.06, 0.5, 0.02), matGold, 0, 1.22, -0.1);
    // chest plate on the front
    add(g, new THREE.BoxGeometry(0.2, 0.14, 0.02), matDark, 0, 1.3, 0.1);
    for (const [name, x] of [['armL', -0.27], ['armR', 0.27]]) {
      const pivot = new THREE.Group(); pivot.position.set(x, 1.45, 0);
      add(pivot, new THREE.SphereGeometry(0.075, 6, 5), body, 0, 0, 0);
      add(pivot, new THREE.CylinderGeometry(0.05, 0.04, 0.58, 6), body, 0, -0.3, 0);
      add(pivot, new THREE.SphereGeometry(0.052, 6, 5), body, 0, -0.62, 0);
      g.add(pivot); parts[name] = pivot;
    }
    add(g, new THREE.CylinderGeometry(0.05, 0.06, 0.1, 6), body, 0, 1.55, 0);
    const head = new THREE.Group(); head.position.set(0, 1.66, 0);
    add(head, new THREE.SphereGeometry(0.125, 8, 6), body, 0, 0, 0);
    add(head, new THREE.BoxGeometry(0.17, 0.05, 0.03), matDark, 0, 0.015, 0.105); // visor
    const nose = add(head, new THREE.ConeGeometry(0.025, 0.07, 4), matGold, 0, -0.025, 0.135);
    nose.rotation.x = Math.PI / 2;
    add(head, new THREE.SphereGeometry(0.03, 5, 4), matGold, 0, 0.02, -0.12); // back of head marker
    g.add(head); parts.head = head;
    g.userData.parts = parts;
    if (opts.ghost) {
      g.traverse((o) => { if (o.isMesh) { o.material = o.material.clone(); } });
    }
    return g;
  }

  const subject = makeFigure('#d6cfc3');
  scene.add(subject);
  const ghostB = makeFigure('#8793a1');
  ghostB.visible = false;
  scene.add(ghostB);
  const twoB = makeFigure('#b7c3d1');
  twoB.position.set(1.0, 0, 0.05);
  twoB.rotation.y = -0.25;
  twoB.visible = false;
  scene.add(twoB);

  // sun marker for time lapse
  const sunBall = new THREE.Mesh(new THREE.SphereGeometry(0.4, 10, 8), new THREE.MeshBasicMaterial({ color: GOLD }));
  sunBall.visible = false;
  scene.add(sunBall);

  // ---- shot camera rig (layer 1: only the overview camera sees it) ----
  const L1 = 1;
  const rig = new THREE.Group();
  const rigBody = shadowed(new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.26, 0.5), matDark), false, false);
  rig.add(rigBody);
  const lens = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.09, 0.26, 8), mat('#2c2c2e'));
  lens.rotation.x = Math.PI / 2; lens.position.z = -0.37; rig.add(lens);
  const lensRing = new THREE.Mesh(new THREE.CylinderGeometry(0.095, 0.095, 0.03, 8), matGold);
  lensRing.rotation.x = Math.PI / 2; lensRing.position.z = -0.5; rig.add(lensRing);
  const matte = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.17, 0.1), mat('#3a3a3d'));
  matte.position.z = -0.57; rig.add(matte);
  const mag = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.2, 0.34), mat('#2c2c2e'));
  mag.position.set(0, 0.23, 0.08); rig.add(mag);
  const handle = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.05, 0.3), matGold);
  handle.position.set(0, 0.36, -0.05); rig.add(handle);
  const tally = new THREE.Mesh(new THREE.SphereGeometry(0.028, 6, 5), matGold);
  tally.position.set(0.1, 0.1, -0.2); rig.add(tally);
  scene.add(rig);

  const legs = [0, 1, 2].map(() => {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 1, 5), matDark);
    scene.add(m); return m;
  });
  const plate = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.04, 8), matDark);
  scene.add(plate);

  // frustum
  const fPos = new Float32Array(5 * 3);
  const fGeo = new THREE.BufferGeometry();
  fGeo.setAttribute('position', new THREE.BufferAttribute(fPos, 3).setUsage(THREE.DynamicDrawUsage));
  fGeo.setIndex([0, 1, 2, 0, 2, 3, 0, 3, 4, 0, 4, 1]);
  const frustumMesh = new THREE.Mesh(fGeo, new THREE.MeshBasicMaterial({ color: GOLD, transparent: true, opacity: 0.16, side: THREE.DoubleSide, depthWrite: false }));
  frustumMesh.frustumCulled = false;
  const lineGeo = new THREE.BufferGeometry();
  lineGeo.setAttribute('position', fGeo.getAttribute('position'));
  lineGeo.setIndex([0, 1, 0, 2, 0, 3, 0, 4, 1, 2, 2, 3, 3, 4, 4, 1]);
  const frustumLines = new THREE.LineSegments(lineGeo, new THREE.LineBasicMaterial({ color: '#c9962f', transparent: true, opacity: 0.85 }));
  frustumLines.frustumCulled = false;
  scene.add(frustumMesh, frustumLines);

  // movement path
  const pathMat = new THREE.LineDashedMaterial({ color: '#c9962f', dashSize: 0.14, gapSize: 0.1, transparent: true, opacity: 0.95 });
  const pathMat2 = new THREE.LineDashedMaterial({ color: '#c9962f', dashSize: 0.06, gapSize: 0.1, transparent: true, opacity: 0.5 });
  let pathLine = null, lookLine = null;

  [rig, plate, frustumMesh, frustumLines, sunBall, ...legs].forEach((o) => o.traverse((c) => c.layers.set(L1)));

  // ---- cameras ----
  const shotCam = new THREE.PerspectiveCamera(FOV, 16 / 9, 0.02, 900);
  const ovCam = new THREE.OrthographicCamera(-8, 8, 5, -5, -200, 400);
  ovCam.layers.enable(L1);

  // ---- state ----
  const S = {
    base: DEFAULT_POSE(),
    ghost: null,
    moveTitle: '',
    playing: false,
    mt: 0,
    tween: null,
    ov: { az: 38 * D2R, el: 35.264 * D2R },
    ovC: new THREE.Vector3(0, 0.9, 0),
    ovExt: 6,
    view: null,
    dirty: true,
    running: false,
    last: 0
  };
  const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const V = (a) => new THREE.Vector3(a[0], a[1], a[2]);
  const UP = new THREE.Vector3(0, 1, 0);

  // ---- solve the shot camera from base pose + movement ----
  function solve(base, mv, u, t) {
    const D = mv ? mv.fn(u, 0.5 - 0.5 * Math.cos(u * 2 * Math.PI), t, base) : {};
    const set = D.set || {};
    let az = (set.az ?? base.az) + (D.azA || 0);
    let elv = (set.el ?? base.el) + (D.elA || 0);
    const dist = clamp((set.dist ?? base.dist) * (D.distM || 1) + (D.distA || 0), 0.06, 500);
    const ty = set.ty ?? base.ty;
    const fov = clamp(base.fov * (D.fovM || 1), 6, 120);
    let roll = base.roll + (D.rollA || 0);

    let sx = 0, sz = 0, sry = 0, walk = 0, walking = false;
    if (D.sub != null) {
      const th = D.sub;
      sx = RING * Math.sin(th); sz = RING * Math.cos(th);
      sry = Math.atan2(Math.cos(th), -Math.sin(th));
      walk = th * WALK; walking = true;
    }
    if (D.rel) az += sry / D2R;
    const tgt = new THREE.Vector3(sx + (walking ? 0 : base.tx), ty, sz);
    const ar = az * D2R, er = elv * D2R;
    const pos = new THREE.Vector3(Math.sin(ar) * Math.cos(er), Math.sin(er), Math.cos(ar) * Math.cos(er)).multiplyScalar(dist).add(tgt);

    const frame = () => {
      const f = tgt.clone().sub(pos).normalize();
      let r = new THREE.Vector3().crossVectors(f, UP);
      if (r.lengthSq() < 1e-6) r.set(1, 0, 0);
      r.normalize();
      const up = new THREE.Vector3().crossVectors(r, f).normalize();
      return { f, r, up };
    };
    if (D.loc || D.posLoc || D.off) {
      const { f, r, up } = frame();
      if (D.loc) { const o = r.clone().multiplyScalar(D.loc[0]).addScaledVector(up, D.loc[1]).addScaledVector(f, D.loc[2]); pos.add(o); tgt.add(o); }
      if (D.off) { const o = V(D.off); pos.add(o); tgt.add(o); }
      if (D.posLoc) { const o = r.clone().multiplyScalar(D.posLoc[0]).addScaledVector(up, D.posLoc[1]).addScaledVector(f, D.posLoc[2]); pos.add(o); }
    }
    if (D.yaw || D.pitch) {
      const dir = tgt.clone().sub(pos);
      if (D.yaw) dir.applyAxisAngle(UP, D.yaw * D2R);
      if (D.pitch) {
        const rr = new THREE.Vector3().crossVectors(dir, UP).normalize();
        dir.applyAxisAngle(rr, D.pitch * D2R);
      }
      tgt.copy(pos).add(dir);
    }
    if (D.shake) {
      const a = D.shake;
      pos.add(new THREE.Vector3(noise(t, 1), noise(t, 2) * 0.7, noise(t, 3)).multiplyScalar(a));
      tgt.add(new THREE.Vector3(noise(t, 4), noise(t, 5), noise(t, 6)).multiplyScalar(a * 0.9));
      roll += noise(t, 7) * a * 30;
    }
    if (D.abs) { pos.copy(V(D.abs.pos)); tgt.copy(V(D.abs.look)); }
    pos.y = Math.max(pos.y, 0.04);
    return {
      pos, tgt, fov, roll, dist,
      sub: { x: sx, z: sz, ry: sry, walk, walking },
      tod: D.tod, fade: clamp(D.fade || 0, 0, 1), blur: D.blur || 0, tilt: !!D.tilt
    };
  }

  // ---- reading the pose back as library titles ----
  function readAngle(b) {
    const roll = Math.abs(wrap180(b.roll));
    if (roll > 150) return 'Upside down';
    if (roll > 28) return 'Extreme Dutch tilt';
    if (roll > 8) return 'Dutch tilt';
    const e = b.el;
    if (e > 75) return 'Overhead / top-down';
    if (e > 45) return "Bird's-eye view";
    if (e > 14) return 'High angle';
    if (e < -45) return "Worm's-eye view";
    if (e < -10) return 'Low angle';
    const az = Math.abs(wrap180(b.az));
    if (az > 155) return 'From behind';
    if (az > 115) return 'Reverse angle';
    if (az > 65) return 'Profile';
    if (az > 28) return 'Three-quarter';
    const cy = b.ty + Math.sin(e * D2R) * b.dist;
    const r = b.dist * Math.cos(e * D2R);
    if (cy < 0.55) return 'Ground level';
    if (cy < 1.2) return 'Hip level';
    if (cy < 1.5 && r < 3) return 'Shoulder level';
    return 'Eye level';
  }
  function readSize(b) {
    const h = 2 * b.dist * Math.tan(b.fov * D2R / 2);
    let best = null, bd = 1e9;
    for (const [k, v] of Object.entries(SIZE_H)) {
      const d = Math.abs(Math.log(h / v));
      if (d < bd) { bd = d; best = k; }
    }
    return best;
  }

  // ---- pose helpers ----
  function elFromCy(cy, ty, dist) { return Math.asin(clamp((cy - ty) / dist, -0.99, 0.99)) / D2R; }
  function floorEl(b) { return Math.asin(clamp((0.05 - b.ty) / b.dist, -1, 1)) / D2R; }
  function clampPose(b) {
    b.dist = clamp(b.dist, 0.08, 22);
    b.el = clamp(b.el, Math.max(-88, floorEl(b)), 86);
    return b;
  }
  const settled = () => (S.tween ? S.tween.to : S.base);
  function poseForSize(title) {
    const p = { ...settled() };
    p.dist = hToDist(SIZE_H[title]);
    p.fov = FOV;
    if (title === 'Insert / macro') { p.dist = 0.1; p.ty = 0.88; p.tx = 0.3; p.autoTy = false; }
    else { p.autoTy = true; p.tx = 0; p.ty = autoTy(p.dist); }
    if (p.cy != null) p.el = elFromCy(p.cy, p.ty, p.dist);
    return clampPose(p);
  }
  function poseForAngle(title) {
    const a = ANGLE[title] || {};
    const p = { ...settled() };
    if (a.dist != null) p.dist = a.dist;
    p.roll = a.roll || 0;
    p.az = a.az;
    p.tx = 0;
    if (a.ty != null) { p.ty = a.ty; p.autoTy = false; }
    else { p.autoTy = true; p.ty = autoTy(p.dist); }
    if (a.cy != null) { p.cy = a.cy; p.el = elFromCy(a.cy, p.ty, p.dist); }
    else { p.cy = null; p.el = a.el; }
    return clampPose(p);
  }

  function startTween(to, ms = 600) {
    const from = { ...S.base };
    // take the short way around for angles
    let dAz = wrap180(to.az - from.az), dRoll = wrap180(to.roll - from.roll);
    S.tween = { from, to, t0: performance.now(), ms, dAz, dRoll };
    requestRender();
  }
  function stepTween(now) {
    const tw = S.tween;
    if (!tw) return false;
    let k = clamp((now - tw.t0) / tw.ms, 0, 1);
    const e = k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
    const { from: f, to } = tw;
    const b = S.base;
    b.az = f.az + tw.dAz * e;
    b.roll = f.roll + tw.dRoll * e;
    b.el = lerp(f.el, to.el, e);
    b.dist = Math.exp(lerp(Math.log(f.dist), Math.log(to.dist), e));
    b.ty = lerp(f.ty, to.ty, e);
    b.tx = lerp(f.tx, to.tx, e);
    b.fov = lerp(f.fov, to.fov, e);
    if (k >= 1) {
      Object.assign(b, to);
      b.az = wrap180(b.az); b.roll = wrap180(b.roll);
      S.tween = null;
    }
    return true;
  }

  // ---- UI sync ----
  function setSelectsCustom(which) {
    if (which.angle) el.angle.value = '';
    if (which.size) el.size.value = '';
  }
  function currentTitles() {
    const b = S.base;
    return {
      size: el.size.value || readSize(b),
      angle: el.angle.value || readAngle(b),
      move: S.moveTitle
    };
  }
  let lastKey = '';
  function updateTexts(force) {
    const t = currentTitles();
    const key = t.size + '|' + t.angle + '|' + t.move + '|' + (el.angle.value || '') + (el.size.value || '');
    if (key === lastKey && !force) return;
    lastKey = key;
    const custom = !el.angle.value || !el.size.value;
    el.reads.textContent = (custom ? 'Reads as: ' : '') + t.angle + ' · ' + (SIZE_SHORT[t.size] || t.size);
    el.sizeTag.textContent = SIZE_SHORT[t.size] || t.size;
    const lines = [];
    const sz = sizesBy[t.size], an = anglesBy[t.angle], mv = movesBy[t.move];
    const hint = (label, item) => item ? `<p><strong>${label}</strong> ${escapeHtml(item.title)}. ${escapeHtml(item.hint || '')}</p>` : '';
    el.hints.innerHTML = hint('Shot size', sz) + hint('Angle', an) + (mv ? hint('Movement', mv) : '<p><strong>Movement</strong> None. The camera holds still.</p>');
    const parts = [];
    if (sz) parts.push('Shot size: ' + sz.prompt);
    if (an) parts.push('Angle: ' + an.prompt);
    if (mv) parts.push('Movement: ' + mv.prompt);
    el.prompt.value = parts.join('\n');
    el.stage.setAttribute('aria-label',
      `Camera preview of a figure on a set. Angle: ${t.angle}. Shot size: ${t.size}. Movement: ${t.move || 'none'}.`);
  }
  function syncZoom() {
    const t = Math.log(S.base.dist / 22) / Math.log(0.08 / 22);
    el.zoom.value = String(clamp(t, 0, 1));
  }
  const distFromZoom = (t) => 22 * Math.pow(0.08 / 22, t);

  function afterManual(opts = {}) {
    S.tween = null;
    if (!opts.keepAngle) S.base.cy = null;
    setSelectsCustom({ angle: true, size: !!opts.size });
    if (opts.size && S.base.autoTy) { S.base.ty = autoTy(S.base.dist); S.base.tx = 0; }
    clampPose(S.base);
    syncZoom();
    updateTexts();
    if (S.moveTitle) rebuildPath();
    requestRender();
  }

  // ---- pointer, wheel, keyboard ----
  const ptr = { id: null, x: 0, y: 0, mode: null };
  el.stage.addEventListener('contextmenu', (e) => e.preventDefault());
  el.stage.addEventListener('pointerdown', (e) => {
    if (e.pointerType === 'mouse' && e.button !== 0 && e.button !== 2) return;
    if (ptr.id != null) return;
    ptr.id = e.pointerId; ptr.x = e.clientX; ptr.y = e.clientY;
    ptr.mode = (e.shiftKey || e.button === 2) ? 'ov' : 'shot';
    el.stage.setPointerCapture(e.pointerId);
    el.stage.classList.add('is-drag');
  });
  el.stage.addEventListener('pointermove', (e) => {
    if (e.pointerId !== ptr.id) return;
    const dx = e.clientX - ptr.x, dy = e.clientY - ptr.y;
    ptr.x = e.clientX; ptr.y = e.clientY;
    if (ptr.mode === 'ov') {
      S.ov.az -= dx * 0.008;
      S.ov.el = clamp(S.ov.el + dy * 0.006, 8 * D2R, 80 * D2R);
      requestRender();
    } else {
      S.base.az = wrap180(S.base.az + dx * 0.45);
      S.base.el = S.base.el - dy * 0.35;
      afterManual();
    }
  });
  const endDrag = (e) => {
    if (e.pointerId !== ptr.id) return;
    ptr.id = null;
    el.stage.classList.remove('is-drag');
  };
  el.stage.addEventListener('pointerup', endDrag);
  el.stage.addEventListener('pointercancel', endDrag);

  function zoomBy(factor) {
    S.base.dist *= factor;
    S.base.fov = FOV;
    S.base.autoTy = true;
    afterManual({ keepAngle: true, size: true });
  }
  el.stage.addEventListener('wheel', (e) => {
    e.preventDefault();
    const d = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaY;
    zoomBy(Math.exp(clamp(d, -200, 200) * 0.0016));
  }, { passive: false });
  el.stage.addEventListener('keydown', (e) => {
    const k = e.key;
    let used = true;
    if (k === 'ArrowLeft') { S.base.az = wrap180(S.base.az - 5); afterManual(); }
    else if (k === 'ArrowRight') { S.base.az = wrap180(S.base.az + 5); afterManual(); }
    else if (k === 'ArrowUp') { S.base.el += 4; afterManual(); }
    else if (k === 'ArrowDown') { S.base.el -= 4; afterManual(); }
    else if (k === '+' || k === '=') zoomBy(0.9);
    else if (k === '-' || k === '_') zoomBy(1.1);
    else used = false;
    if (used) e.preventDefault();
  });
  el.zoom.addEventListener('input', () => {
    S.base.dist = distFromZoom(parseFloat(el.zoom.value));
    S.base.fov = FOV;
    S.base.autoTy = true;
    afterManual({ keepAngle: true, size: true });
    // keep slider under the pointer even if clamping adjusted dist
  });
  el.zin.addEventListener('click', () => zoomBy(0.85));
  el.zout.addEventListener('click', () => zoomBy(1 / 0.85));

  // ---- selects ----
  el.size.value = 'Wide shot';
  el.angle.value = 'Eye level';
  el.size.addEventListener('change', () => {
    if (!el.size.value) return;
    startTween(poseForSize(el.size.value));
    updateTexts();
  });
  el.angle.addEventListener('change', () => {
    if (!el.angle.value) return;
    const p = poseForAngle(el.angle.value);
    S.ghost = ANGLE[el.angle.value].ghost || null;
    startTween(p);
    // sizes follow along when an angle changes the distance
    if (ANGLE[el.angle.value].dist != null) el.size.value = readSize(p);
    updateTexts();
  });
  el.move.addEventListener('change', () => {
    S.moveTitle = el.move.value;
    S.mt = 0;
    S.playing = !!S.moveTitle && !reduceMotion;
    refreshPlay();
    rebuildPath();
    updateTexts();
    requestRender();
  });
  function refreshPlay() {
    el.play.disabled = !S.moveTitle;
    el.play.setAttribute('aria-disabled', S.moveTitle ? 'false' : 'true');
    el.play.title = S.moveTitle ? '' : 'Choose a movement to play';
    el.play.textContent = S.playing ? 'Pause' : 'Play';
    el.play.setAttribute('aria-pressed', S.playing ? 'true' : 'false');
  }
  el.play.addEventListener('click', () => {
    S.playing = !S.playing;
    refreshPlay();
    requestRender();
  });
  el.reset.addEventListener('click', () => {
    S.moveTitle = ''; el.move.value = ''; S.playing = false; S.mt = 0; S.ghost = null;
    S.ov = { az: 38 * D2R, el: 35.264 * D2R };
    el.size.value = 'Wide shot'; el.angle.value = 'Eye level';
    const p = DEFAULT_POSE();
    startTween(p);
    refreshPlay();
    rebuildPath();
    updateTexts(true);
  });
  el.copy.addEventListener('click', async () => {
    const text = el.prompt.value;
    let ok = false;
    try { await navigator.clipboard.writeText(text); ok = true; } catch (_) { /* fall through */ }
    if (!ok) {
      const ta = document.createElement('textarea');
      ta.value = text; ta.setAttribute('readonly', ''); ta.style.cssText = 'position:fixed;left:-9999px;top:0';
      document.body.appendChild(ta); ta.select();
      try { ok = document.execCommand('copy'); } catch (_) { ok = false; }
      ta.remove();
    }
    const old = 'Copy camera prompt';
    el.copy.textContent = ok ? 'Copied' : 'Press Ctrl+C to copy';
    if (!ok) { el.prompt.focus(); el.prompt.select(); }
    clearTimeout(el.copy._t);
    el.copy._t = setTimeout(() => { el.copy.textContent = old; }, 1700);
  });

  // ---- movement path ----
  function rebuildPath() {
    for (const l of [pathLine, lookLine]) { if (l) { scene.remove(l); l.geometry.dispose(); } }
    pathLine = lookLine = null;
    const mv = MV[S.moveTitle];
    if (!mv) return;
    const N = 120;
    const P = [], Lk = [];
    for (let i = 0; i <= N; i++) {
      const v = solve(S.base, mv, i / N, 0);
      P.push(v.pos);
      const d = v.tgt.clone().sub(v.pos).normalize().multiplyScalar(Math.min(v.dist, 8)).add(v.pos);
      Lk.push(d);
    }
    const build = (pts, material, minLen) => {
      let len = 0;
      for (let i = 1; i < pts.length; i++) len += pts[i].distanceTo(pts[i - 1]);
      if (len < minLen) return null;
      const jump = Math.max(2.5, len / pts.length * 6);
      const arr = [];
      for (let i = 1; i < pts.length; i++) {
        if (pts[i].distanceTo(pts[i - 1]) > jump) continue;
        arr.push(pts[i - 1].x, pts[i - 1].y, pts[i - 1].z, pts[i].x, pts[i].y, pts[i].z);
      }
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.Float32BufferAttribute(arr, 3));
      const line = new THREE.LineSegments(g, material);
      line.computeLineDistances();
      line.layers.set(L1);
      line.frustumCulled = false;
      scene.add(line);
      return line;
    };
    pathLine = build(P, pathMat, 0.25);
    lookLine = build(Lk, pathMat2, 0.5);
  }

  // ---- sizing ----
  const size = { w: 0, h: 0, ix: 0, iy: 0, iw: 0, ih: 0 };
  function resize() {
    const r = el.stage.getBoundingClientRect();
    if (r.width < 10 || r.height < 10) return false;
    size.w = r.width; size.h = r.height;
    renderer.setSize(r.width, r.height, false);
    const v = el.view.getBoundingClientRect();
    size.ix = v.left - r.left; size.iy = v.top - r.top; size.iw = v.width; size.ih = v.height;
    ovCam.userData.aspect = r.width / r.height;
    S.dirty = true;
    return true;
  }
  new ResizeObserver(() => { if (resize()) requestRender(); }).observe(el.stage);
  new IntersectionObserver((es) => { if (es.some((e) => e.isIntersecting)) requestRender(); }).observe(el.stage);

  // ---- tripod helper ----
  const yAxis = new THREE.Vector3(0, 1, 0);
  function place(mesh, a, b, radius) {
    const dir = b.clone().sub(a);
    const len = dir.length();
    mesh.position.copy(a).addScaledVector(dir, 0.5);
    mesh.scale.set(radius, len, radius);
    mesh.quaternion.setFromUnitVectors(yAxis, dir.normalize());
  }

  // ---- per-frame update ----
  const tmpA = new THREE.Vector3(), tmpB = new THREE.Vector3();
  function applyScene(view, t) {
    const { pos, tgt } = view;
    shotCam.fov = view.fov;
    shotCam.position.copy(pos);
    shotCam.up.set(0, 1, 0);
    shotCam.lookAt(tgt);
    shotCam.rotateZ(view.roll * D2R);
    shotCam.updateProjectionMatrix();
    shotCam.updateMatrixWorld(true);

    // subject
    const s = view.sub;
    subject.position.set(s.x, 0, s.z);
    subject.rotation.y = s.ry;
    const pr = subject.userData.parts;
    if (s.walking) {
      const sw = Math.sin(s.walk) * 0.65;
      pr.legL.rotation.x = sw; pr.legR.rotation.x = -sw;
      pr.armL.rotation.x = -sw * 0.8; pr.armR.rotation.x = sw * 0.8;
      subject.position.y = Math.abs(Math.cos(s.walk)) * 0.025;
    } else {
      pr.legL.rotation.x = pr.legR.rotation.x = pr.armL.rotation.x = pr.armR.rotation.x = 0;
      subject.position.y = 0;
      pr.torso.scale.y = 1 + Math.sin(t * 2) * 0.006;
    }

    // ghosts
    const g = S.ghost;
    twoB.visible = g === 'two';
    ghostB.visible = g === 'ots' || g === 'pov';
    if (ghostB.visible) {
      const dx = pos.x - tgt.x, dz = pos.z - tgt.z;
      const hl = Math.hypot(dx, dz) || 1;
      const ux = dx / hl, uz = dz / hl;
      let gx, gz;
      if (g === 'ots') {
        const d = Math.min(1.0, hl * 0.5);
        gx = tgt.x + ux * d + uz * 0.34;
        gz = tgt.z + uz * d - ux * 0.34;
      } else { gx = pos.x; gz = pos.z; }
      ghostB.position.set(gx, 0, gz);
      ghostB.rotation.y = Math.atan2(tgt.x - gx, tgt.z - gz);
      if (g === 'ots') ghostB.rotation.y = Math.atan2(-ux, -uz);
    }

    // rig
    rig.position.copy(pos);
    rig.quaternion.copy(shotCam.quaternion);
    const k = clamp(S.ovExt / 6.5, 0.75, 3.2);
    rig.scale.setScalar(k);
    const showRig = pos.distanceTo(tgt) > 0.3;
    rig.visible = showRig;
    // tripod
    const baseP = tmpA.copy(pos); baseP.y -= 0.18 * k;
    const tr = 0.5 * k;
    const tripodOn = showRig && pos.y > 0.25;
    legs.forEach((m, i) => {
      m.visible = tripodOn;
      if (!tripodOn) return;
      const a = i * (Math.PI * 2 / 3) + 0.5;
      const foot = tmpB.set(pos.x + Math.cos(a) * tr, 0.02, pos.z + Math.sin(a) * tr);
      place(m, baseP, foot, 1.0 * k);
    });
    plate.visible = tripodOn;
    plate.position.copy(baseP);
    plate.scale.setScalar(k);

    // frustum
    const L = clamp(pos.distanceTo(tgt), 0.4, 30);
    const hh = Math.tan(view.fov * D2R / 2) * L, hw = hh * (16 / 9);
    const corners = [[-hw, hh], [hw, hh], [hw, -hh], [-hw, -hh]];
    fPos[0] = pos.x; fPos[1] = pos.y; fPos[2] = pos.z;
    corners.forEach((c, i) => {
      tmpB.set(c[0], c[1], -L).applyMatrix4(shotCam.matrixWorld);
      fPos[3 + i * 3] = tmpB.x; fPos[4 + i * 3] = tmpB.y; fPos[5 + i * 3] = tmpB.z;
    });
    fGeo.attributes.position.needsUpdate = true;
    frustumMesh.visible = frustumLines.visible = showRig;

    // gate, sun, light
    const mvd = MV[S.moveTitle];
    gate.visible = !!(mvd && mvd.prop === 'gate');
    const showSun = !!(mvd && mvd.prop === 'sun');
    sunBall.visible = showSun;
    const tod = view.tod;
    if (tod != null) {
      const a = lerp(0.12, 0.88, tod) * Math.PI;
      sun.position.set(Math.cos(a) * 9, Math.sin(a) * 9 + 0.6, 5);
      const day = Math.sin(a);
      sun.intensity = 0.5 + 2.4 * day;
      const warm = 1 - sm(day * 2.2);
      sun.color.setRGB(1, lerp(1, 0.62, warm), lerp(1, 0.4, warm));
      hemi.intensity = 1.0 + 1.4 * day;
      const bg = new THREE.Color('#2b3452').lerp(new THREE.Color('#f5c79a'), sm(day * 3)).lerp(BG_DAY, sm((day - 0.35) * 2));
      scene.background.copy(bg); scene.fog.color.copy(bg);
      sunBall.position.copy(sun.position).multiplyScalar(1.6);
    } else {
      sun.position.set(5, 9, 6); sun.intensity = 2.3; sun.color.set(0xffffff); hemi.intensity = 1.9;
      scene.background.copy(BG_DAY); scene.fog.color.copy(BG_DAY);
      sunBall.position.set(8, 12, -3);
    }

    // inset effects
    el.fade.style.opacity = view.fade ? String(view.fade) : '0';
    el.blur.style.backdropFilter = view.blur > 0.5 ? `blur(${view.blur.toFixed(1)}px)` : 'none';
    el.blur.style.webkitBackdropFilter = el.blur.style.backdropFilter;
    el.tilt.hidden = !view.tilt;
  }

  function updateOverview(dtSec) {
    const { pos } = S.view;
    // frame the subject and the camera together
    const sub = tmpA.set(S.view.sub.x, 0.9, S.view.sub.z);
    const want = tmpB.copy(sub).lerp(pos, 0.38);
    const wantExt = Math.max(3.6, pos.distanceTo(sub) * 0.55 + 2.6);
    const f = 1 - Math.exp(-dtSec * 7);
    const dC = want.distanceTo(S.ovC), dE = Math.abs(wantExt - S.ovExt);
    S.ovC.lerp(want, f);
    S.ovExt = lerp(S.ovExt, wantExt, f);
    return dC > 0.01 || dE > 0.01;
  }

  function render() {
    const W = size.w, H = size.h;
    if (!W || !H) return;
    const asp = W / H;
    const ext = S.ovExt;
    // shift the set left so the subject sits clear of the camera-view inset on the right
    const halfW = ext * asp * 0.62, shiftX = halfW * 2 * (W < 560 ? 0.2 : 0.17);
    ovCam.left = -halfW + shiftX; ovCam.right = halfW + shiftX;
    ovCam.top = ext * 0.62; ovCam.bottom = -ext * 0.62;
    const dir = new THREE.Vector3(Math.sin(S.ov.az) * Math.cos(S.ov.el), Math.sin(S.ov.el), Math.cos(S.ov.az) * Math.cos(S.ov.el));
    ovCam.position.copy(S.ovC).addScaledVector(dir, 80);
    ovCam.lookAt(S.ovC);
    ovCam.updateProjectionMatrix();

    renderer.setScissorTest(false);
    renderer.setViewport(0, 0, W, H);
    renderer.render(scene, ovCam);

    // inset: the shot camera
    if (size.iw > 8) {
      shotCam.aspect = size.iw / size.ih;
      shotCam.updateProjectionMatrix();
      const behind = shotCam.position.z < -2.9;
      const wasB = backdrop.visible, wasG = ghostB.visible;
      if (behind) backdrop.visible = false;
      if (S.ghost === 'pov') ghostB.visible = false;
      renderer.setScissorTest(true);
      const y = H - size.iy - size.ih;
      renderer.setViewport(size.ix, y, size.iw, size.ih);
      renderer.setScissor(size.ix, y, size.iw, size.ih);
      renderer.render(scene, shotCam);
      renderer.setScissorTest(false);
      backdrop.visible = wasB; ghostB.visible = wasG;
    }
  }

  function frame(now) {
    if (!panelVisible()) { S.running = false; return; }
    if (!size.w && !resize()) { S.running = false; return; }
    const dt = clamp((now - S.last) / 1000, 0, 0.1);
    S.last = now;
    let busy = false;
    if (stepTween(now)) { busy = true; syncZoom(); }
    const mv = MV[S.moveTitle];
    if (S.playing && mv) { S.mt += dt; busy = true; }
    const u = mv ? (S.mt / mv.T) % 1 : 0;
    S.view = solve(S.base, mv, u, S.mt);
    applyScene(S.view, S.mt);
    if (updateOverview(dt)) busy = true;
    render();
    if (S.tweenWasActive && !S.tween) { updateTexts(); }
    S.tweenWasActive = !!S.tween;
    if (S.tween === null && S.dirty) { S.dirty = false; }
    if (busy || S.dirty) requestAnimationFrame(frame);
    else S.running = false;
  }

  function requestRender() {
    S.dirty = true;
    if (!S.running) {
      S.running = true;
      S.last = performance.now();
      requestAnimationFrame(frame);
    }
  }
  api = { requestRender };

  // go
  resize();
  syncZoom();
  Object.assign(S.base, poseForSize('Wide shot'));
  Object.assign(S.base, poseForAngle('Eye level'));
  refreshPlay();
  updateTexts(true);
  requestRender();

  // test handle
  window.__cam3d = { S, solve, readAngle, readSize, MV, THREE, scene, renderer };
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
}
