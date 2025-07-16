'use client';

import React from 'react';
import { Heart } from 'lucide-react';

const Footer: React.FC = () => {
    return (
        <footer className="bg-white border-t border-slate-200/60 py-8 mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col items-center space-y-3">
                    {/* Main footer text */}
                    <div className="flex items-center justify-center text-slate-600 text-sm font-medium">
                        <span>© Arijit Kar 2025, made with</span>
                        <Heart className="h-4 w-4 mx-2 text-red-500 fill-current animate-pulse" />
                    </div>

                    {/* Links and contact info */}
                    <div className="flex flex-col sm:flex-row items-center gap-4 text-xs text-slate-500">
                        <a
                            href="https://arijitkar.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-blue-600 transition-colors duration-200 underline decoration-dotted underline-offset-2"
                        >
                            Visit arijitkar.com
                        </a>
                        <span className="hidden sm:inline">•</span>
                        <a
                            href="mailto:connect@arijitkar.com"
                            className="hover:text-blue-600 transition-colors duration-200 underline decoration-dotted underline-offset-2"
                        >
                            connect@arijitkar.com
                        </a>
                        <span className="hidden sm:inline">•</span>
                        <a
                            href="mailto:privacy@arijitkar.com"
                            className="hover:text-blue-600 transition-colors duration-200 underline decoration-dotted underline-offset-2"
                        >
                            privacy@arijitkar.com
                        </a>
                        <span className="hidden sm:inline">•</span>
                        <a
                            href="https://github.com/DemonicAK/bloggie"
                            className="hover:text-blue-600 transition-colors duration-200 underline decoration-dotted underline-offset-2"
                        >
                            codebase 
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
