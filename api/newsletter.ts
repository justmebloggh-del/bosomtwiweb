// POST /api/newsletter
import { cors } from './_lib';

export default async function handler(req: any, res: any) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });

  const { email } = req.body || {};
  if (!email) return res.status(400).json({ message: 'Email required' });
  return res.status(200).json({ success: true, message: 'Subscribed successfully' });
}
