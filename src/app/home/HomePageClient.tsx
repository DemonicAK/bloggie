'use client';

import React, { useState, useEffect, useCallback } from 'react';
import BlogCard from '@/components/BlogCard';
import { getBlogs, getMostLikedBlogs } from '@/lib/blogService';
import { Blog } from '@/types';
import { TrendingUp, Clock, Loader2, Heart, Coffee, BookOpen } from 'lucide-react';

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
        <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Welcome Section */}
                <div className="text-center mb-12">
                    <div className="bg-white rounded-2xl p-8 mb-8 shadow-lg border border-gray-100">
                        <div className="flex items-center justify-center mb-4">
                            <div className="bg-amber-100 p-3 rounded-xl shadow-sm mr-3 rotate-3 hover:rotate-0 transition-transform duration-300">
                                <Heart className="h-6 w-6 text-red-500" fill="currentColor" />
                            </div>
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                                Stories from the Heart
                            </h1>
                        </div>
                        <p className="text-gray-600 text-lg max-w-2xl mx-auto leading-relaxed">
                            Welcome back! Dive into fresh stories from our community of authentic voices.
                            Every story here comes from a real person with something meaningful to share.
                        </p>
                        <div className="mt-4 text-sm text-gray-500 flex items-center justify-center gap-2">
                            <Coffee className="h-4 w-4" />
                            <span>Perfect reading with your morning coffee</span>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex justify-center mb-8">
                    <div className="bg-white rounded-xl p-1 shadow-lg border border-gray-200">
                        <div className="flex space-x-1">
                            <button
                                onClick={() => setActiveTab('latest')}
                                className={`flex items-center px-6 py-3 rounded-lg font-medium transition-all duration-200 ${activeTab === 'latest'
                                    ? 'bg-amber-500 text-white shadow-md'
                                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                    }`}
                            >
                                <Clock className="h-4 w-4 mr-2" />
                                Fresh Stories
                            </button>
                            <button
                                onClick={() => setActiveTab('popular')}
                                className={`flex items-center px-6 py-3 rounded-lg font-medium transition-all duration-200 ${activeTab === 'popular'
                                    ? 'bg-amber-500 text-white shadow-md'
                                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                    }`}
                            >
                                <TrendingUp className="h-4 w-4 mr-2" />
                                Reader Favorites
                            </button>
                        </div>
                    </div>
                </div>

                {/* Blog Grid */}
                {loading ? (
                    <div className="text-center py-12">
                        <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
                            <Loader2 className="h-8 w-8 animate-spin text-amber-500 mx-auto mb-4" />
                            <p className="text-gray-600">Finding great stories for you...</p>
                            <div className="mt-2 text-sm text-gray-400">
                                ✨ Quality takes a moment
                            </div>
                        </div>
                    </div>
                ) : (
                    <>
                        {displayedBlogs.length === 0 ? (
                            <div className="bg-white rounded-2xl p-12 text-center shadow-lg border border-gray-100">
                                <div className="bg-blue-50 p-4 rounded-xl inline-block mb-4">
                                    <BookOpen className="h-12 w-12 text-blue-600" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-700 mb-3">No stories yet in this section</h3>
                                <p className="text-gray-500 mb-4">
                                    {activeTab === 'latest'
                                        ? "Be the first to share your story with our community!"
                                        : "Stories need time to gain popularity. Check back soon!"}
                                </p>
                                <div className="text-sm text-gray-400">
                                    📝 Every great story starts with a single word
                                </div>
                            </div>
                        ) : (
                            <>
                                {/* Story count and encouragement */}
                                <div className="text-center mb-6">
                                    <div className="inline-flex items-center bg-amber-100 text-amber-800 px-4 py-2 rounded-full text-sm font-medium">
                                        <Heart className="h-4 w-4 mr-1" fill="currentColor" />
                                        {displayedBlogs.length} {activeTab === 'latest' ? 'fresh' : 'beloved'} stories waiting for you
                                    </div>
                                </div>

                                <div className="grid gap-6 mb-8">
                                    {displayedBlogs.map((blog, index) => (
                                        <div
                                            key={blog.id}
                                            className="bg-white rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 overflow-hidden"
                                            style={{
                                                animationDelay: `${index * 0.1}s`,
                                                animation: 'fadeInUp 0.6s ease-out forwards'
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
                        )}

                        {/* Load More Button */}
                        {activeTab === 'latest' && hasMore && !loading && (
                            <div className="text-center">
                                <button
                                    onClick={loadMoreBlogs}
                                    disabled={loadingMore}
                                    className="px-8 py-4 bg-gray-800 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loadingMore ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin mr-2 inline" />
                                            Finding more stories...
                                        </>
                                    ) : (
                                        'More Stories Please ✨'
                                    )}
                                </button>
                                <div className="mt-3 text-sm text-gray-500">
                                    There's always another great story to discover
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
