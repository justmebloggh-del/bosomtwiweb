// GET  /api/users  — list users (no passwords)
// POST /api/users  — create user (auth required)
import { getDb, cors, requireAuth, bcrypt, seedIfEmpty } from './_lib';

export default async function handler(req: any, res: any) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'GET') {
    try {
      await seedIfEmpty();
      const { data, error } = await getDb()
        .from('users').select('id, name, email, role');
      if (error) throw error;
      return res.status(200).json(data || []);
    } catch (err: any) {
      return res.status(500).json({ message: err.message || 'Failed to fetch users' });
    }
  }

  if (req.method === 'POST') {
    if (!requireAuth(req, res)) return;
    try {
      const b = req.body;
      const pw = await bcrypt.hash(b.password || 'news2025', 10);
      const { data, error } = await getDb()
        .from('users')
        .insert({ id: String(Date.now()), name: b.name, email: b.email, role: b.role || 'journalist', password: pw })
        .select('id, name, email, role').single();
      if (error) throw error;
      return res.status(201).json(data);
    } catch (err: any) {
      return res.status(500).json({ message: err.message || 'Failed to create user' });
    }
  }

  res.status(405).json({ message: 'Method not allowed' });
}
