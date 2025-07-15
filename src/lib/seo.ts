/**
 * SEO Utilities and Configurations
 * Optimized for competing with Medium, Dev.to, and other major blogging platforms
 */

import { Metadata } from 'next';
import { Blog, User } from '@/types';

// Base SEO configuration
export const baseSEOConfig = {
  siteName: 'Bloggie',
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://bloggie.dev',
  twitterHandle: '@BloggiePlatform',
  defaultImage: '/og-default.png',
  locale: 'en_US',
  type: 'website',
};

// High-value keywords for technical blogs
export const primaryKeywords = [
  'technical blog',
  'programming blog',
  'software engineering blog',
  'developer blog',
  'coding tutorials',
  'tech articles',
  'software development',
  'web development blog',
  'javascript tutorials',
  'react tutorials',
  'typescript guides',
  'nextjs blog',
  'firebase tutorials',
  'cloud computing blog',
  'devops articles',
  'artificial intelligence blog',
  'machine learning tutorials',
  'data science blog',
  'cybersecurity articles',
  'mobile app development',
];

// Generate comprehensive metadata for blog posts
export function generateBlogMetadata(blog: Blog, author?: User): Metadata {
  const title = `${blog.title} | Bloggie - Technical Blog Platform`;
  const description = generateMetaDescription(blog.content);
  const url = `${baseSEOConfig.siteUrl}/blog/${blog.id}`;
  const authorName = author?.displayName || author?.username || 'Bloggie Author';
  
  // Extract keywords from content
  const contentKeywords = extractKeywords(blog.content);
  const keywords = [...primaryKeywords, ...contentKeywords].join(', ');

  return {
    title: {
      default: title,
      template: '%s | Bloggie - Technical Blog Platform',
    },
    description,
    keywords,
    authors: [{ name: authorName, url: `${baseSEOConfig.siteUrl}/user/${author?.username}` }],
    creator: authorName,
    publisher: 'Bloggie',
    
    // Open Graph for social sharing
    openGraph: {
      title,
      description,
      url,
      siteName: baseSEOConfig.siteName,
      images: [
        {
          url: generateOGImage(blog),
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: baseSEOConfig.locale,
      type: 'article',
      publishedTime: blog.createdAt.toISOString(),
      modifiedTime: blog.updatedAt.toISOString(),
      authors: [`${baseSEOConfig.siteUrl}/user/${author?.username}`],
      section: 'Technology',
      tags: contentKeywords,
    },
    
    // Twitter Card
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      site: baseSEOConfig.twitterHandle,
      creator: baseSEOConfig.twitterHandle,
      images: [generateOGImage(blog)],
    },
    
    // Additional SEO tags
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    
    // Canonical URL
    alternates: {
      canonical: url,
    },
    
    // Other metadata
    category: 'Technology',
    classification: 'Technical Blog',
    referrer: 'origin-when-cross-origin',
    formatDetection: {
      telephone: false,
    },
  };
}

// Generate metadata for home page
export function generateHomeMetadata(): Metadata {
  const title = 'Bloggie - Best Technical Blog Platform for Developers | Compete with Medium';
  const description = 'Join the fastest-growing technical blog platform for developers. Share programming tutorials, software engineering insights, and technical articles. Better than Medium for developers.';
  
  return {
    title,
    description,
    keywords: primaryKeywords.join(', '),
    
    openGraph: {
      title,
      description,
      url: baseSEOConfig.siteUrl,
      siteName: baseSEOConfig.siteName,
      images: [
        {
          url: `${baseSEOConfig.siteUrl}/og-home.png`,
          width: 1200,
          height: 630,
          alt: 'Bloggie - Technical Blog Platform',
        },
      ],
      locale: baseSEOConfig.locale,
      type: 'website',
    },
    
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      site: baseSEOConfig.twitterHandle,
      images: [`${baseSEOConfig.siteUrl}/og-home.png`],
    },
    
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    
    verification: {
      google: process.env.GOOGLE_VERIFICATION_CODE,
      yandex: process.env.YANDEX_VERIFICATION_CODE,
    },
  };
}

// Generate metadata for user profiles
export function generateUserMetadata(user: User): Metadata {
  const title = `${user.displayName || user.username} - Technical Blog Author | Bloggie`;
  const description = `Read technical articles and programming tutorials by ${user.displayName || user.username}. Expert insights on software development, coding best practices, and technology trends.`;
  
  return {
    title,
    description,
    keywords: `${user.username}, technical blog author, programming articles, ${primaryKeywords.slice(0, 10).join(', ')}`,
    
    openGraph: {
      title,
      description,
      url: `${baseSEOConfig.siteUrl}/user/${user.username}`,
      siteName: baseSEOConfig.siteName,
      images: [
        {
          url: user.photoURL || `${baseSEOConfig.siteUrl}/default-avatar.png`,
          width: 400,
          height: 400,
          alt: `${user.displayName || user.username} - Profile Picture`,
        },
      ],
      locale: baseSEOConfig.locale,
      type: 'profile',
    },
    
    twitter: {
      card: 'summary',
      title,
      description,
      site: baseSEOConfig.twitterHandle,
      images: [user.photoURL || `${baseSEOConfig.siteUrl}/default-avatar.png`],
    },
    
    robots: {
      index: true,
      follow: true,
    },
  };
}

