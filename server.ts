import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
void __filename;

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'secret';

// -----------------------------
// FILE PERSISTENCE
// -----------------------------
const DATA_DIR = path.join(process.cwd(), 'data');
const ARTICLES_FILE = path.join(DATA_DIR, 'articles.json');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

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
    console.error(`Persist failed for ${filePath}:`, err);
  }
}

app.use(cors());
app.use(express.json({ limit: '5mb' }));

// -----------------------------
// DEFAULT DATA
// -----------------------------
const DEFAULT_USERS = [
  { id: '1', name: 'Admin User', email: 'admin@bosomtwi.web', password: '', role: 'admin' },
  { id: '2', name: 'Kwame Asante', email: 'kwame@bosomtwi.web', password: '', role: 'editor' },
  { id: '3', name: 'Ama Serwaa', email: 'ama@bosomtwi.web', password: '', role: 'journalist' },
  { id: '4', name: 'Kofi Mensah', email: 'kofi@bosomtwi.web', password: '', role: 'journalist' },
];

const DEFAULT_ARTICLES = [
  {
    id: '1', title: 'Ashanti Gold Revenues Reach Record Highs in Q1 2025',
    slug: 'ashanti-gold-revenues-2025', category: 'Business', author: 'Kwame Asante',
    publishedAt: new Date('2025-04-28').toISOString(),
    excerpt: 'The mining sector in the Ashanti Region has reported a significant surge in production, driving national economic growth to new levels and creating thousands of new jobs across the region.',
    image: 'https://images.unsplash.com/photo-1590424753858-3b6b197f89f4?auto=format&fit=crop&q=80&w=800', status: 'published',
    content: 'The Ashanti Region\'s gold mining sector has posted record revenues in the first quarter of 2025, with output exceeding projections by nearly 18%. The surge is attributed to rising global gold prices, improved extraction technologies, and a series of newly opened shafts in the Obuasi and Konongo areas.\n\nThe Minister for Lands and Natural Resources confirmed that the government received GH₵2.1 billion in royalties from the sector this quarter alone, up from GH₵1.7 billion in the same period last year.\n\nLocal employment has also risen, with mining companies reporting a 12% increase in direct hires from Ashanti communities. Environmental oversight bodies are closely monitoring the expansion to ensure compliance with reclamation standards.',
  },
  {
    id: '2', title: 'Manhyia Palace Announces Major Cultural Restoration Project',
    slug: 'manhyia-restoration-project', category: 'Manhyia', author: 'Admin User',
    publishedAt: new Date('2025-04-27').toISOString(),
    excerpt: 'His Majesty Otumfuo Osei Tutu II has commissioned a comprehensive digital archiving project to preserve the heritage of the Golden Stool and Ashanti royal artefacts for future generations.',
    image: 'https://images.unsplash.com/photo-1523438097201-512ae7d59c44?auto=format&fit=crop&q=80&w=800', status: 'published',
    content: 'In a historic announcement at the Manhyia Palace, Otumfuo Osei Tutu II declared the launch of the Ashanti Digital Heritage Initiative — a multimillion-cedi project to digitally preserve and catalogue thousands of royal artefacts, oral histories, and cultural records.\n\nThe project, developed in partnership with the British Museum and several Ghanaian universities, will create a publicly accessible online archive of Ashanti heritage spanning over 400 years.\n\n"This initiative is about ensuring that our children and grandchildren — wherever they are in the world — can connect with their roots," the Asantehene said.',
  },
  {
    id: '3', title: 'New Tech Hub in Kumasi to Train 5,000 Software Engineers',
    slug: 'kumasi-tech-hub-launch', category: 'Technology', author: 'Ama Serwaa',
    publishedAt: new Date('2025-04-26').toISOString(),
    excerpt: 'A state-of-the-art innovation center has opened its doors in the heart of Kumasi, aiming to transform the Garden City into a Silicon Valley of West Africa.',
    image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&q=80&w=800', status: 'published',
    content: 'The Kumasi Innovation Hub officially opened its doors this week, with over 400 students enrolled in its inaugural cohort of software engineering and data science programmes.\n\nThe facility, funded jointly by the government of Ghana and a consortium of Silicon Valley investors, spans 12,000 square metres and is equipped with high-speed fibre internet, collaborative workspaces, and a hardware lab with 3D printing capabilities.\n\nFounding director Dr. Abena Frimpong said the goal is to produce 5,000 job-ready engineers by 2028. "Kumasi has always been a city of craftsmanship. We are now extending that tradition to the digital age."',
  },
  {
    id: '4', title: 'Ashanti Region NPP Primaries: Frontrunners Emerge', slug: 'ashanti-npp-primaries-2028',
    category: 'Politics', author: 'Kofi Mensah', publishedAt: new Date('2025-04-25').toISOString(),
    excerpt: 'The internal elections within the ruling party have set the stage for a competitive showdown in the Ashanti Region, with several prominent figures declaring their candidacy intentions.',
    image: 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?auto=format&fit=crop&q=80&w=800', status: 'published', content: '',
  },
  {
    id: '5', title: 'Asante Kotoko FC Clinches Ghana Premier League Title', slug: 'kotoko-premier-league-title',
    category: 'Sports', author: 'Kwame Asante', publishedAt: new Date('2025-04-24').toISOString(),
    excerpt: 'The Porcupine Warriors secured the championship in an electric match at Baba Yara Sports Stadium, sending thousands of fans into jubilation across Kumasi.',
    image: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&q=80&w=800', status: 'published', content: '',
  },
  {
    id: '6', title: 'Kumasi Cultural Festival 2025 Attracts Record 500,000 Visitors', slug: 'kumasi-cultural-festival-2025',
    category: 'Entertainment', author: 'Ama Serwaa', publishedAt: new Date('2025-04-23').toISOString(),
    excerpt: 'The annual celebration of Ashanti heritage drew performers from across Africa, featuring traditional drumming, kente weaving exhibitions, and contemporary music acts.',
    image: 'https://images.unsplash.com/photo-1541535650810-10d26f5c2abb?auto=format&fit=crop&q=80&w=800', status: 'published', content: '',
  },
  {
    id: '7', title: 'New Specialist Hospital Opens in Kumasi to Serve 2 Million Residents', slug: 'kumasi-specialist-hospital-opens',
    category: 'Health', author: 'Admin User', publishedAt: new Date('2025-04-22').toISOString(),
    excerpt: 'The 400-bed Ashanti Regional Specialist Hospital has officially opened, offering advanced cardiac, oncology, and neurology services to the entire Ashanti Region.',
    image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=800', status: 'published', content: '',
  },
  {
    id: '8', title: 'Kumasi Central Market Renovation: GH₵50M Project Breaks Ground', slug: 'kumasi-central-market-renovation',
    category: 'Local', author: 'Kofi Mensah', publishedAt: new Date('2025-04-21').toISOString(),
    excerpt: 'The Kumasi Metropolitan Assembly has kicked off a major upgrade of West Africa\'s largest open-air market, with modern drainage, fire safety systems, and improved stalls.',
    image: 'https://images.unsplash.com/photo-1567881297167-573abb5f4f7b?auto=format&fit=crop&q=80&w=800', status: 'published', content: '',
  },
  {
    id: '9', title: 'Ghana Signs Historic Trade Deal with European Union', slug: 'ghana-eu-trade-deal-2025',
    category: 'International', author: 'Ama Serwaa', publishedAt: new Date('2025-04-20').toISOString(),
    excerpt: 'The landmark Economic Partnership Agreement opens duty-free access for Ghanaian cocoa, gold, and timber products to EU markets, benefiting over 200,000 producers.',
    image: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&q=80&w=800', status: 'published', content: '',
  },
  {
    id: '10', title: 'Lake Bosomtwe Receives UNESCO World Heritage Recognition', slug: 'lake-bosomtwe-unesco',
    category: 'Local', author: 'Admin User', publishedAt: new Date('2025-04-19').toISOString(),
    excerpt: 'The ancient crater lake, sacred to the Ashanti people, has been inscribed on UNESCO\'s World Heritage List, unlocking millions in conservation funding.',
    image: 'https://images.unsplash.com/photo-1606591198835-36b6b0547da5?auto=format&fit=crop&q=80&w=800', status: 'published', content: '',
  },
  {
    id: '11', title: 'Otumfuo Foundation Launches 2,000-Student Scholarship Programme', slug: 'otumfuo-scholarship-2025',
    category: 'Manhyia', author: 'Kwame Asante', publishedAt: new Date('2025-04-18').toISOString(),
    excerpt: 'The Manhyia Palace has expanded its scholarship programme to support 2,000 brilliant but needy students, fully funded by the Otumfuo Charity Foundation.',
    image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80&w=800', status: 'published', content: '',
  },
  {
    id: '12', title: 'Black Stars Unveil Bold Strategy for 2026 FIFA World Cup Qualifying', slug: 'black-stars-world-cup-2026',
    category: 'Sports', author: 'Kofi Mensah', publishedAt: new Date('2025-04-17').toISOString(),
    excerpt: 'Ghana\'s national football team coach has unveiled a tactical blueprint emphasising youth development and home-based players ahead of the qualifiers.',
    image: 'https://images.unsplash.com/photo-1560272564-c83b66b1ad12?auto=format&fit=crop&q=80&w=800', status: 'published', content: '',
  },
  {
    id: '13', title: 'Cocoa Prices Hit 50-Year High: Ashanti Farmers Reap Record Profits', slug: 'cocoa-prices-record-high-2025',
    category: 'Business', author: 'Ama Serwaa', publishedAt: new Date('2025-04-16').toISOString(),
    excerpt: 'Global cocoa futures have surged past $12,000 per tonne, creating an unprecedented windfall for Ashanti Region farmers.',
    image: 'https://images.unsplash.com/photo-1511381939415-e44015466834?auto=format&fit=crop&q=80&w=800', status: 'published', content: '',
  },
  {
    id: '14', title: 'Ashanti Digital Health App Reaches 400,000 Active Patients', slug: 'ashanti-digital-health-app',
    category: 'Health', author: 'Admin User', publishedAt: new Date('2025-04-15').toISOString(),
    excerpt: 'The GhanaHealth mobile app, developed by Kumasi-based engineers, has connected hundreds of thousands of patients to telemedicine services.',
    image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=800', status: 'published', content: '',
  },
  {
    id: '15', title: 'African Union Summit: Ghana Proposes Pan-African Digital Currency', slug: 'ghana-pan-african-digital-currency',
    category: 'International', author: 'Kofi Mensah', publishedAt: new Date('2025-04-14').toISOString(),
    excerpt: 'Ghana\'s finance ministry tabled a bold proposal at the AU summit for a blockchain-backed continental digital currency to ease intra-African trade.',
    image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&q=80&w=800', status: 'published', content: '',
  },
  {
    id: '16', title: 'Kumasi Entertainment District to Open by December 2025', slug: 'kumasi-entertainment-district',
    category: 'Entertainment', author: 'Ama Serwaa', publishedAt: new Date('2025-04-13').toISOString(),
    excerpt: 'A multi-million dollar entertainment complex featuring live music venues, art galleries, and a food hall celebrating Ashanti cuisine will transform Kumasi\'s social scene.',
    image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=800', status: 'published', content: '',
  },
  {
    id: '17', title: 'Ashanti Region Allocates GH₵20M for Road Infrastructure Overhaul', slug: 'ashanti-road-infrastructure-2025',
    category: 'Politics', author: 'Kwame Asante', publishedAt: new Date('2025-04-12').toISOString(),
    excerpt: 'The regional administration approved a comprehensive road rehabilitation project covering 45 communities.',
    image: 'https://images.unsplash.com/photo-1474690870753-1b92efa1f2d8?auto=format&fit=crop&q=80&w=800', status: 'published', content: '',
  },
  {
    id: '18', title: 'KNUST Researchers Develop Breakthrough Malaria Treatment from Local Plants', slug: 'knust-malaria-research',
    category: 'Technology', author: 'Admin User', publishedAt: new Date('2025-04-11').toISOString(),
    excerpt: 'Scientists at Kwame Nkrumah University of Science and Technology isolated malaria-fighting compounds from indigenous medicinal plants.',
    image: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&q=80&w=800', status: 'published', content: '',
  },
  {
    id: '19', title: 'Otumfuo Calls for Unity as Chieftaincy Dispute Peacefully Resolved', slug: 'otumfuo-unity-chieftaincy',
    category: 'Manhyia', author: 'Admin User', publishedAt: new Date('2025-04-10').toISOString(),
    excerpt: 'The Asantehene successfully mediated a long-standing chieftaincy dispute, calling on all parties to embrace peace as the bedrock of Ashanti governance.',
    image: 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop&q=80&w=800', status: 'published', content: '',
  },
  {
    id: '20', title: 'Kumasi Marathon 2025 Draws 10,000 Athletes from 30 Countries', slug: 'kumasi-marathon-2025',
    category: 'Sports', author: 'Kwame Asante', publishedAt: new Date('2025-04-09').toISOString(),
    excerpt: 'The international road race routed through Kumasi attracted elite athletes from across Africa and Europe, putting the Garden City on the global athletics calendar.',
    image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&q=80&w=800', status: 'published', content: '',
  },
];

