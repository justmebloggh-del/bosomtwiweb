// Shared helpers for all Vercel API routes.
// Underscore prefix = Vercel treats this as a utility, not a route endpoint.

import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

export { bcrypt, jwt };

// ── Supabase client ───────────────────────────────────────────────
const SB_URL =
  process.env.SUPABASE_URL ||
  process.env.VITE_SUPABASE_URL || '';

const SB_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY || '';

export const db = createClient(SB_URL, SB_KEY, { auth: { persistSession: false } });
export const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';

// ── CORS ─────────────────────────────────────────────────────────
export function cors(res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
}

// ── Auth ─────────────────────────────────────────────────────────
export function requireAuth(req: any, res: any): any | null {
  const token = (req.headers?.authorization || '').split(' ')[1];
  if (!token) { res.status(401).json({ message: 'Authentication required' }); return null; }
  try { return jwt.verify(token, JWT_SECRET); }
  catch { res.status(403).json({ message: 'Invalid or expired token' }); return null; }
}

// ── Field mapping ─────────────────────────────────────────────────
export function dbToArticle(r: any) {
  return {
    id: r.id, title: r.title, slug: r.slug, category: r.category,
    author: r.author, publishedAt: r.published_at,
    excerpt: r.excerpt || '', content: r.content || '',
    image: r.image || '', videoUrl: r.video_url || '',
    status: r.status || 'published',
  };
}
export function articleToDb(a: any) {
  return {
    id: a.id, title: a.title, slug: a.slug, category: a.category,
    author: a.author, published_at: a.publishedAt || new Date().toISOString(),
    excerpt: a.excerpt || '', content: a.content || '',
    image: a.image || '', video_url: a.videoUrl || '',
    status: a.status || 'published',
  };
}

