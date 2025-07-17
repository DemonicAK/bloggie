'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { createBlog } from '@/lib/blogService';
import { PenTool, Loader2 } from 'lucide-react';

interface CreateBlogFormProps {
  onBlogCreated?: () => void;
}

const CreateBlogForm: React.FC<CreateBlogFormProps> = ({ onBlogCreated }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    content: ''
  });
  const [errors, setErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setErrors([]); // Clear errors when user types
  };

  const validateForm = () => {
    const newErrors: string[] = [];

    if (!formData.title.trim()) {
      newErrors.push('Title is required');
    } else if (formData.title.length < 2) {
      newErrors.push('Title must be at least 2 characters');
    } else if (formData.title.length <100) {
      newErrors.push('Title must be less than 100 characters');
    }

    if (!formData.content.trim()) {
      newErrors.push('Content is required');
    } else if (formData.content.length < 20) {
      newErrors.push('Content must be at least 20 characters');
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      setErrors(['You must be logged in to create a blog']);
      return;
    }

    if (!validateForm()) return;

    setLoading(true);
    try {
      await createBlog(user.uid, {
        title: formData.title.trim(),
        content: formData.content.trim()
      });

      // Reset form
      setFormData({
        title: '',
        content: ''
      });

      onBlogCreated?.();
    } catch (error: unknown) {
      setErrors([error instanceof Error ? error.message : 'Failed to create blog']);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className=" backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <PenTool className="h-8 w-8 text-blue-600" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-3">Ready to Share Your Story?</h3>
          <p className="text-slate-600">Sign in to start writing and connect with readers worldwide.</p>
        </div>
      </div>
    );
  }

  return (
    <div className=" backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
      <div className="flex items-center space-x-3 mb-8">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg blur-sm opacity-30"></div>
          <PenTool className="relative h-6 w-6 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Write Your next blog
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Error Messages */}
        {errors.length > 0 && (
          <div className="bg-red-50/80 backdrop-blur-sm border border-red-200 rounded-xl p-4">
            {errors.map((error, index) => (
              <p key={index} className="text-red-600 text-sm font-medium">{error}</p>
            ))}
          </div>
        )}

        {/* Title Input */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700">Title</label>
          <Input
            type="text"
            name="title"
            placeholder="What's your story about?"
            value={formData.title}
            onChange={handleInputChange}
            className="text-lg font-medium border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl"
            maxLength={100}
          />
          <p className="text-xs text-slate-500">
            {formData.title.length}/100 characters
          </p>
        </div>

        {/* Content Textarea */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700">Content</label>
          <Textarea
            name="content"
            placeholder="Share your thoughts, experiences, or knowledge..."
            value={formData.content}
            onChange={handleInputChange}
            rows={10}
            className="resize-none border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl"
          />
          <p className="text-xs text-slate-500">
            {formData.content.length} characters (minimum 20)
          </p>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-4">
          <Button
            type="submit"
            disabled={loading || !formData.title.trim() || !formData.content.trim()}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 min-w-[140px]"
          >
            {loading ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Publishing...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <PenTool className="h-4 w-4" />
                <span>Publish Blog</span>
              </div>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateBlogForm;
