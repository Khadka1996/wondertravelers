'use client';

import React, { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { useParams } from 'next/navigation';
import {
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Switch,
  Divider,
  CircularProgress,
  Box,
  Chip,
  Alert,
  Card,
  Typography,
  Container,
} from '@mui/material';
import { CloudUpload, Save, ArrowBack } from '@mui/icons-material';
import { useRouter } from 'next/navigation';

// Import Quill styles
import 'react-quill-new/dist/quill.snow.css';

// Dynamic import for Quill (client-side only)
const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });

// ==================== TYPES ====================

interface Author {
  _id: string;
  name: string;
}

interface Category {
  _id: string;
  name: string;
}

interface BlogFormData {
  title: string;
  subHeading: string;
  content: string;
  author: string;
  category: string;
  type: 'blog' | 'news';
  tags: string[];
  status: 'draft' | 'published' | 'scheduled' | 'archived';
  featuredImage: File | null;
  isFeatured: boolean;
  isBreaking: boolean;
  allowComments: boolean;
  publishedAt: string | null;
  scheduledFor: string | null;
  isScheduled: boolean;
}

interface ValidationErrors {
  [key: string]: string;
}

interface BlogData {
  _id: string;
  title: string;
  subHeading: string;
  content: string;
  author: { _id: string; name: string } | string;
  category: { _id: string; name: string } | string;
  type: 'blog' | 'news';
  tags: string[];
  status: 'draft' | 'published' | 'scheduled' | 'archived';
  featuredImage: string;
  isFeatured: boolean;
  isBreaking: boolean;
  allowComments: boolean;
  publishedAt?: string;
  scheduledFor?: string;
  isScheduled: boolean;
  slug?: string;
  excerpt?: string;
}

// ==================== CONSTANTS ====================

const API_URL = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BASE_URL || 'https://www.wondertravelers.com';

// ==================== COMPONENT ====================

