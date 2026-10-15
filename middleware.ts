// Vercel Edge Middleware — the production fix for "every route serves the
// homepage's metadata" (see MAINTENANCE_PLAN.md, Task 1).
//
// This is a static Vite SPA with no server framework in production (the
// previous attempt at Node serverless functions under /api was removed
// after it crashed on Vercel with ESM/CJS runtime mismatches — see git
// history on vercel.json). Edge Middleware runs on a different runtime
// (Web-standard Request/Response, no Node APIs) and is framework-agnostic
// on Vercel, so it avoids that failure mode entirely.
//
// Approach: fetch this deployment's own built index.html, rewrite the
// homepage-default <title>/meta/JSON-LD tags with the real route's values
// (fetched from Supabase with the anon key, same as the client), and
// return that as the response — so crawlers and non-JS link-preview bots
// (Facebook/WhatsApp/X) see per-article metadata without a full SSR
// framework migration. The React app still mounts and hydrates normally
// on top of this HTML.
import {
  articleHead,
  categoryHead,
  fetchArticleBySlug,
  injectHead,
  notFoundHead,
  staticPageHead,
} from './src/lib/seo';

export const config = {
  matcher: [
    '/article/:slug*',
    '/category/:name*',
    '/privacy',
    '/terms',
    '/advertise',
    '/trending',
    '/videos',
    '/live',
    '/archives',
    '/community',
    '/contact',
    '/submit',
  ],
};

const LIVE_CACHE = 's-maxage=300, stale-while-revalidate=86400';
const NOT_FOUND_CACHE = 's-maxage=60, stale-while-revalidate=300';

export default async function middleware(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const pathname = url.pathname;

  // Fetch the deployment's own static shell. This is a distinct path
  // ("/index.html") that this middleware's matcher doesn't cover, so it
  // can't recurse back into itself.
  const origin = await fetch(new URL('/index.html', url.origin));
  if (!origin.ok) return origin;
  const html = await origin.text();

  const articleMatch = pathname.match(/^\/article\/([^/]+)\/?$/);
  if (articleMatch) {
    const slug = decodeURIComponent(articleMatch[1]);
    const article = await fetchArticleBySlug(slug);
    if (!article) {
      return new Response(injectHead(html, notFoundHead()), {
        status: 404,
        headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': NOT_FOUND_CACHE },
      });
    }
    return new Response(injectHead(html, articleHead(article)), {
      status: 200,
      headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': LIVE_CACHE },
    });
  }

  const categoryMatch = pathname.match(/^\/category\/([^/]+)\/?$/);
  if (categoryMatch) {
    const category = decodeURIComponent(categoryMatch[1]);
    return new Response(injectHead(html, categoryHead(category)), {
      status: 200,
      headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': LIVE_CACHE },
    });
  }

  const staticMeta = staticPageHead(pathname);
  if (staticMeta) {
    return new Response(injectHead(html, staticMeta), {
      status: 200,
      headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': LIVE_CACHE },
    });
  }

  // Matched by config.matcher but nothing above claimed it — serve the
  // unmodified shell rather than risk breaking the route.
  return origin;
}
