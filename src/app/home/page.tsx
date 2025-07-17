import { Metadata } from 'next';
import HomePageClient from './HomePageClient2';

// SEO metadata for home page
export const metadata: Metadata = {
    title: 'Home - Best Technical Blog Platform for Developers | Bloggie',
    description: 'Discover the latest programming tutorials, software engineering articles, and technical insights. Join thousands of developers sharing knowledge on Bloggie - the premier technical blogging platform.',
    keywords: 'technical blog, programming tutorials, software engineering, developer blog, coding tutorials, tech articles, web development, javascript, react, nextjs, typescript, python, java, golang',
    openGraph: {
        title: 'Bloggie - Technical Blog Platform for Developers',
        description: 'Discover programming tutorials, software engineering insights, and technical articles from expert developers.',
        type: 'website',
        url: 'https://bloggie.arijitkar.com/home',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Bloggie - Technical Blog Platform for Developers',
        description: 'Discover programming tutorials and technical insights from expert developers.',
    },
    robots: {
        index: true,
        follow: true,
    },
};

export default function HomePage() {
    return <HomePageClient />;
}
