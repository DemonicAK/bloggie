'use client';

import React, { useState, useEffect } from 'react';
import BlogCard from '@/components/BlogCard';
import { getBlogs, getMostLikedBlogs } from '@/lib/blogService';
import { Blog } from '@/types';
import { TrendingUp, Clock, Loader2, Sparkles } from 'lucide-react';
import { GradientBackground, FloatingCard } from '@/components/ui/animated';

export default function Home() {
  const [latestBlogs, setLatestBlogs] = useState<Blog[]>([]);
  const [mostLikedBlogs, setMostLikedBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'latest' | 'popular'>('latest');

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const [latest, popular] = await Promise.all([
        getBlogs(1),
        getMostLikedBlogs(2)
      ]);
      setLatestBlogs(latest);
      setMostLikedBlogs(popular);
    } catch (error) {
      console.error('Error fetching blogs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const currentBlogs = activeTab === 'latest' ? latestBlogs : mostLikedBlogs;

  return (
    <GradientBackground>
      {/* Hero Section */}
      <div className="relative overflow-hidden pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur-xl opacity-30 animate-pulse"></div>
                <Sparkles className="relative h-16 w-16 text-blue-600" />
              </div>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-6">
              Welcome to Bloggie
            </h1>
            <p className="text-xl md:text-2xl text-slate-600 max-w-3xl mx-auto mb-8 leading-relaxed">
              Discover amazing stories, share your thoughts, and connect with writers from around the world.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                Start Reading
              </button>
              <button className="px-8 py-3 border-2 border-blue-600 text-blue-600 rounded-full font-semibold hover:bg-blue-600 hover:text-white transition-all duration-300">
                Write Your Story
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-1 shadow-lg border border-white/20">
            <button
              onClick={() => setActiveTab('latest')}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${activeTab === 'latest'
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg transform scale-105'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                }`}
            >
              <Clock className="h-4 w-4" />
              <span>Latest</span>
            </button>
            <button
              onClick={() => setActiveTab('popular')}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${activeTab === 'popular'
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg transform scale-105'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                }`}
            >
              <TrendingUp className="h-4 w-4" />
              <span>Popular</span>
            </button>
          </div>
        </div>

        {/* Blog List */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur-sm opacity-30 animate-pulse"></div>
              <Loader2 className="relative h-8 w-8 animate-spin text-blue-600" />
            </div>
          </div>
        ) : currentBlogs.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-12 max-w-md mx-auto">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Sparkles className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">
                No blogs yet
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Be the first to share your story! Sign in and create your first blog post.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {currentBlogs.map((blog, index) => (
              <FloatingCard key={blog.id} delay={index * 0.1}>
                <BlogCard
                  blog={blog}
                  onUpdate={fetchBlogs}
                />
              </FloatingCard>
            ))}
          </div>
        )}
      </div>
    </GradientBackground>
  );
}
