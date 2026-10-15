import { createClient } from '@supabase/supabase-js';
import type { Article } from '../types';

const url = import.meta.env.VITE_SUPABASE_URL as string;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(url, key);

// Article images are uploaded at full original resolution (often
// several MB each) with no resizing. Supabase's storage render
// endpoint can transform them on the fly without re-uploading, so we
// request an appropriately-sized version wherever an image is
// displayed instead of always shipping the original. Non-Supabase
// URLs (external images a journalist pasted in) pass through
// unchanged, since the transform endpoint only works for this
// project's own storage.
export function optimizedImageUrl(src: string, width: number, quality = 75): string {
  if (!src) return src;
  const marker = '/storage/v1/object/public/';
  if (!src.includes(marker)) return src;
  const base = src.replace(marker, '/storage/v1/render/image/public/');
  const sep = base.includes('?') ? '&' : '?';
  return `${base}${sep}width=${width}&quality=${quality}`;
}

export function dbToArticle(r: any): Article {
  return {
    id: r.id,
    title: r.title,
    slug: r.slug,
    category: r.category,
    author: r.author,
    publishedAt: r.published_at,
    excerpt: r.excerpt || '',
    content: r.content || '',
    image: r.image || '',
    videoUrl: r.video_url || '',
    status: r.status || 'published',
  };
}

export function articleToDb(a: Partial<Article> & { author: string }) {
  const title = a.title || '';
  return {
    id: a.id || String(Date.now()),
    title,
    slug: a.slug || title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
    category: a.category,
    author: a.author,
    published_at: a.publishedAt || new Date().toISOString(),
    excerpt: a.excerpt || '',
    content: a.content || '',
    image: a.image || 'https://images.unsplash.com/photo-1590424753858-3b6b197f89f4?auto=format&fit=crop&q=80&w=800',
    video_url: a.videoUrl || '',
    status: a.status || 'published',
  };
}
