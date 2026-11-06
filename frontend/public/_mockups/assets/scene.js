// Orgainse Spatial UI — Phase 1 snapshot scenes (three.js). Abstract shapes only.
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const P = { electric: 0x0062fd, sky: 0x0bd5fd, navy: 0x00007d, cream: 0xf7e7bc, teal: 0x39b29a, coral: 0xe07a5f, amber: 0xffc300, white: 0xffffff };
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const gloss = (c, o = {}) => new THREE.MeshPhysicalMaterial({ color: c, roughness: 0.32, metalness: 0.04, clearcoat: 0.7, clearcoatRoughness: 0.28, envMapIntensity: 0.75, ...o });
const matte = (c, o = {}) => new THREE.MeshPhysicalMaterial({ color: c, roughness: 0.62, metalness: 0, sheen: 0.4, ...o });
const glow = (c, i = 1.6) => new THREE.MeshStandardMaterial({ color: c, emissive: c, emissiveIntensity: i, roughness: 0.4 });
const sphere = (r, m) => new THREE.Mesh(new THREE.SphereGeometry(r, 96, 96), m);
const torus = (r, t, m, arc = Math.PI * 2) => new THREE.Mesh(new THREE.TorusGeometry(r, t, 48, 220, arc), m);
const ringLine = (r, c, op = 0.35) => {
  const pts = new THREE.EllipseCurve(0, 0, r, r).getPoints(200).map((p) => new THREE.Vector3(p.x, p.y, 0));
  return new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: c, transparent: true, opacity: op }));
};

const PRESETS = {
  // Home: hero orb with orbit rings and satellites (logo circles in space)
  home(g, dark) {
    const core = sphere(1.55, gloss(P.electric)); g.add(core);
    const r1 = torus(2.45, 0.05, gloss(P.sky, { roughness: 0.1 })); r1.rotation.set(1.15, 0.25, 0); g.add(r1);
    const r2 = torus(3.1, 0.028, matte(P.navy)); r2.rotation.set(1.35, -0.45, 0.3); g.add(r2);
    const sats = [[0.62, P.coral, 2.6, 0.9, 0.6], [0.46, P.cream, -2.4, -1.35, 0.9], [0.34, P.teal, 1.2, -2.3, 1.2], [0.2, P.amber, -1.5, 2.1, 0.4]];
    sats.forEach(([r, c, x, y, z], i) => { const s = sphere(r, i % 2 ? matte(c) : gloss(c)); s.position.set(x, y, z); g.add(s); });
    const half = torus(0.7, 0.22, matte(P.cream), Math.PI); half.position.set(2.2, 2.2, -1.6); half.rotation.set(0.3, 0.6, 2.6); g.add(half);
    g.userData.spin = [core, r1, r2];
  },
  // Services: six stacked rings (one per service) like a governed rhythm
  services(g) {
    const cols = [P.electric, P.sky, P.teal, P.cream, P.coral, P.amber];
    cols.forEach((c, i) => { const t = torus(2.2 - i * 0.18, 0.16, i % 2 ? matte(c) : gloss(c)); t.position.y = 1.8 - i * 0.72; t.rotation.x = Math.PI / 2.25; t.rotation.z = i * 0.18; g.add(t); });
    const core = sphere(0.9, gloss(P.navy)); g.add(core);
    const s = sphere(0.42, gloss(P.sky)); s.position.set(2.6, 1.6, 0.4); g.add(s);
    g.rotation.z = -0.18;
  },
  // Products / ORQYNE: linked nodes — portfolios, risks, decisions
  products(g) {
    const nodes = [[0, 0, 0, 0.95, P.electric], [2.5, 1.3, -0.6, 0.55, P.teal], [-2.3, 1.5, 0.3, 0.6, P.coral], [1.9, -1.8, 0.5, 0.5, P.amber], [-1.8, -1.7, -0.4, 0.45, P.sky], [0.3, 2.6, -1, 0.36, P.cream], [3.4, -0.3, -1.4, 0.3, P.navy], [-3.3, -0.1, -1.1, 0.3, P.teal]];
    const v = nodes.map(([x, y, z]) => new THREE.Vector3(x, y, z));
    nodes.forEach(([x, y, z, r, c], i) => { const s = sphere(r, i % 3 === 1 ? matte(c) : gloss(c)); s.position.copy(v[i]); g.add(s); });
    [[0, 1], [0, 2], [0, 3], [0, 4], [0, 5], [1, 6], [2, 7], [1, 5], [3, 6], [4, 7]].forEach(([a, b]) => {
      const curve = new THREE.CatmullRomCurve3([v[a], v[a].clone().lerp(v[b], 0.5).add(new THREE.Vector3(0, 0, 0.5)), v[b]]);
      g.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 40, 0.035, 12), gloss(P.navy, { roughness: 0.3 })));
    });
    const halo = torus(1.45, 0.025, gloss(P.sky)); halo.rotation.x = 1.2; g.add(halo);
  },
  // Careers: one ring with many orbiting spheres — people joining a practice
  careers(g) {
    const ring = torus(2.3, 0.22, gloss(P.navy)); ring.rotation.x = 1.25; g.add(ring);
    const cols = [P.amber, P.electric, P.teal, P.coral, P.sky, P.cream, P.electric, P.amber];
    cols.forEach((c, i) => { const a = (i / cols.length) * Math.PI * 2; const s = sphere(0.28 + (i % 3) * 0.12, i % 2 ? matte(c) : gloss(c)); s.position.set(Math.cos(a) * 2.3, Math.sin(a) * 0.75, Math.sin(a) * 2.1); g.add(s); });
    const core = sphere(1.0, gloss(P.amber)); g.add(core);
  },
  // Contact: two spheres (Austin, Bengaluru) joined by a sky arc
  contact(g) {
    const a = sphere(1.05, gloss(P.electric)); a.position.set(-1.9, -0.4, 0); g.add(a);
    const b = sphere(0.85, gloss(P.coral)); b.position.set(2.0, 0.5, -0.4); g.add(b);
    const arc = new THREE.Mesh(new THREE.TubeGeometry(new THREE.QuadraticBezierCurve3(a.position, new THREE.Vector3(0, 2.8, 0.8), b.position), 80, 0.05, 12), gloss(P.sky)); g.add(arc);
    const r = torus(1.5, 0.025, matte(P.navy)); r.position.copy(a.position); r.rotation.x = 1.3; g.add(r);
    const s = sphere(0.3, matte(P.cream)); s.position.set(0.2, -1.9, 0.6); g.add(s);
  },
  // Admin: glowing wire orb + rings in deep navy space
  admin(g) {
    const ico = new THREE.Mesh(new THREE.IcosahedronGeometry(1.5, 2), new THREE.MeshBasicMaterial({ color: P.sky, wireframe: true, transparent: true, opacity: 0.55 })); g.add(ico);
    const core = sphere(0.95, gloss(P.electric, { emissive: P.electric, emissiveIntensity: 0.35 })); g.add(core);
    [2.2, 2.9, 3.6].forEach((r, i) => { const l = ringLine(r, i ? P.sky : P.teal, 0.5 - i * 0.12); l.rotation.set(1.2 + i * 0.12, i * 0.4, 0); g.add(l); });
    const d = [[2.2, 0.6, P.amber], [-2.6, -0.9, P.coral], [1.1, -2.4, P.teal]];
    d.forEach(([x, y, c]) => { const s = sphere(0.16, glow(c)); s.position.set(x, y, 0.5); g.add(s); });
    g.userData.spin = [ico];
  },
  // Small accent cluster for bands / footer / modal art
  accent(g, dark) {
    const a = sphere(1.0, gloss(P.electric)); a.position.set(0.6, 0.2, 0); g.add(a);
    const b = sphere(0.55, gloss(P.coral)); b.position.set(-1.0, -0.9, 0.6); g.add(b);
    const c = sphere(0.36, matte(P.cream)); c.position.set(-0.6, 1.2, 0.4); g.add(c);
    const r = torus(1.75, 0.03, gloss(P.sky)); r.rotation.set(1.2, 0.3, 0); r.position.x = 0.4; g.add(r);
    if (dark) { [2.4, 3.1].forEach((rr) => { const l = ringLine(rr, P.sky, 0.3); l.rotation.x = 1.25; g.add(l); }); }
    g.userData.spin = [r];
  },
};

