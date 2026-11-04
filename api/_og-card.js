/**
 * Branded 1200×630 share card (LinkedIn, WhatsApp, X, Slack…).
 * Abstract art only, built from the logo palette: a soft colour wash, layered
 * circles and fine rings/arcs. Each page uses its own theme (dark or light).
 * Used at runtime (/api/og) and by scripts/make-og-cards.mjs.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ImageResponse } from '@vercel/og';

const DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), '_assets');
const read = (f) => fs.readFileSync(path.join(DIR, f));
const FONTS = [
  { name: 'Outfit', data: read('Outfit-700.woff'), weight: 700, style: 'normal' },
  { name: 'Outfit', data: read('Outfit-600.woff'), weight: 600, style: 'normal' },
  { name: 'Manrope', data: read('Manrope-500.woff'), weight: 500, style: 'normal' },
];
const LOGO = {
  dark: `data:image/png;base64,${read('logo.png').toString('base64')}`,
  light: `data:image/png;base64,${read('logo-light.png').toString('base64')}`,
};

const C = { navy: '#0A0F6B', ink: '#070A45', coral: '#E07A5F', cream: '#F5E6C0', teal: '#3BB39B', deepTeal: '#0D3B36', white: '#FFFFFF' };
const rgba = (hex, a) => {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
};

// dark: light logo + white text. a/b/c = lead, second, accent shape colours.
export const THEMES = {
  navy: { dark: true, bg: C.navy, wash: [C.teal, C.coral], a: C.coral, b: C.teal, c: C.cream, ring: C.cream, kicker: C.cream },
  ink: { dark: true, bg: C.ink, wash: [C.cream, C.teal], a: C.cream, b: C.coral, c: C.teal, ring: C.cream, kicker: C.coral },
  deepTeal: { dark: true, bg: C.deepTeal, wash: [C.teal, C.cream], a: C.teal, b: C.cream, c: C.coral, ring: C.cream, kicker: C.cream },
  ember: { dark: true, bg: '#B4553E', wash: [C.cream, C.coral], a: C.cream, b: C.coral, c: C.navy, ring: C.cream, kicker: C.cream },
  cream: { dark: false, bg: '#FBF6EA', wash: [C.coral, C.cream], a: C.coral, b: C.cream, c: C.teal, ring: C.navy, kicker: C.coral },
  ivory: { dark: false, bg: '#FFFFFF', wash: [C.teal, C.cream], a: C.teal, b: C.cream, c: C.coral, ring: C.navy, kicker: C.teal },
  mist: { dark: false, bg: '#EEF7F4', wash: [C.teal, C.navy], a: C.teal, b: C.navy, c: C.cream, ring: C.navy, kicker: '#1F8A75' },
  blush: { dark: false, bg: '#FCEFEA', wash: [C.coral, C.cream], a: C.coral, b: C.navy, c: C.cream, ring: C.coral, kicker: '#C2593F' },
  slate: { dark: false, bg: '#F6F7FB', wash: [C.navy, C.teal], a: C.navy, b: C.cream, c: C.teal, ring: C.navy, kicker: C.navy },
};

const h = (type, style, children, extra = {}) => ({ type, props: { style, children, ...extra } });
const abs = (style) => h('div', { position: 'absolute', display: 'flex', ...style });

const clamp = (s, n) => {
  const t = String(s || '').replace(/\s+/g, ' ').trim();
  return t.length <= n ? t : `${t.slice(0, n - 1).replace(/\s+\S*$/, '')}…`;
};

// Three compositions from the same vocabulary: layered circles, fine rings/arcs, soft wash.
function art(t, layout) {
  const disc = (d, color, op, top, left) => abs({ width: d, height: d, borderRadius: d, background: color, opacity: op, top, left });
  const ring = (d, color, op, w, top, left) => abs({ width: d, height: d, borderRadius: d, border: `${w}px solid ${rgba(color, op)}`, top, left });
  const k = t.dark ? 1 : 0.8;
  const wash = abs({ inset: 0, backgroundImage: `radial-gradient(circle at 85% 20%, ${rgba(t.wash[0], 0.32 * k)}, transparent 55%), radial-gradient(circle at 65% 100%, ${rgba(t.wash[1], 0.26 * k)}, transparent 50%)` });
  const ink = t.dark ? C.white : C.navy;

  if (layout === 'arc') {
    return [
      wash,
      disc(820, t.a, 0.88, -95, 800),
      ring(940, t.ring, 0.16 * k, 1.5, -155, 740),
      ring(1080, t.ring, 0.1 * k, 1.5, -225, 670),
      disc(230, t.b, 0.85, 400, 715),
      ring(230, ink, 0.3, 1.5, 380, 740),
      disc(84, t.c, 0.95, 120, 760),
      abs({ width: 8, height: 8, borderRadius: 8, background: ink, opacity: 0.7, top: 300, left: 700 }),
    ];
  }
  if (layout === 'orbit') {
    const cx = 990; const cy = 315;
    const r = (d, op) => ring(d, t.ring, op * k, 1.5, cy - d / 2, cx - d / 2);
    const dot = (d, color, x, y, op = 0.92) => disc(d, color, op, y - d / 2, x - d / 2);
    return [
      wash,
      dot(300, t.a, cx, cy, 0.9),
      r(420, 0.28), r(560, 0.2), r(720, 0.14), r(900, 0.09),
      dot(110, t.b, cx - 190, cy + 120),
      dot(64, t.c, cx + 170, cy - 200),
      dot(26, ink, cx + 275, cy + 120, 0.75),
      dot(14, t.c, cx - 330, cy - 160, 0.9),
    ];
  }
  return [
    wash,
    ring(980, t.ring, 0.12 * k, 1.5, -180, 660),
    ring(760, t.ring, 0.16 * k, 1.5, -70, 770),
    disc(340, t.a, 0.88, 70, 830),
    disc(240, t.b, 0.82, 330, 740),
    disc(180, t.c, 0.88, 390, 990),
    ring(340, ink, 0.32, 1.5, 50, 860),
    ring(110, t.ring, 0.45 * k, 1.5, 40, 1075),
    abs({ width: 9, height: 9, borderRadius: 9, background: ink, top: 92, left: 1120, opacity: 0.75 }),
  ];
}

export async function renderCard({ kicker = '', title = '', subtitle = '', theme = 'navy', layout = 'cluster' }) {
  const t = THEMES[theme] || THEMES.navy;
  const headline = clamp(title, 90);
  const size = headline.length > 56 ? 46 : headline.length > 36 ? 54 : 62;
  const text = t.dark ? C.white : C.navy;
  const muted = t.dark ? 'rgba(255,255,255,0.72)' : '#475569';

  const card = h('div', { display: 'flex', position: 'relative', width: 1200, height: 630, background: t.bg, fontFamily: 'Manrope', overflow: 'hidden' }, [
    ...art(t, layout),
    h('div', { position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', width: 660, height: 630, padding: '56px 0 52px 64px' }, [
      h('img', { height: 70, width: 315 }, undefined, { src: t.dark ? LOGO.light : LOGO.dark, height: 70, width: 315 }),
      h('div', { display: 'flex', flexDirection: 'column' }, [
        kicker ? h('div', { display: 'flex', fontFamily: 'Outfit', fontWeight: 600, fontSize: 21, letterSpacing: 3.5, textTransform: 'uppercase', color: t.kicker, marginBottom: 18 }, clamp(kicker, 38)) : null,
        h('div', { display: 'flex', fontFamily: 'Outfit', fontWeight: 700, fontSize: size, lineHeight: 1.08, letterSpacing: -1.5, color: text }, headline),
        subtitle ? h('div', { display: 'flex', marginTop: 22, fontSize: 26, lineHeight: 1.35, color: muted }, clamp(subtitle, 80)) : null,
      ].filter(Boolean)),
      h('div', { display: 'flex', alignItems: 'center', fontSize: 21, letterSpacing: 0.5, color: muted }, [
        h('div', { display: 'flex', width: 36, height: 2, background: t.kicker, marginRight: 14 }),
        'www.orgainse.com',
      ]),
    ]),
  ]);

  const res = new ImageResponse(card, { width: 1200, height: 630, fonts: FONTS });
  return Buffer.from(await res.arrayBuffer());
}
