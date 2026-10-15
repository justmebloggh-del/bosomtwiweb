// Shared with CategoryPage.tsx (client) and the server-side /category/:name
// meta injection in server.ts + middleware.ts, so the description a crawler
// sees server-side matches what a visitor sees after the SPA mounts.
export const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  Manhyia:       'Royal palace, traditional leadership, and Ashanti heritage.',
  Politics:      'Government, elections, policy, and national governance.',
  Business:      'Markets, enterprise, and economic insight from Ashanti Region.',
  Sports:        'Football, athletics, and all major sporting events.',
  Entertainment: 'Music, film, arts, celebrity, and cultural highlights.',
  Technology:    'Innovation, digital transformation, and science in Africa.',
  Lifestyle:     'Health, wellness, travel, food, and everyday living.',
  International: 'World news, global affairs, and Africa on the world stage.',
};
