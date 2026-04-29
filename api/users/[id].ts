// DELETE /api/users/:id  (auth required)
import { getDb, cors, requireAuth } from '../_lib';

export default async function handler(req: any, res: any) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'DELETE') return res.status(405).json({ message: 'Method not allowed' });
  if (!requireAuth(req, res)) return;
  try {
    const { error } = await getDb().from('users').delete().eq('id', req.query.id);
    if (error) throw error;
    return res.status(200).json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ message: err.message || 'Failed to delete user' });
  }
}
