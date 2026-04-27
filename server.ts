import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'secret';

app.use(cors());
app.use(express.json());

// -----------------------------
// DATA STORE (TEMP IN-MEMORY)
// -----------------------------
let users: any[] = [
  { id: '1', name: 'Admin User', email: 'admin@bosomtwi.web', password: '', role: 'admin' },
  { id: '2', name: 'Kwame Asante', email: 'kwame@bosomtwi.web', role: 'editor' },
  { id: '3', name: 'Ama Serwaa', email: 'ama@bosomtwi.web', role: 'journalist' }
];

let articles: any[] = [
  {
    id: '1',
    title: 'Ashanti Gold Revenues Reach Record Highs in Q1 2024',
    slug: 'ashanti-gold-revenues-2024',
    category: 'Business',
    author: 'Kwame Asante',
    publishedAt: new Date().toISOString(),
    excerpt: 'The mining sector in the Ashanti Region has reported a significant surge in production, driving national economic growth to new levels.',
    image: 'https://images.unsplash.com/photo-1590424753858-3b6b197f89f4?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: '2',
    title: 'Manhyia Palace Announces Major Cultural Restoration Project',
    slug: 'manhyia-restoration-project',
    category: 'Manhyia',
    author: 'Admin User',
    publishedAt: new Date().toISOString(),
    excerpt: 'His Majesty Otumfuo Osei Tutu II has commissioned a comprehensive digital archiving project to preserve the heritage of the Golden Stool.',
    image: 'https://images.unsplash.com/photo-1523438097201-512ae7d59c44?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: '3',
    title: 'New Tech Hub in Kumasi to Train 5,000 Software Engineers',
    slug: 'kumasi-tech-hub-launch',
    category: 'Tech',
    author: 'Ama Serwaa',
    publishedAt: new Date().toISOString(),
    excerpt: 'A state-of-the-art innovation center has opened its doors in the heart of Kumasi, aiming to transform the Garden City into a Silicon Valley.',
    image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&q=80&w=800'
  }
];

// Initialize admin password
bcrypt.hash('admin123', 10).then(hash => {
  users[0].password = hash;
});

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
app.post('/api/users', (req, res) => {
  const newUser = { id: String(users.length + 1), ...req.body };
  users.push(newUser);
  res.json(newUser);
});

// -----------------------------
// ARTICLES
// -----------------------------
app.get('/api/articles', (_, res) => res.json(articles));

app.post('/api/articles', (req, res) => {
  const newArticle = {
    id: String(articles.length + 1),
    title: req.body.title,
    slug: req.body.slug || req.body.title.toLowerCase().replace(/ /g, '-'),
    category: req.body.category,
    author: req.body.author,
    publishedAt: new Date().toISOString(),
    excerpt: req.body.excerpt,
    image: req.body.image || 'https://images.unsplash.com/photo-1590424753858-3b6b197f89f4?auto=format&fit=crop&q=80&w=800'
  };
  articles.unshift(newArticle); // Put new articles at the top
  res.json(newArticle);
});

app.delete('/api/articles/:id', (req, res) => {
  const { id } = req.params;
  articles = articles.filter(a => a.id !== id);
  res.json({ success: true });
});

// -----------------------------
// VITE DEV SERVER / PRODUCTION SERVE
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
  app.listen(PORT, '0.0.0.0', () => console.log(`🚀 Server running on http://localhost:${PORT}`));
}

init();