// ── Default seed data ─────────────────────────────────────────────
export const DEFAULT_ARTICLES = [
  { id:'1',  title:'Ashanti Gold Revenues Reach Record Highs in Q1 2025',           slug:'ashanti-gold-revenues-2025',       category:'Business',       author:'Kwame Asante', publishedAt:'2025-04-28T00:00:00.000Z', excerpt:'The mining sector has reported a significant surge in production, driving national economic growth to new levels.',                              image:'https://images.unsplash.com/photo-1590424753858-3b6b197f89f4?auto=format&fit=crop&q=80&w=800', videoUrl:'', status:'published', content:'The Ashanti Region\'s gold mining sector posted record revenues in Q1 2025, with output exceeding projections by 18%.\n\nThe government received GH₵2.1 billion in royalties this quarter, up from GH₵1.7 billion last year.\n\nLocal employment rose 12% with direct hires from Ashanti communities.' },
  { id:'2',  title:'Manhyia Palace Announces Major Cultural Restoration Project',    slug:'manhyia-restoration-project',     category:'Manhyia',        author:'Admin User',   publishedAt:'2025-04-27T00:00:00.000Z', excerpt:'Otumfuo Osei Tutu II commissioned a digital archiving project to preserve the heritage of the Golden Stool.',                                  image:'https://images.unsplash.com/photo-1523438097201-512ae7d59c44?auto=format&fit=crop&q=80&w=800', videoUrl:'', status:'published', content:'Otumfuo Osei Tutu II declared the launch of the Ashanti Digital Heritage Initiative — a multimillion-cedi project.\n\n"This initiative ensures our children can connect with their roots," the Asantehene said.' },
  { id:'3',  title:'New Tech Hub in Kumasi to Train 5,000 Software Engineers',       slug:'kumasi-tech-hub-launch',          category:'Technology',     author:'Ama Serwaa',   publishedAt:'2025-04-26T00:00:00.000Z', excerpt:'A state-of-the-art innovation center has opened in Kumasi, aiming to transform the Garden City into a Silicon Valley of West Africa.',           image:'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&q=80&w=800', videoUrl:'', status:'published', content:'The Kumasi Innovation Hub opened with 400 students enrolled. Goal: 5,000 engineers by 2028.\n\n"Kumasi has always been a city of craftsmanship. We now extend that to the digital age," said Dr. Abena Frimpong.' },
  { id:'4',  title:'Ashanti Region NPP Primaries: Frontrunners Emerge',              slug:'ashanti-npp-primaries',           category:'Politics',       author:'Kofi Mensah',  publishedAt:'2025-04-25T00:00:00.000Z', excerpt:'Internal elections within the ruling party have set the stage for a competitive showdown in the Ashanti Region.',                              image:'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?auto=format&fit=crop&q=80&w=800', videoUrl:'', status:'published', content:'' },
  { id:'5',  title:'Asante Kotoko FC Clinches Ghana Premier League Title',           slug:'kotoko-premier-league-title',     category:'Sports',         author:'Kwame Asante', publishedAt:'2025-04-24T00:00:00.000Z', excerpt:'The Porcupine Warriors secured the championship in an electric match at Baba Yara Sports Stadium.',                                             image:'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&q=80&w=800', videoUrl:'', status:'published', content:'' },
  { id:'6',  title:'Kumasi Cultural Festival 2025 Attracts Record 500,000 Visitors', slug:'kumasi-cultural-festival-2025',   category:'Entertainment',  author:'Ama Serwaa',   publishedAt:'2025-04-23T00:00:00.000Z', excerpt:'The annual celebration of Ashanti heritage drew performers from across Africa.',                                                                image:'https://images.unsplash.com/photo-1541535650810-10d26f5c2abb?auto=format&fit=crop&q=80&w=800', videoUrl:'', status:'published', content:'' },
  { id:'7',  title:'New Specialist Hospital Opens in Kumasi',                         slug:'kumasi-specialist-hospital',      category:'Health',         author:'Admin User',   publishedAt:'2025-04-22T00:00:00.000Z', excerpt:'The 400-bed Ashanti Regional Specialist Hospital offers advanced cardiac and oncology services.',                                                image:'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=800', videoUrl:'', status:'published', content:'' },
  { id:'8',  title:'Kumasi Central Market Renovation: GH₵50M Project Breaks Ground', slug:'kumasi-central-market-renovation', category:'Local',          author:'Kofi Mensah',  publishedAt:'2025-04-21T00:00:00.000Z', excerpt:'The Kumasi Metropolitan Assembly kicked off a major upgrade of West Africa\'s largest open-air market.',                                         image:'https://images.unsplash.com/photo-1567881297167-573abb5f4f7b?auto=format&fit=crop&q=80&w=800', videoUrl:'', status:'published', content:'' },
  { id:'9',  title:'Ghana Signs Historic Trade Deal with European Union',             slug:'ghana-eu-trade-deal-2025',        category:'International',  author:'Ama Serwaa',   publishedAt:'2025-04-20T00:00:00.000Z', excerpt:'The landmark EPA opens duty-free access for Ghanaian cocoa, gold, and timber products to EU markets.',                                           image:'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&q=80&w=800', videoUrl:'', status:'published', content:'' },
  { id:'10', title:'Lake Bosomtwe Receives UNESCO World Heritage Recognition',        slug:'lake-bosomtwe-unesco',            category:'Local',          author:'Admin User',   publishedAt:'2025-04-19T00:00:00.000Z', excerpt:'The ancient crater lake, sacred to the Ashanti people, has been inscribed on UNESCO\'s World Heritage List.',                                    image:'https://images.unsplash.com/photo-1606591198835-36b6b0547da5?auto=format&fit=crop&q=80&w=800', videoUrl:'', status:'published', content:'' },
  { id:'11', title:'Otumfuo Foundation Launches 2,000-Student Scholarship Programme', slug:'otumfuo-scholarship-2025',        category:'Manhyia',        author:'Kwame Asante', publishedAt:'2025-04-18T00:00:00.000Z', excerpt:'The Manhyia Palace expanded its scholarship programme to support 2,000 brilliant students.',                                                  image:'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80&w=800', videoUrl:'', status:'published', content:'' },
  { id:'12', title:'Black Stars Unveil Bold Strategy for 2026 FIFA World Cup',        slug:'black-stars-world-cup-2026',      category:'Sports',         author:'Kofi Mensah',  publishedAt:'2025-04-17T00:00:00.000Z', excerpt:'Ghana\'s national football team coach unveiled a tactical blueprint emphasising youth development.',                                            image:'https://images.unsplash.com/photo-1560272564-c83b66b1ad12?auto=format&fit=crop&q=80&w=800', videoUrl:'', status:'published', content:'' },
  { id:'13', title:'Cocoa Prices Hit 50-Year High: Ashanti Farmers Reap Record Profits', slug:'cocoa-prices-record-2025',    category:'Business',       author:'Ama Serwaa',   publishedAt:'2025-04-16T00:00:00.000Z', excerpt:'Global cocoa futures surged past $12,000 per tonne, creating an unprecedented windfall for Ashanti farmers.',                                   image:'https://images.unsplash.com/photo-1511381939415-e44015466834?auto=format&fit=crop&q=80&w=800', videoUrl:'', status:'published', content:'' },
  { id:'14', title:'Ashanti Digital Health App Reaches 400,000 Active Patients',     slug:'ashanti-digital-health-app',      category:'Health',         author:'Admin User',   publishedAt:'2025-04-15T00:00:00.000Z', excerpt:'The GhanaHealth mobile app has connected hundreds of thousands of patients to telemedicine services.',                                          image:'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=800', videoUrl:'', status:'published', content:'' },
  { id:'15', title:'African Union Summit: Ghana Proposes Pan-African Digital Currency', slug:'ghana-pan-african-currency',    category:'International',  author:'Kofi Mensah',  publishedAt:'2025-04-14T00:00:00.000Z', excerpt:'Ghana\'s finance ministry tabled a bold proposal for a blockchain-backed continental digital currency.',                                          image:'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&q=80&w=800', videoUrl:'', status:'published', content:'' },
  { id:'16', title:'Kumasi Entertainment District to Open by December 2025',          slug:'kumasi-entertainment-district',  category:'Entertainment',  author:'Ama Serwaa',   publishedAt:'2025-04-13T00:00:00.000Z', excerpt:'A multi-million dollar entertainment complex will transform Kumasi\'s social scene.',                                                           image:'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=800', videoUrl:'', status:'published', content:'' },
  { id:'17', title:'Ashanti Region Allocates GH₵20M for Road Infrastructure Overhaul', slug:'ashanti-road-infrastructure',  category:'Politics',       author:'Kwame Asante', publishedAt:'2025-04-12T00:00:00.000Z', excerpt:'The regional administration approved a road rehabilitation project covering 45 communities.',                                                   image:'https://images.unsplash.com/photo-1474690870753-1b92efa1f2d8?auto=format&fit=crop&q=80&w=800', videoUrl:'', status:'published', content:'' },
  { id:'18', title:'KNUST Researchers Develop Breakthrough Malaria Treatment',        slug:'knust-malaria-research',         category:'Technology',     author:'Admin User',   publishedAt:'2025-04-11T00:00:00.000Z', excerpt:'Scientists isolated malaria-fighting compounds from indigenous medicinal plants.',                                                                image:'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&q=80&w=800', videoUrl:'', status:'published', content:'' },
  { id:'19', title:'Otumfuo Calls for Unity as Chieftaincy Dispute Resolved',         slug:'otumfuo-unity-chieftaincy',      category:'Manhyia',        author:'Admin User',   publishedAt:'2025-04-10T00:00:00.000Z', excerpt:'The Asantehene successfully mediated a long-standing chieftaincy dispute.',                                                                   image:'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop&q=80&w=800', videoUrl:'', status:'published', content:'' },
  { id:'20', title:'Kumasi Marathon 2025 Draws 10,000 Athletes from 30 Countries',   slug:'kumasi-marathon-2025',           category:'Sports',         author:'Kwame Asante', publishedAt:'2025-04-09T00:00:00.000Z', excerpt:'The international road race attracted elite athletes from across Africa and Europe.',                                                           image:'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&q=80&w=800', videoUrl:'', status:'published', content:'' },
];

