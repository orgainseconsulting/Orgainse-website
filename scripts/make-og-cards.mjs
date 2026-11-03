// One-off generator for the static pages' share cards → frontend/public/og/*.png
// Run: node scripts/make-og-cards.mjs  (photos live in design-assets/og/), then convert PNG→JPEG (~100KB) for WhatsApp.
import fs from 'node:fs';
import path from 'node:path';
import { renderCard } from '../api/_og-card.js';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const OUT = path.join(ROOT, 'frontend', 'public', 'og');
fs.mkdirSync(OUT, { recursive: true });

export const CARDS = [
  ['home', 'home', 'Delivery Governance Consulting', 'Turn fragmented work into visible, governed execution'],
  ['services', 'services', 'Services', 'PMaaS, outsourced PMO and delivery governance'],
  ['products', 'products', 'ORQYNE by Orgainse', 'Project portfolio and delivery governance software'],
  ['about', 'about', 'About Orgainse', 'A senior delivery team in Austin and Bengaluru'],
  ['contact', 'contact', 'Contact Orgainse', 'Bring one important execution problem'],
  ['ai-assessment', 'assessment', 'Free assessment', 'How ready is your delivery for governed execution?'],
  ['roi-calculator', 'roi', 'Free calculator', 'Model the delivery impact with your own numbers'],
  ['smart-calendar', 'calendar', 'Discovery call', 'Book a free 30-minute discovery call'],
  ['blog', 'blog', 'The Orgainse Blog', 'Field notes on delivery, governance and practical AI'],
  ['newsletter', 'newsletter', 'Orgainse Pulse', 'Delivery governance briefings for busy leaders'],
  ['careers', 'careers', 'Careers at Orgainse', 'Build the practice that makes execution visible'],
  ['privacy', 'default', 'Legal', 'Privacy Policy'],
  ['terms', 'default', 'Legal', 'Terms of Service'],
];

for (const [name, photo, kicker, title] of CARDS) {
  const src = fs.readFileSync(path.join(ROOT, 'design-assets', 'og', `${photo}.jpg`));
  const png = await renderCard({ kicker, title, photo: `data:image/jpeg;base64,${src.toString('base64')}` });
  fs.writeFileSync(path.join(OUT, `${name}.png`), png);
  console.log(`og/${name}.png ${(png.length / 1024).toFixed(0)} KB`);
}
