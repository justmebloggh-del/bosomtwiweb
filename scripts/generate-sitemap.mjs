// Generates dist/sitemap.xml after the Vite build. Runs as a plain Node
// script (not bundled) so it can use the same Supabase project the app
// talks to at runtime — reads the same VITE_ prefixed env vars Vercel
// already has configured for the client build.
import fs from 'fs';
import path from 'path';
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const BASE = 'https://www.bosomtwiweb.com';
const STATIC_PATHS = ['', '/trending', '/videos', '/live', '/archives', '/advertise', '/community', '/contact', '/submit', '/privacy', '/terms'];

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_ANON_KEY;

async function getPublishedArticles() {
  if (!url || !key) {
    console.warn('[sitemap] Supabase env vars not set at build time — sitemap will only include static pages.');
    return [];
  }
  const supabase = createClient(url, key);
  // updated_at may not exist yet on every deploy — see MAINTENANCE_PLAN.md
  // Task 1/3 (the migration in supabase/schema.sql is a required manual
  // step). Select '*' instead of a fixed column list so this script
  // doesn't 400 against a database that hasn't been migrated yet.
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .eq('status', 'published');
  if (error) {
    console.warn('[sitemap] Failed to fetch articles:', error.message);
    return [];
  }
  return data ?? [];
}

const articles = await getPublishedArticles();

// Static pages have no tracked modification date, so <lastmod> is omitted
// for them (optional per the sitemap spec) rather than stamping every one
// with today's date, which is what the previous version of this script did.
const urls = [
  ...STATIC_PATHS.map(p => ({
    loc: `${BASE}${p}`,
    lastmod: null,
    changefreq: p === '' ? 'hourly' : 'weekly',
    priority: p === '' ? '1.0' : '0.7',
  })),
  ...articles.map(a => ({
    loc: `${BASE}/article/${a.slug || a.id}`,
    lastmod: (a.updated_at || a.published_at || '').split('T')[0] || null,
    changefreq: 'weekly',
    priority: '0.8',
  })),
];

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url>
    <loc>${u.loc}</loc>
${u.lastmod ? `    <lastmod>${u.lastmod}</lastmod>\n` : ''}    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>
`;

const outPath = path.join(process.cwd(), 'dist', 'sitemap.xml');
fs.writeFileSync(outPath, xml, 'utf-8');
console.log(`[sitemap] Wrote ${urls.length} URLs (${articles.length} articles) to ${outPath}`);
