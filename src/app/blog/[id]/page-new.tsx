import { Metadata } from 'next';
import { generateBlogMetadata, generateBlogJsonLd } from '@/lib/seo';
import { getBlog, getUserById } from '@/lib/blogService';
import { Blog, User } from '@/types';
import BlogDetailClient from './BlogDetailClient';

interface BlogPageProps {
    params: {
        id: string;
    };
}

// Generate dynamic metadata for SEO
export async function generateMetadata({ params }: BlogPageProps): Promise<Metadata> {
    try {
        const blog = await getBlog(params.id);
        if (!blog) {
            return {
                title: 'Blog Not Found | Bloggie - Technical Blog Platform',
                description: 'The requested technical blog post could not be found. Discover more programming tutorials and software engineering articles on Bloggie.',
                robots: {
                    index: false,
                    follow: true,
                },
            };
        }

        const author = await getUserById(blog.authorId);
        return generateBlogMetadata(blog, author || undefined);
    } catch (error) {
        console.error('Error generating blog metadata:', error);
        return {
            title: 'Technical Blog | Bloggie - Programming Tutorials & Software Engineering',
            description: 'Read in-depth technical articles, programming tutorials, and software engineering insights on Bloggie. Join the community of developers sharing knowledge.',
        };
    }
}

export default async function BlogPage({ params }: BlogPageProps) {
    let blog: Blog | null = null;
    let author: User | null = null;
    let jsonLd = null;

    try {
        blog = await getBlog(params.id);
        if (blog) {
            author = await getUserById(blog.authorId);
            jsonLd = generateBlogJsonLd(blog, author || undefined);
        }
    } catch (error) {
        console.error('Error fetching blog data:', error);
    }

    return (
        <>
            {/* Structured Data for SEO */}
            {jsonLd && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
                />
            )}

            {/* Client Component for Interactive Features */}
            <BlogDetailClient blogId={params.id} initialBlog={blog} initialAuthor={author} />
        </>
    );
}
