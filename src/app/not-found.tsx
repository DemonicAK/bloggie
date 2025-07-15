'use client';

import React from 'react';
import Link from 'next/link';
import { GradientBackground } from '@/components/ui/animated';
import { Home, ArrowLeft, BookOpen } from 'lucide-react';

export default function NotFound() {
    return (
        <GradientBackground>
            <div className="min-h-screen flex items-center justify-center px-4">
                <div className="text-center max-w-md mx-auto">
                    {/* 404 Animation */}
                    <div className="mb-8">
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur-xl opacity-30 animate-pulse"></div>
                            <div className="relative text-8xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                                404
                            </div>
                        </div>
                    </div>

                    {/* Error Message */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-slate-900 mb-4">
                            Oops! Page Not Found
                        </h1>
                        <p className="text-slate-600 text-lg leading-relaxed">
                            The page you&apos;re looking for seems to have wandered off into the digital void.
                            Don&apos;t worry, even the best stories sometimes take unexpected turns!
                        </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            href="/"
                            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-full hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                        >
                            <Home className="w-4 h-4 mr-2" />
                            Back to Home
                        </Link>

                        <button
                            onClick={() => window.history.back()}
                            className="inline-flex items-center px-6 py-3 border-2 border-blue-600 text-blue-600 font-semibold rounded-full hover:bg-blue-600 hover:text-white transition-all duration-300"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Go Back
                        </button>
                    </div>

                    {/* Decorative Element */}
                    <div className="mt-12 opacity-50">
                        <BookOpen className="w-16 h-16 mx-auto text-slate-400" />
                    </div>
                </div>
            </div>
        </GradientBackground>
    );
}
