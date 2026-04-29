// GET  /api/articles  — list all articles
// POST /api/articles  — create article (auth required)
import { getDb, cors, requireAuth, dbToArticle, articleToDb, seedIfEmpty } from './_lib';

export default async function handler(req: any, res: any) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'GET') {
    try {
      await seedIfEmpty().catch(e => console.error('Seed error (non-fatal):', e.message));
      const { data, error } = await getDb()
        .from('articles')
        .select('*')
        .order('published_at', { ascending: false });
      if (error) throw error;
      return res.status(200).json((data || []).map(dbToArticle));
    } catch (err: any) {
      return res.status(500).json({ message: err.message || 'Failed to fetch articles' });
    }
  }

  if (req.method === 'POST') {
    if (!requireAuth(req, res)) return;
    try {
      const b = req.body;
      const article = {
        id:          String(Date.now()),
        title:       b.title,
        slug:        (b.slug || b.title).toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
        category:    b.category,
        author:      b.author,
        publishedAt: new Date().toISOString(),
        excerpt:     b.excerpt  || '',
        content:     b.content  || '',
        image:       b.image    || 'https://images.unsplash.com/photo-1590424753858-3b6b197f89f4?auto=format&fit=crop&q=80&w=800',
        videoUrl:    b.videoUrl || '',
        status:      'published',
      };
      const { data, error } = await getDb()
        .from('articles').insert(articleToDb(article)).select().single();
      if (error) throw error;
      return res.status(201).json(dbToArticle(data));
    } catch (err: any) {
      return res.status(500).json({ message: err.message || 'Failed to create article' });
    }
  }

  res.status(405).json({ message: 'Method not allowed' });
}