// Generate SEO-optimized meta description from content
function generateMetaDescription(content: string): string {
  const cleanContent = content.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  const maxLength = 155;
  
  if (cleanContent.length <= maxLength) {
    return cleanContent;
  }
  
  const truncated = cleanContent.substring(0, maxLength - 3);
  const lastSpace = truncated.lastIndexOf(' ');
  
  return lastSpace > maxLength * 0.8 
    ? truncated.substring(0, lastSpace) + '...'
    : truncated + '...';
}

// Extract keywords from blog content
function extractKeywords(content: string): string[] {
  const commonTechTerms = [
    'javascript', 'typescript', 'react', 'nextjs', 'nodejs', 'python', 'java',
    'golang', 'rust', 'docker', 'kubernetes', 'aws', 'azure', 'gcp',
    'firebase', 'mongodb', 'postgresql', 'redis', 'graphql', 'rest',
    'microservices', 'serverless', 'cloud', 'devops', 'ci/cd', 'testing',
    'performance', 'security', 'authentication', 'authorization', 'api',
    'frontend', 'backend', 'fullstack', 'mobile', 'web development',
    'machine learning', 'ai', 'data science', 'blockchain', 'cryptocurrency',
  ];
  
  const contentLower = content.toLowerCase();
  const foundTerms = commonTechTerms.filter(term => 
    contentLower.includes(term) || contentLower.includes(term.replace(/\s/g, ''))
  );
  
  return foundTerms.slice(0, 10); // Limit to 10 keywords
}

// Generate dynamic OG image URL
function generateOGImage(blog: Blog): string {
  const baseUrl = 'https://og-image.vercel.app';
  const title = encodeURIComponent(blog.title);
  const author = encodeURIComponent(blog.authorUsername);
  
  return `${baseUrl}/${title}.png?theme=dark&md=1&fontSize=75px&images=https%3A%2F%2Fassets.vercel.com%2Fimage%2Fupload%2Ffront%2Fassets%2Fdesign%2Fnextjs-black-logo.svg&widths=350&heights=350&author=${author}`;
}

// Generate JSON-LD structured data for blogs
export function generateBlogJsonLd(blog: Blog, author?: User) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: blog.title,
    description: generateMetaDescription(blog.content),
    image: generateOGImage(blog),
    author: {
      '@type': 'Person',
      name: author?.displayName || author?.username || 'Bloggie Author',
      url: `${baseSEOConfig.siteUrl}/user/${author?.username}`,
      image: author?.photoURL,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Bloggie',
      url: baseSEOConfig.siteUrl,
      logo: {
        '@type': 'ImageObject',
        url: `${baseSEOConfig.siteUrl}/logo.png`,
      },
    },
    datePublished: blog.createdAt.toISOString(),
    dateModified: blog.updatedAt.toISOString(),
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${baseSEOConfig.siteUrl}/blog/${blog.id}`,
    },
    url: `${baseSEOConfig.siteUrl}/blog/${blog.id}`,
    keywords: extractKeywords(blog.content).join(', '),
    wordCount: blog.content.split(/\s+/).length,
    articleSection: 'Technology',
    genre: 'Technical Blog',
    about: 'Software Development',
    audience: {
      '@type': 'Audience',
      audienceType: 'Developers, Software Engineers, Tech Professionals',
    },
    interactionStatistic: [
      {
        '@type': 'InteractionCounter',
        interactionType: 'https://schema.org/LikeAction',
        userInteractionCount: blog.likes.length,
      },
      {
        '@type': 'InteractionCounter',
        interactionType: 'https://schema.org/CommentAction',
        userInteractionCount: blog.comments.length,
      },
    ],
  };
}

// Generate JSON-LD for website/organization
export function generateWebsiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Bloggie',
    alternateName: 'Bloggie Technical Blog Platform',
    url: baseSEOConfig.siteUrl,
    description: 'The best technical blog platform for developers, software engineers, and tech professionals. Share programming tutorials, software engineering insights, and technical articles.',
    publisher: {
      '@type': 'Organization',
      name: 'Bloggie',
      url: baseSEOConfig.siteUrl,
      logo: `${baseSEOConfig.siteUrl}/logo.png`,
      sameAs: [
        'https://twitter.com/BloggiePlatform',
        'https://linkedin.com/company/bloggie',
        'https://github.com/DemonicAK/bloggie',
      ],
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${baseSEOConfig.siteUrl}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
    mainEntity: {
      '@type': 'Blog',
      name: 'Bloggie Technical Blog',
      description: 'Technical articles, programming tutorials, and software engineering insights',
      url: baseSEOConfig.siteUrl,
      blogPost: `${baseSEOConfig.siteUrl}/blog`,
    },
  };
}

// Site performance and Core Web Vitals optimization
export const performanceConfig = {
  preload: [
    { rel: 'preload', href: '/fonts/geist.woff2', as: 'font', type: 'font/woff2', crossOrigin: 'anonymous' as const },
    { rel: 'preload', href: '/api/blogs', as: 'fetch', crossOrigin: 'anonymous' as const },
  ],
  prefetch: [
    { rel: 'prefetch', href: '/dashboard' },
    { rel: 'prefetch', href: '/home' },
  ],
  dns: [
    { rel: 'dns-prefetch', href: '//firebasestorage.googleapis.com' },
    { rel: 'dns-prefetch', href: '//res.cloudinary.com' },
    { rel: 'dns-prefetch', href: '//fonts.googleapis.com' },
  ],
};
