'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Camera, Upload, X, Loader2 } from 'lucide-react';
import { uploadToCloudinary, validateImageFile } from '@/lib/cloudinary';

interface ImageUploadProps {
    currentImage?: string;
    onImageChange: (imageUrl: string) => void;
    className?: string;
    size?: 'sm' | 'md' | 'lg';
    placeholder?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
    currentImage,
    onImageChange,
    className = '',
    size = 'md',
    placeholder = 'Upload image'
}) => {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(currentImage || null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setPreviewUrl(currentImage || null);
    }, [currentImage]);

    const sizeClasses = {
        sm: 'w-16 h-16',
        md: 'w-24 h-24',
        lg: 'w-32 h-32'
    };

    const iconSizes = {
        sm: 'h-6 w-6',
        md: 'h-8 w-8',
        lg: 'h-10 w-10'
    };

    const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Validate file
        const validationError = validateImageFile(file);
        if (validationError) {
            setError(validationError);
            return;
        }

        setError(null);
        setUploading(true);

        try {
            // Create preview
            const reader = new FileReader();
            reader.onload = (e) => {
                setPreviewUrl(e.target?.result as string);
            };
            reader.readAsDataURL(file);

            // Upload to Cloudinary
            const imageUrl = await uploadToCloudinary(file);
            onImageChange(imageUrl);
            setPreviewUrl(imageUrl);
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Failed to upload image');
            setPreviewUrl(currentImage || null);
        } finally {
            setUploading(false);
        }
    };

    const handleRemoveImage = () => {
        setPreviewUrl(null);
        onImageChange('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className={`relative ${className}`}>
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
            />

            <div
                className={`${sizeClasses[size]} rounded-full border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors cursor-pointer relative overflow-hidden bg-gray-50 flex items-center justify-center group`}
                onClick={handleClick}
            >
                {uploading ? (
                    <Loader2 className={`${iconSizes[size]} animate-spin text-gray-400`} />
                ) : previewUrl ? (
                    <>
                        <Image
                            src={previewUrl}
                            alt="Profile preview"
                            fill
                            className="object-cover"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity flex items-center justify-center">
                            <Camera className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        {previewUrl && (
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleRemoveImage();
                                }}
                                className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 transition-colors"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        )}
                    </>
                ) : (
                    <div className="text-center">
                        <Upload className={`${iconSizes[size]} text-gray-400 mb-1`} />
                        <p className="text-xs text-gray-500">{placeholder}</p>
                    </div>
                )}
            </div>

            {error && (
                <p className="text-red-500 text-xs mt-2">{error}</p>
            )}
        </div>
    );
};

export default ImageUpload;
