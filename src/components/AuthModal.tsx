'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import ImageUpload from '@/components/ui/ImageUpload';
import { checkUsernameExists } from '@/lib/blogService';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { login, register, loginWithGoogle } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: '',
    displayName: '',
    confirmPassword: '',
    profilePhoto: ''
  });
  const [errors, setErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [usernameChecking, setUsernameChecking] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);

  // Debounced username availability check
  const checkUsernameAvailability = useCallback(async (username: string) => {
    if (!username || username.length < 3) {
      setUsernameAvailable(null);
      return;
    }

    setUsernameChecking(true);
    try {
      const exists = await checkUsernameExists(username);
      setUsernameAvailable(!exists);
    } catch (error) {
      console.error('Error checking username:', error);
      setUsernameAvailable(null);
    } finally {
      setUsernameChecking(false);
    }
  }, []);

  // Debounce the username check
  useEffect(() => {
    if (!isLogin && formData.username) {
      const timeoutId = setTimeout(() => {
        checkUsernameAvailability(formData.username.toLowerCase().trim());
      }, 500); // 500ms delay

      return () => clearTimeout(timeoutId);
    } else {
      setUsernameAvailable(null);
    }
  }, [formData.username, isLogin, checkUsernameAvailability]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setErrors([]); // Clear errors when user types
  };

  const handleImageChange = (imageUrl: string) => {
    setFormData(prev => ({
      ...prev,
      profilePhoto: imageUrl
    }));
    setErrors([]); // Clear errors when user uploads image
  };

  const validateForm = () => {
    const newErrors: string[] = [];

    if (!formData.email) {
      newErrors.push('Email is required');
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.push('Email is invalid');
    }

    if (!formData.password) {
      newErrors.push('Password is required');
    } else if (formData.password.length < 6) {
      newErrors.push('Password must be at least 6 characters');
    }

    if (!isLogin) {
      if (!formData.username) {
        newErrors.push('Username is required');
      } else if (formData.username.length < 3) {
        newErrors.push('Username must be at least 3 characters');
      } else if (formData.username.length > 20) {
        newErrors.push('Username must be less than 20 characters');
      } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
        newErrors.push('Username can only contain letters, numbers, and underscores');
      } else if (usernameAvailable === false) {
        newErrors.push('Username is already taken. Please choose a different username.');
      } else if (usernameChecking) {
        newErrors.push('Please wait while we check username availability');
      }

      if (!formData.displayName) {
        newErrors.push('Display name is required');
      } else if (formData.displayName.length < 2) {
        newErrors.push('Display name must be at least 2 characters');
      }

      if (!formData.confirmPassword) {
        newErrors.push('Please confirm your password');
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.push('Passwords do not match');
      }
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    try {
      if (isLogin) {
        await login(formData.email, formData.password);
      } else {
        await register(formData.email, formData.password, formData.username, formData.displayName, formData.profilePhoto);
      }
      onClose();
      setFormData({
        email: '',
        password: '',
        username: '',
        displayName: '',
        confirmPassword: '',
        profilePhoto: ''
      });
    } catch (error: unknown) {
      setErrors([error instanceof Error ? error.message : 'An error occurred']);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await loginWithGoogle();
      onClose();
      setFormData({
        email: '',
        password: '',
        username: '',
        displayName: '',
        confirmPassword: '',
        profilePhoto: ''
      });
    } catch (error: unknown) {
      setErrors([error instanceof Error ? error.message : 'An error occurred']);
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setErrors([]);
    setUsernameAvailable(null); // Reset username availability check
    setFormData({
      email: '',
      password: '',
      username: '',
      displayName: '',
      confirmPassword: '',
      profilePhoto: ''
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-yellow-300 p-6 rounded-lg shadow-lg opacity-70">
        <DialogHeader>
          <DialogTitle className="text-2xl text-center">
            {isLogin ? 'Welcome back' : 'Create account'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Error Messages */}
          {errors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              {errors.map((error, index) => (
                <p key={index} className="text-red-600 text-sm">{error}</p>
              ))}
            </div>
          )}
          {/* Profile Photo (Register only) */}
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Profile Photo (Optional)
              </label>
              <div className="flex justify-center">
                <ImageUpload
                  currentImage={formData.profilePhoto}
                  onImageChange={handleImageChange}
                  size="lg"
                  placeholder="Add photo"
                />
              </div>
            </div>
          )}

          {/* Email */}
          <div>
            <Input
              type="email"
              name="email"
              placeholder="Email address"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
          </div>

          {/* Username (Register only) */}
          {!isLogin && (
            <div>
              <div className="relative">
                <Input
                  type="text"
                  name="username"
                  placeholder="Username (e.g., johndoe)"
                  value={formData.username}
                  onChange={handleInputChange}
                  required
                  maxLength={20}
                  className={`pr-8 ${usernameAvailable === true ? 'border-green-500 focus:border-green-500' :
                    usernameAvailable === false ? 'border-red-500 focus:border-red-500' :
                      ''
                    }`}
                />
                {formData.username && formData.username.length >= 3 && (
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                    {usernameChecking ? (
                      <div className="animate-spin h-4 w-4 border-2 border-gray-300 border-t-blue-600 rounded-full"></div>
                    ) : usernameAvailable === true ? (
                      <svg className="h-4 w-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : usernameAvailable === false ? (
                      <svg className="h-4 w-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    ) : null}
                  </div>
                )}
              </div>
              <div className="mt-1">
                <p className="text-xs text-gray-500">
                  3-20 characters, letters, numbers, and underscores only. Will be converted to lowercase.
                </p>
                {formData.username && formData.username.length >= 3 && !usernameChecking && (
                  <p className={`text-xs mt-1 ${usernameAvailable === true ? 'text-green-600' :
                    usernameAvailable === false ? 'text-red-600' :
                      ''
                    }`}>
                    {usernameAvailable === true ? '✓ Username is available' :
                      usernameAvailable === false ? '✗ Username is already taken' :
                        ''}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Display Name (Register only) */}
          {!isLogin && (
            <div>
              <Input
                type="text"
                name="displayName"
                placeholder="Display name (e.g., John Doe)"
                value={formData.displayName}
                onChange={handleInputChange}
                required
              />
            </div>
          )}



          {/* Password */}
          <div>
            <Input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleInputChange}
              required
            />
          </div>

          {/* Confirm Password (Register only) */}
          {!isLogin && (
            <div>
              <Input
                type="password"
                name="confirmPassword"
                placeholder="Confirm password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                required
              />
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700"
            disabled={loading || (!!formData.username && usernameChecking)}
          >
            {loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Create Account')}
          </Button>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-yellow-300 px-2 text-gray-500">Or continue with</span>
            </div>
          </div>

          {/* Google Sign-In Button */}
          <Button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full bg-white hover:bg-gray-50 text-gray-900 border border-gray-300 flex items-center justify-center space-x-2"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            <span>{loading ? 'Please wait...' : `${isLogin ? 'Sign in' : 'Sign up'} with Google`}</span>
          </Button>

          {/* Toggle Mode */}
          <div className="text-center">
            <button
              type="button"
              onClick={toggleMode}
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
