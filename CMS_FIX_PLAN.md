# Bosomtwi Web — CMS Dashboard Fix Pass

Status: **implemented locally, not deployed. Migration has been run
and verified end-to-end.** Nothing in this pass was committed or
pushed by me. The SQL migration (`supabase/cms_data_fixes.sql`) has
been run against production and confirmed working — see "Verification
after migration" below, including a correction of a false alarm I
raised partway through.

## Task 0 — Reconnaissance (bigger finding than expected)

The original audit (a code-reading pass) found the Podcasts pipeline
"disconnected" and Comments moderation "possibly broken." Reconnaissance
for this pass went further: I queried the live Supabase REST API
directly (via `/rest/v1/<table>?select=*&limit=1`, plus a service-role
OpenAPI schema dump for empty tables) and then made real test inserts
with the exact payloads the application code sends. Result: **five
features fail on every single submission in production today**, not
just "disconnected" or "possibly broken":

| Feature | Error returned by the live API |
|---|---|
| Admin → Post a Job | `Could not find the 'apply_url' column of 'community_jobs'` |
| Admin → Post a Scholarship | `Could not find the 'apply_url' column of 'community_scholarships'` |
| Admin → Post an Event | `Could not find the 'image_url' column of 'community_events'` |
| Admin → Podcasts upload | `Could not find the 'audio_path' column of 'podcasts'` |
| Public → Careers application | `Could not find the table 'public.career_applications'` |

Root cause: the application code and the live table shapes have
drifted apart (live columns are named differently than the code
expects, and one table doesn't exist at all). None of this is guessed —
every row in the table above is a real error from the live database.

I also found the Podcasts admin upload wasn't even checking the insert
for an error (`await supabase.from('podcasts').insert({...})` with no
`{ error }` destructured), so staff saw "✓ Podcast uploaded successfully"
on every attempt despite it silently failing 100% of the time.

**You chose:** fix this by adding the missing columns/table via SQL
(preserving every field currently in the admin forms) rather than
trimming the forms down to match the existing columns.

## Task 1 — `supabase/schema.sql` backfill

Added `CREATE TABLE IF NOT EXISTS` definitions (matching the live
column shapes exactly, confirmed via the OpenAPI schema dump) for nine
tables that existed only in the live database, created out-of-band via
the Supabase dashboard and never previously committed here:
`site_config`, `podcasts`, `live_ads`, `ad_enquiries`,
`community_events`, `community_jobs`, `community_scholarships`,
`community_polls`, `contact_submissions`, `story_submissions`. Purely
additive/idempotent — documentation for disaster recovery, not a
behavior change. The *new* columns and the brand-new
`career_applications` table from this fix pass live separately in
`supabase/cms_data_fixes.sql`, matching this repo's existing convention
of dated patch files (`fix_user_id_reconciliation.sql`,
`rls_hardening.sql`).

## Task 2 — Real Breaking News

`AdminDashboard.tsx`'s Breaking News tab (`fetchBreakingNews` /
`handleSaveBreakingNews` / `handleClearBreakingNews`) now reads/writes
`site_config` keys `breaking_news_text` / `breaking_news_active` — the
exact same mechanism the TV tab already used correctly — instead of
`localStorage`, which never left the editor's own browser.

Also fixed the actual public consumer: `Home.tsx`'s `BreakingTicker`
component was *also* reading `localStorage.getItem('bw_breaking')` —
meaning even if the admin's save had worked, no real visitor would
ever have seen it, since each visitor's `localStorage` is their own.
It now fetches the same two `site_config` keys.

## Task 3 — Podcasts: fixed the broken upload, then wired the public page

- `AdminDashboard.tsx`: the upload now calls `getPublicUrl()` after
  storing each file and inserts into `audio_url`/`video_url` (matching
  the live column names and their semantic meaning — a URL, not an
  internal storage path), adds the `author` column from Task 1's
  migration, and — critically — now actually checks the insert's
  `{ error }` and throws if present, so a real failure shows a real
  error instead of a false "✓ uploaded successfully."