// Load from files or use defaults
let users: any[] = loadJSON(USERS_FILE, DEFAULT_USERS);
let articles: any[] = loadJSON(ARTICLES_FILE, DEFAULT_ARTICLES);

// If loaded from file but passwords are empty, re-hash them
async function initPasswords() {
  let changed = false;
  for (const u of users) {
    if (!u.password || u.password === '') {
      if (u.role === 'admin') u.password = await bcrypt.hash('admin123', 10);
      else u.password = await bcrypt.hash('news2025', 10);
      changed = true;
    }
  }
  if (changed) saveJSON(USERS_FILE, users);
}
initPasswords();

// -----------------------------
// AUTH
// -----------------------------
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email);
  if (!user || !user.password) return res.status(401).json({ message: 'Invalid credentials' });
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).json({ message: 'Invalid credentials' });
  const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
  res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
});

// -----------------------------
// USERS
// -----------------------------
app.get('/api/users', (_, res) => res.json(users.map(u => ({ id: u.id, name: u.name, email: u.email, role: u.role }))));

app.post('/api/users', async (req, res) => {
  const hashedPw = await bcrypt.hash(req.body.password || 'news2025', 10);
  const newUser = { id: String(Date.now()), ...req.body, password: hashedPw };
  users.push(newUser);
  saveJSON(USERS_FILE, users);
  res.json({ id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role });
});

