export interface Article {
  id: string;
  title: string;
  slug: string;
  category: string;
  author: string;
  publishedAt: string;
  updatedAt?: string | null;
  excerpt: string;
  image: string;
  content?: string;
  videoUrl?: string;
  status?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'editor' | 'journalist';
}