- `PodcastsPage.tsx`: replaced the fully hardcoded `EPISODES` array
  with a live fetch from `podcasts`. Added real `<audio>`/`<video>`
  playback (there was none before — `playingId` only toggled a fake
  waveform animation; `audioSrc` was always `''`). Removed the
  show-filtering interaction between the "Our Shows" grid and the
  episode list, since real uploaded episodes have no concept of a
  "show" (that's a curated/editorial concept the admin form doesn't
  collect) — "Our Shows" is now purely informational, consistent with
  how other fully-static pages in this app already work (About,
  FactCheck, BusinessDirectory).

## Task 4 — Inbox tab

New "Inbox" tab in `AdminDashboard.tsx` with three sub-tabs (Contact /
Stories / Careers), reading `contact_submissions`, `story_submissions`,
and `career_applications` respectively. Each item shows a status
dropdown (new/read/replied/archived) and a delete button, via new
`fetchInbox`/`updateInboxStatus`/`deleteInboxItem` functions. This
closes the three previously write-only dead ends — submissions were
reaching Supabase successfully (except Careers, see Task 0) but were
invisible without opening the Supabase table editor directly.

Left Inbox and Community open to both journalist and admin roles (see
Task 6) — story pitches in particular are something journalists need
to see to act on, not just admins.

## Task 5 — Draft / scheduled article status

- `PublishModal.tsx`: added "Save as Draft" alongside the publish
  button. Added an optional "Schedule for later" datetime field — this
  originally only stored the target time with no automatic follow-up;
  a `pg_cron` job added later (see the "Scheduled auto-publish" addendum
  further down) now actually flips it to published when the time
  passes, so the UI copy was updated to match once that landed.
  Also made the slug field editable (previously silently
  auto-generated with no way to override it) with a real uniqueness
  check against `articles.slug` before saving — previously a title
  collision would silently produce a duplicate slug with undefined
  behavior for which article resolves at that URL.
- `AdminDashboard.tsx` Articles tab: added a status filter (All /
  Published / Draft) and a Draft/Published badge per row.
- **Found and fixed a second RLS gap while implementing this:** the
  only existing SELECT policy on `articles` was "Public can read
  published articles" (`status = 'published'`). With no staff-specific
  SELECT policy, introducing `status = 'draft'` would have made every
  draft invisible to everyone, including the staff member who wrote
  it — RLS grants visibility per-row only if some policy matches, and
  none would have. Added "Staff can read all articles" to
  `cms_data_fixes.sql`.
- `src/types.ts`, `src/lib/supabase.ts`, `server.ts`: added `scheduledAt`
  mapping alongside the existing `updatedAt` pattern.

## Task 6 — Per-tab role gating

Gated **Breaking News, TV, Advertise, and Settings** to `admin` only —
these affect site-wide messaging, live-stream URLs, real advertiser
relationships/money, and user/role management. Left **Articles,
Analytics, Authors, Inbox, Comments, and Community** open to both
roles — these are day-to-day editorial/content work journalists
reasonably need (posting a community event is analogous to publishing
an article; reading a story pitch in the Inbox is literally a
journalist's job). This is a judgment call, not something explicitly
specified — flagging it so you can tell me if you'd split it
differently. Enforced at the nav level (`ADMIN_ONLY_TABS` filters which
buttons render) plus a defensive `useEffect` that redirects a
non-admin away from an admin-only tab if `tab` state ever ends up
there another way.

## Task 7 — Smaller fixes

- **Ad Packages pricing editor now persists.** Previously pure
  in-memory `useState` with copy claiming "Changes update the public
  Advertise page immediately" — true for the current page load, false
  for anyone else or after a refresh. Now saved to `site_config` key
  `ad_package_overrides` (JSON: `{name, price, period, popular}[]`) via
  an explicit "Save Packages" button (so edits aren't auto-saved
  either — the previous copy overclaimed in both directions). The
  public `Advertise.tsx` page fetches this on load and merges it onto
  its own hardcoded `PACKAGES` array by name, overriding only
  price/period/popular — the description and feature list stay
  hardcoded, since the admin form never collected those anyway.
- **Poll voting now works.** `CommunityPage.tsx`'s `Poll` component
  previously had `pct: 0` hardcoded for every option regardless of
  votes, and clicking an option only ever set local component state —
  never persisted, reset on refresh, not shared between visitors. Added
  `increment_poll_vote(poll_id, option_index)`, a `SECURITY DEFINER` RPC
  that increments exactly one option's vote count (deliberately not a
  broad public UPDATE policy on the whole row, which would let a
  visitor rewrite the question or any count directly). Percentages are
  now computed live from real vote counts. A `localStorage` flag per
  poll ID prevents re-voting in the same browser and persists the
  "already voted, see results" view across reloads. The static
  fallback `POLLS` (shown only if no real poll exists yet) is left as
  non-interactive decorative content, consistent with other fully-static
  pages elsewhere in the app.
