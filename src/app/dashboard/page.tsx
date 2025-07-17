'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import CreateBlogForm from '@/components/CreateBlogForm';
import BlogCard from '@/components/BlogCard';
import { getUserBlogs } from '@/lib/blogService';
import { Blog } from '@/types';
import { BookOpen, PenTool, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { GradientBackground, FloatingCard } from '@/components/ui/animated';

export default function Dashboard() {
    const { user, loading: authLoading } = useAuth();
    const [userBlogs, setUserBlogs] = useState<Blog[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const fetchUserBlogs = useCallback(async () => {
        if (!user) return;

        setLoading(true);
        try {
            const blogs = await getUserBlogs(user.uid);
            setUserBlogs(blogs);
        } catch (error) {
            console.error('Error fetching user blogs:', error);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/');
            return;
        }

        if (user) {
            fetchUserBlogs();
        }
    }, [user, authLoading, router, fetchUserBlogs]);

    if (authLoading) {
        return (
            <GradientBackground>
                <div className="min-h-screen flex items-center justify-center">
                    <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur-sm opacity-30 animate-pulse"></div>
                        <Loader2 className="relative h-8 w-8 animate-spin text-blue-600" />
                    </div>
                </div>
            </GradientBackground>
        );
    }

    if (!user) {
        return null;
    }

    return (
        <div className="min-h-screen bg-background text-foreground">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8 text-center">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-3">
                        Welcome back, {user.username}!
                    </h1>
                    <p className="text-slate-600 text-lg">Ready to share your next story with the world?</p>
                </div>

                {/* Create Blog Form */}
                <div className="mb-12">
                    <CreateBlogForm onBlogCreated={fetchUserBlogs} />
                </div>

                {/* User's Blogs */}
                <div>
                    <div className="flex items-center space-x-3 mb-8">
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg blur-sm opacity-30"></div>
                            <BookOpen className="relative h-6 w-6 text-blue-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-foreground">Your Blog Collection</h2>
                        <span className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                            {userBlogs.length} {userBlogs.length === 1 ? 'story' : 'stories'}
                        </span>
                    </div>

                    {loading ? (
                        <div className="flex justify-center items-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                        </div>
                    ) : userBlogs.length === 0 ? (
                        <FloatingCard className="text-center py-12">
                            <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <PenTool className="w-8 h-8 text-blue-600" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3">
                                Start Your Writing Journey
                            </h3>
                            <p className="text-slate-600">
                                You haven&apos;t written any blogs yet. Use the form above to share your first story!
                            </p>
                        </FloatingCard>
                    ) : (
                                <>
                                    <div className="grid gap-6 md:gap-8">
                                        {userBlogs.map((blog, index) => (
                                            <div
                                                key={blog.id}
                                                className="bg-card rounded-2xl shadow-lg border border-border hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                                                style={{
                                                    animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`
                                                }}
                                            >
                                                <BlogCard
                                                    blog={blog}
                                                    onUpdate={fetchUserBlogs}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </>
                    )}
                </div>
            </div>
        </div>
    );
}
