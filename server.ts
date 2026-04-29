import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
void __filename;

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';

// ─────────────────────────────────────────────────────────────────
// SUPABASE  (primary storage)
// Reads SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY first, then falls
// back to the VITE_ prefixed vars the frontend uses.
// ─────────────────────────────────────────────────────────────────
const SB_URL =
  process.env.SUPABASE_URL ||
  process.env.VITE_SUPABASE_URL || '';

const SB_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||   // preferred – bypasses RLS
  process.env.SUPABASE_ANON_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY || '';

const db: SupabaseClient | null = SB_URL && SB_KEY
  ? createClient(SB_URL, SB_KEY, { auth: { persistSession: false } })
  : null;

// ─────────────────────────────────────────────────────────────────
// FILE-BASED FALLBACK  (local dev without Supabase)
// ─────────────────────────────────────────────────────────────────
const DATA_DIR = process.env.VERCEL
  ? '/tmp/bosomtwi-data'
  : path.join(process.cwd(), 'data');
const ARTICLES_FILE = path.join(DATA_DIR, 'articles.json');
const USERS_FILE    = path.join(DATA_DIR, 'users.json');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}
function loadJSON<T>(filePath: string, fallback: T[]): T[] {
  try {
    if (fs.existsSync(filePath)) return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch { /* fall through */ }
  return fallback;
}
function saveJSON(filePath: string, data: unknown) {
  try {
    ensureDataDir();
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Persist failed:', err);
  }
}

// ─────────────────────────────────────────────────────────────────
// FIELD MAPPING  snake_case (DB) ↔ camelCase (API)
// ─────────────────────────────────────────────────────────────────
function dbToArticle(row: any) {
  return {
    id:          row.id,
    title:       row.title,
    slug:        row.slug,
    category:    row.category,
    author:      row.author,
    publishedAt: row.published_at,
    excerpt:     row.excerpt  || '',
    content:     row.content  || '',
    image:       row.image    || '',
    videoUrl:    row.video_url|| '',
    status:      row.status   || 'published',
  };
}
function articleToDb(a: any) {
  return {
    id:           a.id,
    title:        a.title,
    slug:         a.slug,
    category:     a.category,
    author:       a.author,
    published_at: a.publishedAt || new Date().toISOString(),
    excerpt:      a.excerpt   || '',
    content:      a.content   || '',
    image:        a.image     || '',
    video_url:    a.videoUrl  || '',
    status:       a.status    || 'published',
  };
}

// ─────────────────────────────────────────────────────────────────
// DEFAULT SEED DATA
// ─────────────────────────────────────────────────────────────────
const DEFAULT_USERS = [
  { id: '1', name: 'Admin User',  email: 'admin@bosomtwi.web', password: '', role: 'admin'      },
  { id: '2', name: 'Kwame Asante',email: 'kwame@bosomtwi.web', password: '', role: 'editor'     },
  { id: '3', name: 'Ama Serwaa',  email: 'ama@bosomtwi.web',   password: '', role: 'journalist' },
  { id: '4', name: 'Kofi Mensah', email: 'kofi@bosomtwi.web',  password: '', role: 'journalist' },
];

const DEFAULT_ARTICLES = [
  {
    id: '1', title: 'Ashanti Gold Revenues Reach Record Highs in Q1 2025',
    slug: 'ashanti-gold-revenues-2025', category: 'Business', author: 'Kwame Asante',
    publishedAt: new Date('2025-04-28').toISOString(),
    excerpt: 'The mining sector in the Ashanti Region has reported a significant surge in production, driving national economic growth to new levels.',
    image: 'https://images.unsplash.com/photo-1590424753858-3b6b197f89f4?auto=format&fit=crop&q=80&w=800',
    status: 'published',
    content: 'The Ashanti Region\'s gold mining sector has posted record revenues in the first quarter of 2025, with output exceeding projections by nearly 18%.\n\nThe Minister for Lands and Natural Resources confirmed that the government received GH₵2.1 billion in royalties from the sector this quarter alone.\n\nLocal employment has also risen, with mining companies reporting a 12% increase in direct hires from Ashanti communities.',
  },
  {
    id: '2', title: 'Manhyia Palace Announces Major Cultural Restoration Project',
    slug: 'manhyia-restoration-project', category: 'Manhyia', author: 'Admin User',
    publishedAt: new Date('2025-04-27').toISOString(),
    excerpt: 'Otumfuo Osei Tutu II has commissioned a comprehensive digital archiving project to preserve the heritage of the Golden Stool.',
    image: 'https://images.unsplash.com/photo-1523438097201-512ae7d59c44?auto=format&fit=crop&q=80&w=800',
    status: 'published',
    content: 'In a historic announcement at the Manhyia Palace, Otumfuo Osei Tutu II declared the launch of the Ashanti Digital Heritage Initiative — a multimillion-cedi project to digitally preserve thousands of royal artefacts.\n\n"This initiative is about ensuring that our children and grandchildren can connect with their roots," the Asantehene said.',
  },
  {
    id: '3', title: 'New Tech Hub in Kumasi to Train 5,000 Software Engineers',
    slug: 'kumasi-tech-hub-launch', category: 'Technology', author: 'Ama Serwaa',
    publishedAt: new Date('2025-04-26').toISOString(),
    excerpt: 'A state-of-the-art innovation center has opened its doors in the heart of Kumasi.',
    image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&q=80&w=800',
    status: 'published',
    content: 'The Kumasi Innovation Hub officially opened its doors, with over 400 students enrolled in its inaugural cohort.\n\n"Kumasi has always been a city of craftsmanship. We are now extending that tradition to the digital age," said founding director Dr. Abena Frimpong.',
  },
  {
    id: '4', title: 'Ashanti Region NPP Primaries: Frontrunners Emerge',
    slug: 'ashanti-npp-primaries', category: 'Politics', author: 'Kofi Mensah',
    publishedAt: new Date('2025-04-25').toISOString(),
    excerpt: 'Internal elections within the ruling party have set the stage for a competitive showdown in the Ashanti Region.',
    image: 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?auto=format&fit=crop&q=80&w=800',
    status: 'published', content: '',
  },
  {
    id: '5', title: 'Asante Kotoko FC Clinches Ghana Premier League Title',
    slug: 'kotoko-premier-league-title', category: 'Sports', author: 'Kwame Asante',
    publishedAt: new Date('2025-04-24').toISOString(),
    excerpt: 'The Porcupine Warriors secured the championship in an electric match at Baba Yara Sports Stadium.',
    image: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&q=80&w=800',
    status: 'published', content: '',
  },
  {
    id: '6', title: 'Kumasi Cultural Festival 2025 Attracts Record 500,000 Visitors',
    slug: 'kumasi-cultural-festival-2025', category: 'Entertainment', author: 'Ama Serwaa',
    publishedAt: new Date('2025-04-23').toISOString(),
    excerpt: 'The annual celebration of Ashanti heritage drew performers from across Africa.',
    image: 'https://images.unsplash.com/photo-1541535650810-10d26f5c2abb?auto=format&fit=crop&q=80&w=800',
    status: 'published', content: '',
  },
  {
    id: '7', title: 'New Specialist Hospital Opens in Kumasi',
    slug: 'kumasi-specialist-hospital-opens', category: 'Health', author: 'Admin User',
    publishedAt: new Date('2025-04-22').toISOString(),
    excerpt: 'The 400-bed Ashanti Regional Specialist Hospital has officially opened, offering advanced cardiac and oncology services.',
    image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=800',
    status: 'published', content: '',
  },
  {
    id: '8', title: 'Kumasi Central Market Renovation: GH₵50M Project Breaks Ground',
    slug: 'kumasi-central-market-renovation', category: 'Local', author: 'Kofi Mensah',
    publishedAt: new Date('2025-04-21').toISOString(),
    excerpt: 'The Kumasi Metropolitan Assembly has kicked off a major upgrade of West Africa\'s largest open-air market.',
    image: 'https://images.unsplash.com/photo-1567881297167-573abb5f4f7b?auto=format&fit=crop&q=80&w=800',
    status: 'published', content: '',
  },
  {
    id: '9', title: 'Ghana Signs Historic Trade Deal with European Union',
    slug: 'ghana-eu-trade-deal-2025', category: 'International', author: 'Ama Serwaa',
    publishedAt: new Date('2025-04-20').toISOString(),
    excerpt: 'The landmark Economic Partnership Agreement opens duty-free access for Ghanaian cocoa, gold, and timber products.',
    image: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&q=80&w=800',
    status: 'published', content: '',
  },
  {
    id: '10', title: 'Lake Bosomtwe Receives UNESCO World Heritage Recognition',
    slug: 'lake-bosomtwe-unesco', category: 'Local', author: 'Admin User',
    publishedAt: new Date('2025-04-19').toISOString(),
    excerpt: 'The ancient crater lake, sacred to the Ashanti people, has been inscribed on UNESCO\'s World Heritage List.',
    image: 'https://images.unsplash.com/photo-1606591198835-36b6b0547da5?auto=format&fit=crop&q=80&w=800',
    status: 'published', content: '',
  },
  {
    id: '11', title: 'Otumfuo Foundation Launches 2,000-Student Scholarship Programme',
    slug: 'otumfuo-scholarship-2025', category: 'Manhyia', author: 'Kwame Asante',
    publishedAt: new Date('2025-04-18').toISOString(),
    excerpt: 'The Manhyia Palace has expanded its scholarship programme to support 2,000 brilliant students.',
    image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80&w=800',
    status: 'published', content: '',
  },
  {
    id: '12', title: 'Black Stars Unveil Bold Strategy for 2026 FIFA World Cup Qualifying',
    slug: 'black-stars-world-cup-2026', category: 'Sports', author: 'Kofi Mensah',
    publishedAt: new Date('2025-04-17').toISOString(),
    excerpt: 'Ghana\'s national football team coach has unveiled a tactical blueprint emphasising youth development.',
    image: 'https://images.unsplash.com/photo-1560272564-c83b66b1ad12?auto=format&fit=crop&q=80&w=800',
    status: 'published', content: '',
  },
  {
    id: '13', title: 'Cocoa Prices Hit 50-Year High: Ashanti Farmers Reap Record Profits',
    slug: 'cocoa-prices-record-high-2025', category: 'Business', author: 'Ama Serwaa',
    publishedAt: new Date('2025-04-16').toISOString(),
    excerpt: 'Global cocoa futures have surged past $12,000 per tonne, creating an unprecedented windfall.',
    image: 'https://images.unsplash.com/photo-1511381939415-e44015466834?auto=format&fit=crop&q=80&w=800',
    status: 'published', content: '',
  },
  {
    id: '14', title: 'Ashanti Digital Health App Reaches 400,000 Active Patients',
    slug: 'ashanti-digital-health-app', category: 'Health', author: 'Admin User',
    publishedAt: new Date('2025-04-15').toISOString(),
    excerpt: 'The GhanaHealth mobile app has connected hundreds of thousands of patients to telemedicine.',
    image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=800',
    status: 'published', content: '',
  },
  {
    id: '15', title: 'African Union Summit: Ghana Proposes Pan-African Digital Currency',
    slug: 'ghana-pan-african-digital-currency', category: 'International', author: 'Kofi Mensah',
    publishedAt: new Date('2025-04-14').toISOString(),
    excerpt: 'Ghana\'s finance ministry tabled a bold proposal for a blockchain-backed continental digital currency.',
    image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&q=80&w=800',
    status: 'published', content: '',
  },
  {
    id: '16', title: 'Kumasi Entertainment District to Open by December 2025',
    slug: 'kumasi-entertainment-district', category: 'Entertainment', author: 'Ama Serwaa',
    publishedAt: new Date('2025-04-13').toISOString(),
    excerpt: 'A multi-million dollar entertainment complex will transform Kumasi\'s social scene.',
    image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=800',
    status: 'published', content: '',
  },
  {
    id: '17', title: 'Ashanti Region Allocates GH₵20M for Road Infrastructure Overhaul',
    slug: 'ashanti-road-infrastructure-2025', category: 'Politics', author: 'Kwame Asante',
    publishedAt: new Date('2025-04-12').toISOString(),
    excerpt: 'The regional administration approved a comprehensive road rehabilitation project covering 45 communities.',
    image: 'https://images.unsplash.com/photo-1474690870753-1b92efa1f2d8?auto=format&fit=crop&q=80&w=800',
    status: 'published', content: '',
  },
  {
    id: '18', title: 'KNUST Researchers Develop Breakthrough Malaria Treatment',
    slug: 'knust-malaria-research', category: 'Technology', author: 'Admin User',
    publishedAt: new Date('2025-04-11').toISOString(),
    excerpt: 'Scientists isolated malaria-fighting compounds from indigenous medicinal plants.',
    image: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&q=80&w=800',
    status: 'published', content: '',
  },
  {
    id: '19', title: 'Otumfuo Calls for Unity as Chieftaincy Dispute Peacefully Resolved',
    slug: 'otumfuo-unity-chieftaincy', category: 'Manhyia', author: 'Admin User',
    publishedAt: new Date('2025-04-10').toISOString(),
    excerpt: 'The Asantehene successfully mediated a long-standing chieftaincy dispute.',
    image: 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop&q=80&w=800',
    status: 'published', content: '',
  },
  {
    id: '20', title: 'Kumasi Marathon 2025 Draws 10,000 Athletes from 30 Countries',
    slug: 'kumasi-marathon-2025', category: 'Sports', author: 'Kwame Asante',
    publishedAt: new Date('2025-04-09').toISOString(),
    excerpt: 'The international road race attracted elite athletes from across Africa and Europe.',
    image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&q=80&w=800',
    status: 'published', content: '',
  },
];

// ─────────────────────────────────────────────────────────────────
// LAZY INIT  — seeds Supabase once per serverless cold start
// ─────────────────────────────────────────────────────────────────
let _seedDone = false;
let _seedPromise: Promise<void> | null = null;

async function seedIfEmpty() {
  if (!db) return;
  try {
    const [{ count: ac }, { count: uc }] = await Promise.all([
      db.from('articles').select('*', { count: 'exact', head: true }),
      db.from('users').select('*',    { count: 'exact', head: true }),
    ]);

    if ((ac ?? 0) === 0) {
      await db.from('articles').insert(DEFAULT_ARTICLES.map(articleToDb));
      console.log('Seeded default articles to Supabase');
    }

    if ((uc ?? 0) === 0) {
      const hashed = await Promise.all(DEFAULT_USERS.map(async u => ({
        ...u,
        password: await bcrypt.hash(u.role === 'admin' ? 'admin123' : 'news2025', 10),
      })));
      await db.from('users').insert(hashed);
      console.log('Seeded default users to Supabase');
    }
  } catch (err) {
    console.error('Seed error:', err);
  }
}

async function ensureReady() {
  if (_seedDone) return;
  if (!_seedPromise) _seedPromise = seedIfEmpty().then(() => { _seedDone = true; });
  await _seedPromise;
}

// ─────────────────────────────────────────────────────────────────
// DATA HELPERS  — Supabase ▸ file fallback
// ─────────────────────────────────────────────────────────────────
async function getArticles() {
  await ensureReady();
  if (db) {
    const { data, error } = await db.from('articles').select('*').order('published_at', { ascending: false });
    if (error) throw error;
    return (data || []).map(dbToArticle);
  }
  return loadJSON<any>(ARTICLES_FILE, DEFAULT_ARTICLES);
}

async function createArticle(a: any) {
  if (db) {
    const { data, error } = await db.from('articles').insert(articleToDb(a)).select().single();
    if (error) throw error;
    return dbToArticle(data);
  }
  const list = loadJSON<any>(ARTICLES_FILE, DEFAULT_ARTICLES);
  list.unshift(a);
  saveJSON(ARTICLES_FILE, list);
  return a;
}

async function updateArticle(id: string, patch: any) {
  if (db) {
    const dbPatch: any = {};
    if (patch.title     !== undefined) dbPatch.title      = patch.title;
    if (patch.slug      !== undefined) dbPatch.slug       = patch.slug;
    if (patch.category  !== undefined) dbPatch.category   = patch.category;
    if (patch.author    !== undefined) dbPatch.author     = patch.author;
    if (patch.excerpt   !== undefined) dbPatch.excerpt    = patch.excerpt;
    if (patch.content   !== undefined) dbPatch.content    = patch.content;
    if (patch.image     !== undefined) dbPatch.image      = patch.image;
    if (patch.videoUrl  !== undefined) dbPatch.video_url  = patch.videoUrl;
    if (patch.status    !== undefined) dbPatch.status     = patch.status;
    const { data, error } = await db.from('articles').update(dbPatch).eq('id', id).select().single();
    if (error) throw error;
    return dbToArticle(data);
  }
  const list = loadJSON<any>(ARTICLES_FILE, DEFAULT_ARTICLES);
  const idx  = list.findIndex((a: any) => a.id === id);
  if (idx === -1) throw new Error('Not found');
  list[idx] = { ...list[idx], ...patch };
  saveJSON(ARTICLES_FILE, list);
  return list[idx];
}

async function deleteArticle(id: string) {
  if (db) {
    const { error } = await db.from('articles').delete().eq('id', id);
    if (error) throw error;
    return;
  }
  const list = loadJSON<any>(ARTICLES_FILE, DEFAULT_ARTICLES).filter((a: any) => a.id !== id);
  saveJSON(ARTICLES_FILE, list);
}

async function findUserByEmail(email: string) {
  await ensureReady();
  if (db) {
    const { data } = await db.from('users').select('*').eq('email', email).single();
    return data || null;
  }
  return loadJSON<any>(USERS_FILE, DEFAULT_USERS).find((u: any) => u.email === email) || null;
}

async function getUsers() {
  await ensureReady();
  if (db) {
    const { data, error } = await db.from('users').select('id, name, email, role');
    if (error) throw error;
    return data || [];
  }
  return loadJSON<any>(USERS_FILE, DEFAULT_USERS)
    .map((u: any) => ({ id: u.id, name: u.name, email: u.email, role: u.role }));
}

async function createUser(u: any) {
  if (db) {
    const { data, error } = await db.from('users').insert(u).select('id, name, email, role').single();
    if (error) throw error;
    return data;
  }
  const list = loadJSON<any>(USERS_FILE, DEFAULT_USERS);
  list.push(u);
  saveJSON(USERS_FILE, list);
  return { id: u.id, name: u.name, email: u.email, role: u.role };
}

async function deleteUser(id: string) {
  if (db) {
    const { error } = await db.from('users').delete().eq('id', id);
    if (error) throw error;
    return;
  }
  const list = loadJSON<any>(USERS_FILE, DEFAULT_USERS).filter((u: any) => u.id !== id);
  saveJSON(USERS_FILE, list);
}

// ─────────────────────────────────────────────────────────────────
// MIDDLEWARE
// ─────────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json({ limit: '5mb' }));

function authenticateToken(req: any, res: any, next: any) {
  const token = (req.headers.authorization || '').split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Authentication required' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(403).json({ message: 'Invalid or expired token' });
  }
}