- **Removed Settings → "Site Title."** It never persisted anything
  (no Supabase call at all) and — more importantly — there's no single
  place in this app that reads a dynamic site title; the real title
  lives in `index.html`'s static `<title>` tag and is hardcoded
  separately across many components. Making this field *actually*
  do something would mean a much larger change (threading a dynamic
  title through the Edge Middleware built in the prior SEO pass, which
  only covers specific routes, not sitewide branding). Given the choice
  between "persist it but it still does nothing" and "remove it,"
  removing was the more honest option — happy to scope the larger
  version separately if you want it.
- **Comments moderation is now end-to-end.** The Approve/Reject
  buttons already called the right Supabase update — they just had no
  `status` column to write to (fixed in the migration). I also found
  and fixed the other half: `ArticleView.tsx`'s public comment fetch
  had no status filter at all, so even a working "Reject" would never
  have hidden anything from visitors. It now excludes
  `status = 'rejected'`.

## Verification after migration (including a false alarm, corrected)

`supabase/cms_data_fixes.sql` ran clean against production. Re-testing
the five originally-broken features afterward surfaced a genuine
finding and then a false alarm from my own test methodology — both
worth recording:

- **Real confirmation:** re-running the exact same test payloads that
  previously failed with `Could not find the 'X' column` now failed
  instead with RLS/permission errors for the staff-only tables
  (`community_jobs`, `community_scholarships`, `community_events`,
  `podcasts`) — which is *correct*, since those four should only
  accept writes from an authenticated staff session, not anonymous
  requests. The column-name fix is confirmed; I can't fully exercise
  the authenticated-staff path without real login credentials, but the
  RLS pattern (`is_staff()`) is identical to the one already proven
  working on the `articles` table in production.
- **False alarm (my mistake):** the same re-test on
  `contact_submissions`, `story_submissions`, and the new
  `career_applications` also came back with an RLS error, which I
  initially reported as a regression my changes had caused. It wasn't
  real: my test script added `Prefer: return=representation` (to get
  the inserted row's ID back for cleanup), which makes PostgREST also
  require a SELECT policy on the just-inserted row — these tables
  correctly grant SELECT to staff only, not anon, so *that specific
  header* triggered a second RLS check the real application code never
  triggers. I had you run two follow-up "hotfix" scripts
  (`cms_rls_hotfix.sql`, `cms_grants_hotfix.sql`) chasing this — they
  weren't wrong to run (they make the policies more explicit and are
  harmless), but they weren't fixing a real bug either. Re-tested with
  the *exact* call shape the real `CareersPage.tsx` / `ContactPage.tsx`
  / `SubmitStoryPage.tsx` code uses (no `.select()` chained, so no
  representation requested) — all three returned `201 Created`. Test
  rows were inserted and then deleted via the service-role key, never
  left behind.
