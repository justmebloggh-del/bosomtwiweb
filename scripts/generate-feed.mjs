// Generates dist/feed.xml (RSS 2.0) after the Vite build — the 50 most
// recent published articles. See MAINTENANCE_PLAN.md Task 4.
import fs from 'fs';
import path from 'path';
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const BASE = 'https://www.bosomtwiweb.com';
const SITE_NAME = 'Bosomtwi Web';
const MAX_ITEMS = 50;

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

function plainText(html, max) {
  const text = String(html || '').replace(/\[(image|video)\][^[]*\[\/\1\]/g, ' ').replace(/\s+/g, ' ').trim();
  return text.length > max ? text.slice(0, max - 1).trimEnd() + '…' : text;
}

function imageMimeType(src) {
  const ext = (src.split('?')[0].split('.').pop() || '').toLowerCase();
  if (ext === 'png') return 'image/png';
  if (ext === 'gif') return 'image/gif';
  if (ext === 'webp') return 'image/webp';
  return 'image/jpeg';
}

async function getRecentArticles() {
  if (!url || !key) {
    console.warn('[feed] Supabase env vars not set at build time — writing an empty feed.');
    return [];
  }
  const supabase = createClient(url, key);
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(MAX_ITEMS);
  if (error) {
    console.warn('[feed] Failed to fetch articles:', error.message);
    return [];
  }
  return data ?? [];
}

const articles = await getRecentArticles();
const now = new Date().toUTCString();

const items = articles.map(a => {
  const link = `${BASE}/article/${a.slug || a.id}`;
  const pubDate = a.published_at ? new Date(a.published_at).toUTCString() : now;
  const description = a.excerpt || plainText(a.content, 300);
  const enclosure = a.image
    ? `\n      <enclosure url="${escapeXml(a.image)}" type="${imageMimeType(a.image)}" />\n      <media:content url="${escapeXml(a.image)}" medium="image" />`
    : '';
  return `    <item>
      <title>${escapeXml(a.title)}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${escapeXml(description)}</description>
      <category>${escapeXml(a.category)}</category>${enclosure}
    </item>`;
}).join('\n');

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:media="http://search.yahoo.com/mrss/">
  <channel>
    <title>${escapeXml(SITE_NAME)}</title>
    <link>${BASE}</link>
    <description>Breaking news, analysis, and culture from the Bosomtwe District, the Ashanti Region, and beyond.</description>
    <language>en-gh</language>
    <lastBuildDate>${now}</lastBuildDate>
    <atom:link xmlns:atom="http://www.w3.org/2005/Atom" href="${BASE}/feed.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>
`;

const outPath = path.join(process.cwd(), 'dist', 'feed.xml');
fs.writeFileSync(outPath, xml, 'utf-8');
console.log(`[feed] Wrote ${articles.length} items to ${outPath}`);
