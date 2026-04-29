// PUT    /api/articles/:id   — update article (auth required)
// DELETE /api/articles/:id   — delete article (auth required)
import { db, cors, requireAuth, dbToArticle } from '../_lib';

export default async function handler(req: any, res: any) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { id } = req.query;

  // ── PUT ──────────────────────────────────────────────────────────
  if (req.method === 'PUT') {
    if (!requireAuth(req, res)) return;
    try {
      const b = req.body;
      const patch: any = {};
      if (b.title     !== undefined) patch.title      = b.title;
      if (b.slug      !== undefined) patch.slug       = b.slug;
      if (b.category  !== undefined) patch.category   = b.category;
      if (b.author    !== undefined) patch.author     = b.author;
      if (b.excerpt   !== undefined) patch.excerpt    = b.excerpt;
      if (b.content   !== undefined) patch.content    = b.content;
      if (b.image     !== undefined) patch.image      = b.image;
      if (b.videoUrl  !== undefined) patch.video_url  = b.videoUrl;
      if (b.status    !== undefined) patch.status     = b.status;

      const { data, error } = await db
        .from('articles')
        .update(patch)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return res.status(200).json(dbToArticle(data));
    } catch (err: any) {
      return res.status(500).json({ message: err.message || 'Failed to update article' });
    }
  }

  // ── DELETE ───────────────────────────────────────────────────────
  if (req.method === 'DELETE') {
    if (!requireAuth(req, res)) return;
    try {
      const { error } = await db.from('articles').delete().eq('id', id);
      if (error) throw error;
      return res.status(200).json({ success: true });
    } catch (err: any) {
      return res.status(500).json({ message: err.message || 'Failed to delete article' });
    }
  }

  res.status(405).json({ message: 'Method not allowed' });
}
