# CLAUDE.md — landing-page

The public front door of `blinkneuron.eu`: one page that shows what Krzysztof Prawdzik
builds after hours, plus the privacy policies the app stores need. Plain HTML, CSS and one
small JavaScript file — no framework, no build step, no backend, no third-party request.
GitHub Pages serves it from the repository root. The page carries English copy, and every
string has its Polish twin in a `data-pl` attribute beside it, so **the UI is English and
Polish while the code, the comments and this file stay English**
([`../xreal/CONSTITUTION.md`](../xreal/CONSTITUTION.md) §1). **English is the default** — an
owner decision of 2026-08-26: most of the audience for this page does not read Polish, and
the Polish reader is one click away. Conversation with the owner stays Polish.

The brand rules — the wordmark, the palette, the two type voices — belong to
[`../xreal/brand-blinkneuron.md`](../xreal/brand-blinkneuron.md). Do not restate them here
and do not invent a new colour on this page.

## The one invariant that must never break

**`https://blinkneuron.eu/ulam/privacy/` must answer, publicly, forever.**

The Google Play listing for Ulam points at that URL. A store listing whose privacy policy
404s is a policy violation, and the app can be pulled for it. Two things follow, and both
are load-bearing:

- The site is hosted **off the home lab**. The lab sleeps, loses its forwarded ports and
  gets restarted. A Play reviewer must never meet that.
- `python3 tools/check.py` asserts the file is there, that every internal link resolves and
  that `CNAME` still names the domain. Run it before every deploy. Keep it green.

## Domain notes

- **English is the page, Polish is the attribute.** `data-pl` holds the Polish HTML for a
  node. `assets/app.js` captures the English into `data-en` at load, so the page still reads
  with JavaScript switched off. A new text node needs both, or the PL switch shows a hole.
- **The address is never a `mailto:`.** The footer prints `krzysztof [at] blinkneuron.eu` and
  the copy button assembles the real address in JavaScript. That is deliberate anti-harvest
  work, and it applies to the privacy policies too. Do not "fix" it into a link.
- **Two controls, both hidden without JavaScript.** The language pair and the theme button
  live in `.controls[hidden]`, which `app.js` reveals. A control that cannot work must not be
  on the page. The theme has three states: stored light, stored dark, and no choice at all —
  the last one follows the system, so the dark tokens are written twice on purpose.
- **The status dots are semantic, not decoration.** Cyan means it runs and a visitor can
  open it. Violet means there is a gap — still being built. An empty ring means private.
  This is the brand's cyan/violet convention, so do not repaint a dot to taste.
- **Never publish a link to a private host.** `minerals`, `harpa` and `dadquest` hold family
  data and are meant to be reachable from the LAN and the tailnet only. They get a card and
  no link. Check what a host really answers to the open internet before you link it.
- **A claim on this page carries its source.** "1038 tasks" comes from the Ulam corpus,
  "57 tests" from its suite. If a number cannot be traced to a repository, it does not go up.
- **The privacy policy text is owned by the app.** The wording came from
  `../ignacy-alfik/store/privacy.html`. A change to the policy is a change in both places.

## Behavioural guidelines (Andrej Karpathy skills)

1. **Think before coding** — state assumptions; ask when a significant call is ambiguous.
2. **Simplicity first** — the minimum that solves the problem. This page has no build step
   on purpose; adding one needs a reason bigger than taste.
3. **Surgical changes** — touch only what the task needs; match the surrounding style.
4. **Goal-driven execution** — verify end to end before calling it done.

## Repo commands

```bash
python3 -m http.server 8799        # http://127.0.0.1:8799
python3 tools/check.py             # links, CNAME, privacy policy
/home/morph/projects/overworked/.venv/bin/python tools/og.py   # re-render assets/og.png
```

Deploy is a push to `main`. GitHub Pages publishes the repository root. The DNS records and
the first-time setup are in [`docs/deploy.md`](docs/deploy.md).

## Architecture in one breath

`index.html` holds the whole page and all of its Polish copy; there is no template and no
data file, because a project here is a card you copy once a year. `assets/style.css` holds
every value as a token in `:root`, with the dark palette as one media-query override — the
light face is the default because the siblings on this zone are dark and the owner asked
for the opposite here. `assets/app.js` does three things and nothing else: the theme switch, the
language switch, and the Ulam spiral in the hero, drawn once onto a canvas from a walk that
steps 1, 1, 2, 2, 3, 3 and turns left. Everything in it starts from one block at the bottom,
so no declaration is used before it exists. `ulam/privacy/` is the page Google Play links to.
`tools/check.py` guards the invariant, `tools/og.py` redraws the social card from
`tools/og.html` in a real browser so the wordmark matches the site, and `tools/shots.py`
re-cuts the two phone screenshots from the app's own store set in `../ignacy-alfik/store/`.
