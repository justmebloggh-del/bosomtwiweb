import { createClient } from '@sanity/client';

export const sanity = createClient({
  projectId: (import.meta as any).env.VITE_SANITY_PROJECT_ID || 'placeholder',
  dataset: (import.meta as any).env.VITE_SANITY_DATASET || 'production',
  token: (import.meta as any).env.VITE_SANITY_API_TOKEN,
  useCdn: false, // Set to false to ensure we get the latest data when publishing
  apiVersion: '2024-03-26',
});

export const SANITY_CONFIGURED = !!(import.meta as any).env.VITE_SANITY_PROJECT_ID;