export function mountScene(canvas, { preset = 'home', dark = false, offset = [2.6, 0], scale = 1, cam = 13.5 } = {}) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = dark ? 1.1 : 0.95;
  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
  camera.position.set(0, 0, cam);

  scene.add(new THREE.HemisphereLight(0xffffff, dark ? 0x05062b : 0xdfe6ff, dark ? 0.5 : 0.9));
  const key = new THREE.DirectionalLight(0xffffff, dark ? 1.6 : 2.2); key.position.set(4, 6, 6); scene.add(key);
  const rim = new THREE.DirectionalLight(dark ? P.sky : 0xbfe9ff, dark ? 1.4 : 0.8); rim.position.set(-6, -2, -4); scene.add(rim);

  const group = new THREE.Group();
  PRESETS[preset](group, dark);
  group.scale.setScalar(scale);
  scene.add(group);

  const mobile = window.innerWidth < 760;
  const base = new THREE.Vector3(mobile ? 0 : offset[0], mobile ? (canvas.closest('.band') ? 2.6 : 2.0) : offset[1], 0);
  group.position.copy(base);
  if (mobile) group.scale.setScalar(scale * 0.42);
  group.rotation.y = -0.35;

  const mouse = { x: 0, y: 0 };
  window.addEventListener('pointermove', (e) => { mouse.x = e.clientX / window.innerWidth - 0.5; mouse.y = e.clientY / window.innerHeight - 0.5; });

  const resize = () => {
    const { clientWidth: w, clientHeight: h } = canvas;
    renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
  };
  new ResizeObserver(resize).observe(canvas); resize();

  const clock = new THREE.Clock();
  const tick = () => {
    const t = clock.getElapsedTime();
    const rect = canvas.getBoundingClientRect();
    const sy = (window.innerHeight / 2 - (rect.top + rect.height / 2)) / window.innerHeight;
    group.rotation.y = -0.35 + t * 0.12 + mouse.x * 0.5;
    group.rotation.x = mouse.y * 0.3 + sy * 0.4;
    group.position.y = base.y + sy * 0.9 + Math.sin(t * 0.6) * 0.08;
    (group.userData.spin || []).forEach((m, i) => { m.rotation.z += 0.002 * (i + 1); });
    renderer.render(scene, camera);
    if (!reduce) requestAnimationFrame(tick);
  };
  tick();
}

// Auto-mount every <canvas data-scene="preset" data-dark data-x data-y data-scale>
document.querySelectorAll('canvas[data-scene]').forEach((c) => mountScene(c, {
  preset: c.dataset.scene,
  dark: c.hasAttribute('data-dark'),
  offset: [Number(c.dataset.x ?? 2.6), Number(c.dataset.y ?? 0)],
  scale: Number(c.dataset.scale ?? 1),
  cam: Number(c.dataset.cam ?? 13.5),
}));
