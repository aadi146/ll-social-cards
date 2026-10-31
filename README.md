# Lending Leverage social cards

Public assets for Lending Leverage's social content. Nothing here is client information: brand fonts, a photo, the card renderer, a mirror of Aadi's published views (`insights.json`), and the weekly card images that Zernio pulls into draft posts.

- `render-cards.mjs` — draws the cards (satori + resvg, no browser). `npm install && node render-cards.mjs packs/<week>-cards.json cards/<week>`
- `insights.json` — mirror of the LL Aadi Insights table. `active: false` rows are mined but not yet confirmed by Aadi and must not be used in posts.
- `packs/` — one JSON per week: posts, captions, card specs, insight keys.
- `cards/<week>/` — rendered PNGs. Referenced by raw URL from Zernio drafts.
- `CONTENT-SYSTEM.md` — the rulebook.

Raw URL pattern: `https://raw.githubusercontent.com/aadi146/ll-social-cards/main/cards/<week>/<id>.png`
