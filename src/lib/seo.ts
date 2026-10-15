// Framework-agnostic SEO helpers shared between:
//  - middleware.ts   (Vercel Edge Middleware — production)
//  - server.ts       (Express — local `npm run dev` preview, mirrors middleware.ts)
// Both runtimes expose global fetch() and process.env, so this file
// deliberately avoids Node-only and Edge-only APIs (no @supabase/supabase-js,
// no fs) to stay safe in either place.
import { CATEGORY_DESCRIPTIONS } from './categoryMeta';

export const SITE_URL = 'https://www.bosomtwiweb.com';
export const SITE_NAME = 'Bosomtwi Web';
export const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.jpg`;

export interface ArticleRow {
  id: string;
  title: string;
  slug: string;
  category: string;
  author: string;
  published_at: string;
  updated_at?: string | null;
  excerpt: string;
  content: string;
  image: string;
  status: string;
}

function env(name: string): string {
  return (typeof process !== 'undefined' && process.env && process.env[name]) || '';
}

export function getSupabaseConfig() {
  const url = env('SUPABASE_URL') || env('VITE_SUPABASE_URL');
  const anonKey = env('SUPABASE_ANON_KEY') || env('VITE_SUPABASE_ANON_KEY');
  return { url, anonKey };
}

// Fetches one published article by slug with the anon key, subject to the
// same "Public can read published articles" RLS policy the client uses.
// Never pass the service-role key in here.
export async function fetchArticleBySlug(slug: string): Promise<ArticleRow | null> {
  const { url, anonKey } = getSupabaseConfig();
  if (!url || !anonKey) return null;
  const cols = 'id,title,slug,category,author,published_at,updated_at,excerpt,content,image,status';
  const endpoint = `${url}/rest/v1/articles?slug=eq.${encodeURIComponent(slug)}&status=eq.published&select=${cols}&limit=1`;
  try {
    const res = await fetch(endpoint, { headers: { apikey: anonKey, Authorization: `Bearer ${anonKey}` } });
    if (!res.ok) return null;
    const rows = await res.json().catch(() => []);
    return Array.isArray(rows) && rows[0] ? (rows[0] as ArticleRow) : null;
  } catch {
    return null;
  }
}

export function escapeHtml(input: string): string {
  return String(input ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// JSON-LD sits inside a <script> element — the only character that can
// break out of it is `<` (as the start of `</script>`), so escape just
// that instead of HTML-escaping the whole JSON string, which would
// corrupt quotes/ampersands that are valid JSON.
export function safeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}

function plainText(html: string, max: number): string {
  const text = (html || '').replace(/\[(image|video)\][^[]*\[\/\1\]/g, ' ').replace(/\s+/g, ' ').trim();
  return text.length > max ? text.slice(0, max - 1).trimEnd() + '…' : text;
}

export interface HeadOverrides {
  title: string;
  description: string;
  canonical: string;
  ogType: 'website' | 'article';
  ogImage?: string;
  robots?: string; // e.g. 'noindex' for a 404
  articlePublishedTime?: string;
  articleModifiedTime?: string;
  articleSection?: string;
  jsonLdExtra?: unknown[]; // additional <script type="application/ld+json"> blocks
}

// Rewrites the homepage-default <title>/meta tags already present in the
// built index.html with per-route values, and appends any extra JSON-LD
// blocks before </head>. Only touches tags matched verbatim from
// index.html's current markup — anything unmatched is left untouched
// rather than duplicated.
export function injectHead(html: string, o: HeadOverrides): string {
  const title = escapeHtml(o.title);
  const desc = escapeHtml(o.description);
  const canonical = escapeHtml(o.canonical);
  const image = escapeHtml(o.ogImage || DEFAULT_OG_IMAGE);

  let out = html
    .replace(/<title>.*?<\/title>/s, `<title>${title}</title>`)
    .replace(/<meta name="description" content="[^"]*" \/>/, `<meta name="description" content="${desc}" />`)
    .replace(/<link rel="canonical" href="[^"]*" \/>/, `<link rel="canonical" href="${canonical}" />`)
    .replace(/<meta property="og:title" content="[^"]*" \/>/, `<meta property="og:title" content="${title}" />`)
    .replace(/<meta property="og:description" content="[^"]*" \/>/, `<meta property="og:description" content="${desc}" />`)
    .replace(/<meta property="og:type" content="[^"]*" \/>/, `<meta property="og:type" content="${o.ogType}" />`)
    .replace(/<meta property="og:url" content="[^"]*" \/>/, `<meta property="og:url" content="${canonical}" />`)
    .replace(/<meta property="og:image" content="[^"]*" \/>/, `<meta property="og:image" content="${image}" />`)
    .replace(/<meta name="twitter:title" content="[^"]*" \/>/, `<meta name="twitter:title" content="${title}" />`)
    .replace(/<meta name="twitter:description" content="[^"]*" \/>/, `<meta name="twitter:description" content="${desc}" />`)
    .replace(/<meta name="twitter:image" content="[^"]*" \/>/, `<meta name="twitter:image" content="${image}" />`);

  if (o.robots) {
    out = out.replace(/<meta name="robots" content="[^"]*" \/>/, `<meta name="robots" content="${escapeHtml(o.robots)}" />`);
  }

  const extraTags: string[] = [];
  if (o.ogType === 'article') {
    if (o.articlePublishedTime) extraTags.push(`<meta property="article:published_time" content="${escapeHtml(o.articlePublishedTime)}" />`);
    if (o.articleModifiedTime) extraTags.push(`<meta property="article:modified_time" content="${escapeHtml(o.articleModifiedTime)}" />`);
    if (o.articleSection) extraTags.push(`<meta property="article:section" content="${escapeHtml(o.articleSection)}" />`);
  }
  for (const block of o.jsonLdExtra || []) {
    extraTags.push(`<script type="application/ld+json">${safeJsonLd(block)}</script>`);
  }
  if (extraTags.length) {
    out = out.replace('</head>', `  ${extraTags.join('\n  ')}\n</head>`);
  }
  return out;
}

export function articleHead(article: ArticleRow, canonicalBase = SITE_URL): HeadOverrides {
  const canonical = `${canonicalBase}/article/${article.slug}`;
  const description = article.excerpt?.trim() || plainText(article.content, 160);
  const headline = article.title.length > 110 ? article.title.slice(0, 109) + '…' : article.title;
  const modified = article.updated_at || article.published_at;

  const newsArticle = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline,
    description,
    image: article.image ? [article.image] : [],
    datePublished: article.published_at,
    dateModified: modified,
    author: [{ '@type': 'Person', name: article.author }],
    publisher: {
      '@type': 'NewsMediaOrganization',
      name: SITE_NAME,
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/logo.png` },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': canonical },
    articleSection: article.category,
  };

  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${canonicalBase}/` },
      { '@type': 'ListItem', position: 2, name: article.category, item: `${canonicalBase}/category/${encodeURIComponent(article.category)}` },
      { '@type': 'ListItem', position: 3, name: headline, item: canonical },
    ],
  };

  return {
    title: `${article.title} | ${SITE_NAME}`,
    description,
    canonical,
    ogType: 'article',
    ogImage: article.image || undefined,
    articlePublishedTime: article.published_at,
    articleModifiedTime: modified,
    articleSection: article.category,
    jsonLdExtra: [newsArticle, breadcrumb],
  };
}

export function notFoundHead(canonicalBase = SITE_URL): HeadOverrides {
  return {
    title: `Article Not Found | ${SITE_NAME}`,
    description: 'The article you are looking for could not be found.',
    canonical: canonicalBase,
    ogType: 'website',
    robots: 'noindex, follow',
  };
}

export function categoryHead(category: string, canonicalBase = SITE_URL): HeadOverrides {
  const description = CATEGORY_DESCRIPTIONS[category] || `Latest ${category} news from ${SITE_NAME}.`;
  return {
    title: `${category} | ${SITE_NAME}`,
    description,
    canonical: `${canonicalBase}/category/${encodeURIComponent(category)}`,
    ogType: 'website',
  };
}

const STATIC_PAGE_META: Record<string, { title: string; description: string }> = {
  '/privacy':   { title: `Privacy Policy | ${SITE_NAME}`, description: 'How Bosomtwi Web collects, uses, and protects your data.' },
  '/terms':     { title: `Terms of Service | ${SITE_NAME}`, description: 'The terms governing your use of Bosomtwi Web.' },
  '/advertise': { title: `Advertise With Us | ${SITE_NAME}`, description: 'Reach readers across the Bosomtwe District and Ashanti Region.' },
  '/trending':  { title: `Trending | ${SITE_NAME}`, description: 'The most-read stories on Bosomtwi Web right now.' },
  '/videos':    { title: `Videos | ${SITE_NAME}`, description: 'Watch the latest video coverage from Bosomtwi Web.' },
  '/live':      { title: `Live | ${SITE_NAME}`, description: 'Watch Bosomtwi Web TV live.' },
  '/archives':  { title: `Archives | ${SITE_NAME}`, description: 'Browse past coverage from Bosomtwi Web.' },
  '/community': { title: `Community | ${SITE_NAME}`, description: 'Connect with the Bosomtwi Web community.' },
  '/contact':   { title: `Contact Us | ${SITE_NAME}`, description: 'Get in touch with the Bosomtwi Web editorial team.' },
  '/submit':    { title: `Submit a Story | ${SITE_NAME}`, description: 'Share a tip or submit a story to Bosomtwi Web.' },
};

export function staticPageHead(pathname: string, canonicalBase = SITE_URL): HeadOverrides | null {
  const meta = STATIC_PAGE_META[pathname];
  if (!meta) return null;
  return { title: meta.title, description: meta.description, canonical: `${canonicalBase}${pathname}`, ogType: 'website' };
}
