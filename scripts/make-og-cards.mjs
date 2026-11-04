// Generator for the static pages' share cards → frontend/public/og/*.jpg
// Run: node scripts/make-og-cards.mjs   (renders PNG, then python/PIL converts to JPEG ~<150KB)
import fs from 'node:fs';
import path from 'node:path';
import { renderCard } from '../api/_og-card.js';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const OUT = path.join(ROOT, 'frontend', 'public', 'og');
fs.mkdirSync(OUT, { recursive: true });

// [file, theme, layout, kicker, headline]
export const CARDS = [
  ['home', 'navy', 'cluster', 'Delivery Governance Consulting', 'Turn fragmented work into visible, governed execution'],
  ['services', 'cream', 'arc', 'Services', 'PMaaS, outsourced PMO and delivery governance'],
  ['products', 'deepTeal', 'orbit', 'ORQYNE by Orgainse', 'Project portfolio and delivery governance software'],
  ['about', 'ivory', 'orbit', 'About Orgainse', 'A senior delivery team in Austin and Bengaluru'],
  ['contact', 'ember', 'arc', 'Contact Orgainse', 'Bring one important execution problem'],
  ['ai-assessment', 'ink', 'orbit', 'Free assessment', 'How ready is your delivery for governed execution?'],
  ['roi-calculator', 'mist', 'cluster', 'Free calculator', 'Model the delivery impact with your own numbers'],
  ['smart-calendar', 'blush', 'arc', 'Discovery call', 'Book a free 30-minute discovery call'],
  ['blog', 'ink', 'cluster', 'The Orgainse Blog', 'Field notes on delivery, governance and practical AI'],
  ['newsletter', 'blush', 'orbit', 'Orgainse Pulse', 'Delivery governance briefings for busy leaders'],
  ['careers', 'deepTeal', 'arc', 'Careers at Orgainse', 'Build the practice that makes execution visible'],
  ['privacy', 'slate', 'orbit', 'Legal', 'Privacy Policy'],
  ['terms', 'slate', 'arc', 'Legal', 'Terms of Service'],
];

for (const [name, theme, layout, kicker, title] of CARDS) {
  const png = await renderCard({ kicker, title, theme, layout });
  fs.writeFileSync(path.join(OUT, `${name}.png`), png);
  console.log(`og/${name}.png ${theme}`);
}
