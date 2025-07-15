'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import { getBlog, toggleLike, toggleBookmark, addComment, getUserById, getUsersByIds } from '@/lib/blogService';
import { Blog, CreateCommentData, User } from '@/types';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
    Heart,
    Bookmark,
    MessageCircle,
    User as UserIcon,
    Calendar,
    ArrowLeft,
    Loader2,
    Send
} from 'lucide-react';
import Link from 'next/link';

interface BlogDetailClientProps {
    blogId: string;
    initialBlog?: Blog | null;
    initialAuthor?: User | null;
}

export default function BlogDetailClient({ blogId, initialBlog, initialAuthor }: BlogDetailClientProps) {
    const router = useRouter();
    const { user } = useAuth();
    const [blog, setBlog] = useState<Blog | null>(initialBlog || null);
    const [loading, setLoading] = useState(!initialBlog);
    const [isLiking, setIsLiking] = useState(false);
    const [isBookmarking, setIsBookmarking] = useState(false);
    const [newComment, setNewComment] = useState('');
    const [isAddingComment, setIsAddingComment] = useState(false);
    const [showComments, setShowComments] = useState(true);
    const [authorData, setAuthorData] = useState<User | null>(initialAuthor || null);
    const [commentAuthors, setCommentAuthors] = useState<Record<string, User>>({});

    const fetchBlog = useCallback(async () => {
        if (!blogId) return;

        setLoading(true);
        try {
            const blogData = await getBlog(blogId);
            setBlog(blogData);

            if (blogData && !authorData) {
                // Fetch author data
                const author = await getUserById(blogData.authorId);
                setAuthorData(author);
            }

            if (blogData && blogData.comments.length > 0) {
                // Fetch comment authors
                const commentAuthorIds = [...new Set(blogData.comments.map(comment => comment.authorId))];
                const authors = await getUsersByIds(commentAuthorIds);
                const authorsMap = Array.isArray(authors)
                    ? authors.reduce((acc: Record<string, User>, author: User | null) => {
                        if (author) acc[author.uid] = author;
                        return acc;
                    }, {} as Record<string, User>)
                    : {};
                setCommentAuthors(authorsMap);
            }
        } catch (error) {
            console.error('Error fetching blog:', error);
        } finally {
            setLoading(false);
        }
    }, [blogId, authorData]);

    useEffect(() => {
        if (!initialBlog) {
            fetchBlog();
        } else if (blog && blog.comments.length > 0 && Object.keys(commentAuthors).length === 0) {
            // Fetch comment authors for initial blog
            const commentAuthorIds = [...new Set(blog.comments.map(comment => comment.authorId))];
            getUsersByIds(commentAuthorIds).then(authors => {
                const authorsMap = Array.isArray(authors)
                    ? authors.reduce((acc: Record<string, User>, author: User | null) => {
                        if (author) acc[author.uid] = author;
                        return acc;
                    }, {} as Record<string, User>)
                    : {};
                setCommentAuthors(authorsMap);
            });
        }
    }, [fetchBlog, initialBlog, blog, commentAuthors]);

    const handleLike = async () => {
        if (!user || !blog || isLiking) return;

        setIsLiking(true);
        try {
            await toggleLike(blog.id, user.uid);
            // Refresh blog data
            await fetchBlog();
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
            // Refresh blog data
            await fetchBlog();
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
            // Refresh blog data to show new comment
            await fetchBlog();
        } catch (error) {
            console.error('Error adding comment:', error);
        } finally {
            setIsAddingComment(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
                    <p className="text-gray-600">Loading amazing content...</p>
                </div>
            </div>
        );
    }

    if (!blog) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Blog not found</h1>
                    <p className="text-gray-600 mb-6">The blog you&apos;re looking for doesn&apos;t exist or has been removed.</p>
                    <Button onClick={() => router.push('/home')} className="bg-blue-600 hover:bg-blue-700">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Home
                    </Button>
                </div>
            </div>
        );
    }

    const isLiked = user && blog.likes.includes(user.uid);
    const isBookmarked = user && blog.bookmarks.includes(user.uid);

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
            <div className="max-w-4xl mx-auto px-4 py-8">
                {/* Back button */}
                <Button
                    onClick={() => router.back()}
                    variant="ghost"
                    className="mb-6 text-blue-600 hover:bg-blue-50"
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                </Button>

                {/* Blog content */}
                <article className="bg-white rounded-xl shadow-lg overflow-hidden">
                    {/* Header */}
                    <header className="p-8 border-b border-gray-100">
                        <h1 className="text-4xl font-bold text-gray-900 mb-6 leading-tight">
                            {blog.title}
                        </h1>

                        {/* Author and meta info */}
                        <div className="flex items-center gap-4 mb-6">
                            {authorData?.photoURL ? (
                                <Image
                                    src={authorData.photoURL}
                                    alt={authorData.displayName || authorData.username}
                                    width={48}
                                    height={48}
                                    className="rounded-full object-cover ring-2 ring-blue-100"
                                />
                            ) : (
                                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                                    <UserIcon className="h-6 w-6 text-white" />
                                </div>
                            )}
                            <div>
                                <Link
                                    href={`/user/${blog.authorUsername}`}
                                    className="font-semibold text-gray-900 hover:text-blue-600 transition-colors"
                                >
                                    {authorData?.displayName || blog.authorUsername}
                                </Link>
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                    <Calendar className="h-4 w-4" />
                                    <time dateTime={blog.createdAt.toISOString()}>
                                        {formatDistanceToNow(blog.createdAt, { addSuffix: true })}
                                    </time>
                                </div>
                            </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-4">
                            <Button
                                onClick={handleLike}
                                disabled={!user || isLiking}
                                variant="ghost"
                                size="sm"
                                className={`flex items-center gap-2 ${isLiked
                                        ? 'text-red-600 bg-red-50 hover:bg-red-100'
                                        : 'text-gray-600 hover:bg-gray-100'
                                    }`}
                            >
                                <Heart
                                    className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`}
                                />
                                {blog.likes.length}
                            </Button>

                            <Button
                                onClick={handleBookmark}
                                disabled={!user || isBookmarking}
                                variant="ghost"
                                size="sm"
                                className={`flex items-center gap-2 ${isBookmarked
                                        ? 'text-blue-600 bg-blue-50 hover:bg-blue-100'
                                        : 'text-gray-600 hover:bg-gray-100'
                                    }`}
                            >
                                <Bookmark
                                    className={`h-4 w-4 ${isBookmarked ? 'fill-current' : ''}`}
                                />
                                {isBookmarked ? 'Bookmarked' : 'Bookmark'}
                            </Button>

                            <Button
                                onClick={() => setShowComments(!showComments)}
                                variant="ghost"
                                size="sm"
                                className="flex items-center gap-2 text-gray-600 hover:bg-gray-100"
                            >
                                <MessageCircle className="h-4 w-4" />
                                {blog.comments.length} Comments
                            </Button>
                        </div>
                    </header>

                    {/* Blog content */}
                    <div className="p-8">
                        <div
                            className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-blue-600 prose-strong:text-gray-900"
                            dangerouslySetInnerHTML={{ __html: blog.content.replace(/\n/g, '<br />') }}
                        />
                    </div>
                </article>

                {/* Comments section */}
                {showComments && (
                    <section className="mt-8 bg-white rounded-xl shadow-lg p-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">
                            Comments ({blog.comments.length})
                        </h2>

                        {/* Add comment form */}
                        {user ? (
                            <form onSubmit={handleAddComment} className="mb-8">
                                <div className="flex gap-4">
                                    {user.photoURL ? (
                                        <Image
                                            src={user.photoURL}
                                            alt={user.displayName || user.username}
                                            width={40}
                                            height={40}
                                            className="rounded-full object-cover ring-2 ring-blue-100"
                                        />
                                    ) : (
                                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                                            <UserIcon className="h-5 w-5 text-white" />
                                        </div>
                                    )}
                                    <div className="flex-1">
                                        <Textarea
                                            value={newComment}
                                            onChange={(e) => setNewComment(e.target.value)}
                                            placeholder="Add a thoughtful comment..."
                                            className="mb-3 resize-none"
                                            rows={3}
                                        />
                                        <Button
                                            type="submit"
                                            disabled={!newComment.trim() || isAddingComment}
                                            className="bg-blue-600 hover:bg-blue-700"
                                        >
                                            {isAddingComment ? (
                                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                            ) : (
                                                <Send className="h-4 w-4 mr-2" />
                                            )}
                                            Post Comment
                                        </Button>
                                    </div>
                                </div>
                            </form>
                        ) : (
                            <div className="mb-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
                                <p className="text-blue-800 text-center">
                                    <Link href="/auth" className="font-semibold hover:underline">
                                        Sign in
                                    </Link>{' '}
                                    to join the conversation
                                </p>
                            </div>
                        )}

                        {/* Comments list */}
                        <div className="space-y-6">
                            {blog.comments.length === 0 ? (
                                <p className="text-gray-500 text-center py-8">
                                    No comments yet. Be the first to share your thoughts!
                                </p>
                            ) : (
                                blog.comments.map((comment) => {
                                    const commentAuthor = commentAuthors[comment.authorId];
                                    return (
                                        <div key={comment.id} className="flex gap-4 p-4 bg-gray-50 rounded-lg">
                                            {commentAuthor?.photoURL ? (
                                                <Image
                                                    src={commentAuthor.photoURL}
                                                    alt={commentAuthor.displayName || commentAuthor.username}
                                                    width={40}
                                                    height={40}
                                                    className="rounded-full object-cover ring-2 ring-gray-200"
                                                />
                                            ) : (
                                                <div className="w-10 h-10 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center">
                                                    <UserIcon className="h-5 w-5 text-white" />
                                                </div>
                                            )}
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Link
                                                        href={`/user/${comment.authorUsername}`}
                                                        className="font-semibold text-gray-900 hover:text-blue-600 transition-colors"
                                                    >
                                                        {commentAuthor?.displayName || comment.authorUsername}
                                                    </Link>
                                                    <span className="text-sm text-gray-500">
                                                        {formatDistanceToNow(comment.createdAt, { addSuffix: true })}
                                                    </span>
                                                </div>
                                                <p className="text-gray-700 leading-relaxed">
                                                    {comment.content}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
}
