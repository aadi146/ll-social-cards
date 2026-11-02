# Reserve content: series plan (115 pieces)

A bank of ready-to-post pieces Aadi picks from whenever a week needs more, or a theme deserves a run. Every piece is built from a confirmed-or-mined view in `insights.json` and follows CONTENT-SYSTEM.md. Nothing here goes to Zernio until Aadi picks it. Older recordings (April–July) are used for principles only: no rates, lender names, lender policy, scheme caps or grant amounts.

| # | Series | Card type | Pieces | What it is |
|---|---|---|---|---|
| 1 | **Plain English** | `term` | 15 | One piece of lending jargon per card, explained the way Aadi does across a table, and why it matters to you. Evergreen; the backbone of a Tuesday slot. |
| 2 | **Our take** | `take` | 20 | Aadi's photo, one view, one thing to do with it. The signature format. |
| 3 | **Myth vs what we see** | `myth` | 15 | A common belief, crossed out, against what actually happens on our files. |
| 4 | **Rule of thumb** | `stat` | 8 | One number people can hold on to, with the caveat. |
| 5 | **A question to ask yourself** | `question` | 10 | Money-habits and protection prompts, framed as questions, never advice. |
| 6 | **Carousels** | `cover` + `point` + `cta` | 20 | Journeys ("what actually happens when…"), "before you sign" checklists, "5 things we check", and themed jargon sets. 5–7 slides each. |
| 7 | **How we work** | `qa` + `take` | 12 | "Ask the broker" Q&A cards and behind-the-scenes views on how LL runs a file. The no-fee model and the Trident one-stop shop live here. |
| 8 | **In his words** | `note` | 15 | The screenshot-of-a-post look: white card, name and handle, three short paragraphs that land one idea (observation, observation, reframe). Ten singles and five 5-slide threads. The established-voice format; any carousel can be re-cut this way on request. |

## Posting rhythm suggestion
- Weekly routine supplies 4 fresh posts. Reserve fills gaps and themed weeks.
- Suggested slots: Mon = Our take · Tue = Plain English · Wed = Carousel · Thu = Myth or Rule of thumb · Fri = Question / How we work.
- A series can be run as a block (for example "Plain English" every Tuesday for 15 weeks) so followers learn to expect it.

## Files
- `packs/reserve/<series>.json` — posts with captions (LinkedIn + Instagram), card specs, insight keys, `status: "reserve"`.
- `cards/reserve/<series>/` — rendered PNGs. Raw URL: `https://raw.githubusercontent.com/aadi146/ll-social-cards/main/cards/reserve/<series>/<id>.png`.
- `RESERVE.md` — browsable index with previews. Pick by id; say "load reserve <id> to Zernio" and it becomes a draft.

## Rules specific to the reserve
- Principles over particulars: no rate, no lender, no scheme figure, no dated reference.
- Each piece cites its `insight_keys`; a piece built on an unconfirmed insight carries `needs_confirmation: true` and is listed separately in RESERVE.md.
- Same gate as the weekly routine: a piece that reads like any broker's post is cut, not published.
