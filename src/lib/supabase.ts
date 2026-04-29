import { createClient } from '@supabase/supabase-js';
import type { Article } from '../types';

const url = import.meta.env.VITE_SUPABASE_URL as string;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(url, key);

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
