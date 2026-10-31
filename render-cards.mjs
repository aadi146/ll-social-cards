// Portable Lending Leverage card renderer: same card types and brand tokens as ../render.py,
// but drawn with satori + resvg so it runs anywhere Node runs (no Chrome). Used by the Friday
// cloud routine; render.py stays the local preview tool.
//
//   node render-cards.mjs spec.json out-dir [assets-base-url]
//
// spec.json = array of cards, each {id, type, ...fields}; types: stat, take, myth, cover, point, cta, rba, question.
// Fonts and the photo are read from ./fonts and ./assets next to this file when present, otherwise
// fetched from <assets-base-url> (default: the public Awesomate Files folder).
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const [specPath, outDir = join(HERE, 'out'), assetsBase = 'https://lendingleverage.awesomate.io/files/public/social/assets'] = process.argv.slice(2);
if (!specPath) { console.error('usage: node render-cards.mjs spec.json out-dir [assets-base-url]'); process.exit(1); }

const TEAL = '#009597', BLUE = '#0787b0', CHAR = '#1c2325', NAVY = '#05394c';
const INK = '#2B3437', MUTED = '#5B6B73', LINE = '#E3E9EC', TINT = '#F1F7F8', PAGE = '#EDF1F3';
const W = 1080, H = 1350;
const SANS = 'DM Sans', DISPLAY = 'Comodo';

async function asset(name) {
  for (const dir of ['fonts', 'assets']) {
    const p = join(HERE, dir, name);
    if (existsSync(p)) return readFileSync(p);
  }
  const r = await fetch(`${assetsBase}/${name}`);
  if (!r.ok) throw new Error(`asset ${name}: HTTP ${r.status}`);
  return Buffer.from(await r.arrayBuffer());
}
const photoUrl = existsSync(join(HERE, 'assets', 'aadi.jpg'))
  ? `data:image/jpeg;base64,${readFileSync(join(HERE, 'assets', 'aadi.jpg')).toString('base64')}`
  : `${assetsBase}/aadi.jpg`;

const fonts = [
  { name: SANS, data: await asset('DMSans-Regular.ttf'), weight: 400, style: 'normal' },
  { name: SANS, data: await asset('DMSans-Bold.ttf'), weight: 700, style: 'normal' },
  { name: DISPLAY, data: await asset('Comodo-Regular.ttf'), weight: 400, style: 'normal' },
];

// Tiny element helpers (satori takes React-like element objects).
const h = (type, style, children, extra = {}) => ({ type, props: { style, children, ...extra } });
const col = (style, ...children) => h('div', { display: 'flex', flexDirection: 'column', ...style }, children.filter(Boolean));
const row = (style, ...children) => h('div', { display: 'flex', flexDirection: 'row', ...style }, children.filter(Boolean));
const text = (s, style) => h('div', { display: 'flex', width: '100%', ...style }, decode(s));
const decode = s => String(s ?? '').replace(/&rsquo;/g, '’').replace(/&lsquo;/g, '‘').replace(/&ldquo;/g, '“').replace(/&rdquo;/g, '”')
  .replace(/&times;/g, '×').replace(/&rarr;/g, '→').replace(/&middot;/g, '·').replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ');

const dark = (d) => d ? { fg: '#fff', label: '#CFECEE', body: '#E4F2F4', handle: '#B9D7DB', disc: '#9FC4C9', bg: `linear-gradient(160deg, ${NAVY} 0%, #063f55 55%, #0a5a6e 100%)`, sowhatBg: 'rgba(255,255,255,0.10)', sowhatBar: '#7FD3D6', pillBg: 'rgba(255,255,255,0.12)', pillFg: '#fff' }
  : { fg: CHAR, label: TEAL, body: INK, handle: MUTED, disc: MUTED, bg: PAGE, sowhatBg: TINT, sowhatBar: TEAL, pillBg: TINT, pillFg: TEAL };

