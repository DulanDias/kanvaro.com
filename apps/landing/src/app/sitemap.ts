import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://kanvaro.com';
  const now = new Date().toISOString();
  const pages = [
    '',
    '/docs',
    '/docs/self-hosting',
    '/docs/aws',
    '/privacy',
    '/terms',
  ];
  return pages.map((path) => ({
    url: `${base}${path}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: path === '' ? 1 : 0.6,
  }));
}
