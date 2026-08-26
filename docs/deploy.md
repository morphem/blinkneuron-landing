# Deploy — blinkneuron.eu on GitHub Pages

The apex `blinkneuron.eu` moves off the registrar's parking page and onto GitHub Pages. The
subdomains do not move: `kvasir`, `minerals`, `harpa`, `skald`, `decks` and the planned
`ulam` keep pointing at the home WAN through SWAG. This document changes two records and
adds one.

**Why not the home lab.** Constitution §5 sends an app to Unraid behind SWAG, and this page
is a documented exception. Two reasons, both hard:

1. **Google Play must reach `/ulam/privacy/`.** A listing whose privacy URL is unreachable
   is a policy violation. The lab sleeps, loses its forwarded ports and gets restarted.
2. **An apex record cannot be a CNAME.** The home hosts follow the MikroTik DDNS name
   (`a6470abef1ee.sn.mynetname.net`), and an apex cannot follow a name that changes. GitHub
   publishes four fixed anycast addresses instead.

If DNS later moves to Cloudflare (`homelab/BACKLOG.md`), this stays true — Cloudflare would
just flatten a CNAME at the apex. Nothing here has to be undone first.

## 1. The repository

```bash
cd ~/projects/landing-page
git init && git add -A
git commit -m "Landing page for blinkneuron.eu"
gh repo create blinkneuron-landing --public --source=. --remote=origin --push
```

The repository has to be **public**, or GitHub Pages needs a paid plan.

## 2. Turn on Pages

```bash
gh api -X POST repos/morphem/blinkneuron-landing/pages \
  -f 'source[branch]=main' -f 'source[path]=/'
gh api -X PUT repos/morphem/blinkneuron-landing/pages -f cname=blinkneuron.eu -F https_enforced=true
```

Or in the browser: *Settings → Pages → Deploy from a branch → `main` / `/ (root)`*, then
*Custom domain* → `blinkneuron.eu` → *Enforce HTTPS*.

`CNAME` and `.nojekyll` are already in the repository. Leave both. `CNAME` is what keeps the
custom domain across redeploys, and `.nojekyll` stops Jekyll from touching the files.

## 3. DNS at domeny.tv

Today the apex answers `185.221.110.23` — the registrar's parking page. Replace it.

| Type | Name | Value |
|---|---|---|
| A | `@` | `185.199.108.153` |
| A | `@` | `185.199.109.153` |
| A | `@` | `185.199.110.153` |
| A | `@` | `185.199.111.153` |
| CNAME | `www` | `morphem.github.io.` |

Optional, for IPv6 visitors: AAAA `@` → `2606:50c0:8000::153`, `2606:50c0:8001::153`,
`2606:50c0:8002::153`, `2606:50c0:8003::153`.

**Do not touch any other record.** Every existing subdomain keeps its CNAME to the MikroTik
DDNS name.

## 4. Verify

```bash
python3 tools/check.py
dig +short blinkneuron.eu                    # the four 185.199.x.153 addresses
curl -sSI https://blinkneuron.eu | head -1   # HTTP/2 200
curl -sS -o /dev/null -w '%{http_code}\n' https://blinkneuron.eu/ulam/privacy/
curl -sS -o /dev/null -w '%{http_code}\n' https://kvasir.blinkneuron.eu   # still 200
```

The certificate takes a few minutes after the DNS change. *Enforce HTTPS* stays greyed out
until GitHub has issued it.

## 5. Then tell Google Play

Paste `https://blinkneuron.eu/ulam/privacy/` into *Policy → App content → Privacy policy*.
The full sequence is in [`../../ignacy-alfik/docs/release.md`](../../ignacy-alfik/docs/release.md).

## Routine deploys

Push to `main`. Pages rebuilds in under a minute. Run `python3 tools/check.py` first.
