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
  const { login, register } = useAuth();
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
