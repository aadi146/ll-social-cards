"""Reserve-bank helpers for the Lending Leverage social cards.

python3 reserve_tools.py check              -> validates every packs/reserve/*.json against CONTENT-SYSTEM limits
python3 reserve_tools.py cards <series>     -> writes packs/reserve/<series>-cards.json (flat card list for render-cards.mjs)
python3 reserve_tools.py index              -> rebuilds RESERVE.md with previews for every reserve piece

A reserve pack is {"series": "...", "title": "...", "posts": [ {id, series, slot, insight_keys, pillar, needs_confirmation,
cards: [card specs], linkedin, instagram} ]}. Card ids are made unique as "<series>-<post id>-<card id>".
"""
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).parent
RES = ROOT / 'packs' / 'reserve'
RAW = 'https://raw.githubusercontent.com/aadi146/ll-social-cards/main/cards/reserve'
GEN = 'General information only, not personal advice.'
BANNED = re.compile(r"\b(unlock|navigate|in today'?s market|speak with a broker|guaranteed?|game-?changer|secret|hack|journey\b(?! card)|leverage\b(?! leverage))", re.I)
DATED = re.compile(r"\b(\d\.\d{1,2}\s?%|\d{1,2}\.\d{2}\s?%|cash rate|RBA|CBA|NAB|ANZ|Westpac|Macquarie|ING\b|Bankwest|Suncorp|St\.? ?George|Liberty|Pepper|Resimac|Bluestone|La ?Trobe|first home guarantee|\$\d{2,3},?\d{3})", re.I)
LIMITS = {  # words
    'take': {'hook': 14, 'so_what': 22}, 'stat': {'headline': 8, 'body': 40}, 'myth': {'myth': 12, 'reality': 12, 'because': 30},
    'question': {'question': 20, 'body': 20}, 'point': {'title': 5, 'body': 35}, 'cover': {'hook': 14, 'sub': 20}, 'cta': {'headline': 8, 'body': 20},
    'term': {'term': 4, 'meaning': 14, 'why_it_matters': 45}, 'qa': {'question': 18, 'answer': 55},
}


def words(s):
    return len(re.findall(r"[\w'&;-]+", re.sub(r'&\w+;', 'x', str(s))))


def load_packs():
    return {p.stem: json.loads(p.read_text()) for p in sorted(RES.glob('*.json')) if not p.stem.endswith('-cards')}


def insight_keys():
    return {r['key']: r for r in json.loads((ROOT / 'insights.json').read_text())['rows']}


def check():
    keys = insight_keys()
    problems = 0
    for series, pack in load_packs().items():
        ids = set()
        for post in pack['posts']:
            pid = f"{series}/{post['id']}"
            if post['id'] in ids:
                print(f"DUP id {pid}"); problems += 1
            ids.add(post['id'])
            for k in post.get('insight_keys', []):
                if k not in keys:
                    print(f"{pid}: unknown insight key {k}"); problems += 1
                elif not keys[k]['active'] and not post.get('needs_confirmation'):
                    print(f"{pid}: uses unconfirmed {k} without needs_confirmation"); problems += 1
            for plat, lo, hi in (('linkedin', 60, 160), ('instagram', 30, 130)):
                cap = post.get(plat, '')
                n = words(cap)
                if not lo <= n <= hi:
                    print(f"{pid}: {plat} {n} words"); problems += 1
                if GEN not in cap:
                    print(f"{pid}: {plat} missing disclaimer"); problems += 1
                if m := BANNED.search(cap):
                    print(f"{pid}: {plat} banned word '{m.group(0)}'"); problems += 1
                if m := DATED.search(cap):
                    print(f"{pid}: {plat} dated/lender reference '{m.group(0)}'"); problems += 1
            if plat == 'instagram' and cap.count('#') != 5:
                pass
            ig = post.get('instagram', '')
            if ig.count('#') < 3 or ig.count('#') > 6:
                print(f"{pid}: instagram has {ig.count('#')} hashtags"); problems += 1
            for c in post['cards']:
                lim = LIMITS.get(c['type'])
                if lim is None:
                    print(f"{pid}: unknown card type {c['type']}"); problems += 1; continue
                for field, mx in lim.items():
                    if field in c and words(c[field]) > mx:
                        print(f"{pid}/{c['id']}: {field} {words(c[field])} words > {mx}"); problems += 1
                blob = ' '.join(str(v) for v in c.values())
                if m := DATED.search(blob):
                    print(f"{pid}/{c['id']}: dated/lender reference '{m.group(0)}'"); problems += 1
                if m := BANNED.search(blob):
                    print(f"{pid}/{c['id']}: banned word '{m.group(0)}'"); problems += 1
    total = sum(len(p['posts']) for p in load_packs().values())
    print(f"{total} reserve posts checked, {problems} problems")
    return problems


def cards(series):
    pack = load_packs()[series]
    out = []
    for post in pack['posts']:
        for c in post['cards']:
            cc = dict(c)
            cc['id'] = f"{series}-{post['id']}-{c['id']}"
            out.append(cc)
    (RES / f'{series}-cards.json').write_text(json.dumps(out, indent=1, ensure_ascii=False))
    print(f"{len(out)} cards -> packs/reserve/{series}-cards.json")


def index():
    packs = load_packs()
    keys = insight_keys()
    lines = ['# Reserve bank', '', 'Ready-to-post pieces, grouped by series. Pick by **id**; nothing here is in Zernio until Aadi asks for it.',
             'Pieces marked *to confirm* rest on an insight Aadi has not yet confirmed.', '']
    total = 0
    for series, pack in packs.items():
        lines += [f"## {pack.get('title', series)}", '', pack.get('description', ''), '']
        for post in pack['posts']:
            total += 1
            first = post['cards'][0]
            img = f"{RAW}/{series}/{series}-{post['id']}-{first['id']}.png"
            hook = post.get('hook') or first.get('hook') or first.get('headline') or first.get('question') or first.get('term') or first.get('myth') or ''
            flag = ' · *to confirm*' if post.get('needs_confirmation') else ''
            n = len(post['cards'])
            kind = f"carousel, {n} slides" if n > 1 else first['type']
            lines += [f"### `{series}/{post['id']}` — {hook}{flag}", '',
                      f"<img src=\"{img}\" width=\"270\">", '',
                      f"{kind} · insights: {', '.join(post.get('insight_keys', []))}", '',
                      '<details><summary>LinkedIn caption</summary>', '', post['linkedin'].replace('\n', '  \n'), '', '</details>',
                      '<details><summary>Instagram caption</summary>', '', post['instagram'].replace('\n', '  \n'), '', '</details>', '']
    lines.insert(3, f'**{total} pieces across {len(packs)} series.**')
    (ROOT / 'RESERVE.md').write_text('\n'.join(lines))
    print(f"RESERVE.md: {total} pieces")


if __name__ == '__main__':
    cmd = sys.argv[1] if len(sys.argv) > 1 else 'check'
    if cmd == 'check':
        sys.exit(1 if check() else 0)
    elif cmd == 'cards':
        cards(sys.argv[2])
    elif cmd == 'index':
        index()
