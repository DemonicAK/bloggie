'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { checkUsernameExists } from '@/lib/blogService';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';

import { uploadToCloudinary, validateImageFile } from '@/lib/cloudinary';
// import { checkUsernameExists } from '@/lib/blogService';
// import { DialogProps } from '@/types';

import { UserFormData, AuthModalProps } from '@/types';
import ImageSelector from './ImageSelector';
import { Router } from 'lucide-react';
import { useRouter } from 'next/navigation';

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
  const router = useRouter();
  // Get authentication methods from context
  const { login, register, loginWithGoogle } = useAuth();

  // Function to validate username availability
  const checkUsernameAvailability = useCallback(async (usernameToCheck: string) => {
    // console.log('Checking username availability:', usernameToCheck); // test
    setIsCheckingUsername(true);
    try {
      const usernameExists = await checkUsernameExists(usernameToCheck);
      setIsUsernameAvailable(!usernameExists);
      // console.log('Username check result:', !usernameExists); // test
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

  // Handle profile image upload with validation
  const handleImage = (file: File | null) => {
    if (file) {
      // Clear previous errors
      setValidationErrors([]);

      // Use centralized validation from cloudinary.ts
      const validationError = validateImageFile(file);
      if (validationError) {
        setValidationErrors([validationError]);
        return;
      }

      console.log("User selected:", file.name, `(${(file.size / (1024 * 1024)).toFixed(2)}MB)`);

      // Create image preview to validate dimensions (optional)
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);

      img.onload = () => {
        // Optional: Validate image dimensions
        const maxDimension = 4096; // 4K resolution max
        if (img.width > maxDimension || img.height > maxDimension) {
          setValidationErrors([`Image dimensions (${img.width}x${img.height}) are too large. Maximum allowed: ${maxDimension}x${maxDimension}`]);
          URL.revokeObjectURL(objectUrl);
          return;
        }

        // Image is valid, update form data
        setUserFormData(prev => ({
          ...prev,
          profileImage: file
        }));
        URL.revokeObjectURL(objectUrl);
      };

      img.onerror = () => {
        setValidationErrors(['Invalid image file. Please select a different image.']);
        URL.revokeObjectURL(objectUrl);
      };

      img.src = objectUrl;

    } else {
      console.log("Image removed");
      setUserFormData(prev => ({
        ...prev,
        profileImage: ''
      }));
      // Clear any image-related errors when image is removed
      setValidationErrors(prev => prev.filter(error =>
        !error.includes('Image') && !error.includes('image')
      ));
    }
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
      }

      if (!userFormData.displayName) {
        newErrors.push('Display name is required for registration');
      }

      // Validate profile image if provided
      if (userFormData.profileImage && userFormData.profileImage instanceof File) {
        const validationError = validateImageFile(userFormData.profileImage);
        if (validationError) {
          newErrors.push(validationError);
        }
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
        // console.log('Attempting login...'); // test
        await login(userFormData.email, userFormData.password);
      } else {
        // console.log('Attempting registration...'); // test
        // Check username availability before registration
        const trimmedUsername = userFormData.username.trim();
        const usernameExists = await checkUsernameExists(trimmedUsername);
        if (usernameExists) {
          setValidationErrors(['This username is already taken. Please choose a different username.']);
          setIsSubmittingForm(false);
          return;
        }

        // console.log('Username is available, proceeding with registration'); // test
        let profileImageUrl = '';
        if (userFormData.profileImage) {
          try {
            const file = userFormData.profileImage as File;

            // Final validation before upload using centralized validation
            const validationError = validateImageFile(file);
            if (validationError) {
              setValidationErrors([validationError]);
              setIsSubmittingForm(false);
              return;
            }

            // Upload image to Cloudinary
            profileImageUrl = await uploadToCloudinary(file);

            if (!profileImageUrl) {
              setValidationErrors(['Failed to upload image. Please try again or choose a different image.']);
              setIsSubmittingForm(false);
              return;
            }
          } catch (uploadError) {
            console.error('Image upload error:', uploadError);
            const uploadErrorMessage = uploadError instanceof Error
              ? `Image upload failed: ${uploadError.message}`
              : 'Failed to upload image. Please try again.';
            setValidationErrors([uploadErrorMessage]);
            setIsSubmittingForm(false);
            return;
          }
        }

        // console.log('Registering user with data:', userFormData); // test
        await register(
          userFormData.email,
          userFormData.password,
          userFormData.username.trim(), // Keep original case for display
          userFormData.displayName,
          profileImageUrl
        );
      }
      // console.log('Authentication successful'); // test
      router.push('/'); // Redirect to home page after successful auth
      onClose();
    } catch (error: unknown) {
      console.error('Authentication error:', error);

      // Handle specific Firebase errors gracefully
      let errorMessage = 'An unexpected error occurred. Please try again.';

      if (error instanceof Error) {
        const errorCode = (error as any).code;

        switch (errorCode) {
          case 'auth/email-already-in-use':
            errorMessage = 'An account with this email already exists. Please try signing in instead.';
            break;
          case 'auth/weak-password':
            errorMessage = 'Password is too weak. Please choose a stronger password.';
            break;
          case 'auth/invalid-email':
            errorMessage = 'Please enter a valid email address.';
            break;
          case 'auth/user-not-found':
            errorMessage = 'No account found with this email. Please check your email or sign up.';
            break;
          case 'auth/wrong-password':
            errorMessage = 'Incorrect password. Please try again.';
            break;
          case 'auth/too-many-requests':
            errorMessage = 'Too many failed attempts. Please wait a moment and try again.';
            break;
          case 'auth/network-request-failed':
            errorMessage = 'Network error. Please check your connection and try again.';
            break;
          case 'auth/user-disabled':
            errorMessage = 'This account has been disabled. Please contact support.';
            break;
          default:
            errorMessage = error.message || errorMessage;
        }
      }

      setValidationErrors([errorMessage]);
    } finally {
      setIsSubmittingForm(false);
    }
  };

  // Handle Google sign-in/sign-up
  const handleGoogleAuth = async () => {
    setIsSubmittingForm(true);
    setValidationErrors([]);

    try {
      await loginWithGoogle();
      router.push('/'); // Redirect to home page after successful auth
      onClose();
    } catch (error: unknown) {
      console.error('Google authentication error:', error);

      // Handle specific Firebase errors gracefully
      let errorMessage = 'Failed to sign in with Google. Please try again.';

      if (error instanceof Error) {
        const errorCode = (error as any).code;

        switch (errorCode) {
          case 'auth/popup-closed-by-user':
            errorMessage = 'Sign-in was cancelled. Please try again.';
            break;
          case 'auth/popup-blocked':
            errorMessage = 'Popup was blocked by your browser. Please enable popups and try again.';
            break;
          case 'auth/network-request-failed':
            errorMessage = 'Network error. Please check your connection and try again.';
            break;
          case 'auth/too-many-requests':
            errorMessage = 'Too many attempts. Please wait a moment and try again.';
            break;
          case 'auth/user-disabled':
            errorMessage = 'This account has been disabled. Please contact support.';
            break;
          case 'auth/account-exists-with-different-credential':
            errorMessage = 'An account with this email already exists. Please try signing in with email/password.';
            break;
          default:
            errorMessage = error.message || errorMessage;
        }
      }

      setValidationErrors([errorMessage]);
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
      <DialogContent className="sm:max-w-md bg-white border border-gray-200 shadow-2xl">
        <DialogHeader className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mb-2">
            <span className="text-2xl">👋</span>
          </div>
          <DialogTitle className="text-2xl font-bold text-gray-800">
            {isLoginMode ? 'Welcome Back!' : 'Join Our Community'}
          </DialogTitle>
          <p className="text-gray-600 text-sm">
            {isLoginMode
              ? 'Ready to discover more amazing stories?'
              : 'Start sharing your voice with the world'}
          </p>
        </DialogHeader>

        <form onSubmit={handleFormSubmission} className="space-y-4">
          {/* Profile image upload */}
          {!isLoginMode && (
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Profile Picture (Optional) 📸
              </label>
              {/* <ImageUpload
              onImageChange={handleImageUpload}
              currentImage={userFormData.profileImage}
            /> */}
              <ImageSelector onImageSelect={handleImage} />

              <p className="text-xs text-gray-500 mt-1">
                Help others recognize you! You can always change this later.
              </p>
            </div>
          )}

          {/* Email input field */}
          <div>
            <Input
              type="email"
              name="email"
              placeholder="Enter your email address"
              value={userFormData.email}
              onChange={handleInputChange}
              required
              className="w-full border-gray-200 focus:border-amber-500 focus:ring-amber-500"
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
              className="w-full border-gray-200 focus:border-amber-500 focus:ring-amber-500"
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
                  className="w-full border-gray-200 focus:border-amber-500 focus:ring-amber-500"
                />
                {userFormData.username && (
                  <div className="mt-2 text-sm">
                    {isCheckingUsername ? (
                      <span className="text-gray-500 flex items-center gap-1">
                        <div className="w-3 h-3 border border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                        Checking availability...
                      </span>
                    ) : isUsernameAvailable === true ? (
                      <span className="text-green-600 flex items-center gap-1">
                        <span className="w-4 h-4 bg-green-100 rounded-full flex items-center justify-center text-xs">✓</span>
                        Great choice! This username is available
                      </span>
                    ) : isUsernameAvailable === false ? (
                      <span className="text-red-600 flex items-center gap-1">
                        <span className="w-4 h-4 bg-red-100 rounded-full flex items-center justify-center text-xs">✗</span>
                        This username is already taken
                      </span>
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
                  className="w-full border-gray-200 focus:border-amber-500 focus:ring-amber-500"
                />
              </div>


            </>
          )}

          {/* Error messages display */}
          {validationErrors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <span className="text-red-500 text-lg">⚠️</span>
                <div>
                  <h4 className="text-red-800 font-medium text-sm mb-1">
                    Please fix the following issues:
                  </h4>
                  {validationErrors.map((errorMessage, index) => (
                    <p key={index} className="text-red-600 text-sm">
                      • {errorMessage}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Submit button */}
          <Button
            type="submit"
            disabled={isSubmittingForm || (!isLoginMode && isCheckingUsername)}
            className="w-full bg-amber-500 hover:bg-amber-600 text-white font-medium py-3 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmittingForm
              ? (isLoginMode ? 'Signing you in...' : 'Creating your account...')
              : (isLoginMode ? 'Sign In ✨' : 'Join the Community 🎉')
            }
          </Button>

          {/* Mode switch button */}
          <div className="text-center pt-2">
            <p className="text-gray-600 text-sm mb-2">
              {isLoginMode ? "New to our community?" : "Already part of the family?"}
            </p>
            <button
              type="button"
              onClick={switchAuthMode}
              disabled={isSubmittingForm}
              className="text-amber-600 hover:text-amber-700 font-medium text-sm underline decoration-2 underline-offset-2 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoginMode
                ? "Create your account here"
                : "Sign in to your account"
              }
            </button>
          </div>
          <div className="space-y-3">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">or</span>
              </div>
            </div>
          </div>
          {/* Google Sign-in Button */}
          <Button
            type="button"
            onClick={handleGoogleAuth}
            disabled={isSubmittingForm}
            className="w-full bg-white border-2 border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-colors duration-200 flex items-center justify-center gap-3 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            {isSubmittingForm ? 'Signing in...' : 'Continue with Google'}
          </Button>

          {/* Trust indicators */}
          <div className="pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-500 text-center leading-relaxed">
              {isLoginMode
                ? "🔒 Your data is secure and we respect your privacy"
                : "🌟 Join thousands of storytellers in our welcoming community"
              }
            </p>
          </div>
        </form>

      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
