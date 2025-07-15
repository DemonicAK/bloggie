'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

// Extend Window interface for gtag
declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

interface SEOEnhancerProps {
    title?: string;
    description?: string;
    keywords?: string;
    structuredData?: object;
}

export default function SEOEnhancer({
    title,
    description,
    keywords,
    structuredData
}: SEOEnhancerProps) {
    const pathname = usePathname();

    useEffect(() => {
        // Track page views for analytics
        if (typeof window !== 'undefined' && window.gtag) {
            window.gtag('config', process.env.NEXT_PUBLIC_GA_ID!, {
                page_title: title || document.title,
                page_location: window.location.href,
                page_path: pathname,
            });
        }

        // Update meta tags dynamically
        if (title) {
            document.title = title;
        }

        if (description) {
            let metaDescription = document.querySelector('meta[name="description"]');
            if (!metaDescription) {
                metaDescription = document.createElement('meta');
                metaDescription.setAttribute('name', 'description');
                document.head.appendChild(metaDescription);
            }
            metaDescription.setAttribute('content', description);
        }

        if (keywords) {
            let metaKeywords = document.querySelector('meta[name="keywords"]');
            if (!metaKeywords) {
                metaKeywords = document.createElement('meta');
                metaKeywords.setAttribute('name', 'keywords');
                document.head.appendChild(metaKeywords);
            }
            metaKeywords.setAttribute('content', keywords);
        }

        // Add structured data
        if (structuredData) {
            const script = document.createElement('script');
            script.type = 'application/ld+json';
            script.text = JSON.stringify(structuredData);
            script.id = 'structured-data';

            // Remove existing structured data
            const existing = document.getElementById('structured-data');
            if (existing) {
                document.head.removeChild(existing);
            }

            document.head.appendChild(script);

            return () => {
                const currentScript = document.getElementById('structured-data');
                if (currentScript) {
                    document.head.removeChild(currentScript);
                }
            };
        }
    }, [title, description, keywords, structuredData, pathname]);

    return null;
}