export const DEFAULT_USERS_PLAIN = [
  { id:'1', name:'Admin User',   email:'admin@bosomtwi.web', role:'admin',      pw:'admin123' },
  { id:'2', name:'Kwame Asante', email:'kwame@bosomtwi.web', role:'editor',     pw:'news2025' },
  { id:'3', name:'Ama Serwaa',   email:'ama@bosomtwi.web',   role:'journalist', pw:'news2025' },
  { id:'4', name:'Kofi Mensah',  email:'kofi@bosomtwi.web',  role:'journalist', pw:'news2025' },
];

// Idempotent seed — safe to call on every cold start.
// Uses upsert so concurrent cold starts don't create duplicates.
export async function seedIfEmpty() {
  try {
    const [{ count: ac }, { count: uc }] = await Promise.all([
      db.from('articles').select('*', { count: 'exact', head: true }),
      db.from('users').select('*',    { count: 'exact', head: true }),
    ]);

    if ((ac ?? 0) === 0) {
      await db.from('articles').upsert(DEFAULT_ARTICLES.map(articleToDb), { onConflict: 'id' });
    }
    if ((uc ?? 0) === 0) {
      const hashed = await Promise.all(DEFAULT_USERS_PLAIN.map(async u => ({
        id: u.id, name: u.name, email: u.email, role: u.role,
        password: await bcrypt.hash(u.pw, 10),
      })));
      await db.from('users').upsert(hashed, { onConflict: 'id' });
    }
  } catch (err) {
    // Tables may not exist yet — user needs to run supabase/schema.sql
    console.error('Seed failed (have you run supabase/schema.sql?):', err);
  }
}
