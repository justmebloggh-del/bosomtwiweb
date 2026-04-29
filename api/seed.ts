// POST /api/seed  — force-upsert all default seed articles (admin only)
// GET  /api/seed  — health check, returns current article count
import { getDb, cors, requireAuth, seedIfEmpty, dbToArticle } from './_lib';

export default async function handler(req: any, res: any) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'GET') {
    try {
      const db = getDb();
      const { count } = await db
        .from('articles')
        .select('*', { count: 'exact', head: true });
      return res.status(200).json({ articles: count ?? 0, status: 'ok' });
    } catch (err: any) {
      return res.status(500).json({ message: err.message });
    }
  }

  if (req.method === 'POST') {
    if (!requireAuth(req, res)) return;
    try {
      await seedIfEmpty();
      const { data } = await getDb()
        .from('articles')
        .select('*')
        .order('published_at', { ascending: false });
      return res.status(200).json({
        message: 'Seed articles synced successfully.',
        count: data?.length ?? 0,
      });
    } catch (err: any) {
      return res.status(500).json({ message: err.message || 'Seed failed' });
    }
  }

  res.status(405).json({ message: 'Method not allowed' });
}
