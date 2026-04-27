export interface Article {
  id: string;
  title: string;
  slug: string;
  category: string;
  author: string;
  publishedAt: string;
  excerpt: string;
  image: string;
  videoUrl?: string;
  content?: any; // Sanity Portable Text
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'editor' | 'journalist' | 'user';
}

export type Category = 'Politics' | 'Business' | 'Sports' | 'Technology' | 'Entertainment' | 'Health' | 'Opinion' | 'Local' | 'International';
