import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { createClient } from '@sanity/client';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'secret';

app.use(cors());
app.use(express.json());

// -----------------------------
// SANITY CLIENT
// -----------------------------
const SANITY_PROJECT_ID = process.env.VITE_SANITY_PROJECT_ID || 'hdnz0m66';

const sanity = createClient({
  projectId: SANITY_PROJECT_ID,
  dataset: process.env.VITE_SANITY_DATASET || 'bosomtwiweb',
  apiVersion: '2024-01-01',
  useCdn: true,
});

// -----------------------------
// USERS (TEMP IN-MEMORY)
// -----------------------------
let users: any[] = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@bosomtwi.web',
    password: '',
    role: 'admin'
  },
  {
    id: '2',
    name: 'Kwame Asante',
    email: 'kwame@bosomtwi.web',
    role: 'editor'
  },
  {
    id: '3',
    name: 'Ama Serwaa',
    email: 'ama@bosomtwi.web',
    role: 'journalist'
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

  if (!user || !user.password) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const valid = await bcrypt.compare(password, user.password);

  if (!valid) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const token = jwt.sign(
    { id: user.id, role: user.role },
    JWT_SECRET,
    { expiresIn: '24h' }
  );

  res.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  });
});

// -----------------------------
// USERS
// -----------------------------
app.get('/api/users', (_, res) => {
  res.json(users.map(u => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role
  })));
});

app.post('/api/users', (req, res) => {
  const newUser = {
    id: String(users.length + 1),
    ...req.body
  };
  users.push(newUser);
  res.json(newUser);
});

// -----------------------------
// ARTICLES
// -----------------------------
app.get('/api/articles', async (_, res) => {
  try {
    const query = `
      *[_type == "post"] | order(publishedAt desc) {
        "id": _id,
        title,
        "slug": slug.current,
        "category": categories[0]->title,
        "author": author->name,
        publishedAt,
        excerpt,
        "image": mainImage.asset->url
      }
    `;

    const articles = await sanity.fetch(query);
    res.json(articles);
  } catch (error) {
    console.error('Sanity fetch error:', error);
    res.status(500).json({ message: 'Failed to fetch articles' });
  }
});

app.post('/api/articles', async (req, res) => {
  try {
    const doc = {
      _type: 'post',
      title: req.body.title,
      slug: { _type: 'slug', current: req.body.slug },
      category: req.body.category,
      author: req.body.author,
      publishedAt: new Date().toISOString(),
      excerpt: req.body.excerpt
    };
    const result = await sanity.create(doc);
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to create article' });
  }
});

app.delete('/api/articles/:id', (req, res) => {
  res.status(501).json({ message: 'Delete should be handled in Sanity Studio' });
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
    app.get('*', (_, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}

init();
