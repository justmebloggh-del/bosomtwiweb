// GET /api/health  — diagnose env vars and Supabase connectivity
import { cors } from './_lib';

export default async function handler(req: any, res: any) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  const sbUrl =
    process.env.SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.VITE_SUPABASE_URL || '';
  const sbKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY || '';
  const jwtSecret = process.env.JWT_SECRET || '';

  const urlVar =
    process.env.SUPABASE_URL                    ? 'SUPABASE_URL' :
    process.env.NEXT_PUBLIC_SUPABASE_URL         ? 'NEXT_PUBLIC_SUPABASE_URL' :
    process.env.VITE_SUPABASE_URL                ? 'VITE_SUPABASE_URL' : 'none';
  const keyVar =
    process.env.SUPABASE_SERVICE_ROLE_KEY              ? 'SUPABASE_SERVICE_ROLE_KEY' :
    process.env.SUPABASE_ANON_KEY                      ? 'SUPABASE_ANON_KEY' :
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY          ? 'NEXT_PUBLIC_SUPABASE_ANON_KEY' :
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY   ? 'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY' :
    process.env.VITE_SUPABASE_ANON_KEY                 ? 'VITE_SUPABASE_ANON_KEY' : 'none';

  const report: Record<string, string> = {
    supabase_url:   sbUrl     ? `✓ set (via ${urlVar})` : '✗ MISSING',
    supabase_key:   sbKey     ? `✓ set (via ${keyVar})` : '✗ MISSING',
    jwt_secret:     jwtSecret ? '✓ set' : '✗ MISSING (using insecure default)',
    node_env:       process.env.NODE_ENV || 'unknown',
  };

  // Attempt a live Supabase query
  if (sbUrl && sbKey) {
    try {
      const { createClient } = await import('@supabase/supabase-js');
      const db = createClient(sbUrl, sbKey, { auth: { persistSession: false } });
      const { error } = await db.from('articles').select('id').limit(1);
      report.supabase_query = error ? `✗ ${error.message}` : '✓ connected';
    } catch (e: any) {
      report.supabase_query = `✗ ${e.message}`;
    }
  } else {
    report.supabase_query = '✗ skipped (missing env vars)';
  }

  const allOk = !Object.values(report).some(v => v.startsWith('✗'));
  return res.status(allOk ? 200 : 500).json(report);
}
