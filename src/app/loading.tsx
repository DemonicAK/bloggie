'use client';

import React from 'react';
import { GradientBackground } from '@/components/ui/animated';
import { Sparkles } from 'lucide-react';

export default function Loading() {
    return (
        <>
            {/* Custom CSS for Zig Zag Animation */}
            <style jsx>{`
                @keyframes zigzagMove {
                    0% {
                        transform: translateX(-120px) translateY(0px);
                        opacity: 0;
                    }
                    10% {
                        opacity: 1;
                    }
                    25% {
                        transform: translateX(-80px) translateY(-32px);
                    }
                    37.5% {
                        transform: translateX(-40px) translateY(0px);
                    }
                    50% {
                        transform: translateX(0px) translateY(-32px);
                    }
                    62.5% {
                        transform: translateX(40px) translateY(0px);
                    }
                    75% {
                        transform: translateX(80px) translateY(-32px);
                    }
                    90% {
                        transform: translateX(120px) translateY(0px);
                        opacity: 1;
                    }
                    100% {
                        transform: translateX(120px) translateY(0px);
                        opacity: 0;
                    }
                }
                
                @keyframes pulseGlow {
                    0%, 100% {
                        box-shadow: 0 0 20px rgba(59, 130, 246, 0.5);
                    }
                    50% {
                        box-shadow: 0 0 40px rgba(139, 92, 246, 0.8);
                    }
                }
            `}</style>

            <GradientBackground>
                <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center">
                        {/* Zig Zag Loading Animation */}
                        <div className="relative mb-8">
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur-xl opacity-20 animate-pulse"></div>

                            {/* Zig Zag Container */}
                            <div className="relative flex items-center justify-center h-24 w-64 mx-auto">
                                {/* Zig Zag Path */}
                                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 256 96" fill="none">
                                    <path
                                        d="M16 48 L48 16 L80 48 L112 16 L144 48 L176 16 L208 48 L240 16"
                                        stroke="url(#zigzagGradient)"
                                        strokeWidth="3"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        className="opacity-30"
                                    />
                                    <defs>
                                        <linearGradient id="zigzagGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                            <stop offset="0%" stopColor="#3b82f6" />
                                            <stop offset="100%" stopColor="#8b5cf6" />
                                        </linearGradient>
                                    </defs>
                                </svg>

                                {/* Animated Dots Following Zig Zag Path */}
                                <div className="absolute inset-0 flex items-center justify-center">
                                    {[...Array(5)].map((_, index) => (
                                        <div
                                            key={index}
                                            className="absolute w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full shadow-lg"
                                            style={{
                                                animationName: 'zigzagMove, pulseGlow',
                                                animationDuration: '2s, 1s',
                                                animationTimingFunction: 'ease-in-out, ease-in-out',
                                                animationIterationCount: 'infinite, infinite',
                                                animationDirection: 'normal, alternate',
                                                animationDelay: `${index * 0.2}s`,
                                                filter: 'brightness(1.2)',
                                            }}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Central Sparkle Icon */}
                            <Sparkles className="relative h-12 w-12 text-blue-600 mx-auto mt-4 animate-pulse" />
                        </div>

                        {/* Loading Text */}
                        <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                            Loading Amazing Stories...
                        </h2>
                        <p className="text-slate-600">
                            Please wait while we prepare something wonderful for you
                        </p>
                    </div>
                </div>
            </GradientBackground>
        </>
    );
}
