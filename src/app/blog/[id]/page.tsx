'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import { getBlog, toggleLike, toggleBookmark, addComment } from '@/lib/blogService';
import { Blog, CreateCommentData } from '@/types';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
    Heart,
    Bookmark,
    MessageCircle,
    User,
    Calendar,
    ArrowLeft,
    Loader2,
    Send
} from 'lucide-react';
import Link from 'next/link';

export default function BlogDetail() {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const [blog, setBlog] = useState<Blog | null>(null);
    const [loading, setLoading] = useState(true);
    const [isLiking, setIsLiking] = useState(false);
    const [isBookmarking, setIsBookmarking] = useState(false);
    const [newComment, setNewComment] = useState('');
    const [isAddingComment, setIsAddingComment] = useState(false);
    const [showComments, setShowComments] = useState(true);

    const blogId = params?.id as string;

    const fetchBlog = useCallback(async () => {
        if (!blogId) return;

        setLoading(true);
        try {
            const blogData = await getBlog(blogId);
            setBlog(blogData);
        } catch (error) {
            console.error('Error fetching blog:', error);
        } finally {
            setLoading(false);
        }
    }, [blogId]);

    useEffect(() => {
        fetchBlog();
    }, [blogId, fetchBlog]);

    const handleLike = async () => {
        if (!user || !blog || isLiking) return;

        setIsLiking(true);
        try {
            await toggleLike(blog.id, user.uid);
            await fetchBlog(); // Refresh blog data
        } catch (error) {
            console.error('Error toggling like:', error);
        } finally {
            setIsLiking(false);
        }
    };

    const handleBookmark = async () => {
        if (!user || !blog || isBookmarking) return;

        setIsBookmarking(true);
        try {
            await toggleBookmark(blog.id, user.uid);
            await fetchBlog(); // Refresh blog data
        } catch (error) {
            console.error('Error toggling bookmark:', error);
        } finally {
            setIsBookmarking(false);
        }
    };

    const handleAddComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !blog || !newComment.trim() || isAddingComment) return;

        setIsAddingComment(true);
        try {
            const commentData: CreateCommentData = {
                content: newComment.trim()
            };
            await addComment(blog.id, user.uid, commentData);
            setNewComment('');
            await fetchBlog(); // Refresh blog data
        } catch (error) {
            console.error('Error adding comment:', error);
        } finally {
            setIsAddingComment(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        );
    }

    if (!blog) {
        return (
            <div className="min-h-screen bg-gray-50">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="text-center py-12">
                        <h1 className="text-2xl font-bold text-gray-900 mb-4">Blog not found</h1>
                        <p className="text-gray-600 mb-6">The blog you&apos;re looking for doesn&apos;t exist.</p>
                        <Button onClick={() => router.push('/')}>
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Home
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    const isLiked = user ? blog.likes.includes(user.uid) : false;
    const isBookmarked = user ? blog.bookmarks.includes(user.uid) : false;

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Back Button */}
                <Button
                    variant="ghost"
                    onClick={() => router.back()}
                    className="mb-6 text-gray-600 hover:text-gray-900"
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                </Button>

                {/* Blog Content */}
                <article className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    {/* Header */}
                    <div className="p-6 border-b border-gray-200">
                        <h1 className="text-3xl font-bold text-gray-900 mb-4">{blog.title}</h1>

                        <div className="flex items-center justify-between">
                            <Link
                                href={`/user/${blog.authorUsername}`}
                                className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
                            >
                                {blog.authorPhotoURL ? (
                                    <Image
                                        src={blog.authorPhotoURL}
                                        alt={blog.authorUsername}
                                        width={48}
                                        height={48}
                                        className="h-12 w-12 rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="h-12 w-12 rounded-full bg-blue-600 flex items-center justify-center">
                                        <User className="h-6 w-6 text-white" />
                                    </div>
                                )}
                                <div>
                                    <p className="font-medium text-gray-900">{blog.authorUsername}</p>
                                    <div className="flex items-center text-sm text-gray-500">
                                        <Calendar className="h-3 w-3 mr-1" />
                                        {formatDistanceToNow(new Date(blog.createdAt), { addSuffix: true })}
                                    </div>
                                </div>
                            </Link>

                            {/* Action Buttons */}
                            <div className="flex items-center space-x-2">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleLike}
                                    disabled={!user || isLiking}
                                    className={`${isLiked ? 'text-red-600' : 'text-gray-500 hover:text-red-600'}`}
                                >
                                    <Heart className={`h-5 w-5 mr-1 ${isLiked ? 'fill-current' : ''}`} />
                                    {blog.likes.length}
                                </Button>

                                {user && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleBookmark}
                                        disabled={isBookmarking}
                                        className={`${isBookmarked ? 'text-blue-600' : 'text-gray-500 hover:text-blue-600'}`}
                                    >
                                        <Bookmark className={`h-5 w-5 ${isBookmarked ? 'fill-current' : ''}`} />
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                        <div className="prose max-w-none">
                            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{blog.content}</p>
                        </div>
                    </div>
                </article>

                {/* Comments Section */}
                <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200">
                    <div className="p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center space-x-2">
                                <MessageCircle className="h-5 w-5 text-gray-600" />
                                <h2 className="text-xl font-semibold text-gray-900">Comments</h2>
                                <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-sm">
                                    {blog.comments.length}
                                </span>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowComments(!showComments)}
                            >
                                {showComments ? 'Hide' : 'Show'}
                            </Button>
                        </div>

                        {/* Add Comment Form */}
                        {user && (
                            <form onSubmit={handleAddComment} className="mb-6">
                                <div className="flex space-x-3">
                                    {user.photoURL ? (
                                        <Image
                                            src={user.photoURL}
                                            alt={user.username}
                                            width={40}
                                            height={40}
                                            className="h-10 w-10 rounded-full object-cover flex-shrink-0"
                                        />
                                    ) : (
                                        <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                                            <User className="h-5 w-5 text-white" />
                                        </div>
                                    )}
                                    <div className="flex-1">
                                        <Textarea
                                            value={newComment}
                                            onChange={(e) => setNewComment(e.target.value)}
                                            placeholder="Write a comment..."
                                            rows={3}
                                            className="mb-3"
                                        />
                                        <div className="flex justify-end">
                                            <Button
                                                type="submit"
                                                size="sm"
                                                disabled={!newComment.trim() || isAddingComment}
                                                className="bg-blue-600 hover:bg-blue-700"
                                            >
                                                {isAddingComment ? (
                                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                ) : (
                                                    <Send className="h-4 w-4 mr-2" />
                                                )}
                                                Comment
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        )}

                        {!user && (
                            <div className="text-center py-4 mb-6 bg-gray-50 rounded-lg">
                                <p className="text-gray-600">Sign in to leave a comment</p>
                            </div>
                        )}

                        {/* Comments List */}
                        {showComments && (
                            <div className="space-y-4">
                                {blog.comments.length === 0 ? (
                                    <div className="text-center py-8 text-gray-500">
                                        No comments yet. Be the first to comment!
                                    </div>
                                ) : (
                                    blog.comments.map((comment) => (
                                        <div key={comment.id} className="flex space-x-3 p-4 bg-gray-50 rounded-lg">
                                            {comment.authorPhotoURL ? (
                                                <Image
                                                    src={comment.authorPhotoURL}
                                                    alt={comment.authorUsername}
                                                    width={32}
                                                    height={32}
                                                    className="h-8 w-8 rounded-full object-cover flex-shrink-0"
                                                />
                                            ) : (
                                                <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                                                    <User className="h-4 w-4 text-white" />
                                                </div>
                                            )}
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-2 mb-1">
                                                    <Link
                                                        href={`/user/${comment.authorUsername}`}
                                                        className="font-medium text-gray-900 hover:text-blue-600"
                                                    >
                                                        {comment.authorUsername}
                                                    </Link>
                                                    <span className="text-sm text-gray-500">
                                                        {comment.createdAt ? formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true }) : 'Just now'}
                                                    </span>
                                                </div>
                                                <p className="text-gray-700">{comment.content}</p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
