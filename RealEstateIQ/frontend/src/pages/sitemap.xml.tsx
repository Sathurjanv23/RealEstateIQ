import { GetServerSideProps } from 'next';
import axios from 'axios';

const SITE_URL = 'https://real-estate-iq-pi.vercel.app';

function generateSiteMap(propertyIds: string[]): string {
  const staticPages = [
    { url: '', priority: '1.0', changefreq: 'daily' },
    { url: '/properties', priority: '0.9', changefreq: 'daily' },
    { url: '/predict', priority: '0.9', changefreq: 'weekly' },
    { url: '/market', priority: '0.8', changefreq: 'daily' },
    { url: '/pricing', priority: '0.8', changefreq: 'weekly' },
    { url: '/compare', priority: '0.7', changefreq: 'monthly' },
    { url: '/recommendations', priority: '0.7', changefreq: 'weekly' },
    { url: '/terms', priority: '0.4', changefreq: 'yearly' },
    { url: '/privacy', priority: '0.4', changefreq: 'yearly' },
  ];

  const currentDate = new Date().toISOString().split('T')[0];

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${staticPages
    .map(
      (page) => `
    <url>
      <loc>${SITE_URL}${page.url}</loc>
      <lastmod>${currentDate}</lastmod>
      <changefreq>${page.changefreq}</changefreq>
      <priority>${page.priority}</priority>
    </url>`
    )
    .join('')}
  ${propertyIds
    .map(
      (id) => `
    <url>
      <loc>${SITE_URL}/properties/${id}</loc>
      <lastmod>${currentDate}</lastmod>
      <changefreq>weekly</changefreq>
      <priority>0.8</priority>
    </url>`
    )
    .join('')}
</urlset>`;
}

export default function SiteMap() {
  // getServerSideProps will handle the XML response
  return null;
}

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  let propertyIds: string[] = [];

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://realestateiq-1.onrender.com';

  try {
    const { data } = await axios.get(`${apiUrl}/api/properties?limit=200`, {
      timeout: 4000,
    });
    if (data?.data?.properties && Array.isArray(data.data.properties)) {
      propertyIds = data.data.properties.map((p: { _id: string }) => p._id);
    }
  } catch {
    // If backend is sleeping or unreachable, use fallback IDs
    propertyIds = [
      '6aacabaca446f8a3c4152a8a',
      '6aacabaca446f8a3c4152a8b',
      '6aacabaca446f8a3c4152a8c',
      '6aacabaca446f8a3c4152a8d',
    ];
  }

  const sitemap = generateSiteMap(propertyIds);

  res.setHeader('Content-Type', 'text/xml');
  res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=7200');
  res.write(sitemap);
  res.end();

  return {
    props: {},
  };
};