// ─────────────────────────────────────────────────────────────────
// ROUTES
// ─────────────────────────────────────────────────────────────────

// — Auth
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await findUserByEmail(email);
    if (!user?.password) return res.status(401).json({ message: 'Invalid credentials' });
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ message: 'Invalid credentials' });
    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Server error' });
  }
});

// — Users
app.get('/api/users', async (_, res) => {
  try { res.json(await getUsers()); } catch (err: any) { res.status(500).json({ message: err.message }); }
});

app.post('/api/users', authenticateToken, async (req, res) => {
  try {
    const pw = await bcrypt.hash(req.body.password || 'news2025', 10);
    const u  = { id: String(Date.now()), ...req.body, password: pw };
    res.json(await createUser(u));
  } catch (err: any) { res.status(500).json({ message: err.message }); }
});

app.delete('/api/users/:id', authenticateToken, async (req, res) => {
  try { await deleteUser(req.params.id); res.json({ success: true }); }
  catch (err: any) { res.status(500).json({ message: err.message }); }
});

// — Articles
app.get('/api/articles', async (_, res) => {
  try { res.json(await getArticles()); } catch (err: any) { res.status(500).json({ message: err.message }); }
});

app.post('/api/articles', authenticateToken, async (req, res) => {
  try {
    const article = {
      id:          String(Date.now()),
      title:       req.body.title,
      slug:        (req.body.slug || req.body.title)
                     .toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
      category:    req.body.category,
      author:      req.body.author,
      publishedAt: new Date().toISOString(),
      excerpt:     req.body.excerpt  || '',
      content:     req.body.content  || '',
      image:       req.body.image    || 'https://images.unsplash.com/photo-1590424753858-3b6b197f89f4?auto=format&fit=crop&q=80&w=800',
      videoUrl:    req.body.videoUrl || '',
      status:      'published',
    };
    res.json(await createArticle(article));
  } catch (err: any) { res.status(500).json({ message: err.message }); }
});

app.put('/api/articles/:id', authenticateToken, async (req, res) => {
  try { res.json(await updateArticle(req.params.id, req.body)); }
  catch (err: any) { res.status(500).json({ message: err.message }); }
});

app.delete('/api/articles/:id', authenticateToken, async (req, res) => {
  try { await deleteArticle(req.params.id); res.json({ success: true }); }
  catch (err: any) { res.status(500).json({ message: err.message }); }
});

// — Newsletter
app.post('/api/newsletter', (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email required' });
  res.json({ success: true, message: 'Subscribed successfully' });
});

// ─────────────────────────────────────────────────────────────────
// EXPORT (Vercel serverless) + LOCAL SERVER
// ─────────────────────────────────────────────────────────────────
export default app;

async function init() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: { port: 24679 } },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_, res) => res.sendFile(path.join(distPath, 'index.html')));
  }
  app.listen(PORT, '0.0.0.0', () =>
    console.log(`🚀 Bosomtwi Web running on http://localhost:${PORT} (Supabase: ${db ? 'ON' : 'OFF'})`));
}

if (!process.env.VERCEL) {
  init();
}
