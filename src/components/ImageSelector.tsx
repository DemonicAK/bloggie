'use client';
import React, { useRef, useState } from "react";
import { ImageSelectorProps } from "@/types";


const ImageSelector: React.FC<ImageSelectorProps> = ({ onImageSelect, className }) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [preview, setPreview] = useState<string | null>(null);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setPreview(url);
            onImageSelect?.(file);
        }
    };

    const handleRemove = () => {
        setPreview(null);
        onImageSelect?.(null);
        if (inputRef.current) inputRef.current.value = "";
    };

    return (
        <div className={`flex flex-col items-center gap-4 ${className}`}>
            {preview ? (
                <div className="relative group w-40 h-40 rounded overflow-hidden border border-gray-300">
                    <img src={preview} alt="Selected" className="w-full h-full object-cover" />
                    <button
                        onClick={handleRemove}
                        className="absolute top-1 right-1 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded hidden group-hover:block"
                    >
                        Remove
                    </button>
                </div>
            ) : (
                <button
                    onClick={() => inputRef.current?.click()}
                    className="w-40 h-40 flex items-center justify-center border border-dashed border-gray-400 rounded hover:bg-gray-100 text-gray-500"
                >
                    Select Image
                </button>
            )}
            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
            />
        </div>
    );
};

export default ImageSelector;
