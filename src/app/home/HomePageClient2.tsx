'use client';

import React, { useState, useEffect, useCallback } from 'react';
import BlogCard from '@/components/BlogCard';
import { getBlogs, getMostLikedBlogs } from '@/lib/blogService';
import { Blog } from '@/types';
import { TrendingUp, Clock, Loader2, BookOpen, Terminal } from 'lucide-react';

export default function HomePageClient() {
    const [latestBlogs, setLatestBlogs] = useState<Blog[]>([]);
    const [mostLikedBlogs, setMostLikedBlogs] = useState<Blog[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [activeTab, setActiveTab] = useState<'latest' | 'popular'>('latest');
    const [hasMore, setHasMore] = useState(true);
    const [lastDocumentId, setLastDocumentId] = useState<string | undefined>(undefined);

    const fetchInitialBlogs = async () => {
        setLoading(true);
        try {
            const [latestResult, popular] = await Promise.all([
                getBlogs(10), // Initial load of 10 blogs with pagination
                getMostLikedBlogs(10)
            ]);
            setLatestBlogs(latestResult.blogs);
            setLastDocumentId(latestResult.lastDoc);
            setHasMore(latestResult.hasMore);
            setMostLikedBlogs(popular);
        } catch (error) {
            console.error('Error fetching blogs:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadMoreBlogs = useCallback(async () => {
        if (loadingMore || !hasMore || activeTab !== 'latest') return;

        setLoadingMore(true);
        try {
            // Load more blogs using pagination
            const moreResult = await getBlogs(10, lastDocumentId);

            setLatestBlogs(prev => {
                const newBlogs = moreResult.blogs.filter(blog =>
                    !prev.some(existingBlog => existingBlog.id === blog.id)
                );
                return [...prev, ...newBlogs];
            });

            setLastDocumentId(moreResult.lastDoc);
            setHasMore(moreResult.hasMore);
        } catch (error) {
            console.error('Error loading more blogs:', error);
        } finally {
            setLoadingMore(false);
        }
    }, [loadingMore, hasMore, activeTab, lastDocumentId]);

    useEffect(() => {
        fetchInitialBlogs();
    }, []);

    const displayedBlogs = activeTab === 'latest' ? latestBlogs : mostLikedBlogs;

    return (
        <div className="min-h-screen bg-background">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {/* Tab Navigation */}
                <div className="flex justify-center mb-8">
                    <div className="bg-card rounded-xl p-1 shadow-lg border border-border flex">
                        <button
                            onClick={() => setActiveTab('latest')}
                            className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${activeTab === 'latest'
                                    ? 'bg-primary text-primary-foreground shadow-md'
                                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                                }`}
                        >
                            <Clock className="h-4 w-4" />
                            <span>Latest Posts</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('popular')}
                            className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${activeTab === 'popular'
                                    ? 'bg-primary text-primary-foreground shadow-md'
                                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                                }`}
                        >
                            <TrendingUp className="h-4 w-4" />
                            <span>Most Popular</span>
                        </button>
                    </div>
                </div>

                {/* Loading State */}
                {loading ? (
                    <div className="text-center py-20">
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur-sm opacity-30 animate-pulse"></div>
                            <Loader2 className="relative h-8 w-8 animate-spin text-primary mx-auto" />
                        </div>
                        <p className="mt-4 text-muted-foreground text-lg">
                            Loading amazing tech content...
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Blog Grid */}
                        {displayedBlogs.length > 0 ? (
                            <>
                                <div className="grid gap-6 md:gap-8">
                                    {displayedBlogs.map((blog, index) => (
                                        <div
                                            key={blog.id}
                                            className="bg-card rounded-2xl shadow-lg border border-border hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                                            style={{
                                                animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`
                                            }}
                                        >
                                            <BlogCard
                                                blog={blog}
                                                onUpdate={fetchInitialBlogs}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <div className="text-center py-20">
                                <div className="mb-6">
                                    <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                                    <h3 className="text-xl font-semibold text-foreground mb-2">
                                        No articles found
                                    </h3>
                                    <p className="text-muted-foreground">
                                        Be the first to share your technical knowledge with the community!
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Load More Button */}
                        {activeTab === 'latest' && hasMore && !loading && (
                            <div className="text-center">
                                <button
                                    onClick={loadMoreBlogs}
                                    disabled={loadingMore}
                                    className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loadingMore ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin mr-2 inline" />
                                            Loading more articles...
                                        </>
                                    ) : (
                                        'Load More Articles 🚀'
                                    )}
                                </button>
                                <div className="mt-3 text-sm text-muted-foreground">
                                    Discover more technical insights and tutorials
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            <style jsx>{`
                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `}</style>
        </div>
    );
}