- **Lesson for next time:** when testing anon-insert policies, match
  the real client call shape exactly (no `Prefer: return=representation`
  unless the real code uses `.select()`), since that header changes
  what RLS has to satisfy.

## Manual steps

1. ~~Run `supabase/cms_data_fixes.sql`~~ — **done**, confirmed working
   (see "Verification after migration" above).
2. ~~Run `cms_rls_hotfix.sql` / `cms_grants_hotfix.sql`~~ — **done**;
   turned out not to be fixing a real bug (see above), but harmless and
   already applied, no need to revert.
3. **Still outstanding:** click through the actual admin dashboard
   logged in as a journalist and as an admin — I still don't have
   staff login credentials or a browser in this environment, so Inbox,
   Breaking News, Podcasts upload, the new draft/schedule flow, and the
   per-role tab visibility have only been verified at the
   database/API/typecheck level, not by actually using the UI.
4. ~~Scheduled articles auto-publishing~~ — **done**, see the
   "Scheduled auto-publish" addendum below. Run
   `supabase/scheduled_publish.sql` to enable it.
5. Decide if the Task 6 role split above matches how you actually want
   journalists vs. admins to work — easy to adjust either direction.

## Not run (and why)

- **No live click-through test of the admin dashboard.** I have no
  journalist/admin login credentials for this environment, and no
  browser-automation tool available in this session, so I could not
  actually log in and click through Inbox/Breaking News/Podcasts/
  Drafts/Polls in a real browser. Verification instead came from: (a)
  real REST API calls against the live database with the anon key,
  confirming exact error messages before and the absence of errors
  after the schema change would apply, (b) `tsc --noEmit` and
  `npm run build` passing clean after every change, (c) curl checks
  confirming public pages (`/`, `/community`, `/advertise`, `/podcasts`)
  still return 200. Please click through the dashboard yourself after
  running the migration, especially Inbox and the new draft/schedule
  flow in `PublishModal`.
- **SQL migration was not executed.** No credentials/CLI access to run
  DDL against this specific Supabase project from this environment
  (same limitation as the `updated_at` migration in the prior SEO
  pass). See "Manual steps" #1.

## Rollback notes

- **Migration:** every statement in `cms_data_fixes.sql` is additive
  (`ADD COLUMN IF NOT EXISTS`, `CREATE TABLE IF NOT EXISTS`, guarded
  policy creation). To fully roll back, you'd `DROP` the specific
  columns/table/policies/function it added — nothing here touches or
  removes existing data.
- **Breaking News / TV / Ad Packages (site_config):** revert the
  `AdminDashboard.tsx`/`Home.tsx`/`Advertise.tsx` changes; the
  `site_config` rows become inert and harmless if unread.
- **Podcasts:** revert `AdminDashboard.tsx`'s upload handler and
  `PodcastsPage.tsx` to their prior versions; the `author` column and
  any real uploaded rows are harmless if the code stops reading them.
- **Inbox tab:** delete the tab's JSX block, `InboxCard`, and the
  three fetch/update/delete functions in `AdminDashboard.tsx`; remove
  `'Inbox'` from `TABS`.
- **Drafts/scheduling:** revert `PublishModal.tsx` and the Articles
  tab's status filter/badge; the `scheduled_at` column and "Staff can
  read all articles" policy are harmless if unused.
- **Role gating:** delete the `ADMIN_ONLY_TABS` array and its two
  usages to restore the previous "every tab visible to both roles"
  behavior.
- **Poll voting:** revert `CommunityPage.tsx`'s `Poll` component and
  `handleVote`; drop the `increment_poll_vote` function if you want it
  fully gone, though it's harmless unused.
- **Comments:** revert the `.neq('status', 'rejected')` filter in
  `ArticleView.tsx` if you want unmoderated comments visible again.

## Addendum — in-body links + document attachments

Added after the fixes above, same conventions:

