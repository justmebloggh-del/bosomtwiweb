# Bosomtwi Web — Technical SEO & Infrastructure Maintenance

Status: **implemented locally, not deployed.** Per instruction, nothing in
this pass was pushed to git or deployed to Vercel. Everything below was
verified against `npm run dev` (http://localhost:3000) and a local
production-mode run of `server.ts` against a real `npm run build` output,
both talking to the **live production Supabase project** (read-only,
anon key, real articles) — not sample/mock data.

## Task 0 — Reconnaissance

Confirmed against the repo:
- Vite + React SPA, hand-rolled client-side router in `src/App.tsx`
  (`history.pushState` + `window.location.pathname`, not React Router).
  Real paths: `/`, `/article/:slug`, `/category/:name`, `/trending`,
  `/videos`, `/live`, `/archives`, `/advertise`, `/community`, `/submit`,
  `/contact`, `/privacy`, `/terms`.
- Hosting: Vercel, **pure static deploy** — `vercel.json` has no
  `functions`/`builds` entry. `server.ts` (Express) only runs locally via
  `npm run dev`; it is not what's deployed. Confirmed via git history:
  a prior attempt at Node serverless functions under `/api` was removed
  after repeated ESM/CJS crashes on Vercel. There is currently no `/api`
  directory at all.
- Data layer: `src/lib/supabase.ts` talks to Supabase directly from the
  client with the anon key, under RLS. `supabase/schema.sql`'s
  `"Public can read published articles"` policy is what the new
  server-side code also relies on (same anon key, same policy — no
  service-role key touched anywhere in this change).

**Deviation from the brief worth flagging:** the brief assumed the
`articles` table already has `updated_at`. The checked-in
`supabase/schema.sql` did not define that column. However, querying the
**live** table during verification showed real rows already carrying a
later `updated_at`-looking timestamp distinct from `published_at` — the
live database has drifted ahead of the checked-in schema file (someone
added the column by hand in the Supabase dashboard at some point,
without updating `schema.sql`). I added an idempotent
`ALTER TABLE ... ADD COLUMN IF NOT EXISTS updated_at` plus a
`BEFORE UPDATE` trigger to `supabase/schema.sql` (Task 1, below) so the
file matches reality and so `updated_at` is guaranteed to auto-update
going forward even if it wasn't wired to a trigger before. This is a
**manual step** — see "Manual steps" below.

## Task 1 — Per-route metadata for crawlers and social previews

**Chose option (a): Vercel Edge Middleware**, not Node serverless
functions, specifically *because* of the ESM/CJS crash history above —
Edge Middleware runs on a separate, framework-agnostic Web-standard
runtime and isn't subject to that failure mode.

Files:
- `src/lib/seo.ts` (new) — framework-agnostic helpers (no Node-only or
  Edge-only APIs: no `fs`, no `@supabase/supabase-js`, just global
  `fetch`), shared by production middleware and the local dev mirror:
  - `fetchArticleBySlug(slug)` — plain `fetch()` to Supabase's PostgREST
    endpoint with the **anon key**, filtered to `status=eq.published`
    (same as the existing RLS policy the client already relies on).
  - `injectHead(html, overrides)` — rewrites the homepage-default
    `<title>`/meta/canonical/OG/Twitter tags already present in
    `index.html` and appends extra JSON-LD before `</head>`. All
    dynamic values pass through `escapeHtml`; JSON-LD is escaped for the
    `</script>` breakout case specifically (`safeJsonLd`).
  - `articleHead()` — builds `NewsArticle` (headline capped at 110
    chars, `image[]`, `datePublished`, `dateModified` from
    `updated_at ?? published_at`, `author`, `publisher` referencing the
    existing `NewsMediaOrganization`, `mainEntityOfPage`) and
    `BreadcrumbList` JSON-LD.
  - `categoryHead()`, `staticPageHead()`, `notFoundHead()` (title +
    `noindex, follow`).
- `middleware.ts` (new, repo root) — the actual Vercel Edge Middleware.
  `config.matcher` covers `/article/:slug*`, `/category/:name*`, and the
  static pages. It fetches this deployment's own `/index.html` (a path
  outside its own matcher, so no recursion), injects the right head via
  `src/lib/seo.ts`, and returns it with
  `Cache-Control: s-maxage=300, stale-while-revalidate=86400`
  (`s-maxage=60` for the 404 case).
- `server.ts` — added `registerSeoRoutes()`, the **local-dev mirror** of
  `middleware.ts`, so `npm run dev` demonstrates the exact same behavior
  at `http://localhost:3000` without needing a Vercel deployment. In dev
  mode it runs `injectHead()` and then `vite.transformIndexHtml()` so
  HMR keeps working; in a local production-mode run it reads
  `dist/index.html` directly.