app.delete('/api/users/:id', (req, res) => {
  users = users.filter(u => u.id !== req.params.id);
  saveJSON(USERS_FILE, users);
  res.json({ success: true });
});

// -----------------------------
// ARTICLES
// -----------------------------
app.get('/api/articles', (_, res) => res.json(articles));

app.post('/api/articles', (req, res) => {
  const newArticle = {
    id: String(Date.now()),
    title: req.body.title,
    slug: (req.body.slug || req.body.title)
      .toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
    category: req.body.category,
    author: req.body.author,
    publishedAt: new Date().toISOString(),
    excerpt: req.body.excerpt,
    content: req.body.content || '',
    image: req.body.image || 'https://images.unsplash.com/photo-1590424753858-3b6b197f89f4?auto=format&fit=crop&q=80&w=800',
    videoUrl: req.body.videoUrl || '',
    status: 'published',
  };
  articles.unshift(newArticle);
  saveJSON(ARTICLES_FILE, articles);
  res.json(newArticle);
});

app.put('/api/articles/:id', (req, res) => {
  const idx = articles.findIndex(a => a.id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: 'Not found' });
  articles[idx] = { ...articles[idx], ...req.body };
  saveJSON(ARTICLES_FILE, articles);
  res.json(articles[idx]);
});

app.delete('/api/articles/:id', (req, res) => {
  articles = articles.filter(a => a.id !== req.params.id);
  saveJSON(ARTICLES_FILE, articles);
  res.json({ success: true });
});

// -----------------------------
// NEWSLETTER
// -----------------------------
app.post('/api/newsletter', (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email required' });
  res.json({ success: true, message: 'Subscribed successfully' });
});

// -----------------------------
// VITE DEV SERVER / PRODUCTION
// -----------------------------
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
  app.listen(PORT, '0.0.0.0', () => console.log(`🚀 Bosomtwi Web running on http://localhost:${PORT}`));
}

init();
