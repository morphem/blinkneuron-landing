# blinkneuron.eu

The landing page for **BlinkNeuron** — Krzysztof Prawdzik's after-hours projects — and the
public home of the privacy policies that the app stores require.

Static HTML, CSS and one small script. No framework, no build step, no backend, and not one
request that leaves the page. Served by GitHub Pages from the repository root. English by
default, Polish one click away, light or dark to taste.

```bash
python3 -m http.server 8799     # http://127.0.0.1:8799
python3 tools/check.py          # links, CNAME and the privacy policy
```

## What is on it

| Section | Holds |
|---|---|
| Hero | The thesis, and the Ulam spiral drawn on a canvas |
| Header | EN/PL and light/dark, both remembered in the visitor's own browser |
| Ulam | The app on its way to Google Play, and the link to its privacy policy |
| Projects | Kvasir, Minerals, talented-hr, Harpa, DadQuest — with an honest status each |
| Method | How the work is done: research first, one invariant per project, voice to prompt |
| Strengths | CliftonStrengths 34, tied to something concrete in the code |

## The rule that matters

`https://blinkneuron.eu/ulam/privacy/` is on the Google Play listing for Ulam. It has to
answer, from the public internet, every time. That is why this site does not run on the home
lab, and why `tools/check.py` runs before a deploy. See [`CLAUDE.md`](CLAUDE.md).

## Adding a project

Copy one `<article class="card">` block in `index.html` and change it. The page is written in
English; give every text node a `data-pl` attribute with the Polish, pick a status (`live`,
`wip` or `private`), and link it only if the host really answers to the open internet.

Brand rules — the wordmark, the palette, the two type voices — live in
[`../xreal/brand-blinkneuron.md`](../xreal/brand-blinkneuron.md).
