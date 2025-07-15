'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Sparkles, BookOpen, PenTool, Users, TrendingUp } from 'lucide-react';
import { GradientBackground } from '@/components/ui/animated';
import AuthModal from '@/components/AuthModal';
import { Button } from '@/components/ui/button';

export default function LandingPage() {
    const [showAuthModal, setShowAuthModal] = useState(false);

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
                            <Link href="/home">
                                <button className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                                    Start Reading
                                </button>
                            </Link>
                            <Button
                                onClick={() => setShowAuthModal(true)}
                                className="px-8 py-3 border-2 border-blue-600 text-blue-600 rounded-full font-semibold hover:bg-blue-600 hover:text-white transition-all duration-300 bg-transparent"
                            >
                                Write Your Story
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Features Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
                        Why Choose Bloggie?
                    </h2>
                    <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                        Join thousands of writers and readers in our vibrant community
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {/* Feature 1 */}
                    <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300 group">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <BookOpen className="w-6 h-6 text-blue-600" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-4">Discover Stories</h3>
                        <p className="text-slate-600 leading-relaxed">
                            Explore a vast collection of stories from talented writers around the globe. Find your next favorite read.
                        </p>
                    </div>

                    {/* Feature 2 */}
                    <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300 group">
                        <div className="w-12 h-12 bg-gradient-to-r from-purple-100 to-indigo-100 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <PenTool className="w-6 h-6 text-purple-600" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-4">Share Your Voice</h3>
                        <p className="text-slate-600 leading-relaxed">
                            Write and publish your stories with our intuitive editor. Share your unique perspective with the world.
                        </p>
                    </div>

                    {/* Feature 3 */}
                    <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300 group">
                        <div className="w-12 h-12 bg-gradient-to-r from-indigo-100 to-blue-100 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <Users className="w-6 h-6 text-indigo-600" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-4">Build Community</h3>
                        <p className="text-slate-600 leading-relaxed">
                            Connect with like-minded readers and writers. Like, comment, and engage with content that inspires you.
                        </p>
                    </div>
                </div>
            </div>

            {/* CTA Section */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-8 md:p-12 text-center text-white shadow-2xl">
                    <TrendingUp className="w-16 h-16 mx-auto mb-6 opacity-80" />
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">
                        Ready to Start Your Journey?
                    </h2>
                    <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
                        Join our growing community of passionate writers and readers. Your story matters.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button
                            onClick={() => setShowAuthModal(true)}
                            className="px-8 py-3 bg-white text-blue-600 rounded-full font-semibold hover:bg-gray-100 transition-all duration-300 shadow-lg"
                        >
                            Get Started
                        </Button>
                        <Link href="/home">
                            <button className="px-8 py-3 border-2 border-white text-white rounded-full font-semibold hover:bg-white hover:text-blue-600 transition-all duration-300">
                                Browse Stories
                            </button>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Auth Modal */}
            <AuthModal
                isOpen={showAuthModal}
                onClose={() => setShowAuthModal(false)}
            />
        </GradientBackground>
    );
}
