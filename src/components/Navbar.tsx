'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import {
    User,
    LogOut,
    PenTool,
    Settings,
    ChevronDown,
    Sun,
    Moon,
    Terminal
} from 'lucide-react';
import AuthModal from './AuthModal';
import UserSettingsModal from './UserSettingsModal';

const Navbar = () => {
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [showSettingsModal, setShowSettingsModal] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleLogout = async () => {
        try {
            await logout();
            setShowDropdown(false);
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    return (
        <>
            <nav className="sticky top-0 z-50 backdrop-blur-xl border-b border-border/60">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        {/* Logo - Tech-focused */}
                        <Link href={user ? "/home" : "/landing"} className="flex items-center space-x-3 group">
                            <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg blur-sm opacity-30 group-hover:opacity-50 transition-opacity"></div>
                                <Terminal className="relative h-8 w-8 text-blue-500 group-hover:text-purple-600 transition-colors" />
                            </div>
                            <span className="text-xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
                                TechBlog
                            </span>
                        </Link>

                        {/* Center - Share Your Thought Button */}
                        <div className="flex-1 flex justify-center">
                            {user && (
                                <Link
                                    href="/dashboard"
                                    className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 group"
                                >
                                    <PenTool className="h-4 w-4 group-hover:scale-110 transition-transform" />
                                    <span className="font-medium">Share Your Thought</span>
                                </Link>
                            )}
                        </div>

                        {/* Right Side - Theme Toggle and User Actions */}
                        <div className="flex items-center space-x-4">
                            {/* Theme Toggle Switch */}
                            <button
                                onClick={toggleTheme}
                                className="relative inline-flex h-6 w-11 items-center rounded-full bg-muted hover:bg-accent transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
                            >
                                <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-background shadow-lg transition-transform duration-200 ease-in-out ${theme === 'dark' ? 'translate-x-6' : 'translate-x-1'
                                        }`}
                                >
                                    {theme === 'light' ? (
                                        <Sun className="h-3 w-3 text-yellow-500 absolute top-0.5 left-0.5" />
                                    ) : (
                                        <Moon className="h-3 w-3 text-blue-400 absolute top-0.5 left-0.5" />
                                    )}
                                </span>
                            </button>

                            {/* User Actions */}
                            {user ? (
                                <div className="relative" ref={dropdownRef}>
                                    {/* User Dropdown Trigger */}
                                    <button
                                        onClick={() => setShowDropdown(!showDropdown)}
                                        className="flex items-center space-x-2 hover:bg-accent rounded-lg p-2 transition-colors"
                                    >
                                        {user.photoURL ? (
                                            <Image
                                                src={user.photoURL}
                                                alt={user.displayName || user.username}
                                                width={32}
                                                height={32}
                                                className="h-8 w-8 rounded-full object-cover border-2 border-border"
                                            />
                                        ) : (
                                            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                                                <User className="h-4 w-4 text-primary-foreground" />
                                            </div>
                                        )}
                                        <span className="text-sm font-medium text-foreground hidden sm:block">
                                            {user.displayName || user.username}
                                        </span>
                                        <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
                                    </button>

                                    {/* Dropdown Menu */}
                                    {showDropdown && (
                                        <div className="absolute right-0 mt-2 w-56 bg-card rounded-lg shadow-lg border border-border py-2 z-50 ">
                                            {/* User Info */}
                                            <div className="px-4 py-3 border-b border-border">
                                                <p className="text-sm font-medium text-card-foreground">
                                                    {user.displayName || user.username}
                                                </p>
                                                <p className="text-sm text-muted-foreground">@{user.username}</p>
                                                <p className="text-xs text-muted-foreground mt-1">{user.email}</p>
                                            </div>

                                            {/* Menu Items */}
                                            <div className="py-1">
                                                <Link
                                                    href={`/user/${user.username}`}
                                                    className="flex items-center px-4 py-2 text-sm text-card-foreground hover:bg-accent transition-colors"
                                                    onClick={() => setShowDropdown(false)}
                                                >
                                                    <User className="h-4 w-4 mr-3" />
                                                    View Profile
                                                </Link>

                                                <button
                                                    onClick={() => {
                                                        setShowSettingsModal(true);
                                                        setShowDropdown(false);
                                                    }}
                                                    className="flex items-center w-full px-4 py-2 text-sm text-card-foreground hover:bg-accent transition-colors"
                                                >
                                                    <Settings className="h-4 w-4 mr-3" />
                                                    Settings
                                                </button>

                                                <hr className="my-1 border-border" />

                                                <button
                                                    onClick={handleLogout}
                                                    className="flex items-center w-full px-4 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                                                >
                                                    <LogOut className="h-4 w-4 mr-3" />
                                                    Sign Out
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <Button
                                    onClick={() => setShowAuthModal(true)}
                                    className="bg-primary hover:bg-primary/90 text-primary-foreground"
                                >
                                    Sign In
                                </Button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Auth Modal */}
                <AuthModal
                    isOpen={showAuthModal}
                    onClose={() => setShowAuthModal(false)}
                />

                {/* User Settings Modal */}
                <UserSettingsModal
                    isOpen={showSettingsModal}
                    onClose={() => setShowSettingsModal(false)}
                />
            </nav>
        </>
    );
};

export default Navbar;
