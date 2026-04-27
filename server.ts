import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // In-memory user store
  let users: any[] = [
    {
      id: '1',
      name: 'Admin User',
      email: 'admin@bosomtwi.web',
      password: '', // will be hashed in a real scenario
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

  // Initialize admin password correctly
  const adminHash = await bcrypt.hash('admin123', 10);
  users[0].password = adminHash;

  const JWT_SECRET = process.env.JWT_SECRET || 'secret';

  // Auth Routes
  app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    const user = users.find(u => u.email === email);

    if (!user || (user.password && !(await bcrypt.compare(password, user.password)))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
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

  // User Management
  app.get('/api/users', (req, res) => {
    res.json(users.map(u => ({ id: u.id, name: u.name, email: u.email, role: u.role })));
  });

  app.post('/api/users', async (req, res) => {
    const newUser = { id: String(users.length + 1), ...req.body };
    users.push(newUser);
    res.json(newUser);
  });

  // Articles
  let customArticles: any[] = [];

  app.get('/api/articles', (req, res) => {
    const categories = [
      'Manhyia', 'Politics', 'Business', 'Sports', 'Technology', 
      'Entertainment', 'Health', 'Local', 'International'
    ];
    
    const articles: any[] = [...customArticles];
    let id = articles.length + 1;

    const titles: Record<string, string[]> = {
      'Manhyia': [
        'The Sacred Golden Stool: Symbol of Soul',
        'Otumfuo Osei Tutu II: A Visionary King',
        'Restoration of the Royal Mausoleum',
        'Akwasidae Festival: A Display of Grandeur',
        'The Role of Queen Mothers in Ashanti Governance'
      ],
      'Politics': [
        'The Ashanti Vote: Shaping the National Agenda',
        'Decentralization in Kumasi: New Policies',
        'Parliamentary Debates on Ashanti Infrastructure',
        'Youth Engagement in Regional Governance',
        'Voter Registration Surge in Ashanti Districts'
      ],
      'Business': [
        'Kejetia Market: The Engine of Trade',
        'Ashanti Cocoa Farmers Lead National Yield',
        'Gold Mining: Sustainable Practices for the Future',
        'Real Estate Boom in Kumasi Suburbs',
        'Indigenous Manufacturing Gains Global Attention'
      ],
      'Sports': [
        'Asante Kotoko: Chasing the Continental Dream',
        'Grassroots Football: Scouting the Next Stars',
        'Baba Yara Stadium Renovations Complete',
        'The Rise of Basketball in Kumasi Schools',
        'Ashanti Traditional Boxing Tournaments'
      ],
      'Technology': [
        'Kumasi Tech Hub: Innovating for Africa',
        'Agri-Tech Solutions for Cocoa Farmers',
        'E-Commerce Revolution in local markets',
        'Coding Bootcamps Empowers Ashanti Youth',
        'The Digitalization of Land Title Records'
      ],
      'Entertainment': [
        'Kumawood: The Evolution of Ashanti Cinema',
        'Highlife Music: New Wave from Kumasi',
        'Cultural Troupes Tour Internationally',
        'The Ashanti Fashion Week: Modern Meets Tradition',
        'Visual Artists Redefining Kumasi Streets'
      ],
      'Health': [
        'KATH Specialist Centers Expand Capacity',
        'Traditional Medicine: Integrating with Modern Care',
        'Mobile Health Clinics Reach Remote Villages',
        'Healthy Living: The Ashanti Diet Revisited',
        'Mental Health Awareness in Local Communities'
      ],
      'Local': [
        'Lake Bosomtwe Conservation Efforts',
        'The Transformation of Adum Commercial Center',
        'New Community Libraries Open in Rural Ashanti',
        'Sanitation Drives in Kumasi Municipalities',
        'Preserving Native Dialects in Local Schools'
      ],
      'International': [
        'The Ashanti Diaspora: Investing Back Home',
        'Cultural Exchange Programs with Global Cities',
        'Ashanti Gold Exported to Swiss Refineries',
        'The Global Influence of Ashanti Adinkra Symbols',
        'Eco-Tourism: Attracting Global Visitors to Bosomtwe'
      ]
    };

    const authors = ['Kwame Asante', 'Ama Serwaa', 'Kofi Mensah', 'Yaa Asantewaa II', 'Otumfuo Historian'];
    const images = [
      'https://images.unsplash.com/photo-1523821741446-edb2b68bb7a0?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1590424753858-3b6b197f89f4?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1574169208507-84376144848b?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&q=80&w=800'
    ];

    categories.forEach(cat => {
      for (let i = 0; i < 5; i++) {
        articles.push({
          id: String(id++),
          title: titles[cat][i] || `${cat} News Update ${i + 1}`,
          slug: `${cat.toLowerCase()}-${i + 1}`,
          category: cat,
          author: authors[i % authors.length],
          publishedAt: new Date(Date.now() - (i * 86400000)).toISOString(),
          excerpt: `A deep dive into the latest developments concerning ${cat} and its impact on the Ashanti region. This report covers the essential facts and future implications...`,
          image: images[id % images.length]
        });
      }
    });

    res.json(articles);
  });

  app.post('/api/articles', (req, res) => {
    const newArticle = {
      id: String(Date.now()),
      publishedAt: new Date().toISOString(),
      ...req.body
    };
    customArticles.unshift(newArticle);
    res.json(newArticle);
  });

  app.delete('/api/articles/:id', (req, res) => {
    const { id } = req.params;
    customArticles = customArticles.filter(a => a.id !== id);
    res.status(204).send();
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
