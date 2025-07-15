'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import ImageUpload from '@/components/ui/ImageUpload';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle
} from '@/components/ui/dialog';
import { Settings } from 'lucide-react';

interface UserSettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const UserSettingsModal: React.FC<UserSettingsModalProps> = ({ isOpen, onClose }) => {
    const { user, updateUserProfile } = useAuth();
    const [formData, setFormData] = useState({
        displayName: user?.displayName || '',
        username: user?.username || '',
        profilePhoto: user?.photoURL || ''
    });
    const [errors, setErrors] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    React.useEffect(() => {
        if (user) {
            setFormData({
                displayName: user.displayName || '',
                username: user.username || '',
                profilePhoto: user.photoURL || ''
            });
        }
    }, [user]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        setErrors([]);
        setSuccess(false);
    };

    const handleImageChange = (imageUrl: string) => {
        setFormData(prev => ({
            ...prev,
            profilePhoto: imageUrl
        }));
        setErrors([]);
        setSuccess(false);
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

        setErrors(newErrors);
        return newErrors.length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        setLoading(true);
        try {
            await updateUserProfile({
                displayName: formData.displayName.trim(),
                username: formData.username.trim(),
                photoURL: formData.profilePhoto
            });
            setSuccess(true);
            setTimeout(() => {
                setSuccess(false);
                onClose();
            }, 1500);
        } catch (error: unknown) {
            setErrors([error instanceof Error ? error.message : 'Failed to update profile']);
        } finally {
            setLoading(false);
        }
    };

    if (!user) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
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
                            <p className="text-green-600 text-sm text-center">Profile updated successfully!</p>
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
                        <div className="flex justify-center">
                            <ImageUpload
                                currentImage={formData.profilePhoto}
                                onImageChange={handleImageChange}
                                size="lg"
                                placeholder="Change photo"
                            />
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
                            onClick={onClose}
                            className="flex-1"
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            className="flex-1 bg-blue-600 hover:bg-blue-700"
                            disabled={loading}
                        >
                            {loading ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default UserSettingsModal;
