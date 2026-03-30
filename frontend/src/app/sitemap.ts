import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://hbtrade.ltd';
  const lastModified = new Date().toISOString();

  return [
    // Home page
    {
      url: baseUrl,
      lastModified,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    // About page
    {
      url: `${baseUrl}/about`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    // Services page
    {
      url: `${baseUrl}/services`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    // Product Request page
    {
      url: `${baseUrl}/product-request`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    // Tracking page
    {
      url: `${baseUrl}/tracking`,
      lastModified,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    // Contact page
    {
      url: `${baseUrl}/contact`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    // Wholesale Products page
    {
      url: `${baseUrl}/wholesale-products`,
      lastModified,
      changeFrequency: 'daily',
      priority: 0.9,
    },
  ];
}
