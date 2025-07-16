'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/**
 * Dynamic SEO 
 
 */

interface SEOEnhancementProps {
    title?: string;
    description?: string;
    keywords?: string;
    structuredData?: object;
    canonicalUrl?: string;
    noIndex?: boolean;
}

export default function SEOEnhancer({
    title,
    description,
    keywords,
    structuredData,
    canonicalUrl,
    noIndex = false
}: SEOEnhancementProps) {
    const currentPath = usePathname();

    useEffect(() => {
        // console.log('SEO Enhancer running for path:', currentPath); // test

        // Update page title dynamically if provided
        if (title) {
            document.title = title;
            // console.log('Updated page title to:', title); // test
        }

        // Update or create meta description
        if (description) {
            let metaDescriptionTag = document.querySelector('meta[name="description"]') as HTMLMetaElement;
            if (!metaDescriptionTag) {
                // Create new meta description if it doesn't exist
                metaDescriptionTag = document.createElement('meta');
                metaDescriptionTag.setAttribute('name', 'description');
                document.head.appendChild(metaDescriptionTag);
                // console.log('Created new meta description tag'); // test
            }
            metaDescriptionTag.setAttribute('content', description);
        }

        // Update or create meta keywords (less important for modern SEO but still useful)
        if (keywords) {
            let metaKeywordsTag = document.querySelector('meta[name="keywords"]') as HTMLMetaElement;
            if (!metaKeywordsTag) {
                metaKeywordsTag = document.createElement('meta');
                metaKeywordsTag.setAttribute('name', 'keywords');
                document.head.appendChild(metaKeywordsTag);
                // console.log('Created new meta keywords tag'); // test
            }
            metaKeywordsTag.setAttribute('content', keywords);
        }

        // Handle canonical URL to prevent duplicate content issues
        if (canonicalUrl) {
            let canonicalLinkTag = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
            if (!canonicalLinkTag) {
                canonicalLinkTag = document.createElement('link');
                canonicalLinkTag.setAttribute('rel', 'canonical');
                document.head.appendChild(canonicalLinkTag);
                // console.log('Created new canonical link tag'); // test
            }
            canonicalLinkTag.setAttribute('href', canonicalUrl);
        }

        // Handle robots meta tag for indexing control
        if (noIndex) {
            let robotsMetaTag = document.querySelector('meta[name="robots"]') as HTMLMetaElement;
            if (!robotsMetaTag) {
                robotsMetaTag = document.createElement('meta');
                robotsMetaTag.setAttribute('name', 'robots');
                document.head.appendChild(robotsMetaTag);
            }
            robotsMetaTag.setAttribute('content', 'noindex, nofollow');
            // console.log('Set page to noindex'); // test
        }

        // Add or update structured data (JSON-LD)
        if (structuredData) {
            const structuredDataScript = document.createElement('script');
            structuredDataScript.type = 'application/ld+json';
            structuredDataScript.text = JSON.stringify(structuredData);
            structuredDataScript.id = 'dynamic-structured-data';

            // Remove any existing structured data to prevent duplicates
            const existingStructuredData = document.getElementById('dynamic-structured-data');
            if (existingStructuredData) {
                document.head.removeChild(existingStructuredData);
                // console.log('Removed existing structured data'); // test
            }

            document.head.appendChild(structuredDataScript);
            // console.log('Added structured data:', structuredData); // test

            // Cleanup function to remove structured data when component unmounts
            return () => {
                const currentStructuredDataScript = document.getElementById('dynamic-structured-data');
                if (currentStructuredDataScript) {
                    document.head.removeChild(currentStructuredDataScript);
                    // console.log('Cleaned up structured data on unmount'); // test
                }
            };
        }

        // Add viewport meta tag if it doesn't exist (important for mobile SEO)
        if (!document.querySelector('meta[name="viewport"]')) {
            const viewportMetaTag = document.createElement('meta');
            viewportMetaTag.setAttribute('name', 'viewport');
            viewportMetaTag.setAttribute('content', 'width=device-width, initial-scale=1');
            document.head.appendChild(viewportMetaTag);
            // console.log('Added viewport meta tag'); // test
        }

        // Add charset meta tag if it doesn't exist
        if (!document.querySelector('meta[charset]')) {
            const charsetMetaTag = document.createElement('meta');
            charsetMetaTag.setAttribute('charset', 'UTF-8');
            document.head.insertBefore(charsetMetaTag, document.head.firstChild);
            // console.log('Added charset meta tag'); // test
        }

    }, [title, description, keywords, structuredData, currentPath, canonicalUrl, noIndex]);

    // This component doesn't render anything visible
    return null;
}

/**
 * Helper hook for common SEO operations
 * This can be used in other components to easily update SEO elements
 */
export function useSEOUpdate() {
    const updatePageSEO = (seoData: Partial<SEOEnhancementProps>) => {
        // console.log('Updating SEO with data:', seoData); // test

        if (seoData.title) {
            document.title = seoData.title;
        }

        if (seoData.description) {
            const metaDesc = document.querySelector('meta[name="description"]') as HTMLMetaElement;
            if (metaDesc) {
                metaDesc.content = seoData.description;
            }
        }

        // Add more SEO updates as needed
    };

    return { updatePageSEO };
}
