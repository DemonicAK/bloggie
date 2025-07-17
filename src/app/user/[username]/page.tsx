'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { getUserByUsername, getBlogsByUsername } from '@/lib/blogService';
import { User, Blog } from '@/types';
import BlogCard from '@/components/BlogCard';
import { User as UserIcon, Calendar, BookOpen, Loader2 } from 'lucide-react';
import { formatDistance } from 'date-fns';

export default function UserProfile() {
    const params = useParams();
    const [user, setUser] = useState<User | null>(null);
    const [userBlogs, setUserBlogs] = useState<Blog[]>([]);
    const [loading, setLoading] = useState(true);
    const [blogsLoading, setBlogsLoading] = useState(true);

    const username = params?.username as string;

    const fetchUserData = useCallback(async () => {
        if (!username) return;

        setLoading(true);
        try {
            const userData = await getUserByUsername(username);
            setUser(userData);
        } catch (error) {
            console.error('Error fetching user:', error);
        } finally {
            setLoading(false);
        }
    }, [username]);

    const fetchUserBlogs = useCallback(async () => {
        if (!username) return;

        setBlogsLoading(true);
        try {
            const blogs = await getBlogsByUsername(username);
            setUserBlogs(blogs);
        } catch (error) {
            console.error('Error fetching user blogs:', error);
        } finally {
            setBlogsLoading(false);
        }
    }, [username]);

    useEffect(() => {
        fetchUserData();
        fetchUserBlogs();
    }, [fetchUserData, fetchUserBlogs]);

    if (loading) {
        return (
            <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen bg-background text-foreground">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="text-center py-12">
                        <UserIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                        <h1 className="text-2xl font-bold text-foreground mb-4">User not found</h1>
                        <p className="text-muted-foreground">The user profile you&apos;re looking for doesn&apos;t exist.</p>
                    </div>
                </div>
            </div>
        );
    }

    const totalLikes = userBlogs.reduce((sum, blog) => sum + blog.likes.length, 0);

    return (
        <div className="min-h-screen bg-background text-foreground">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* User Profile Header */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
                    <div className="flex items-start space-x-6">
                        {/* Profile Picture */}
                        <div className="flex-shrink-0">
                            {user.photoURL ? (
                                <Image
                                    src={user.photoURL}
                                    alt={user.username}
                                    width={96}
                                    height={96}
                                    className="h-24 w-24 rounded-full object-cover"
                                />
                            ) : (
                                <div className="h-24 w-24 rounded-full bg-blue-600 flex items-center justify-center">
                                    <UserIcon className="h-12 w-12 text-white" />
                                </div>
                            )}
                        </div>

                        {/* User Info */}
                        <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                                <h1 className="text-2xl font-bold text-gray-900">
                                    {user.displayName || user.username}
                                </h1>
                                {user.displayName && (
                                    <span className="text-gray-500">@{user.username}</span>
                                )}
                            </div>

                            <div className="flex items-center text-sm text-gray-500 mb-4">
                                <Calendar className="h-4 w-4 mr-2" />
                                Joined {(() => {
                                    try {
                                        const date = user.createdAt instanceof Date ? user.createdAt : new Date(user.createdAt);
                                        return isNaN(date.getTime()) ? 'recently' : formatDistance(date, new Date(), { addSuffix: true });
                                    } catch {
                                        return 'recently';
                                    }
                                })()}
                            </div>

                            {/* Stats */}
                            <div className="flex items-center space-x-6">
                                <div className="text-center">
                                    <div className="text-xl font-bold text-gray-900">{userBlogs.length}</div>
                                    <div className="text-sm text-gray-500">
                                        {userBlogs.length === 1 ? 'Blog' : 'Blogs'}
                                    </div>
                                </div>
                                <div className="text-center">
                                    <div className="text-xl font-bold text-gray-900">{totalLikes}</div>
                                    <div className="text-sm text-gray-500">
                                        {totalLikes === 1 ? 'Like' : 'Likes'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* User's Blogs */}
                <div>
                    <div className="flex items-center space-x-2 mb-6">
                        <BookOpen className="h-5 w-5 text-gray-600" />
                        <h2 className="text-xl font-semibold text-gray-900">
                            {user.displayName || user.username}&apos;s Blogs
                        </h2>
                        <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-sm">
                            {userBlogs.length}
                        </span>
                    </div>

                    {blogsLoading ? (
                        <div className="flex justify-center items-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                        </div>
                    ) : userBlogs.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">
                                    No blogs yet
                                </h3>
                                <p className="text-gray-600">
                                    {user.displayName || user.username} hasn&apos;t published any blogs yet.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {userBlogs.map((blog) => (
                                <BlogCard
                                    key={blog.id}
                                    blog={blog}
                                    onUpdate={fetchUserBlogs}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
