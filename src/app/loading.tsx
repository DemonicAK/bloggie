'use client';

import React from 'react';
import { GradientBackground } from '@/components/ui/animated';
import { Loader2, Sparkles } from 'lucide-react';

export default function Loading() {
    return (
        <GradientBackground>
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    {/* Loading Animation */}
                    <div className="relative mb-6">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur-xl opacity-30 animate-pulse"></div>
                        <Sparkles className="relative h-16 w-16 text-blue-600 mx-auto mb-4" />
                        <Loader2 className="relative h-8 w-8 animate-spin text-blue-600 mx-auto" />
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
    );
}
