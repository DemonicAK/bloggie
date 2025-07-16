'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Heart, BookOpen, Coffee, Users, Feather } from 'lucide-react';
import AuthModal from '@/components/AuthModal';
import { Button } from '@/components/ui/button';

export default function LandingPage() {
    const [showAuthModal, setShowAuthModal] = useState(false);

    return (
        <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
            {/* Hero Section */}
            <div className="relative pt-16 pb-12">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <div className="inline-flex items-center justify-center mb-8">
                            <div className="bg-amber-100 p-4 rounded-2xl shadow-lg rotate-3 hover:rotate-0 transition-transform duration-300">
                                <Heart className="h-12 w-12 text-red-500" fill="currentColor" />
                            </div>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-bold text-gray-800 mb-6 leading-tight">
                            Stories That Matter,
                            <br />
                            <span className="text-amber-600 italic">Voices That Inspire</span>
                        </h1>
                        <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed font-light">
                            Welcome to a cozy corner of the internet where real people share real stories.
                            No algorithms, no noise—just authentic voices and meaningful connections.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                            <Link href="/home">
                                <button className="px-8 py-4 bg-amber-500 text-white rounded-lg font-medium hover:bg-amber-600 transition-colors duration-200 shadow-md hover:shadow-lg text-lg">
                                    Discover Stories
                                </button>
                            </Link>
                            <Button
                                onClick={() => setShowAuthModal(true)}
                                className="px-8 py-4 border-2 border-amber-500 text-amber-700 rounded-lg font-medium hover:bg-amber-50 transition-colors duration-200 bg-white text-lg"
                            >
                                Share Your Story
                            </Button>
                        </div>
                        <div className="mt-8 text-sm text-gray-500">
                            ✨ Join 2,847 storytellers and counting
                        </div>
                    </div>
                </div>
            </div>

            {/* Personal Touch Section */}
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="bg-white rounded-3xl p-8 md:p-12 shadow-lg border border-gray-100">
                    <div className="text-center mb-12">
                        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
                            Why We Built Bloggie
                        </h2>
                        <div className="w-16 h-1 bg-amber-400 mx-auto rounded-full mb-6"></div>
                        <p className="text-gray-600 max-w-2xl mx-auto text-lg leading-relaxed">
                            We believe everyone has a story worth telling. In a world full of noise,
                            we wanted to create a quiet space where authentic voices can be heard and appreciated.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Feature 1 */}
                        <div className="text-center group">
                            <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-105 transition-transform duration-200 shadow-sm">
                                <BookOpen className="w-8 h-8 text-blue-600" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-800 mb-3">Curated Stories</h3>
                            <p className="text-gray-600 leading-relaxed">
                                Every story is hand-picked and thoughtfully presented. No clickbait,
                                just genuine content that enriches your day.
                            </p>
                        </div>

                        {/* Feature 2 */}
                        <div className="text-center group">
                            <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-105 transition-transform duration-200 shadow-sm">
                                <Feather className="w-8 h-8 text-green-600" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-800 mb-3">Simple Writing</h3>
                            <p className="text-gray-600 leading-relaxed">
                                Our distraction-free editor helps you focus on what matters most—
                                your words and your message.
                            </p>
                        </div>

                        {/* Feature 3 */}
                        <div className="text-center group">
                            <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-105 transition-transform duration-200 shadow-sm">
                                <Users className="w-8 h-8 text-purple-600" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-800 mb-3">Meaningful Connections</h3>
                            <p className="text-gray-600 leading-relaxed">
                                Connect with readers who truly appreciate your work.
                                Build relationships that go beyond likes and follows.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Testimonial-like Section */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="bg-gradient-to-r from-amber-400 to-orange-400 rounded-3xl p-8 md:p-12 text-white shadow-xl relative overflow-hidden">
                    <div className="absolute top-4 right-4 opacity-20">
                        <Coffee className="w-24 h-24" />
                    </div>
                    <div className="relative">
                        <div className="text-center">
                            <p className="text-xl md:text-2xl font-light italic mb-6 leading-relaxed">
                                "This feels like the old internet—when sharing stories meant something,
                                and every click led to a human connection."
                            </p>
                            <div className="text-amber-100 text-sm">
                                — Sarah, one of our first writers
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Final CTA */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">
                        Ready to Be Part of Something Real?
                    </h2>
                    <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
                        Whether you're here to read, write, or just explore—you're welcome.
                        Let's build a community that values substance over spectacle.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button
                            onClick={() => setShowAuthModal(true)}
                            className="px-10 py-4 bg-gray-800 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors duration-200 shadow-lg text-lg"
                        >
                            Start Writing Today
                        </Button>
                        <Link href="/home">
                            <button className="px-10 py-4 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:border-gray-400 hover:bg-gray-50 transition-colors duration-200 text-lg">
                                Explore Stories
                            </button>
                        </Link>
                    </div>
                    <div className="mt-6 text-sm text-gray-500">
                        No spam, no pressure. Just good stories. 📚
                    </div>
                </div>
            </div>

            {/* Auth Modal */}
            <AuthModal
                isOpen={showAuthModal}
                onClose={() => setShowAuthModal(false)}
            />
        </div>
    );
}
