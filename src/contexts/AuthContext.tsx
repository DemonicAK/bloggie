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

          // Handle createdAt field safely
          let createdAt: Date;
          if (userData.createdAt instanceof Date) {
            createdAt = userData.createdAt;
          } else if (userData.createdAt && typeof userData.createdAt === 'object' && 'toDate' in userData.createdAt) {
            // Handle Firestore Timestamp
            createdAt = (userData.createdAt as any).toDate();
          } else if (userData.createdAt) {
            // Try to parse as string or number
            const dateValue = new Date(userData.createdAt as any);
            createdAt = isNaN(dateValue.getTime()) ? new Date() : dateValue;
          } else {
            // Fallback to current date
            createdAt = new Date();
          }

          const userWithPhoto = {
            ...userData,
            photoURL: userData.photoURL || firebaseUser.photoURL || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face&auto=format&q=80",
            createdAt: createdAt
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
      // Trim username for checking and storage
      const trimmedUsername = username.trim();

      // Check if username already exists (this is a safety check, UI should handle this)
      const usernameExists = await checkUsernameExists(trimmedUsername);
      if (usernameExists) {
        throw new Error('Username is already taken. Please choose a different username.');
      }

      const { user: firebaseUser } = await createUserWithEmailAndPassword(auth, email, password);

      // Update profile
      await updateProfile(firebaseUser, {
        displayName: displayName,
        photoURL: profilePhoto,
      });

      // Create user document in Firestore
      const userData: User = {
        uid: firebaseUser.uid,
        email,
        username: trimmedUsername,
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

        // Handle createdAt field safely
        let createdAt: Date;
        if (userData.createdAt instanceof Date) {
          createdAt = userData.createdAt;
        } else if (userData.createdAt && typeof userData.createdAt === 'object' && 'toDate' in userData.createdAt) {
          // Handle Firestore Timestamp
          createdAt = (userData.createdAt as any).toDate();
        } else if (userData.createdAt) {
          // Try to parse as string or number
          const dateValue = new Date(userData.createdAt as any);
          createdAt = isNaN(dateValue.getTime()) ? new Date() : dateValue;
        } else {
          // Fallback to current date
          createdAt = new Date();
        }

        setUser({
          ...userData,
          createdAt: createdAt
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

      // Prepare the updated user data, ensuring dates are properly handled
      const updatedUserData = { ...user, ...updates };

      // Ensure createdAt is a valid Date
      let validCreatedAt: Date;
      if (updatedUserData.createdAt instanceof Date && !isNaN(updatedUserData.createdAt.getTime())) {
        validCreatedAt = updatedUserData.createdAt;
      } else if (updatedUserData.createdAt && typeof updatedUserData.createdAt === 'object' && 'toDate' in updatedUserData.createdAt) {
        // Handle Firestore Timestamp
        validCreatedAt = (updatedUserData.createdAt as any).toDate();
      } else {
        // Fallback to current date if invalid
        validCreatedAt = new Date();
      }

      // Prepare data for Firestore with proper date handling
      const firestoreData = {
        uid: updatedUserData.uid,
        username: updatedUserData.username,
        email: updatedUserData.email,
        displayName: updatedUserData.displayName,
        photoURL: updatedUserData.photoURL,
        createdAt: validCreatedAt
      };

      // Update Firestore document
      await setDoc(doc(db, 'users', user.uid), firestoreData);

      // Update local state with the properly formatted data
      const finalUserData = { ...updatedUserData, createdAt: validCreatedAt };
      setUser(finalUserData);
    } catch (error) {
      console.error('Error updating user profile:', error);
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