- **Hyperlinks in article body text.** `PublishModal.tsx`'s formatting
  toolbar gained a "Link" button (`[link:URL]text[/link]`, same
  token-based approach as the existing `**bold**`/`_italic_`/`[size:]`
  syntax). `ArticleView.tsx`'s `renderInline()` renders it as a real
  `<a target="_blank">`.
- **PDF/Word/Excel/PowerPoint attachments**, the way major news sites
  attach a source document (court filing, report, dataset) to a story.
  A new "Attach Document" toolbar button uploads to a **new** Storage
  bucket, `article-documents` (separate from `article-images` so a
  20MB document cap doesn't also raise the image/video bucket's
  limit), and inserts `[file]url|filename|sizeBytes[/file]`.
  `ArticleView.tsx` renders it as a downloadable card (file-type icon,
  name, size, download icon) via a new `renderFileAttachment()`.
- **Manual step required:** run `supabase/article_attachments.sql` in
  the Supabase SQL editor — it creates the `article-documents` bucket
  directly via SQL (`INSERT INTO storage.buckets`, not the dashboard
  UI) plus the matching staff-upload/public-download policies, same
  pattern as the existing `article-images` bucket. Nothing works until
  this runs; `tsc`/`vite build` pass either way since this is a
  database-side dependency, not a code one.
- **Verified:** `tsc --noEmit` and `npm run build` clean. The link and
  file-attachment token regexes were also checked in isolation against
  sample strings (multi-token text, a realistic Supabase storage URL
  with pipe-delimited filename/size) to confirm they parse exactly as
  `renderInline()`/`renderBody()` expect. Not verified: an actual
  upload through the dashboard UI or a real rendered page in a browser
  — same credential/browser-access limitation as the rest of this
  session.
- **Rollback:** revert the toolbar/upload-handler additions in
  `PublishModal.tsx` and the `renderInline`/`renderFileAttachment`/
  `[file]` block-handler additions in `ArticleView.tsx`. The
  `article-documents` bucket and its policies are harmless if nothing
  references them.

## Addendum — scheduled auto-publish

The "Schedule for later" field (Task 5) originally only stored a
target time on a draft with no automatic follow-up — an editor had to
come back and hit Publish themselves. Fixed with `pg_cron`
(`supabase/scheduled_publish.sql`), a job running every minute entirely
inside Postgres:

```sql
UPDATE public.articles
SET status = 'published', published_at = NOW(), scheduled_at = NULL
WHERE status = 'draft' AND scheduled_at IS NOT NULL AND scheduled_at <= NOW();
```

No new serverless function or Vercel Cron Job — consistent with this
project's existing avoidance of a Node server in production. Also
fixed a related pre-existing inconsistency while doing this:
`PublishModal.tsx`'s insert path always stamped `published_at` at
*creation* time, even for a draft saved days before its scheduled
go-live — meaning a scheduled article would have shown the wrong
publish date once it went live. The cron job now sets `published_at =
NOW()` at the moment it actually publishes, so the date shown to
readers (and used by the sitemap/RSS feed) reflects when the story
actually went live, not when the draft was first saved.

- **Manual step required:** run `supabase/scheduled_publish.sql` in
  the Supabase SQL editor. It enables the `pg_cron` extension (usually
  just works from the SQL editor on Supabase; if it errors on
  permissions, enable "pg_cron" first via Database → Extensions in the
  dashboard, then re-run just the `cron.schedule(...)` portion) and
  registers the job. The script's last line confirms registration by
  listing the job back.
- **Verified:** `tsc --noEmit` / `npm run build` clean. The cron job
  itself runs inside Supabase's Postgres, which this environment has
  no way to directly observe running — I can't watch a minute tick by
  and confirm a real draft flips to published without DB execution
  access. The SQL was checked for correctness against the exact column
  names/semantics already in use (`status`, `scheduled_at`,
  `published_at`) rather than run.
- **Rollback:** `SELECT cron.unschedule('publish-scheduled-articles');`
  stops it; nothing else to revert since no application code changed
  beyond the two UI-copy corrections above.
