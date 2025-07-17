'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
    Code2,
    Terminal,
    Database,
    Cloud,
    Cpu,
    GitBranch,
    Zap,
    Users,
    BookOpen,
    Rocket
} from 'lucide-react';
import AuthModal from '@/components/AuthModal';
import { Button } from '@/components/ui/button';

export default function LandingPage() {
    const [showAuthModal, setShowAuthModal] = useState(false);

    return (
        <div className="min-h-screen bg-background text-foreground">
            {/* Hero Section */}
            <div className="relative pt-16 pb-12">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <div className="inline-flex items-center justify-center mb-8">
                            <div className="bg-gradient-to-r from-cyan-500 to-blue-600 p-4 rounded-2xl shadow-lg hover:scale-105 transition-transform duration-300">
                                <Code2 className="h-12 w-12 text-white" />
                            </div>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                            Code. Learn. Share.
                            <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                                Build The Future
                            </span>
                        </h1>
                        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
                            Join the premier technical blogging platform where developers share insights,
                            tutorials, and breakthrough discoveries that shape the tech landscape.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                            <Link href="/home">
                                <button className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg font-medium hover:from-cyan-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl text-lg">
                                    Explore Tech Articles
                                </button>
                            </Link>
                            <Button
                                onClick={() => setShowAuthModal(true)}
                                className="px-8 py-4 border-2 border-border bg-card text-card-foreground rounded-lg font-medium hover:bg-accent transition-colors duration-200 text-lg"
                            >
                                Start Writing Code
                            </Button>
                        </div>
                        <div className="mt-8 text-sm text-muted-foreground">
                            🚀 Join 10,000+ developers sharing knowledge
                        </div>
                    </div>
                </div>
            </div>

            {/* Tech Focus Section */}
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="bg-card rounded-3xl p-8 md:p-12 shadow-xl border border-border">
                    <div className="text-center mb-12">
                        <h2 className="text-2xl md:text-3xl font-bold mb-4">
                            Built by Developers, for Developers
                        </h2>
                        <div className="w-16 h-1 bg-gradient-to-r from-cyan-400 to-blue-500 mx-auto rounded-full mb-6"></div>
                        <p className="text-muted-foreground max-w-2xl mx-auto text-lg leading-relaxed">
                            We understand the unique challenges of technical writing. Our platform is designed
                            to help you share complex ideas with clarity and precision.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Feature 1 */}
                        <div className="text-center group">
                            <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-105 transition-transform duration-200 shadow-lg">
                                <Code2 className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-xl font-semibold mb-3">Syntax Highlighting</h3>
                            <p className="text-muted-foreground leading-relaxed">
                                Beautiful code blocks with support for 100+ programming languages.
                                Make your tutorials crystal clear.
                            </p>
                        </div>

                        {/* Feature 2 */}
                        <div className="text-center group">
                            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-105 transition-transform duration-200 shadow-lg">
                                <GitBranch className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-xl font-semibold mb-3">Version Control</h3>
                            <p className="text-muted-foreground leading-relaxed">
                                Track changes to your articles, collaborate with reviewers,
                                and maintain a history of your technical content.
                            </p>
                        </div>

                        {/* Feature 3 */}
                        <div className="text-center group">
                            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-105 transition-transform duration-200 shadow-lg">
                                <Zap className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-xl font-semibold mb-3">Performance First</h3>
                            <p className="text-muted-foreground leading-relaxed">
                                Lightning-fast load times and optimized for search engines.
                                Your content deserves to be discovered.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tech Stack Showcase */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="bg-gradient-to-r from-slate-900 to-slate-800 dark:from-slate-800 dark:to-slate-900 rounded-3xl p-8 md:p-12 text-white shadow-2xl relative overflow-hidden">
                    <div className="absolute top-4 right-4 opacity-20">
                        <Database className="w-24 h-24" />
                    </div>
                    <div className="relative">
                        <div className="text-center">
                            <h3 className="text-2xl md:text-3xl font-bold mb-6">
                                Popular Topics on Bloggie
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                                <div className="flex items-center space-x-2 bg-white/10 rounded-lg p-3">
                                    <Terminal className="w-5 h-5" />
                                    <span className="text-sm">DevOps</span>
                                </div>
                                <div className="flex items-center space-x-2 bg-white/10 rounded-lg p-3">
                                    <Code2 className="w-5 h-5" />
                                    <span className="text-sm">React</span>
                                </div>
                                <div className="flex items-center space-x-2 bg-white/10 rounded-lg p-3">
                                    <Cloud className="w-5 h-5" />
                                    <span className="text-sm">AWS</span>
                                </div>
                                <div className="flex items-center space-x-2 bg-white/10 rounded-lg p-3">
                                    <Cpu className="w-5 h-5" />
                                    <span className="text-sm">AI/ML</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Final CTA */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="text-center">
                    <h2 className="text-3xl md:text-4xl font-bold mb-6">
                        Ready to Share Your Tech Knowledge?
                    </h2>
                    <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                        Whether you're sharing a quick tip or writing an in-depth tutorial,
                        join thousands of developers building the future through knowledge sharing.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button
                            onClick={() => setShowAuthModal(true)}
                            className="px-10 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg font-medium hover:from-cyan-600 hover:to-blue-700 transition-all duration-200 shadow-lg text-lg"
                        >
                            Start Your Tech Blog
                        </Button>
                        <Link href="/home">
                            <button className="px-10 py-4 border-2 border-border bg-card text-card-foreground rounded-lg font-medium hover:bg-accent transition-colors duration-200 text-lg">
                                Explore Articles
                            </button>
                        </Link>
                    </div>
                    <div className="mt-6 text-sm text-muted-foreground">
                        No fluff, just code. 💻
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
