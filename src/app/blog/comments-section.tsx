'use client';

import { MessageCircle, Send, Trash2, Edit2, X, Check } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

const API_URL = 'https://wonder.shirijanga.com';

interface Comment {
  _id: string;
  content: string;
  text?: string;
  author: { _id?: string; name: string; profileImage?: string };
  createdAt: string;
  likesCount?: number;
}

interface CommentsSectionProps {
  blogId: string;
  allowComments: boolean;
}

export default function CommentsSection({ blogId, allowComments }: CommentsSectionProps) {
  const { user, isLoading: isAuthLoading } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingComments, setIsLoadingComments] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  useEffect(() => {
    fetchComments();
  }, [blogId]);

  // Log user and auth status for debugging
  useEffect(() => {
    console.log('COMMENTS: Auth loading:', isAuthLoading);
    console.log('COMMENTS: User state:', user ? { id: user._id, name: user.username } : 'null');
  }, [user, isAuthLoading]);

  const fetchComments = async () => {
    try {
      setIsLoadingComments(true);
      setError(null);
      
      console.log('Fetching comments from:', `${API_URL}/api/blogs/${blogId}/comments`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch(`${API_URL}/api/blogs/${blogId}/comments`, {
        headers: { 'Accept': 'application/json' },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      console.log('Comments fetch response status:', response.status);

      if (response.ok) {
        const result = await response.json();
        const commentsList = Array.isArray(result.data) ? result.data : (result.data?.data || []);
        console.log('COMMENTS: Comments loaded:', {
          count: commentsList.length,
          samples: commentsList.slice(0, 2).map((c: any) => ({
            id: c._id,
            authorId: c.author?._id,
            authorName: c.author?.name,
            content: c.content?.substring(0, 20)
          }))
        });
        setComments(commentsList);
      } else {
        console.warn('Comments fetch failed with status:', response.status);
      }
    } catch (error) {
      if (error instanceof TypeError) {
        console.error('Network error fetching comments:', error.message);
        setError('Unable to connect to server. Please check your internet connection.');
      } else if (error instanceof Error && error.name === 'AbortError') {
        console.error('Comments fetch timeout');
        setError('Request timed out. Please try again.');
      } else {
        console.error('Error fetching comments:', error);
        setError('Failed to load comments');
      }
    } finally {
      setIsLoadingComments(false);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      alert('Please login to comment');
      return;
    }

    if (!newComment.trim()) {
      alert('Please write a comment');
      return;
    }

    const commentText = newComment.trim();
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Adding comment...');
      console.log('Blog ID:', blogId);
      console.log('User:', user?._id);

      const response = await fetch(`${API_URL}/api/blogs/${blogId}/comments`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text: commentText })
      });

      console.log('Comment response status:', response.status);

      if (!response.ok) {
        const result = await response.json();
        const errorMsg = result.error || result.message || 'Failed to post comment';
        console.error('Comment error:', errorMsg);
        setError(errorMsg);
        throw new Error(errorMsg);
      }

      const result = await response.json();
      console.log('Comment added:', result.data?._id);
      
      if (result.success && result.data) {
        const newCommentObj = {
          ...result.data,
          content: result.data.content || commentText,
          author: result.data.author || user
        };
        setComments([newCommentObj, ...comments]);
        setNewComment('');
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      if (!(error instanceof Error) || !error.message) {
        setError('Network error. Please try again.');
      } else {
        setError(error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditComment = async (commentId: string) => {
    if (!user) {
      alert('Please login to edit comments');
      return;
    }

    if (!editText.trim()) {
      alert('Comment cannot be empty');
      return;
    }

    const newEditText = editText.trim();
    setIsLoading(true);

    try {
      console.log('Editing comment:', commentId);
      console.log('New text:', newEditText);

      const response = await fetch(`${API_URL}/api/blogs/${blogId}/comments/${commentId}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text: newEditText })
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('Edit error:', error);
        throw new Error(error.error || 'Failed to edit comment');
      }

      // Update comment in list
      setComments(comments.map(c => 
        c._id === commentId 
          ? { ...c, content: newEditText } 
          : c
      ));
      
      setEditingId(null);
      setEditText('');
      console.log('Comment edited successfully');
    } catch (error) {
      console.error('Error editing comment:', error);
      setError(error instanceof Error ? error.message : 'Failed to edit comment. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!user) {
      alert('Please login to delete comments');
      return;
    }

    const confirmMsg = user?.role === 'admin' ? 'Delete this comment?' : 'Delete your comment?';
    if (!confirm(confirmMsg)) return;

    try {
      console.log('Deleting comment:', commentId);
      console.log('User ID:', user?._id);
      console.log('User role:', user?.role);
      
      const response = await fetch(`${API_URL}/api/blogs/${blogId}/comments/${commentId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log('Delete response status:', response.status);

      if (!response.ok) {
        const error = await response.json();
        console.error('Delete error:', error);
        throw new Error(error.error || 'Failed to delete comment');
      }

      // Remove comment from list instantly
      setComments(comments.filter(c => c._id !== commentId));
      console.log('Comment deleted successfully');
    } catch (error) {
      console.error('Error deleting comment:', error);
      setError(error instanceof Error ? error.message : 'Failed to delete comment. Please try again.');
    }
  };

  const canEditOrDelete = (comment: Comment): boolean => {
    if (!user) {
      console.log('COMMENTS: No user, hiding buttons');
      return false;
    }
    const canEdit = user._id === comment.author?._id || user.role === 'admin';
    if (!canEdit) {
      console.log('COMMENTS: Cannot edit/delete', {
        userId: user._id,
        authorId: comment.author?._id,
        userRole: user.role,
        match: user._id === comment.author?._id
      });
    }
    return canEdit;
  };

  if (!allowComments) {
    return null;
  }

  return (
    <div className="my-12 pt-8 border-t-2 border-slate-200">
      <h3 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
        <MessageCircle size={24} className="text-blue-600" />
        Comments ({comments.length})
      </h3>

      {/* Add Comment Form */}
      {user ? (
        <form onSubmit={handleAddComment} className="mb-8 p-4 bg-slate-50 rounded-lg">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Share your thoughts..."
            className="w-full p-3 border border-slate-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={3}
            disabled={isLoading}
          />
          <div className="mt-3 flex justify-end">
            <button
              type="submit"
              disabled={isLoading || !newComment.trim()}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              <Send size={16} />
              {isLoading ? 'Posting...' : 'Post Comment'}
            </button>
          </div>
          {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
        </form>
      ) : (
        <p className="mb-8 p-4 bg-blue-50 text-blue-800 rounded-lg">
          <a href="/auth/login" className="font-medium hover:underline">Sign in</a> to comment on this article.
        </p>
      )}

      {/* Comments List */}
      <div className="space-y-4">
        {isLoadingComments ? (
          <p className="text-slate-500">Loading comments...</p>
        ) : isAuthLoading ? (
          <p className="text-slate-500">Loading authentication...</p>
        ) : comments.length > 0 ? (
          comments.map((comment) => {
            const canEdit = canEditOrDelete(comment);
            console.log('Rendering comment:', {
              commentId: comment._id,
              authorId: comment.author?._id,
              userId: user?._id,
              canEdit
            });
            return (
            <div key={comment._id} className="p-4 bg-slate-50 rounded-lg">
              <div className="flex items-start gap-3 mb-2">
                <div className="w-8 h-8 bg-linear-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0">
                  {comment.author?.name?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-slate-900">{comment.author?.name}</p>
                  <p className="text-xs text-slate-500">
                    {new Date(comment.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </p>
                </div>
                {/* Only show action buttons if user is logged in AND (is author OR is admin) */}
                {canEdit && (
                  <div className="flex items-center gap-2">
                    {user?._id === comment.author?._id && (
                      <button
                        onClick={() => {
                          setEditingId(comment._id);
                          setEditText(comment.content || comment.text || '');
                        }}
                        className="text-blue-500 hover:text-blue-700 transition-colors"
                        title="Edit comment"
                      >
                        <Edit2 size={16} />
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteComment(comment._id)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                      title={user?.role === 'admin' ? 'Delete comment (Admin)' : 'Delete comment'}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}
              </div>

              {/* Edit Mode */}
              {editingId === comment._id ? (
                <div className="mt-3 space-y-2">
                  <textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="w-full p-3 border border-blue-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={2}
                    disabled={isLoading}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditComment(comment._id)}
                      disabled={isLoading || !editText.trim()}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50 transition-colors"
                    >
                      <Check size={14} />
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setEditingId(null);
                        setEditText('');
                      }}
                      disabled={isLoading}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-slate-400 text-white rounded text-sm hover:bg-slate-500 disabled:opacity-50 transition-colors"
                    >
                      <X size={14} />
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-slate-700 text-sm wrap-break-word">{comment.content || comment.text}</p>
              )}
            </div>
            );
          })
        ) : (
          <p className="text-slate-500 text-center py-8">No comments yet. Be the first to comment!</p>
        )}
      </div>
    </div>
  );
}
