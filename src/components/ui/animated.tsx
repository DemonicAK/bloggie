'use client';

import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface FloatingCardProps {
    children: ReactNode;
    className?: string;
    delay?: number;
}

export const FloatingCard: React.FC<FloatingCardProps> = ({
    children,
    className = '',
    delay = 0
}) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
                duration: 0.5,
                delay,
                type: "spring",
                stiffness: 100,
                damping: 10
            }}
            whileHover={{
                y: -5,
                scale: 1.02,
                transition: { duration: 0.2 }
            }}
            className={`bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 ${className}`}
        >
            {children}
        </motion.div>
    );
};

export const GradientBackground: React.FC<{ children: ReactNode }> = ({ children }) => {
    return (
        <div className="relative min-h-screen overflow-hidden">
            {/* Animated gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
                <div className="absolute top-10 left-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
                <div className="absolute top-0 right-4 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
                <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
            </div>

            {/* Content */}
            <div className="relative z-10">
                {children}
            </div>
        </div>
    );
};

export const AnimatedCounter: React.FC<{ value: number; suffix?: string }> = ({
    value,
    suffix = ''
}) => {
    return (
        <motion.span
            key={value}
            initial={{ scale: 1.2, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3, type: "spring" }}
            className="inline-block"
        >
            {value}{suffix}
        </motion.span>
    );
};

export const GlowingButton: React.FC<{
    children: ReactNode;
    onClick?: () => void;
    className?: string;
    disabled?: boolean;
}> = ({ children, onClick, className = '', disabled = false }) => {
    return (
        <motion.button
            onClick={onClick}
            disabled={disabled}
            whileHover={{ scale: disabled ? 1 : 1.05 }}
            whileTap={{ scale: disabled ? 1 : 0.95 }}
            className={`relative px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:from-blue-700 hover:to-purple-700'
                } ${className}`}
        >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur-sm opacity-30 -z-10"></div>
            {children}
        </motion.button>
    );
};
