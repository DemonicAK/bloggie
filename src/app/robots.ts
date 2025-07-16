import { MetadataRoute } from 'next';
import { mainSEOSettings } from '@/lib/seo';

// Generate robots.txt dynamically based on environment
// Production should allow indexing, staging should not
export default function robots(): MetadataRoute.Robots {
  const baseUrl = mainSEOSettings.websiteUrl;
  
  // console.log('Generating robots.txt for:', baseUrl); // Debug

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // Block these paths from search engines for security and performance
        disallow: [
          '/api/',           // Don't index API endpoints
          '/dashboard',      // Private user dashboard  
          '/_next/',         // Next.js internal files
          '/admin/',         // Admin panel
          '/private/',       // Any private content
          '/temp/',          // Temporary files
          '/draft/',         // Draft content
        ],
      },
      // Block AI crawlers - we don't want our content used for training
      {
        userAgent: 'GPTBot',
        disallow: '/',
      },
      {
        userAgent: 'ChatGPT-User',
        disallow: '/',
      },
      {
        userAgent: 'CCBot',
        disallow: '/',
      },
      {
        userAgent: 'anthropic-ai',
        disallow: '/',
      },
      {
        userAgent: 'Claude-Web',
        disallow: '/',
      },
      // Block other unwanted bots
      {
        userAgent: 'Bytedance',
        disallow: '/',
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