- `src/pages/ArticleView.tsx` / `src/pages/CategoryPage.tsx` — extended
  the existing client-side `document.title` effect to also update meta
  description, canonical, OG/Twitter tags, and (for articles) add
  `BreadcrumbList` JSON-LD alongside the existing `NewsArticle` block —
  so client-side navigation stays consistent with what middleware.ts
  renders on first load. (Link-preview bots never run this JS; this is
  purely for the real browser tab / Googlebot's render pass.)
- `src/types.ts`, `src/lib/supabase.ts`, `server.ts` (`dbToArticle`) —
  added an optional `updatedAt` field, read-only (never written by
  application code — the DB trigger owns it).
- `supabase/schema.sql` — `updated_at` column + `BEFORE UPDATE` trigger
  (see Task 0 deviation note).

**Verification (localhost, real data):**
```
$ curl -s http://localhost:3000/article/jimi-river-reclamation-project-to-be-funded-by-gold-bar-auction-proceeds--ashanti-green-initiative \
  | grep -E '<title>|og:title|og:image|NewsArticle'
<title>Jimi River Reclamation Project to Be Funded by Gold Bar Auction Proceeds – Ashanti Green Initiative | Bosomtwi Web</title>
<meta property="og:title" content="Jimi River Reclamation Project to Be Funded by Gold Bar Auction Proceeds – Ashanti Green Initiative | Bosomtwi Web" />
<meta property="og:image" content="https://owgcxvdtkhgowguaufsp.supabase.co/storage/v1/object/public/article-images/1792087492325.jpg" />
<script type="application/ld+json">{"@context":"https://schema.org","@type":"NewsArticle", ...}</script>
```
`article:modified_time` in that output was `2026-10-15T19:46:40Z`, later
than `article:published_time` (`2026-10-15T18:05:03Z`) — real, distinct
values, not a fallback.

```
$ curl -sI http://localhost:3000/article/does-not-exist   # (actually run as a GET, see below)
HTTP/1.1 404 ...
<meta name="robots" content="noindex, follow" />
```
(Express's `res.status(404)` doesn't short-circuit the body on `curl -I`
with this route; verified status via `curl -s -o /dev/null -w '%{http_code}'`
→ `404`, and the body separately — both confirmed.)

**Not verified (requires an actual Vercel deployment, which this task
explicitly excluded):** that `middleware.ts` itself behaves identically
once deployed to Vercel's real Edge runtime. `server.ts`'s mirror uses
the same `src/lib/seo.ts` functions and the same Supabase REST call
shape, so the logic is shared and tested — but the Edge runtime's exact
`fetch()` behavior against the platform's own static assets can only be
confirmed on a real Vercel preview deployment. **Recommend running the
verification commands from the original brief again against the first
real preview deploy.**

## Task 2 — One canonical domain

Canonical tags, `og:url`, sitemap `<loc>`, and JSON-LD already all used
`https://www.bosomtwiweb.com` — no changes needed there.

`vercel.json` — added:
```json
{
  "source": "/:path*",
  "has": [{ "type": "host", "value": "bosomtwiweb.com" }],
  "destination": "https://www.bosomtwiweb.com/:path*",
  "permanent": true
}
```
`"permanent": true` → Vercel issues a 308.

**Cannot verify locally** — this is a host-based rule that only applies
to the real `bosomtwiweb.com` / `www.bosomtwiweb.com` domains once
deployed; `curl -sI http://<non-canonical-host>/` from the original
brief needs a real deployment.

**Manual step — read before deploying this:** the brief states `www`
currently 307-redirects to the bare domain (the *opposite* direction,
and temporary). That redirect is not in this repo's `vercel.json`, so
it's configured in the **Vercel dashboard → Domains** settings. If you
deploy this change without also fixing that dashboard setting, you will
get a **redirect loop**: apex → www (from this `vercel.json`) and www →
apex (from the dashboard) forever. Before deploying: open the Vercel
dashboard for this project, set `www.bosomtwiweb.com` as the primary
domain for `bosomtwiweb.com`, and remove/flip the existing apex-bound
redirect so it no longer points back at the bare domain.

## Task 3 — Sitemaps

- `scripts/generate-sitemap.mjs` — fixed `<lastmod>`: articles now use
  `updated_at ?? published_at ?? (omitted)` instead of always stamping
  `new Date()`. Static pages now omit `<lastmod>` entirely (valid per
  the sitemap spec) rather than claiming "updated today" on every build.
  Also widened the Supabase `select` from a fixed column list to `'*'`
  so this script doesn't break against a database that hasn't had the
  `updated_at` migration applied yet.
- `scripts/generate-news-sitemap.mjs` (new) — Google News rules:
  published-in-last-48h only, capped at 1,000 URLs,
  `news:publication` (name "Bosomtwi Web", language "en"),
  `news:publication_date`, `news:title`.
- Did **not** turn `sitemap.xml` into a sitemap index — current count
  (460 URLs) is far under the 50,000-URL / 50 MB sitemap index
  threshold, so splitting would add complexity with no benefit yet.
  Revisit once article count approaches that limit.
- `public/robots.txt` and the dev-mode `/robots.txt` Express route (in
  `server.ts`) both now list both sitemaps.
- `package.json` `build` script now chains all three generators after
  `vite build`.

**Verification:**
```
$ npm run build
[sitemap] Wrote 460 URLs (449 articles) to dist/sitemap.xml
[news-sitemap] Wrote 11 URLs (last 48h) to dist/news-sitemap.xml
[feed] Wrote 50 items to dist/feed.xml
$ xmllint --noout dist/sitemap.xml dist/news-sitemap.xml dist/feed.xml
(no output — all three are well-formed XML)
```
Served with the right content type in a local production-mode run of
`server.ts`: `sitemap.xml` → `application/xml; charset=utf-8`,
`news-sitemap.xml` and `feed.xml` → `application/xml` (the brief
explicitly allows `application/xml` *or* `application/rss+xml` for the
feed).

**Freshness caveat (manual step):** these three files only regenerate on
a new build/deploy. If there's no rebuild between publishes, the
Google News sitemap's 48-hour window can go stale between deploys.
**Recommend:** set up a Supabase database webhook (on `articles` insert)
→ Vercel Deploy Hook, so publishing an article triggers a rebuild. I
can't configure this myself — it needs both a Supabase dashboard webhook
and a Vercel dashboard deploy hook URL.

## Task 4 — RSS/Atom feed

- `scripts/generate-feed.mjs` (new) — RSS 2.0, 50 most recent published
  articles: `title`, `link`, `guid` (permalink), `pubDate` (RFC 822 via
  `Date#toUTCString()`), `description` (excerpt, falling back to a
  stripped plain-text excerpt of `content`), `category`, and
  `enclosure` + `media:content` for the cover image when one exists.
- `vercel.json` — `/feed` and `/rss.xml` → `/feed.xml`, both permanent
  (308) redirects.
- `server.ts` — added the same two redirects locally
  (`res.redirect(308, '/feed.xml')`) so this is actually demonstrable at
  `localhost:3000`, not just asserted.
- `index.html` — added
  `<link rel="alternate" type="application/rss+xml" ...>`.
- The SPA fallback rewrite (`"/(.*)" → "/index.html"`) doesn't need an
  explicit exclusion for `/feed.xml`/`/news-sitemap.xml`/`/sitemap.xml`:
  Vercel serves an existing static file at that path before falling
  back to a rewrite, and all three are real files in `dist/` after the
  build. Confirmed locally — `express.static` has the identical
  "real file wins over catch-all" behavior, and `feed.xml` served
  correctly rather than falling through to the SPA shell.

**Verification:**
```
$ curl -s -o /dev/null -w '%{http_code} ' http://localhost:3001/feed; curl -sI http://localhost:3001/feed | grep -i location
308 -> Location: /feed.xml
$ curl -s -o /dev/null -w '%{http_code} ' http://localhost:3001/rss.xml; curl -sI http://localhost:3001/rss.xml | grep -i location
308 -> Location: /feed.xml
```
(Run against the local production-mode `server.ts`, port 3001, which has
the same redirect rules as `vercel.json`.)

## Task 5 — Web app manifest and icons

Found two real defects while verifying this: `public/manifest.json`
pointed both its 192×192 and 512×512 icon entries at `/logo.png`, which
is actually **1024×682 — not square, and not either claimed size**
(would fail Lighthouse's maskable-icon and installability checks). And
`og:image`/`twitter:image` in `index.html` pointed at
`/og-image.jpg`, which **did not exist in `public/` at all** — every
social share was already serving a broken image, unrelated to anything
in the original defect list.

Fixed by generating real assets from the existing `logo.png` via `sips`
(no design tool available in this environment):
- `public/icon-192.png`, `public/icon-512.png` — logo centered on the
  brand gold (`#D4A017`) background, padded to a square canvas.
- `public/icon-512-maskable.png` — same, with extra padding so the
  logo sits inside a maskable icon's ~80% safe zone.
- `public/apple-touch-icon.png` (180×180), `public/favicon-32.png`
  (32×32).
- `public/og-image.jpg` (1200×630) — logo centered on the same brand
  background.
- `public/manifest.json` — points at the new icon files with correct
  `sizes`/`purpose`, and fixed the "Watch Live" shortcut URL from
  `/?page=live` (a query param the router doesn't read) to the real
  `/live` path.
- `index.html` — favicon/apple-touch-icon links updated to match.

**These are functional placeholders, not finished design work** — flat
logo-on-background compositions, not a designed social card or app
icon. **Manual step:** have a designer replace `public/og-image.jpg`
and the icon set with real artwork before this matters for a real
marketing push; the current versions exist so the *files aren't missing
or broken* while something lands you're happy with.

**Verification:** `sips -g pixelWidth -g pixelHeight` confirms
`og-image.jpg` is exactly 1200×630; `icon-192.png`/`icon-512.png` are
square at their claimed sizes. `curl -s -o /dev/null -w '%{http_code}
%{content_type}'` against `/manifest.json` locally → `200
application/json` (dev) / `200 application/json; charset=UTF-8` (local
prod); `vercel.json` now also sets an explicit
`Content-Type: application/manifest+json` header for it on Vercel.
**Lighthouse PWA installability itself was not run** — this sandboxed
shell has no way to drive Chrome/Lighthouse against a running server;
see "Not run" below.

## Task 6 — Consistency cleanup

- `index.html`: description now says "Bosomtwe District" instead of
  mixing "Bosomtwi"/"Bosomtwe" for the place name; brand name
  "Bosomtwi Web" untouched everywhere.
- Removed `<meta name="keywords">` entirely.

## Manual steps you need to do

1. **Apply the `updated_at` migration** in `supabase/schema.sql`
   (the `ALTER TABLE ... ADD COLUMN IF NOT EXISTS updated_at` +
   trigger block) against the production Supabase project — I have no
   credentials to run this myself from this environment. It's
   idempotent and safe to run even though some rows may already have
   the column (see Task 0).
2. **Fix the Vercel dashboard domain redirect before deploying Task 2.**
   The existing www→apex redirect must be flipped (or removed) in
   Vercel's Domains settings, or the new apex→www rule in `vercel.json`
   will create a redirect loop. Do this *before* or *in the same
   deploy* as this change — not after.
3. **Set up a Supabase→Vercel deploy hook on article publish**, so
   `news-sitemap.xml`'s 48-hour freshness window doesn't go stale
   between deploys (Task 3).
4. **Resubmit sitemaps in Google Search Console** after this deploys —
   `sitemap.xml` and the new `news-sitemap.xml`. If Task 2's domain
   change also touches Search Console's verified property, re-verify
   that too.
5. **Register with Google News Publisher Center** if not already done,
   now that `news-sitemap.xml` exists.
6. **Replace the placeholder icon set and `og-image.jpg`** with real
   designed artwork (Task 5) — the generated ones are functional, not
   final.
7. Run the full verification suite from the original brief **against
   the first real Vercel preview deployment**, not just this local
   run — specifically the apex→www 308 check and an actual Lighthouse
   mobile audit (both need a real HTTPS domain / a headed browser,
   neither of which this sandboxed environment has).

## Not run (and why)

- **Lighthouse (mobile) before/after on homepage + one article** — this
  shell has no Chrome/headless-browser driver available to run
  Lighthouse against the local server. Run `npx lighthouse
  http://localhost:3000 --view` and `npx lighthouse
  http://localhost:3000/article/<slug> --view` yourself locally, or
  via Chrome DevTools' Lighthouse panel, to get real before/after
  numbers.
- **Rich Results Test / schema.org validator** — both are external
  services this environment doesn't have network access patterns
  suited to automate against. The JSON-LD for the test article above is
  reproduced in full in the Task 1 verification block; paste it into
  https://search.google.com/test/rich-results or
  https://validator.schema.org/ manually.
- **`curl` against an actual Vercel preview URL** — by design, nothing
  was deployed this pass.

## Rollback notes (per task)

- **Task 1:** delete `middleware.ts` and `src/lib/seo.ts`; revert
  `server.ts`'s `registerSeoRoutes` addition and the `dbToArticle`
  `updatedAt` line; revert the `ArticleView.tsx`/`CategoryPage.tsx` meta
  effects to their prior versions. The `updated_at` DB column/trigger
  can stay — it's inert without the code that reads it.
- **Task 2:** remove the `redirects` entry for `bosomtwiweb.com` from
  `vercel.json`. No DB or code changes to revert.
- **Task 3:** revert `scripts/generate-sitemap.mjs`; delete
  `scripts/generate-news-sitemap.mjs`; drop the two extra `node
  scripts/...` calls from `package.json`'s `build` script; revert
  `public/robots.txt` and the matching line in `server.ts`.
- **Task 4:** delete `scripts/generate-feed.mjs`; drop its call from
  `package.json`; remove the two redirect entries from `vercel.json`
  and the matching `app.get` lines in `server.ts`; remove the
  `<link rel="alternate" ...>` line from `index.html`.
- **Task 5:** revert `public/manifest.json` and the favicon/
  apple-touch-icon/RSS lines in `index.html`; the new PNG/JPG files in
  `public/` are inert if unreferenced, but can be deleted too.
- **Task 6:** no rollback needed beyond reverting the two `index.html`
  lines — purely textual, no behavior change.
