export interface Article {
  id: string;
  title: string;
  slug: string;
  category: string;
  author: string;
  publishedAt: string;
  excerpt: string;
  image: string;
  content?: string;
  videoUrl?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'editor' | 'journalist';
}
