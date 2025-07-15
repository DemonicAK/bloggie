'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { Blog } from '@/types';
import { Button } from '@/components/ui/button';
import { Heart, Bookmark, MessageCircle, User, Calendar, ArrowRight } from 'lucide-react';
import { toggleLike, toggleBookmark } from '@/lib/blogService';
import { formatDistance } from 'date-fns';

interface BlogCardProps {
  blog: Blog;
  onUpdate?: () => void;
}

const BlogCard: React.FC<BlogCardProps> = ({ blog, onUpdate }) => {
  const { user } = useAuth();
  const [isLiking, setIsLiking] = useState(false);
  const [isBookmarking, setIsBookmarking] = useState(false);

  const isLiked = user ? blog.likes.includes(user.uid) : false;
  const isBookmarked = user ? blog.bookmarks.includes(user.uid) : false;

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user || isLiking) return;

    setIsLiking(true);
    try {
      await toggleLike(blog.id, user.uid);
      onUpdate?.();
    } catch (error) {
      console.error('Error toggling like:', error);
    } finally {
      setIsLiking(false);
    }
  };

  const handleBookmark = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user || isBookmarking) return;

    setIsBookmarking(true);
    try {
      await toggleBookmark(blog.id, user.uid);
      onUpdate?.();
    } catch (error) {
      console.error('Error toggling bookmark:', error);
    } finally {
      setIsBookmarking(false);
    }
  };

  const truncateContent = (content: string, maxLength: number = 150) => {
    if (content.length <= maxLength) return content;
    return content.slice(0, maxLength) + '...';
  };

  return (
    <div className="group p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <Link
          href={`/user/${blog.authorUsername}`}
          className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
        >
          {blog.authorPhotoURL ? (
            <Image
              src={blog.authorPhotoURL}
              alt={blog.authorUsername}
              width={40}
              height={40}
              className="h-10 w-10 rounded-full object-cover ring-2 ring-blue-100"
            />
          ) : (
            <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
              <User className="h-5 w-5 text-white" />
            </div>
          )}
          <div>
            <p className="font-semibold text-slate-900">{blog.authorUsername}</p>
            <div className="flex items-center text-sm text-slate-500">
              <Calendar className="h-3 w-3 mr-1" />
              {formatDistance(blog.createdAt, new Date(), { addSuffix: true })}
            </div>
          </div>
        </Link>
      </div>

      {/* Content */}
      <Link href={`/blog/${blog.id}`} className="block group/content">
        <h2 className="text-xl font-bold text-slate-900 mb-3 group-hover/content:bg-gradient-to-r group-hover/content:from-blue-600 group-hover/content:to-purple-600 group-hover/content:bg-clip-text group-hover/content:text-transparent transition-all duration-300 leading-tight">
          {blog.title}
        </h2>
        <p className="text-slate-600 mb-4 leading-relaxed">
          {truncateContent(blog.content)}
        </p>
        <div className="flex items-center text-blue-600 font-medium text-sm group-hover/content:translate-x-1 transition-transform duration-300">
          <span>Read more</span>
          <ArrowRight className="h-4 w-4 ml-1" />
        </div>
      </Link>

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
        <div className="flex items-center space-x-4">
          {/* Like Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLike}
            disabled={!user || isLiking}
            className={`flex items-center space-x-1 hover:scale-110 transition-all duration-200 ${isLiked ? 'text-red-500 hover:text-red-600' : 'text-slate-500 hover:text-red-500'
              }`}
          >
            <Heart className={`h-4 w-4 ${isLiked ? 'fill-current animate-pulse' : ''}`} />
            <span className="text-sm font-medium">{blog.likes.length}</span>
          </Button>

          {/* Comment Button */}
          <Link href={`/blog/${blog.id}`}>
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center space-x-1 text-slate-500 hover:text-blue-600 hover:scale-110 transition-all duration-200"
            >
              <MessageCircle className="h-4 w-4" />
              <span className="text-sm font-medium">{blog.comments.length}</span>
            </Button>
          </Link>
        </div>

        {/* Bookmark Button */}
        {user && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBookmark}
            disabled={isBookmarking}
            className={`hover:scale-110 transition-all duration-200 ${isBookmarked ? 'text-blue-600 hover:text-blue-700' : 'text-slate-500 hover:text-blue-600'
              }`}
          >
            <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-current' : ''}`} />
          </Button>
        )}
      </div>
    </div>
  );
};

export default BlogCard;
