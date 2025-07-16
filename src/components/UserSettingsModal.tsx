'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { uploadToCloudinary, validateImageFile } from '@/lib/cloudinary';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle
} from '@/components/ui/dialog';
import { Settings } from 'lucide-react';
import ImageSelector from '@/components/ImageSelector';

interface UserSettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const UserSettingsModal: React.FC<UserSettingsModalProps> = ({ isOpen, onClose }) => {
    const { user, updateUserProfile } = useAuth();
    const [formData, setFormData] = useState({
        displayName: '',
        username: '',
        profilePhoto: ''
    });
    const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
    const [isUploadingImage, setIsUploadingImage] = useState(false);
    const [errors, setErrors] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    React.useEffect(() => {
        if (user && isOpen) {
            setFormData({
                displayName: user.displayName || '',
                username: user.username || '',
                profilePhoto: user.photoURL || ''
            });
            // Reset states when modal opens (but only on initial open, not on user updates)
            setSelectedImageFile(null);
            setIsUploadingImage(false);
            setErrors([]);
            // Don't reset success state if it's already true (to prevent closing during updates)
            if (!success) {
                setSuccess(false);
            }
        }
    }, [isOpen]); // Removed 'user' dependency to prevent re-runs during user updates

    // Separate effect to handle initial form data when user changes but only when modal is first opened
    React.useEffect(() => {
        if (user && isOpen && !loading) {
            setFormData({
                displayName: user.displayName || '',
                username: user.username || '',
                profilePhoto: user.photoURL || ''
            });
        }
    }, [user?.uid]); // Only trigger when user ID changes (new user)

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        setErrors([]);
        setSuccess(false);
    };

    const handleImageSelect = (file: File | null) => {
        // Clear previous errors
        setErrors([]);
        setSuccess(false);

        if (file) {
            // Validate the selected image file
            const validationError = validateImageFile(file);
            if (validationError) {
                setErrors([validationError]);
                setSelectedImageFile(null);
                return;
            }

            // File is valid, store it for upload
            setSelectedImageFile(file);
        } else {
            // Image was removed
            setSelectedImageFile(null);
            setFormData(prev => ({
                ...prev,
                profilePhoto: user?.photoURL || '' // Revert to original photo URL
            }));
        }
    };

    const validateForm = () => {
        const newErrors: string[] = [];

        if (!formData.displayName.trim()) {
            newErrors.push('Display name is required');
        } else if (formData.displayName.length < 2) {
            newErrors.push('Display name must be at least 2 characters');
        }

        if (!formData.username.trim()) {
            newErrors.push('Username is required');
        } else if (formData.username.length < 2) {
            newErrors.push('Username must be at least 2 characters');
        } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
            newErrors.push('Username can only contain letters, numbers, and underscores');
        }

        // Validate selected image file if there is one
        if (selectedImageFile) {
            const imageValidationError = validateImageFile(selectedImageFile);
            if (imageValidationError) {
                newErrors.push(imageValidationError);
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
            let photoURL = formData.profilePhoto;

            // Upload new image if one was selected
            if (selectedImageFile) {
                setIsUploadingImage(true);
                try {
                    photoURL = await uploadToCloudinary(selectedImageFile);
                } catch (uploadError) {
                    console.error('Image upload error:', uploadError);
                    const uploadErrorMessage = uploadError instanceof Error
                        ? `Image upload failed: ${uploadError.message}`
                        : 'Failed to upload image. Please try again.';
                    setErrors([uploadErrorMessage]);
                    setLoading(false);
                    setIsUploadingImage(false);
                    return;
                } finally {
                    setIsUploadingImage(false);
                }
            }

            await updateUserProfile({
                displayName: formData.displayName.trim(),
                username: formData.username.trim(),
                photoURL: photoURL
            });

            setSuccess(true);
            // Don't auto-close immediately, let user see the success message
            // They can manually close or the success will auto-hide after delay
            setTimeout(() => {
                setSuccess(false);
                // Removed automatic onClose() - let user close manually
            }, 3000);
        } catch (error: unknown) {
            console.error('Profile update error:', error);
            let errorMessage = 'Failed to update profile';

            if (error instanceof Error) {
                const errorCode = (error as any).code;

                switch (errorCode) {
                    case 'auth/network-request-failed':
                        errorMessage = 'Network error. Please check your connection and try again.';
                        break;
                    case 'auth/too-many-requests':
                        errorMessage = 'Too many requests. Please wait a moment and try again.';
                        break;
                    case 'auth/user-not-found':
                        errorMessage = 'User not found. Please try signing in again.';
                        break;
                    default:
                        errorMessage = error.message || errorMessage;
                }
            }

            setErrors([errorMessage]);
        } finally {
            setLoading(false);
        }
    };

    if (!user) return null;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => {
            // Only allow closing if not in a loading state
            if (!open && !loading && !isUploadingImage) {
                onClose();
            }
        }}>
            <DialogContent className="sm:max-w-md bg-white p-6 rounded-lg shadow-lg">
                <DialogHeader>
                    <DialogTitle className="text-2xl text-center flex items-center justify-center gap-2">
                        <Settings className="h-6 w-6" />
                        Profile Settings
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Success Message */}
                    {success && (
                        <div className="bg-green-50 border border-green-200 rounded-md p-3">
                            <div className="flex items-center justify-between">
                                <p className="text-green-600 text-sm">✅ Profile updated successfully!</p>
                                <button
                                    type="button"
                                    onClick={() => setSuccess(false)}
                                    className="text-green-600 hover:text-green-800 text-sm font-medium"
                                >
                                    ×
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Error Messages */}
                    {errors.length > 0 && (
                        <div className="bg-red-50 border border-red-200 rounded-md p-3">
                            {errors.map((error, index) => (
                                <p key={index} className="text-red-600 text-sm">{error}</p>
                            ))}
                        </div>
                    )}

                    {/* Profile Photo */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3 text-center">
                            Profile Photo
                        </label>
                        <div className="flex flex-col items-center gap-3">
                            {/* Current Profile Photo Preview */}
                            {!selectedImageFile && formData.profilePhoto && (
                                <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-gray-200">
                                    <img
                                        src={formData.profilePhoto}
                                        alt="Current profile"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            )}

                            {/* Image Selector */}
                            <ImageSelector
                                onImageSelect={handleImageSelect}
                                className="w-full"
                            />

                            <p className="text-xs text-gray-500 text-center">
                                {selectedImageFile
                                    ? `Selected: ${selectedImageFile.name} (${(selectedImageFile.size / (1024 * 1024)).toFixed(2)}MB)`
                                    : 'Upload a new photo or keep your current one. Max 5MB.'
                                }
                            </p>
                        </div>
                    </div>

                    {/* Display Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Display Name
                        </label>
                        <Input
                            type="text"
                            name="displayName"
                            placeholder="Display name (e.g., John Doe)"
                            value={formData.displayName}
                            onChange={handleInputChange}
                            required
                        />
                    </div>

                    {/* Username */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Username
                        </label>
                        <Input
                            type="text"
                            name="username"
                            placeholder="Username (e.g., johndoe)"
                            value={formData.username}
                            onChange={handleInputChange}
                            required
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Only letters, numbers, and underscores allowed
                        </p>
                    </div>

                    {/* Current Email (Read-only) */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email Address
                        </label>
                        <Input
                            type="email"
                            value={user.email}
                            disabled
                            className="bg-gray-100 cursor-not-allowed"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Email cannot be changed
                        </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-3">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                // Reset any temporary states and close
                                setSelectedImageFile(null);
                                setErrors([]);
                                setSuccess(false);
                                onClose();
                            }}
                            className="flex-1"
                            disabled={loading && isUploadingImage} // Only disable during image upload
                        >
                            {loading && isUploadingImage ? 'Uploading...' : 'Cancel'}
                        </Button>
                        <Button
                            type="submit"
                            className="flex-1 bg-blue-600 hover:bg-blue-700"
                            disabled={loading}
                        >
                            {loading
                                ? (isUploadingImage ? 'Uploading image...' : 'Saving...')
                                : 'Save Changes'
                            }
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default UserSettingsModal;