const label = (s, t, extra = {}) => text(s, { fontFamily: DISPLAY, fontSize: 30, letterSpacing: 1.5, color: t.label, ...extra });
const head = (s, size, t, extra = {}) => text(s, { fontFamily: SANS, fontWeight: 700, fontSize: size, letterSpacing: -1.5, lineHeight: 1.04, color: t.fg, ...extra });
const body = (s, t, size = 38, extra = {}) => text(s, { fontFamily: SANS, fontSize: size, lineHeight: 1.35, color: t.body, ...extra });
const rule = () => h('div', { display: 'flex', height: 4, width: 120, background: TEAL, borderRadius: 2, marginTop: 34, marginBottom: 34 });
const pill = (s, t, extra = {}) => text(s, { width: 'auto', fontFamily: DISPLAY, fontSize: 26, letterSpacing: 1, paddingTop: 12, paddingBottom: 12, paddingLeft: 24, paddingRight: 24, borderRadius: 999, background: t.pillBg, color: t.pillFg, ...extra });
const disc = (s, t, extra = {}) => text(s, { fontFamily: SANS, fontSize: 20, lineHeight: 1.3, color: t.disc, ...extra });
const sowhat = (lead, s, t) => h('div', { display: 'flex', marginTop: 44, borderLeft: `6px solid ${t.sowhatBar}`, background: t.sowhatBg, paddingTop: 30, paddingBottom: 30, paddingLeft: 34, paddingRight: 34, borderTopRightRadius: 18, borderBottomRightRadius: 18, fontFamily: SANS, fontSize: 32, lineHeight: 1.35, color: t.fg, flexWrap: 'wrap' },
  [h('span', { fontWeight: 700, marginRight: 8 }, lead), h('span', {}, decode(s))]);
const GEN = 'General information only, not personal advice.';
const CRED = 'General information only. Aaditya Sahu (Credit Representative 545239) of Lending Leverage Pty Ltd is an authorised credit representative of Connective Credit Services Pty Ltd, Australian Credit Licence 389328.';

const logo = () => h('svg', { width: 56, height: 60, viewBox: '0 0 30 33' }, [
  h('path', {}, null, { d: 'M1.75 1.75h8.5v21.5h-8.5z', stroke: TEAL, strokeWidth: 3.5, fill: 'none' }),
  h('path', {}, null, { d: 'M8 1.75v29.5h20.25V20.25H12.5V1.75z', stroke: TEAL, strokeWidth: 3.5, fill: 'none' }),
]);
const foot = (t) => row({ width: W - 168, height: 100, flexShrink: 0, alignItems: 'center', justifyContent: 'space-between', marginTop: 40 },
  row({ alignItems: 'center', gap: 18 }, logo(), text('lending\nleverage', { width: 'auto', fontFamily: DISPLAY, fontSize: 30, lineHeight: 0.95, color: t.fg, whiteSpace: 'pre' })),
  text('@lendingwithaadi', { width: 'auto', fontFamily: SANS, fontSize: 24, color: t.handle }));

const card = (isDark, content) => {
  const t = dark(isDark);
  return col({ width: W, height: H, paddingTop: 84, paddingRight: 84, paddingBottom: 72, paddingLeft: 84, background: t.bg, color: t.fg },
    col({ height: H - 84 - 72 - 140, width: W - 168, justifyContent: 'center', overflow: 'hidden' }, ...content(t)), foot(t));
};

