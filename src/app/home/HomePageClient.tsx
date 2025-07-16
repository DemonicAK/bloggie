'use client';

import React, { useState, useEffect, useCallback } from 'react';
import BlogCard from '@/components/BlogCard';
import { getBlogs, getMostLikedBlogs } from '@/lib/blogService';
import { Blog } from '@/types';
import { TrendingUp, Clock, Loader2, Sparkles } from 'lucide-react';
import { GradientBackground, FloatingCard } from '@/components/ui/animated';

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
        <GradientBackground>
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Welcome Section */}
                <div className="text-center mb-12">
                    <FloatingCard className="p-8 mb-8">
                        <div className="flex items-center justify-center mb-4">
                            <Sparkles className="h-8 w-8 text-blue-600 mr-3" />
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                Welcome to Bloggie
                            </h1>
                        </div>
                        <p className="text-gray-600 text-lg max-w-2xl mx-auto leading-relaxed">
                            Discover amazing stories, share your thoughts, and connect with a community of passionate writers and readers.
                        </p>
                    </FloatingCard>
                </div>

                {/* Tabs */}
                <div className="flex justify-center mb-8">
                    <div className="bg-white/70 backdrop-blur-sm rounded-xl p-1 shadow-lg border border-white/20">
                        <div className="flex space-x-1">
                            <button
                                onClick={() => setActiveTab('latest')}
                                className={`flex items-center px-6 py-3 rounded-lg font-medium transition-all duration-200 ${activeTab === 'latest'
                                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg transform scale-105'
                                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                                    }`}
                            >
                                <Clock className="h-4 w-4 mr-2" />
                                Latest Stories
                            </button>
                            <button
                                onClick={() => setActiveTab('popular')}
                                className={`flex items-center px-6 py-3 rounded-lg font-medium transition-all duration-200 ${activeTab === 'popular'
                                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg transform scale-105'
                                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                                    }`}
                            >
                                <TrendingUp className="h-4 w-4 mr-2" />
                                Popular Today
                            </button>
                        </div>
                    </div>
                </div>

                {/* Blog Grid */}
                {loading ? (
                    <div className="text-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
                        <p className="text-gray-600">Loading amazing stories...</p>
                    </div>
                ) : (
                    <>
                        {displayedBlogs.length === 0 ? (
                            <FloatingCard className="text-center py-12">
                                <Sparkles className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-xl font-semibold text-gray-700 mb-2">No stories yet</h3>
                                <p className="text-gray-500">Be the first to share your amazing story!</p>
                            </FloatingCard>
                        ) : (
                            <div className="grid gap-6 mb-8">
                                {displayedBlogs.map((blog, index) => (
                                    <FloatingCard key={blog.id} delay={index * 0.1}>
                                        <BlogCard
                                            blog={blog}
                                            onUpdate={fetchInitialBlogs}
                                        />
                                    </FloatingCard>
                                ))}
                            </div>
                        )}

                        {/* Load More Button */}
                        {activeTab === 'latest' && hasMore && !loading && (
                            <div className="text-center">
                                <button
                                    onClick={loadMoreBlogs}
                                    disabled={loadingMore}
                                    className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                                >
                                    {loadingMore ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin mr-2 inline" />
                                            Loading more...
                                        </>
                                    ) : (
                                        'Load More Stories'
                                    )}
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </GradientBackground>
    );
}
