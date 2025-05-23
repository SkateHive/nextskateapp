import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://skatehive.app';

  // Static routes
  const staticRoutes = [
    { url: `${baseUrl}/`, lastModified: new Date().toISOString() },
    { url: `${baseUrl}/mag`, lastModified: new Date().toISOString() },
    { url: `${baseUrl}/leaderboard`, lastModified: new Date().toISOString() },
    { url: `${baseUrl}/map`, lastModified: new Date().toISOString() },
    { url: `${baseUrl}/dao`, lastModified: new Date().toISOString() },
    { url: `${baseUrl}/upload`, lastModified: new Date().toISOString() },
    { url: `${baseUrl}/landing`, lastModified: new Date().toISOString() },
    { url: `${baseUrl}/profile`, lastModified: new Date().toISOString() },
    { url: `${baseUrl}/wallet`, lastModified: new Date().toISOString() },
  ];

  return staticRoutes;
}
