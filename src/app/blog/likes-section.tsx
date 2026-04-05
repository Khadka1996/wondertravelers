'use client';

import { Heart } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BASE_URL || 'https://www.wondertravelers.com';

interface LikesSectionProps {
  blogId: string;
  initialLikes?: number;
  initialIsLiked?: boolean;
}

export default function LikesSection({ blogId, initialLikes = 0, initialIsLiked = false }: LikesSectionProps) {
  const { user } = useAuth();
  const [likes, setLikes] = useState(initialLikes);
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLike = async () => {
    if (!user) {
      alert('Please login to like this blog');
      return;
    }

    // Store previous state for revert
    const previousLikes = likes;
    const previousIsLiked = isLiked;
    
    // Optimistic update - update immediately
    setIsLiked(!isLiked);
    setLikes(isLiked ? likes - 1 : likes + 1);
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Starting like request...');
      console.log('BlogId:', blogId);
      console.log('User:', user?._id);

      const response = await fetch(`${API_URL}/api/blogs/${blogId}/like`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log('Response status:', response.status);
      console.log('Response statusText:', response.statusText);

      const result = await response.json();
      console.log('Response body:', result);

      if (!response.ok) {
        const errorMsg = result.error || result.message || 'Failed to toggle like';
        console.error('Error response:', errorMsg);
        setError(errorMsg);
        // Revert optimistic update
        setIsLiked(previousIsLiked);
        setLikes(previousLikes);
      } else if (result.success && result.data) {
        // Update with response data for accurate count
        console.log('Like successful! New count:', result.data.likesCount);
        setLikes(result.data.likesCount);
        setIsLiked(result.data.isLiked);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      setError('Network error. Please try again.');
      // Revert optimistic update on error
      setIsLiked(previousIsLiked);
      setLikes(previousLikes);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={handleLike}
        disabled={isLoading}
        className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
          isLiked
            ? 'bg-red-100 text-red-600 hover:bg-red-200'
            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
        } disabled:opacity-50`}
      >
        <Heart size={18} fill={isLiked ? 'currentColor' : 'none'} />
        <span className="font-medium">{likes}</span>
      </button>
      {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
    </>
  );
}
