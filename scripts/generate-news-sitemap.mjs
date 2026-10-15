// Generates dist/news-sitemap.xml after the Vite build — Google News
// sitemap rules: only articles published in the last 48 hours, at most
// 1,000 URLs. See MAINTENANCE_PLAN.md Task 3.
//
// Freshness caveat: like sitemap.xml, this only regenerates on a new
// build/deploy. If articles are published between deploys without
// triggering a rebuild, this sitemap goes stale within the 48h window.
// MAINTENANCE_PLAN.md documents setting up a Supabase→Vercel deploy hook
// on publish as a manual follow-up for this reason.
import fs from 'fs';
import path from 'path';
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const BASE = 'https://www.bosomtwiweb.com';
const PUBLICATION_NAME = 'Bosomtwi Web';
const PUBLICATION_LANGUAGE = 'en';
const WINDOW_MS = 48 * 60 * 60 * 1000;
const MAX_URLS = 1000;

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_ANON_KEY;

function escapeXml(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

async function getRecentArticles() {
  if (!url || !key) {
    console.warn('[news-sitemap] Supabase env vars not set at build time — writing an empty news sitemap.');
    return [];
  }
  const supabase = createClient(url, key);
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(MAX_URLS);
  if (error) {
    console.warn('[news-sitemap] Failed to fetch articles:', error.message);
    return [];
  }
  const cutoff = Date.now() - WINDOW_MS;
  return (data ?? []).filter(a => a.published_at && new Date(a.published_at).getTime() >= cutoff);
}

const articles = await getRecentArticles();

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${articles.map(a => `  <url>
    <loc>${BASE}/article/${escapeXml(a.slug || a.id)}</loc>
    <news:news>
      <news:publication>
        <news:name>${escapeXml(PUBLICATION_NAME)}</news:name>
        <news:language>${PUBLICATION_LANGUAGE}</news:language>
      </news:publication>
      <news:publication_date>${a.published_at}</news:publication_date>
      <news:title>${escapeXml(a.title)}</news:title>
    </news:news>
  </url>`).join('\n')}
</urlset>
`;

const outPath = path.join(process.cwd(), 'dist', 'news-sitemap.xml');
fs.writeFileSync(outPath, xml, 'utf-8');
console.log(`[news-sitemap] Wrote ${articles.length} URLs (last 48h) to ${outPath}`);
