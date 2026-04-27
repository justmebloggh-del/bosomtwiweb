import express from 'express';
import { createServer as createViteServer } from 'vite';
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

// -----------------------------
// SANITY CLIENT
// -----------------------------
const sanity = createClient({
  projectId: process.env.SANITY_PROJECT_ID!,
  dataset: process.env.SANITY_DATASET || 'production',
  apiVersion: process.env.SANITY_API_VERSION || '2024-01-01',
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

export async function createApp() {
  const app = express();
  const JWT_SECRET = process.env.JWT_SECRET || 'secret';

  app.use(cors());
  app.use(express.json());

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
  // ARTICLES (SANITY POWERED 🔥)
  // -----------------------------
  app.get('/api/articles', async (_, res) => {
    try {
      const query = `
        *[_type == "post"] | order(publishedAt desc) {
          _id,
          title,
          "slug": slug.current,
          category,
          author,
          publishedAt,
          excerpt,
          "image": image.asset->url
        }
      `;

      const articles = await sanity.fetch(query);

      res.json(articles);
    } catch (error) {
      console.error('Sanity fetch error:', error);
      res.status(500).json({ message: 'Failed to fetch articles' });
    }
  });

  // Create article in Sanity (optional)
  app.post('/api/articles', async (req, res) => {
    try {
      const doc = {
        _type: 'post',
        title: req.body.title,
        slug: {
          _type: 'slug',
          current: req.body.slug
        },
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

  // -----------------------------
  // DELETE (OPTIONAL - SANITY NOT USED HERE)
  // -----------------------------
  app.delete('/api/articles/:id', (req, res) => {
    res.status(501).json({
      message: 'Delete should be handled in Sanity Studio'
    });
  });

  return app;
}

async function startServer() {
  const app = await createApp();
  const PORT = Number(process.env.PORT) || 3000;

  // -----------------------------
  // VITE DEV SERVER (Only for Local Dev)
  // -----------------------------
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: {
          port: 24679
        }
      },
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

  // -----------------------------
  // START SERVER
  // -----------------------------
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}

// Only run server directly if not imported (e.g. by Vercel)
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  startServer();
}
