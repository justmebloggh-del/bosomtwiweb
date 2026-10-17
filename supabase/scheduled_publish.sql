-- ─────────────────────────────────────────────────────────────────
-- True auto-publish for scheduled articles — run once in the
-- Supabase SQL editor.
--
-- PublishModal.tsx's "Schedule for later" field only ever stored the
-- target time on `articles.scheduled_at` and left the article as a
-- draft — nothing came back later to actually publish it. This adds a
-- pg_cron job, running every minute entirely inside Postgres, that
-- flips any draft whose scheduled_at has passed to published. No new
-- serverless function or Vercel Cron Job needed — consistent with how
-- this project already avoids a Node server in production (see
-- MAINTENANCE_PLAN.md's note on the removed /api serverless functions).
--
-- Runs as the role that owns the cron job (the `postgres` role used by
-- the SQL editor), which bypasses RLS the same way any other
-- superuser-run maintenance job would — this is not a new RLS
-- exception, just Postgres' normal behavior for the table owner.
-- Idempotent: safe to run again (replaces the existing job definition
-- rather than erroring on a duplicate name).
-- ─────────────────────────────────────────────────────────────────

CREATE EXTENSION IF NOT EXISTS pg_cron;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'publish-scheduled-articles') THEN
    PERFORM cron.unschedule('publish-scheduled-articles');
  END IF;
END $$;

SELECT cron.schedule(
  'publish-scheduled-articles',
  '* * * * *', -- every minute — the finest resolution cron syntax allows
  $$
    UPDATE public.articles
    SET status = 'published',
        published_at = NOW(),   -- reflects actual go-live time, not when the draft was first saved
        scheduled_at = NULL     -- cleared once it's actually live, so the admin UI's "Scheduled" badge doesn't linger
    WHERE status = 'draft'
      AND scheduled_at IS NOT NULL
      AND scheduled_at <= NOW();
  $$
);

-- Confirm it's registered (the only statement here that returns rows).
SELECT jobid, jobname, schedule, active FROM cron.job WHERE jobname = 'publish-scheduled-articles';
