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

import { UserFormData, AuthModalProps } from '@/types';

const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login'
}) => {
  // State management for authentication modal
  const [isLoginMode, setIsLoginMode] = useState<boolean>(initialMode === 'login');
  const [userFormData, setUserFormData] = useState<UserFormData>({
    email: '',
    password: '',
    username: '',
    displayName: '',
    profileImage: ''
  });

  // Form validation and user feedback states
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isSubmittingForm, setIsSubmittingForm] = useState<boolean>(false);
  const [isUsernameAvailable, setIsUsernameAvailable] = useState<boolean | null>(null);
  const [isCheckingUsername, setIsCheckingUsername] = useState<boolean>(false);

  // Get authentication methods from context
  const { login, register } = useAuth();

  // Function to validate username availability
  const checkUsernameAvailability = useCallback(async (usernameToCheck: string) => {
    // console.log('Checking username availability:', usernameToCheck); // Debug
    setIsCheckingUsername(true);
    try {
      const usernameExists = await checkUsernameExists(usernameToCheck);
      setIsUsernameAvailable(!usernameExists);
      // console.log('Username check result:', !usernameExists); // Debug
    } catch (error) {
      console.error('Error checking username availability:', error);
      setIsUsernameAvailable(null);
    } finally {
      setIsCheckingUsername(false);
    }
  }, []);

  // Effect to check username availability when user types
  useEffect(() => {
    if (!isLoginMode && userFormData.username) {
      const timeoutId = setTimeout(() => {
        checkUsernameAvailability(userFormData.username.toLowerCase().trim());
      }, 500);
      return () => clearTimeout(timeoutId);
    } else {
      setIsUsernameAvailable(null);
    }
  }, [userFormData.username, isLoginMode, checkUsernameAvailability]);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    setValidationErrors([]); // Clear errors when user types
  };

  // Handle profile image upload
  const handleImageUpload = (imageUrl: string) => {
    setUserFormData(prev => ({
      ...prev,
      profileImage: imageUrl
    }));
    setValidationErrors([]); // Clear errors when user uploads image
  };

  // Validate form inputs before submission
  const validateFormInputs = (): string[] => {
    const newErrors: string[] = [];

    if (!userFormData.email) {
      newErrors.push('Email address is required');
    } else if (!/\S+@\S+\.\S+/.test(userFormData.email)) {
      newErrors.push('Please enter a valid email address');
    }

    if (!userFormData.password) {
      newErrors.push('Password is required');
    } else if (userFormData.password.length < 6) {
      newErrors.push('Password must be at least 6 characters long');
    }

    if (!isLoginMode) {
      if (!userFormData.username) {
        newErrors.push('Username is required for registration');
      } else if (userFormData.username.length < 3) {
        newErrors.push('Username must be at least 3 characters long');
      } else if (!/^[a-zA-Z0-9_]+$/.test(userFormData.username)) {
        newErrors.push('Username can only contain letters, numbers, and underscores');
      } else if (isUsernameAvailable === false) {
        newErrors.push('This username is already taken');
      }

      if (!userFormData.displayName) {
        newErrors.push('Display name is required for registration');
      }
    }

    return newErrors;
  };

  // Handle form submission
  const handleFormSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    // console.log('Form submission started:', { isLoginMode, userFormData }); // testing

    const formErrors = validateFormInputs();
    if (formErrors.length > 0) {
      setValidationErrors(formErrors);
      return;
    }

    setIsSubmittingForm(true);
    setValidationErrors([]);

    try {
      if (isLoginMode) {
        // console.log('Attempting login...'); // Debug
        await login(userFormData.email, userFormData.password);
      } else {
        // console.log('Attempting registration...'); // Debug
        await register(
          userFormData.email,
          userFormData.password,
          userFormData.username.toLowerCase().trim(),
          userFormData.displayName,
          userFormData.profileImage
        );
      }
      // console.log('Authentication successful'); // Debug
      onClose();
    } catch (error: unknown) {
      console.error('Authentication error:', error);
      setValidationErrors([error instanceof Error ? error.message : 'An unexpected error occurred']);
    } finally {
      setIsSubmittingForm(false);
    }
  };

  // Reset form when modal closes or mode changes
  const resetFormData = () => {
    setUserFormData({
      email: '',
      password: '',
      username: '',
      displayName: '',
      profileImage: ''
    });
    setValidationErrors([]);
    setIsUsernameAvailable(null);
  };

  // Switch between login and registration modes
  const switchAuthMode = () => {
    setIsLoginMode(!isLoginMode);
    resetFormData();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            {isLoginMode ? 'Welcome Back!' : 'Create Your Account'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleFormSubmission} className="space-y-4">
          {/* Email input field */}
          <div>
            <Input
              type="email"
              name="email"
              placeholder="Enter your email address"
              value={userFormData.email}
              onChange={handleInputChange}
              required
              className="w-full"
            />
          </div>

          {/* Password input field */}
          <div>
            <Input
              type="password"
              name="password"
              placeholder="Enter your password"
              value={userFormData.password}
              onChange={handleInputChange}
              required
              className="w-full"
            />
          </div>

          {/* Registration-only fields */}
          {!isLoginMode && (
            <>
              {/* Username input with availability check */}
              <div>
                <Input
                  type="text"
                  name="username"
                  placeholder="Choose a unique username"
                  value={userFormData.username}
                  onChange={handleInputChange}
                  required
                  className="w-full"
                />
                {userFormData.username && (
                  <div className="mt-1 text-sm">
                    {isCheckingUsername ? (
                      <span className="text-gray-500">Checking availability...</span>
                    ) : isUsernameAvailable === true ? (
                      <span className="text-green-600">✓ Username is available</span>
                    ) : isUsernameAvailable === false ? (
                      <span className="text-red-600">✗ Username is taken</span>
                    ) : null}
                  </div>
                )}
              </div>

              {/* Display name input */}
              <div>
                <Input
                  type="text"
                  name="displayName"
                  placeholder="Enter your display name"
                  value={userFormData.displayName}
                  onChange={handleInputChange}
                  required
                  className="w-full"
                />
              </div>

              {/* Profile image upload */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Profile Picture (Optional)
                </label>
                <ImageUpload
                  onImageChange={handleImageUpload}
                  currentImage={userFormData.profileImage}
                />
              </div>
            </>
          )}

          {/* Error messages display */}
          {validationErrors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              {validationErrors.map((errorMessage, index) => (
                <p key={index} className="text-red-600 text-sm">
                  {errorMessage}
                </p>
              ))}
            </div>
          )}

          {/* Submit button */}
          <Button
            type="submit"
            disabled={isSubmittingForm || (!isLoginMode && isCheckingUsername)}
            className="w-full"
          >
            {isSubmittingForm
              ? (isLoginMode ? 'Signing In...' : 'Creating Account...')
              : (isLoginMode ? 'Sign In' : 'Create Account')
            }
          </Button>

          {/* Mode switch button */}
          <div className="text-center">
            <button
              type="button"
              onClick={switchAuthMode}
              className="text-blue-600 hover:text-blue-800 text-sm underline"
            >
              {isLoginMode
                ? "Don't have an account? Sign up here"
                : "Already have an account? Sign in here"
              }
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
