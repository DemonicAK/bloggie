'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
    confirmPassword: ''
  });
  const [errors, setErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setErrors([]); // Clear errors when user types
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
      } else if (formData.username.length < 2) {
        newErrors.push('Username must be at least 2 characters');
      }

      if (!formData.displayName) {
        newErrors.push('Display name is required');
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
        await register(formData.email, formData.password, formData.username, formData.displayName);
      }
      onClose();
      setFormData({
        email: '',
        password: '',
        username: '',
        displayName: '',
        confirmPassword: ''
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
    setFormData({
      email: '',
      password: '',
      username: '',
      displayName: '',
      confirmPassword: ''
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
              <Input
                type="text"
                name="username"
                placeholder="Username (e.g., johndoe)"
                value={formData.username}
                onChange={handleInputChange}
                required
              />
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
            disabled={loading}
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