const BUILDERS = {
  stat: c => card(true, t => [label(c.label, t),
    text(c.value, { fontFamily: SANS, fontWeight: 700, fontSize: 300, letterSpacing: -12, lineHeight: 1, color: '#7FD3D6', marginTop: 60 }),
    head(c.headline, 66, t, { marginTop: 10 }), rule(), body(c.body, t), disc(c.note || GEN, t, { marginTop: 36 })]),
  take: c => card(true, t => [
    row({ alignItems: 'center', gap: 36 },
      h('img', { width: 220, height: 220, borderRadius: 110, objectFit: 'cover', border: '8px solid rgba(255,255,255,0.18)' }, null, { src: photoUrl }),
      col({}, label('our take', t), text('Aadi Sahu · Principal Broker', { fontFamily: SANS, fontSize: 30, color: t.handle, marginTop: 10 }))),
    head(`“${decode(c.hook)}”`, 74, t, { marginTop: 70 }), sowhat('What to do with this:', c.so_what, t), disc(GEN, t, { marginTop: 30 })]),
  myth: c => card(false, t => [label('myth vs what we see', t),
    col({ marginTop: 60, background: '#fff', borderRadius: 24, paddingTop: 44, paddingBottom: 44, paddingLeft: 48, paddingRight: 48, border: `2px solid ${LINE}` },
      row({}, pill('people say', t, { background: '#FBECEC', color: '#A33' })),
      text(c.myth, { fontFamily: SANS, fontWeight: 700, fontSize: 54, letterSpacing: -1.5, lineHeight: 1.04, color: MUTED, marginTop: 26, textDecoration: 'line-through', textDecorationColor: '#C66' })),
    col({ marginTop: 28, background: NAVY, borderRadius: 24, paddingTop: 44, paddingBottom: 44, paddingLeft: 48, paddingRight: 48 },
      row({}, pill('what we see', t, { background: 'rgba(255,255,255,0.14)', color: '#fff' })),
      text(c.reality, { fontFamily: SANS, fontWeight: 700, fontSize: 54, letterSpacing: -1.5, lineHeight: 1.04, color: '#fff', marginTop: 26 }),
      text(c.because, { fontFamily: SANS, fontSize: 32, lineHeight: 1.35, color: '#CFECEE', marginTop: 24 })),
    disc(c.note || GEN, t, { marginTop: 30 })]),
  cover: c => card(true, t => [label(c.label, t), head(c.hook, 96, t, { marginTop: 70 }), rule(), body(c.sub, t, 40), row({ marginTop: 60 }, pill('swipe →', t))]),
  point: c => card(false, t => [
    row({ justifyContent: 'space-between', alignItems: 'baseline' }, label(c.label, t), label(`${c.n} / ${c.of}`, t, { width: 'auto', color: MUTED })),
    text(String(c.n).padStart(2, '0'), { width: 'auto', fontFamily: SANS, fontWeight: 700, fontSize: 88, letterSpacing: -3, lineHeight: 1, color: TEAL, marginTop: 70 }),
    head(c.title, 72, t, { marginTop: 26 }), rule(), body(c.body, t)]),
  cta: c => card(true, t => [label(c.label, t), head(c.headline, 84, t, { marginTop: 70 }), rule(), body(c.body, t, 40),
    row({ marginTop: 70 }, text(c.button, { width: 'auto', fontFamily: SANS, fontWeight: 700, fontSize: 36, paddingTop: 26, paddingBottom: 26, paddingLeft: 44, paddingRight: 44, borderRadius: 999, background: TEAL, color: '#fff' })),
    disc(c.note || CRED, t, { marginTop: 40 })]),
  rba: c => card(true, t => [label(`rba update · ${decode(c.date)}`, t),
    row({ marginTop: 60, alignItems: 'flex-end', gap: 30 },
      text(c.rate, { width: 'auto', fontFamily: SANS, fontWeight: 700, fontSize: 230, letterSpacing: -10, lineHeight: 0.9, color: '#7FD3D6' }), pill(c.change, t, { marginBottom: 22 })),
    head(c.headline, 64, t, { marginTop: 40 }), rule(), body(c.body, t), sowhat('What it means for you:', c.so_what, t)]),
  question: c => card(false, t => [label('a question to ask yourself', t), head(c.question, 90, t, { marginTop: 90, color: NAVY }), rule(), body(c.body, t), disc(GEN, t, { marginTop: 36 })]),
};

// The 'point' card's white page: swap the light background for pure white to match render.py.
const spec = JSON.parse(readFileSync(specPath, 'utf8'));
mkdirSync(outDir, { recursive: true });
for (const c of spec) {
  const build = BUILDERS[c.type];
  if (!build) { console.error(`skip ${c.id}: unknown type ${c.type}`); continue; }
  let el = build(c);
  if (c.type === 'point') el.props.style.background = '#fff';
  const svg = await satori(el, { width: W, height: H, fonts });
  const png = new Resvg(svg, { fitTo: { mode: 'width', value: W } }).render().asPng();
  const out = join(outDir, `${c.id}.png`);
  writeFileSync(out, png);
  console.log(out);
}
