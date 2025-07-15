'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User as FirebaseUser,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { User } from '@/types';
import { checkUsernameExists } from '@/lib/blogService';

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  register: (email: string, password: string, username: string, displayName: string, profilePhoto?: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (updates: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setFirebaseUser(firebaseUser);

      if (firebaseUser) {
        // Get user data from Firestore
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data() as User;
          // Ensure photoURL is available - fallback to Firebase Auth photoURL if not in Firestore
          const userWithPhoto = {
            ...userData,
            photoURL: userData.photoURL || firebaseUser.photoURL || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face&auto=format&q=80",
            createdAt: userData.createdAt instanceof Date ? userData.createdAt : new Date(userData.createdAt)
          };
          setUser(userWithPhoto);
        } else {
          // If user doesn't exist in Firestore, create a basic user object
          const basicUser: User = {
            uid: firebaseUser.uid,
            email: firebaseUser.email || '',
            username: firebaseUser.email?.split('@')[0] || '',
            photoURL: firebaseUser.photoURL || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face&auto=format&q=80",
            displayName: firebaseUser.displayName || "HitlerIsBack",
            createdAt: new Date(),
          };
          setUser(basicUser);
        }
      } else {
        setUser(null);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const register = async (email: string, password: string, username: string, displayName: string, profilePhoto?: string) => {
    setLoading(true);
    try {
      // Normalize username to lowercase and trim whitespace
      // const normalizedUsername = username.toLowerCase().trim();
      const normalizedUsername = username.trim();

      // Check if username already exists
      const usernameExists = await checkUsernameExists(normalizedUsername);
      if (usernameExists) {
        throw new Error('Username is already taken. Please choose a different username.');
      }

      const { user: firebaseUser } = await createUserWithEmailAndPassword(auth, email, password);

      // Update profile
      await updateProfile(firebaseUser, {
        displayName: displayName,
        photoURL: profilePhoto,
      });

      // Create user document in Firestore with both original and normalized username
      const userData: User = {
        uid: firebaseUser.uid,
        email,
        username: username, // Keep original format
        displayName,
        photoURL: profilePhoto || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face&auto=format&q=80",
        createdAt: new Date(),
      };

      await setDoc(doc(db, 'users', firebaseUser.uid), userData);
      setUser(userData);
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const loginWithGoogle = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const { user: firebaseUser } = await signInWithPopup(auth, provider);

      // Check if user document exists in Firestore
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));

      if (!userDoc.exists()) {
        // New user, create user document
        // Generate a username from email or displayName
        const emailPrefix = firebaseUser.email?.split('@')[0] || '';
        const baseUsername = firebaseUser.displayName?.toLowerCase().replace(/\s+/g, '') || emailPrefix;

        // Ensure username is unique
        let username = baseUsername;
        let counter = 1;
        while (await checkUsernameExists(username)) {
          username = `${baseUsername}${counter}`;
          counter++;
        }

        const userData: User = {
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          username: username,
          displayName: firebaseUser.displayName || username,
          photoURL: firebaseUser.photoURL || undefined,
          createdAt: new Date(),
        };

        await setDoc(doc(db, 'users', firebaseUser.uid), userData);
        setUser(userData);
      } else {
        // Existing user, load user data
        const userData = userDoc.data() as User;
        setUser({
          ...userData,
          createdAt: userData.createdAt instanceof Date ? userData.createdAt : new Date(userData.createdAt)
        });
      }
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  const updateUserProfile = async (updates: Partial<User>) => {
    if (!user || !firebaseUser) {
      throw new Error('No user logged in');
    }

    setLoading(true);
    try {
      // Update Firebase Auth profile if photoURL or displayName is being updated
      if (updates.photoURL !== undefined || updates.displayName !== undefined) {
        await updateProfile(firebaseUser, {
          displayName: updates.displayName || firebaseUser.displayName,
          photoURL: updates.photoURL || firebaseUser.photoURL,
        });
      }

      // Update Firestore document
      const updatedUserData = { ...user, ...updates };
      await setDoc(doc(db, 'users', user.uid), updatedUserData);

      // Update local state
      setUser(updatedUserData);
    } catch (error) {
      setLoading(false);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    firebaseUser,
    loading,
    login,
    loginWithGoogle,
    register,
    logout,
    updateUserProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
