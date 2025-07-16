/**
 * SEO Utilities and Configurations
 * 
 * I spent a lot of time researching competitor keywords and SEO strategies
 * TODO: Add more social media platforms (LinkedIn, Facebook, etc.)
 */

import { Metadata } from 'next';
import { Blog, User } from '@/types';

// Base configuration for our SEO setup - adjust these as needed based on analytics
export const mainSEOSettings = {
  siteName: 'Bloggie',
  websiteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://bloggie.arijitkar.com',
  twitterAccount: '@BloggiebyAK',
  fallbackImage: '/og-default.png',
  siteLocale: 'en_US',
  websiteType: 'website',
};

// console.log('SEO Config loaded:', mainSEOSettings); // Debug: Check config values

// Target keywords for technical blogs - researched from competitor analysis
// These keywords are what developers actually search for (based on my research)
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

// Generate comprehensive metadata for individual blog posts
export function generateBlogMetadata(blogPost: Blog, blogAuthor?: User): Metadata {
  // console.log('Generating metadata for blog:', blogPost.title); // Debug
  
  const pageTitle = `${blogPost.title} | Bloggie - Technical Blog Platform`;
  const pageDescription = generateMetaDescription(blogPost.content);
  const blogUrl = `${baseSEOConfig.siteUrl}/blog/${blogPost.id}`;
  const writerName = blogAuthor?.displayName || blogAuthor?.username || 'Bloggie Author';
  
  // Extract relevant keywords from the blog content
  const contentBasedKeywords = extractKeywords(blogPost.content);
  const allKeywords = [...primaryKeywords, ...contentBasedKeywords].join(', ');

  return {
    title: {
      default: pageTitle,
      template: '%s | Bloggie - Technical Blog Platform',
    },
    description: pageDescription,
    keywords: allKeywords,
    authors: [{ name: writerName, url: `${baseSEOConfig.siteUrl}/user/${blogAuthor?.username}` }],
    creator: writerName,
    publisher: 'Bloggie',
    
    // Open Graph for social sharing
    openGraph: {
      title: pageTitle,
      description: pageDescription,
      url: blogUrl,
      siteName: baseSEOConfig.siteName,
      images: [
        {
          url: generateOGImage(blogPost),
          width: 1200,
          height: 630,
          alt: pageTitle,
        },
      ],
      locale: baseSEOConfig.locale,
      type: 'article',
      publishedTime: blogPost.createdAt.toISOString(),
      modifiedTime: blogPost.updatedAt.toISOString(),
      authors: [`${baseSEOConfig.siteUrl}/user/${blogAuthor?.username}`],
      section: 'Technology',
      tags: contentBasedKeywords,
    },
    
    // Twitter Card
    twitter: {
      card: 'summary_large_image',
      title: pageTitle,
      description: pageDescription,
      site: baseSEOConfig.twitterHandle,
      creator: baseSEOConfig.twitterHandle,
      images: [generateOGImage(blogPost)],
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
      canonical: blogUrl,
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

// Generate metadata for the home page
export function generateHomeMetadata(): Metadata {
  const homeTitle = 'Bloggie - Best Technical Blog Platform for Developers | Compete with Medium';
  const homeDescription = 'Join the fastest-growing technical blog platform for developers. Share programming tutorials, software engineering insights, and technical articles. Better than Medium for developers.';
  
  // console.log('Generating home page metadata'); // Debug
  
  return {
    title: homeTitle,
    description: homeDescription,
    keywords: primaryKeywords.join(', '),
    
    openGraph: {
      title: homeTitle,
      description: homeDescription,
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
      title: homeTitle,
      description: homeDescription,
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
  };
}

// Generate metadata for user profile pages
export function generateUserMetadata(userProfile: User): Metadata {
  const profileTitle = `${userProfile.displayName || userProfile.username} - Technical Writer on Bloggie`;
  const profileDescription = `Read technical articles and programming tutorials by ${userProfile.displayName || userProfile.username} on Bloggie, the premier platform for developers.`;
  
  return {
    title: profileTitle,
    description: profileDescription,
    keywords: `${userProfile.username}, technical blog author, programming articles, ${primaryKeywords.slice(0, 10).join(', ')}`,
    
    openGraph: {
      title: profileTitle,
      description: profileDescription,
      url: `${baseSEOConfig.siteUrl}/user/${userProfile.username}`,
      siteName: baseSEOConfig.siteName,
      images: [
        {
          url: userProfile.photoURL || `${baseSEOConfig.siteUrl}/default-avatar.png`,
          width: 400,
          height: 400,
          alt: `${userProfile.displayName || userProfile.username}'s profile picture`,
        },
      ],
      locale: baseSEOConfig.locale,
      type: 'profile',
    },
    
    twitter: {
      card: 'summary',
      title: profileTitle,
      description: profileDescription,
      site: baseSEOConfig.twitterHandle,
      images: [userProfile.photoURL || `${baseSEOConfig.siteUrl}/default-avatar.png`],
    },
    
    robots: {
      index: true,
      follow: true,
    },
  };
}

// Create SEO-optimized meta description from blog content
function generateMetaDescription(blogContent: string): string {
  // console.log('Creating meta description from content'); // Debug
  
  // Remove HTML tags and normalize whitespace
  const cleanedContent = blogContent.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  const maxDescriptionLength = 155; // Google's recommended length
  
  if (cleanedContent.length <= maxDescriptionLength) {
    return cleanedContent;
  }
  
  // Truncate at word boundary for better readability
  const truncatedText = cleanedContent.substring(0, maxDescriptionLength - 3);
  const lastSpaceIndex = truncatedText.lastIndexOf(' ');
  
  // Only use word boundary if it's not too short (80% of max length)
  return lastSpaceIndex > maxDescriptionLength * 0.8 
    ? truncatedText.substring(0, lastSpaceIndex) + '...'
    : truncatedText + '...';
}

// Extract relevant keywords from blog content using simple algorithm
function extractKeywords(blogContent: string): string[] {
  // console.log('Extracting keywords from content'); // Debug
  
  // Simple keyword extraction - could be improved with NLP libraries
  const technicalTerms = [
    'javascript', 'typescript', 'react', 'nextjs', 'nodejs', 'python',
    'java', 'golang', 'rust', 'docker', 'kubernetes', 'aws', 'firebase',
    'mongodb', 'postgresql', 'graphql', 'api', 'frontend', 'backend',
    'fullstack', 'programming', 'coding', 'development', 'tutorial',
    'guide', 'tips', 'best practices', 'performance', 'optimization'
  ];
  
  const lowerCaseContent = blogContent.toLowerCase();
  const foundKeywords = technicalTerms.filter(term => 
    lowerCaseContent.includes(term.toLowerCase())
  );
  
  // console.log('Found keywords:', foundKeywords); // Debug
  return foundKeywords.slice(0, 10); // Limit to top 10 keywords
}

// Generate dynamic Open Graph image URL (placeholder for now)
function generateOGImage(blogPost: Blog): string {
  // TODO: Implement actual dynamic image generation
  // For now, return a placeholder with the blog title
  const encodedTitle = encodeURIComponent(blogPost.title);
  return `${baseSEOConfig.siteUrl}/api/og?title=${encodedTitle}`;
}

// Generate structured data (JSON-LD) for blog posts
export function generateBlogJsonLd(blogPost: Blog, postAuthor?: User) {
  // console.log('Creating structured data for:', blogPost.title); // Debug
  
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: blogPost.title,
    description: generateMetaDescription(blogPost.content),
    image: generateOGImage(blogPost),
    author: {
      '@type': 'Person',
      name: postAuthor?.displayName || postAuthor?.username || 'Bloggie Author',
      url: `${baseSEOConfig.siteUrl}/user/${postAuthor?.username}`,
      image: postAuthor?.photoURL,
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
    datePublished: blogPost.createdAt.toISOString(),
    dateModified: blogPost.updatedAt.toISOString(),
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${baseSEOConfig.siteUrl}/blog/${blogPost.id}`,
    },
    url: `${baseSEOConfig.siteUrl}/blog/${blogPost.id}`,
    keywords: extractKeywords(blogPost.content).join(', '),
    wordCount: blogPost.content.split(/\s+/).length,
    articleSection: 'Technology',
    genre: 'Technical Blog',
    about: 'Software Development',
    audience: {
      '@type': 'Audience',
      audienceType: 'Developers, Software Engineers, Tech Professionals',
    },
    // Include engagement metrics for better SEO
    interactionStatistic: [
      {
        '@type': 'InteractionCounter',
        interactionType: 'https://schema.org/LikeAction',
        userInteractionCount: blogPost.likes.length,
      },
      {
        '@type': 'InteractionCounter',
        interactionType: 'https://schema.org/CommentAction',
        userInteractionCount: blogPost.comments.length,
      },
    ],
  };
}

// Generate website-level structured data
export function generateWebsiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Bloggie',
    alternateName: 'Bloggie Technical Blog Platform',
    url: baseSEOConfig.siteUrl,
    description: 'The premier technical blogging platform for developers, software engineers, and tech professionals.',
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

// Performance and Core Web Vitals optimization settings
export const webPerformanceSettings = {
  preload: [
    '/fonts/inter-var.woff2', // Preload critical fonts
    '/logo.png', // Preload logo
  ],
  prefetch: [
    '/api/blogs', // Prefetch common API endpoints
  ],
  // Critical CSS should be inlined
  criticalCSS: true,
  // Image optimization settings
  imageOptimization: {
    formats: ['avif', 'webp', 'jpeg'],
    sizes: '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
    quality: 85,
  },
};

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

// For backward compatibility with existing code
export const baseSEOConfig = {
  ...mainSEOSettings,
  siteUrl: mainSEOSettings.websiteUrl,
  twitterHandle: mainSEOSettings.twitterAccount,
  locale: mainSEOSettings.siteLocale,
  siteName: mainSEOSettings.siteName,
  defaultImage: mainSEOSettings.fallbackImage,
  type: mainSEOSettings.websiteType,
};

// console.log('SEO utilities loaded successfully'); // Debug