export default function EditBlogPage() {
  const router = useRouter();
  const params = useParams();
  const blogId = params.id as string;
  
  const [formData, setFormData] = useState<BlogFormData>({
    title: '',
    subHeading: '',
    content: '',
    author: '',
    category: '',
    type: 'blog',
    tags: [],
    status: 'draft',
    featuredImage: null,
    isFeatured: false,
    isBreaking: false,
    allowComments: true,
    publishedAt: null,
    scheduledFor: null,
    isScheduled: false,
  });

  const [originalBlog, setOriginalBlog] = useState<BlogData | null>(null);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [tagInput, setTagInput] = useState('');
  const [featuredImagePreview, setFeaturedImagePreview] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isImageReplaced, setIsImageReplaced] = useState(false);

  // Quill modules configuration
  const modules = useMemo(
    () => ({
      toolbar: [
        [{ header: [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ list: 'ordered' }, { list: 'bullet' }],
        ['blockquote', 'code-block'],
        ['link', 'image'],
        [{ align: [] }],
        ['clean'],
      ],
    }),
    []
  );

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch blog details
      const blogRes = await fetch(`${API_URL}/api/blogs/${blogId}`, {
        credentials: 'include',
        headers: { 'Accept': 'application/json' }
      });

      if (!blogRes.ok) {
        if (blogRes.status === 401) {
          window.location.href = `/auth/login?redirect=/admin/blog`;
          return;
        }
        throw new Error(`Failed to load blog (${blogRes.status})`);
      }

      const blogData = await blogRes.json();
      const blog = blogData.data || blogData;
      
      setOriginalBlog(blog);
      setFormData({
        title: blog.title || '',
        subHeading: blog.subHeading || '',
        content: blog.content || '',
        author: blog.author?._id || blog.author || '',
        category: blog.category?._id || blog.category || '',
        type: blog.type || 'blog',
        tags: blog.tags || [],
        status: blog.status || 'draft',
        featuredImage: null,
        isFeatured: blog.isFeatured || false,
        isBreaking: blog.isBreaking || false,
        allowComments: blog.allowComments !== false,
        publishedAt: blog.publishedAt ? blog.publishedAt.split('T')[0] : null,
        scheduledFor: blog.scheduledFor ? blog.scheduledFor.split('T')[0] : null,
        isScheduled: blog.isScheduled || false,
      });

      if (blog.featuredImage) {
        // Handle both absolute URLs and relative paths
        const imageUrl = blog.featuredImage.startsWith('http') 
          ? blog.featuredImage 
          : `${API_URL}${blog.featuredImage}`;
        setFeaturedImagePreview(imageUrl);
      }

      let authorsData: Author[] = [];
      let categoriesData: Category[] = [];

      // Fetch authors
      try {
        const res = await fetch(`${API_URL}/api/authors`, {
          credentials: 'include',
          headers: { 'Accept': 'application/json' }
        });

        if (res.ok) {
          const data = await res.json();
          authorsData = Array.isArray(data) ? data : data?.data || [];
        }
      } catch (error) {
        console.error('Error fetching authors:', error);
      }

      // Fetch categories
      try {
        const res = await fetch(`${API_URL}/api/categories`, {
          credentials: 'include',
          headers: { 'Accept': 'application/json' }
        });

        if (res.ok) {
          const data = await res.json();
          categoriesData = Array.isArray(data) ? data : data?.data || [];
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }

      setAuthors(authorsData);
      setCategories(categoriesData);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to fetch blog';
      setErrorMessage(errorMsg);
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateBlogRequest = async (data: BlogFormData) => {
    const formDataToSend = new FormData();
    formDataToSend.append('title', data.title);
    formDataToSend.append('subHeading', data.subHeading);
    formDataToSend.append('content', data.content);
    formDataToSend.append('author', data.author);
    formDataToSend.append('category', data.category);
    formDataToSend.append('type', data.type);
    formDataToSend.append('status', data.status);
    formDataToSend.append('isFeatured', String(data.isFeatured));
    formDataToSend.append('isBreaking', String(data.isBreaking));
    formDataToSend.append('allowComments', String(data.allowComments));
    formDataToSend.append('isScheduled', String(data.isScheduled));
    
    if (data.scheduledFor) formDataToSend.append('scheduledFor', data.scheduledFor);
    formDataToSend.append('tags', JSON.stringify(data.tags.length > 0 ? data.tags : []));
    
    // Only append featured image if it was replaced
    if (data.featuredImage && isImageReplaced) {
      formDataToSend.append('featuredImage', data.featuredImage);
    }

    const response = await fetch(`${API_URL}/api/blogs/${blogId}`, {
      method: 'PUT',
      credentials: 'include',
      body: formDataToSend,
    });

    if (!response.ok) {
      let errorMessage = 'Failed to update blog';
      
      if (response.status === 401) {
        errorMessage = 'Session expired. Please log in again.';
      } else if (response.status === 403) {
        errorMessage = 'You do not have permission to update blogs.';
      } else if (response.status === 400) {
        errorMessage = 'Invalid blog data. Please check all fields.';
      } else if (response.status === 404) {
        errorMessage = 'Blog not found.';
      }
      
      try {
        const errorData = await response.json();
        if (errorData.error) errorMessage = errorData.error;
        if (errorData.message) errorMessage = errorData.message;
      } catch {
        // Silent catch - use default error message
      }
      
      throw new Error(errorMessage);
    }

    return await response.json();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSelectChange = (e: { target: { name: string; value: unknown } }) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleFeaturedImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && isValidImage(file)) {
      setFormData(prev => ({ ...prev, featuredImage: file }));
      setIsImageReplaced(true);
      const reader = new FileReader();
      reader.onloadend = () => setFeaturedImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const isValidImage = (file: File): boolean => {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const maxSize = 10 * 1024 * 1024; // 10MB
    
    if (!validTypes.includes(file.type)) {
      setErrorMessage('❌ Invalid image format. Please use JPG, PNG, or WebP');
      return false;
    }
    if (file.size > maxSize) {
      setErrorMessage('❌ Image size exceeds 10MB limit');
      return false;
    }
    return true;
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (isValidImage(file)) {
        setFormData(prev => ({ ...prev, featuredImage: file }));
        setIsImageReplaced(true);
        const reader = new FileReader();
        reader.onloadend = () => setFeaturedImagePreview(reader.result as string);
        reader.readAsDataURL(file);
      }
    }
  };

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim().toLowerCase();
      if (!formData.tags.includes(newTag)) {
        setFormData(prev => ({ ...prev, tags: [...prev.tags, newTag] }));
        setTagInput('');
      }
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const validationErrors: ValidationErrors = {};
    if (!formData.title.trim()) validationErrors.title = 'Title is required';
    if (!formData.subHeading.trim()) validationErrors.subHeading = 'Sub-heading is required';
    if (!formData.content.trim() || formData.content.replace(/<[^>]*>/g, '').length < 50) {
      validationErrors.content = 'Content is required (min 50 chars)';
    }
    if (!formData.author) validationErrors.author = 'Author is required';
    if (!formData.category) validationErrors.category = 'Category is required';
    if (formData.status === 'scheduled' && !formData.scheduledFor) {
      validationErrors.scheduledFor = 'Scheduled date is required';
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setErrorMessage('❌ Please fix the errors in the form');
      return;
    }

    setSubmitting(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const result = await updateBlogRequest(formData);
      // Re-fetch blog data after successful update to show latest changes
      if (result.data && result.data.featuredImage) {
        const imageUrl = result.data.featuredImage.startsWith('http')
          ? result.data.featuredImage
          : `${API_URL}${result.data.featuredImage}`;
        setFeaturedImagePreview(imageUrl);
      }
      setSuccessMessage('✅ Blog updated successfully!');
      // Clear success message after 5 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 5000);
    } catch (err) {
      const msg = (err instanceof Error) ? err.message : 'Unknown error occurred';
      setErrorMessage(`❌ ${msg}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', gap: 2, flexDirection: 'column' }}>
        <CircularProgress />
        <Typography>Loading blog...</Typography>
      </Box>
    );
  }

  if (!originalBlog) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">Blog not found</Alert>
        <Button variant="outlined" startIcon={<ArrowBack />} onClick={() => router.push('/admin/blog/edit')}>
          Back to Blogs
        </Button>
      </Container>
    );
  }

  const contentLength = formData.content.replace(/<[^>]*>/g, '').trim().length;
  const estimatedReadingTime = Math.max(1, Math.ceil(contentLength / 200));

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <form onSubmit={handleSubmit}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4" fontWeight="bold">✏️ Edit Blog Post</Typography>
          <Button variant="outlined" startIcon={<ArrowBack />} onClick={() => router.push('/admin/blog/edit')}>
            Back
          </Button>
        </Box>

        {/* Two-Column Layout: Sidebar + Main Content */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 2fr' }, gap: 3, mb: 4 }}>
          {/* Right Sidebar */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Publish Settings */}
            <Card sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>📅 Publish Settings</Typography>

              {/* Status */}
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  name="status"
                  value={formData.status}
                  onChange={handleSelectChange}
                  label="Status"
                >
                  <MenuItem value="draft">📝 Draft</MenuItem>
                  <MenuItem value="published">✅ Published</MenuItem>
                  <MenuItem value="scheduled">⏰ Scheduled</MenuItem>
                  <MenuItem value="archived">📦 Archived</MenuItem>
                </Select>
              </FormControl>

              {/* Type */}
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Type</InputLabel>
                <Select
                  name="type"
                  value={formData.type}
                  onChange={handleSelectChange}
                  label="Type"
                >
                  <MenuItem value="blog">📰 Blog</MenuItem>
                  <MenuItem value="news">🔴 News</MenuItem>
                </Select>
              </FormControl>

              {/* Featured/Breaking Toggles */}
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">⭐ Featured</Typography>
                  <Switch checked={formData.isFeatured} onChange={handleCheckboxChange} name="isFeatured" />
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1, opacity: formData.type === 'news' ? 1 : 0.5, pointerEvents: formData.type === 'news' ? 'auto' : 'none' }}>
                  <Typography variant="body2">🔴 Breaking News</Typography>
                  <Switch checked={formData.isBreaking && formData.type === 'news'} onChange={(e) => {
                    if (formData.type === 'news') {
                      handleCheckboxChange(e);
                    }
                  }} name="isBreaking" disabled={formData.type !== 'news'} />
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography variant="body2">💬 Allow Comments</Typography>
                  <Switch checked={formData.allowComments} onChange={handleCheckboxChange} name="allowComments" />
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* Scheduling */}
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="body2">Schedule Post</Typography>
                <Switch checked={formData.isScheduled} onChange={handleCheckboxChange} name="isScheduled" />
              </Box>

              {formData.isScheduled && (
                <TextField
                  fullWidth
                  type="datetime-local"
                  name="scheduledFor"
                  value={formData.scheduledFor || ''}
                  onChange={handleInputChange}
                  label="Schedule Date & Time"
                  InputLabelProps={{ shrink: true }}
                  error={!!errors.scheduledFor}
                  helperText={errors.scheduledFor}
                  sx={{ mb: 2 }}
                />
              )}

              {/* Reading Time */}
              <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary' }}>
                📖 Estimated Reading Time: {estimatedReadingTime} min
              </Typography>
            </Card>

            {/* Featured Image */}
            <Card sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>🖼️ Featured Image</Typography>
              
              {featuredImagePreview && (
                <Box sx={{ mb: 2, borderRadius: 1, overflow: 'hidden', maxHeight: 200, width: '100%', position: 'relative' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={featuredImagePreview} alt="Featured" style={{ width: '100%', height: 'auto', display: 'block' }} />
                </Box>
              )}

              <Box
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                sx={{
                  border: '2px dashed #ccc',
                  borderRadius: 2,
                  p: 2,
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  '&:hover': { borderColor: '#1976d2', backgroundColor: '#f5f5f5' }
                }}
              >
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFeaturedImageChange}
                  style={{ display: 'none' }}
                  id="featured-image-input"
                />
                <label htmlFor="featured-image-input" style={{ cursor: 'pointer', display: 'block' }}>
                  <CloudUpload sx={{ fontSize: 40, color: '#1976d2', mb: 1 }} />
                  <Typography variant="body2">Drag & drop or click to select image</Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>Max 10MB • JPG, PNG, WebP</Typography>
                </label>
              </Box>
            </Card>
          </Box>

          {/* Main Content */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Author & Category */}
            <Card sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>👤 Author & Category</Typography>
              
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Author</InputLabel>
                <Select
                  name="author"
                  value={formData.author}
                  onChange={handleSelectChange}
                  label="Author"
                >
                  {authors.map(author => (
                    <MenuItem key={author._id} value={author._id}>{author.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              {errors.author && <Typography color="error" variant="caption">{errors.author}</Typography>}

              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  name="category"
                  value={formData.category}
                  onChange={handleSelectChange}
                  label="Category"
                >
                  {categories.map(category => (
                    <MenuItem key={category._id} value={category._id}>{category.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              {errors.category && <Typography color="error" variant="caption">{errors.category}</Typography>}
            </Card>

            {/* Title */}
            <TextField
              fullWidth
              label="Blog Title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              error={!!errors.title}
              helperText={errors.title}
              placeholder="e.g., Top 10 AI Trends in 2024"
            />

            {/* Sub-heading */}
            <TextField
              fullWidth
              label="Sub-heading"
              name="subHeading"
              value={formData.subHeading}
              onChange={handleInputChange}
              error={!!errors.subHeading}
              helperText={errors.subHeading}
              placeholder="Brief summary of the blog"
              multiline
              rows={2}
            />

            {/* Rich Text Editor */}
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>📝 Content</Typography>
              <Box sx={{ 
                border: errors.content ? '1px solid #d32f2f' : '1px solid #e0e0e0', 
                borderRadius: '4px',
                '& .ql-container': { fontSize: '14px' },
                '& .ql-editor': { minHeight: '300px' }
              }}>
                <ReactQuill
                  value={formData.content}
                  onChange={(value) => setFormData(prev => ({ ...prev, content: value }))}
                  modules={modules}
                  theme="snow"
                />
              </Box>
              {errors.content && <Typography color="error" variant="caption">{errors.content}</Typography>}
            </Box>

            {/* Tags */}
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>🏷️ Tags</Typography>
              <TextField
                fullWidth
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                placeholder="Add tags (press Enter)"
                size="small"
              />
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
                {formData.tags.map((tag) => (
                  <Chip
                    key={tag}
                    label={tag}
                    onDelete={() => handleRemoveTag(tag)}
                    color="primary"
                    variant="outlined"
                  />
                ))}
              </Box>
            </Box>

            {/* Submit Button */}
            {errorMessage && <Alert severity="error" sx={{ mb: 2 }}>{errorMessage}</Alert>}
            {successMessage && <Alert severity="success" sx={{ mb: 2 }}>{successMessage}</Alert>}
            
            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={submitting}
              startIcon={submitting ? <CircularProgress size={20} /> : <Save />}
              sx={{ mt: 2 }}
            >
              {submitting ? 'Updating...' : 'Update Blog'}
            </Button>
          </Box>
        </Box>
      </form>
    </Container>
  );
}
