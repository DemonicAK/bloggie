'use client';

import React, { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function RootPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (user) {
        // Redirect authenticated users to home page
        router.replace('/home');
      } else {
        // Redirect unauthenticated users to landing page
        router.replace('/landing');
      }
    }
  }, [user, loading, router]);

  // Show loading spinner while determining redirect
  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary/80 rounded-full blur-sm opacity-30 animate-pulse"></div>
        <Loader2 className="relative h-8 w-8 animate-spin text-primary" />
      </div>
    </div>
  );
}
