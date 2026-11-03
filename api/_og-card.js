/**
 * Branded 1200×630 share card (LinkedIn, WhatsApp, X, Slack…).
 * Left: logo, kicker, headline. Right: optional photo, otherwise the logo's
 * coral / cream / teal circles. Used at runtime (/api/og) and by
 * scripts/make-og-cards.mjs for the static pages.
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
const LOGO = `data:image/png;base64,${read('logo.png').toString('base64')}`;

const NAVY = '#0A0F6B';
const CORAL = '#E07A5F';
const CREAM = '#F5E6C0';
const TEAL = '#3BB39B';

const h = (type, style, children, extra = {}) => ({ type, props: { style, children, ...extra } });

const clamp = (s, n) => {
  const t = String(s || '').replace(/\s+/g, ' ').trim();
  return t.length <= n ? t : `${t.slice(0, n - 1).replace(/\s+\S*$/, '')}…`;
};

function circles() {
  const dot = (size, color, top, left) => h('div', {
    position: 'absolute', width: size, height: size, borderRadius: size, background: color, top, left,
  });
  return h('div', { display: 'flex', position: 'relative', width: 440, height: 630, background: '#F8FAFC' }, [
    dot(300, CORAL, 40, 140),
    dot(240, CREAM, 300, 20),
    dot(220, TEAL, 370, 230),
  ]);
}

export async function renderCard({ kicker = '', title = '', subtitle = '', photo = null }) {
  const headline = clamp(title, 90);
  const size = headline.length > 60 ? 50 : headline.length > 38 ? 58 : 66;
  const right = photo
    ? h('div', { display: 'flex', width: 440, height: 630, position: 'relative' }, [
      h('img', { width: 440, height: 630, objectFit: 'cover' }, undefined, { src: photo, width: 440, height: 630 }),
      h('div', { position: 'absolute', left: 0, top: 0, width: 10, height: 630, background: TEAL }),
    ])
    : circles();

  const card = h('div', { display: 'flex', width: 1200, height: 630, background: '#FFFFFF', fontFamily: 'Manrope' }, [
    h('div', { display: 'flex', flexDirection: 'column', justifyContent: 'space-between', width: 760, height: 630, padding: '56px 60px 52px 64px' }, [
      h('img', { height: 74, width: 333 }, undefined, { src: LOGO, height: 74, width: 333 }),
      h('div', { display: 'flex', flexDirection: 'column' }, [
        kicker ? h('div', { display: 'flex', fontFamily: 'Outfit', fontWeight: 600, fontSize: 22, letterSpacing: 3, textTransform: 'uppercase', color: CORAL, marginBottom: 18 }, clamp(kicker, 38)) : null,
        h('div', { display: 'flex', fontFamily: 'Outfit', fontWeight: 700, fontSize: size, lineHeight: 1.08, letterSpacing: -1.5, color: NAVY }, headline),
        subtitle ? h('div', { display: 'flex', marginTop: 22, fontSize: 26, lineHeight: 1.35, color: '#475569' }, clamp(subtitle, 90)) : null,
      ].filter(Boolean)),
      h('div', { display: 'flex', alignItems: 'center', fontSize: 22, color: '#475569' }, [
        h('div', { display: 'flex', width: 14, height: 14, borderRadius: 14, background: CORAL, marginRight: 6 }),
        h('div', { display: 'flex', width: 14, height: 14, borderRadius: 14, background: CREAM, marginRight: 6 }),
        h('div', { display: 'flex', width: 14, height: 14, borderRadius: 14, background: TEAL, marginRight: 14 }),
        'www.orgainse.com',
      ]),
    ]),
    right,
  ]);

  const res = new ImageResponse(card, { width: 1200, height: 630, fonts: FONTS });
  return Buffer.from(await res.arrayBuffer());
}
