'use client';

import React, { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { useToast } from '@/components/ToastProvider';
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
  Stack,
  Container,
} from '@mui/material';
import { CloudUpload, Save, ArrowBack, Delete as DeleteIcon } from '@mui/icons-material';
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

// ==================== CONSTANTS ====================

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// ==================== COMPONENT ====================

export default function AddBlogPage() {
  const router = useRouter();
  const toast = useToast();
  
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

  const [authors, setAuthors] = useState<Author[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [tagInput, setTagInput] = useState('');
  const [featuredImagePreview, setFeaturedImagePreview] = useState<string | null>(null);

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
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      let authorsData: Author[] = [];
      let categoriesData: Category[] = [];

      // Fetch authors
      try {
        const res = await fetch(`${API_URL}/api/authors`, {
          credentials: 'include',
          headers: { 'Accept': 'application/json' }
        });

        if (!res.ok) {
          if (res.status === 401) {
            window.location.href = '/auth/login?redirect=/admin/blog/add';
            return;
          }
          throw new Error(`Server error (${res.status})`);
        }

        const data = await res.json();
        authorsData = Array.isArray(data) ? data : data?.data || [];
      } catch (error) {
        console.error('Error fetching authors:', error);
      }

      // Fetch categories
      try {
        const res = await fetch(`${API_URL}/api/categories`, {
          credentials: 'include',
          headers: { 'Accept': 'application/json' }
        });

        if (!res.ok) {
          if (res.status === 401) {
            window.location.href = '/auth/login?redirect=/admin/blog/add';
            return;
          }
          throw new Error(`Server error (${res.status})`);
        }

        const data = await res.json();
        categoriesData = Array.isArray(data) ? data : data?.data || [];
      } catch (error) {
        console.error('Error fetching categories:', error);
      }

      setAuthors(authorsData);
      setCategories(categoriesData);

      if (authorsData.length === 0 || categoriesData.length === 0) {
        toast.error('⚠️ No authors or categories available. Please add them first.');
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to fetch data';
      toast.error(errorMsg);
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const uploadBlog = async (data: BlogFormData) => {
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
    
    if (data.featuredImage) {
      formDataToSend.append('featuredImage', data.featuredImage);
    }

    const response = await fetch(`${API_URL}/api/blogs`, {
      method: 'POST',
      credentials: 'include',
      body: formDataToSend,
    });

    if (!response.ok) {
      let errorMessage = 'Failed to create blog';
      
      if (response.status === 401) {
        errorMessage = 'Session expired. Please log in again.';
      } else if (response.status === 403) {
        errorMessage = 'You do not have permission to create blogs.';
      } else if (response.status === 400) {
        errorMessage = 'Invalid blog data. Please check all fields.';
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
      const reader = new FileReader();
      reader.onloadend = () => setFeaturedImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const isValidImage = (file: File): boolean => {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const maxSize = 10 * 1024 * 1024; // 10MB
    
    if (!validTypes.includes(file.type)) {
      toast.error('❌ Invalid image format. Please use JPG, PNG, or WebP');
      return false;
    }
    if (file.size > maxSize) {
      toast.error('❌ Image size exceeds 10MB limit');
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

  const resetForm = () => {
    setFormData({
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
    setFeaturedImagePreview(null);
    setTagInput('');
    setErrors({});
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
      toast.error('Form Validation Error', 'Please fix the errors in the form');
      return;
    }

    setSubmitting(true);

    try {
      await uploadBlog(formData);
      toast.success('Success!', 'Blog created successfully!');
      resetForm();
      // Redirect after success
      setTimeout(() => {
        router.push('/admin/blog');
      }, 1500);
    } catch (err) {
      const msg = (err instanceof Error) ? err.message : 'Unknown error occurred';
      toast.error('Error', msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', gap: 2, flexDirection: 'column' }}>
        <CircularProgress />
        <Typography>Loading form...</Typography>
      </Box>
    );
  }

  const contentLength = formData.content.replace(/<[^>]*>/g, '').trim().length;
  const estimatedReadingTime = Math.max(1, Math.ceil(contentLength / 200));

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <form onSubmit={handleSubmit}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4" fontWeight="bold">📝 Create New Blog Post</Typography>
          <Button variant="outlined" startIcon={<ArrowBack />} onClick={() => router.push('/admin/blog')}>
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
              <Stack spacing={2.5}>
                <Box>
                  <Typography variant="body2" fontWeight={500} sx={{ mb: 1 }}>Content Type</Typography>
                  <FormControl fullWidth size="small">
                    <Select name="type" value={formData.type} onChange={handleSelectChange}>
                      <MenuItem value="blog">📝 Blog Post</MenuItem>
                      <MenuItem value="news">📰 News Article</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
                <Divider sx={{ my: 1 }} />
                <Box>
                  <Typography variant="body2" fontWeight={500} sx={{ mb: 1 }}>Publication Status</Typography>
                  <FormControl fullWidth size="small">
                    <Select name="status" value={formData.status} onChange={handleSelectChange}>
                      <MenuItem value="draft">✏️ Draft - Save for later</MenuItem>
                      <MenuItem value="published">✅ Published - Live now</MenuItem>
                      <MenuItem value="scheduled">⏰ Scheduled - Publish later</MenuItem>
                      <MenuItem value="archived">📦 Archived - Hidden</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
                {formData.status === 'scheduled' && (
                  <Box>
                    <Typography variant="body2" fontWeight={500} sx={{ mb: 1 }}>Publish At</Typography>
                    <TextField
                      fullWidth
                      type="datetime-local"
                      name="scheduledFor"
                      value={formData.scheduledFor || ''}
                      onChange={handleInputChange}
                      InputLabelProps={{ shrink: true }}
                      size="small"
                      error={!!errors.scheduledFor}
                      helperText={errors.scheduledFor}
                    />
                  </Box>
                )}
              </Stack>
            </Card>

            {/* Highlight This Post */}
            <Card sx={{ p: 3, backgroundColor: '#f5f7ff' }}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>⭐ Highlight This Post</Typography>
              <Stack spacing={2.5}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e0e0e0' }}>
                  <Box>
                    <Typography variant="subtitle1" fontWeight={500}>Featured Post</Typography>
                    <Typography variant="caption" color="textSecondary">Highlight on homepage</Typography>
                  </Box>
                  <Switch name="isFeatured" checked={formData.isFeatured} onChange={handleCheckboxChange} color="primary" />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e0e0e0', opacity: formData.type === 'news' ? 1 : 0.5, pointerEvents: formData.type === 'news' ? 'auto' : 'none' }}>
                  <Box>
                    <Typography variant="subtitle1" fontWeight={500}>Breaking News</Typography>
                    <Typography variant="caption" color="textSecondary">Mark as urgent/latest</Typography>
                  </Box>
                  <Switch name="isBreaking" checked={formData.isBreaking && formData.type === 'news'} onChange={(e) => {
                    if (formData.type === 'news') {
                      handleCheckboxChange(e);
                    }
                  }} color="error" disabled={formData.type !== 'news'} />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e0e0e0' }}>
                  <Box>
                    <Typography variant="subtitle1" fontWeight={500}>Allow Comments</Typography>
                    <Typography variant="caption" color="textSecondary">Readers can discuss</Typography>
                  </Box>
                  <Switch name="allowComments" checked={formData.allowComments} onChange={handleCheckboxChange} color="success" />
                </Box>
              </Stack>
            </Card>
          </Box>

          {/* Left Main Content */}
          <Box>
            <Stack spacing={3}>
              {/* Basic Info */}
              <Card sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>📋 Basic Information</Typography>
                <Stack spacing={2}>
                  <TextField
                    fullWidth
                    label="Title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    error={!!errors.title}
                    helperText={errors.title}
                    inputProps={{ maxLength: 200 }}
                  />
                  <TextField
                    fullWidth
                    label="Sub-heading"
                    name="subHeading"
                    value={formData.subHeading}
                    onChange={handleInputChange}
                    multiline
                    rows={2}
                    error={!!errors.subHeading}
                    helperText={errors.subHeading}
                    inputProps={{ maxLength: 200 }}
                  />
                </Stack>
              </Card>

              {/* Author & Category */}
              <Card sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>👤 Author & Category</Typography>
                <Stack spacing={2} direction={{ xs: 'column', sm: 'row' }}>
                  <FormControl fullWidth error={!!errors.author}>
                    <InputLabel>Author</InputLabel>
                    <Select name="author" value={formData.author} onChange={handleSelectChange} label="Author">
                      <MenuItem value=""><em>Select an author...</em></MenuItem>
                      {authors.map(a => <MenuItem key={a._id} value={a._id}>{a.name}</MenuItem>)}
                    </Select>
                  </FormControl>
                  <FormControl fullWidth error={!!errors.category}>
                    <InputLabel>Category</InputLabel>
                    <Select name="category" value={formData.category} onChange={handleSelectChange} label="Category">
                      <MenuItem value=""><em>Select a category...</em></MenuItem>
                      {categories.map(c => <MenuItem key={c._id} value={c._id}>{c.name}</MenuItem>)}
                    </Select>
                  </FormControl>
                </Stack>
              </Card>

              {/* Content Editor */}
              <Card sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>✍️ Content</Typography>
                <Box 
                  sx={{ 
                    border: errors.content ? '2px solid #d32f2f' : '1px solid #d0d0d0',
                    borderRadius: '8px', 
                    overflow: 'hidden',
                    backgroundColor: '#fafafa',
                    transition: 'all 0.2s ease',
                    '& .ql-container': {
                      fontSize: '16px',
                      fontFamily: '"Roboto", sans-serif',
                    },
                    '& .ql-editor': {
                      minHeight: '400px',
                      padding: '16px',
                      backgroundColor: '#fff',
                      '&.ql-blank::before': {
                        color: '#999',
                        fontStyle: 'italic',
                      }
                    },
                    '& .ql-toolbar': {
                      backgroundColor: '#f5f5f5',
                      borderBlock: '1px solid #d0d0d0',
                      '& .ql-stroke': {
                        stroke: '#666',
                      },
                      '& .ql-fill': {
                        fill: '#666',
                      },
                      '& .ql-picker-label': {
                        color: '#666',
                      },
                      '& button:hover, & button.ql-active': {
                        '& .ql-stroke': { stroke: '#1976d2' },
                        '& .ql-fill': { fill: '#1976d2' },
                      }
                    }
                  }}
                >
                  <ReactQuill
                    value={formData.content}
                    onChange={(value) => setFormData(prev => ({ ...prev, content: value }))}
                    modules={modules}
                    formats={['header', 'bold', 'italic', 'underline', 'strike', 'list', 'blockquote', 'code-block', 'link', 'image', 'align']}
                    placeholder="Start writing your amazing story..."
                    theme="snow"
                  />
                </Box>
                {errors.content && (
                  <Typography sx={{ color: '#d32f2f', fontSize: '0.875rem', mt: 1.5, fontWeight: 500 }}>
                    ❌ {errors.content}
                  </Typography>
                )}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                  <Typography variant="caption" sx={{ color: '#666' }}>
                    📖 ~{estimatedReadingTime} {estimatedReadingTime === 1 ? 'minute' : 'minutes'} estimated read time
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#999' }}>
                    {contentLength} characters
                  </Typography>
                </Box>
              </Card>

              {/* Featured Image */}
              <Card sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>🖼️ Featured Image</Typography>
                <Box 
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  sx={{ 
                    border: '2px dashed #1976d2', 
                    borderRadius: '8px', 
                    p: 4, 
                    textAlign: 'center', 
                    cursor: 'pointer', 
                    transition: 'all 0.3s',
                    backgroundColor: '#f0f5ff',
                    '&:hover': { borderColor: '#64b5f6', backgroundColor: '#e3f2fd' }
                  }}
                >
                  <input
                    type="file"
                    id="featured-image-input"
                    hidden
                    accept="image/*"
                    onChange={handleFeaturedImageChange}
                  />
                  <label htmlFor="featured-image-input" style={{ cursor: 'pointer', width: '100%', display: 'block' }}>
                    {featuredImagePreview ? (
                      <Box>
                        <Box component="img" src={featuredImagePreview} alt="Preview" sx={{ maxWidth: '100%', maxHeight: '300px', borderRadius: '8px' }} />
                        <Typography sx={{ mt: 2 }}>Click or drag another image to replace</Typography>
                      </Box>
                    ) : (
                      <Box>
                        <CloudUpload sx={{ fontSize: 48, color: '#1976d2', mb: 1 }} />
                        <Typography variant="h6">Drag and drop your featured image here</Typography>
                        <Typography variant="body2" color="textSecondary">or click to select (JPG, PNG, WebP max 10MB)</Typography>
                      </Box>
                    )}
                  </label>
                </Box>
                {featuredImagePreview && (
                  <Button 
                    variant="outlined" 
                    size="small" 
                    color="error" 
                    startIcon={<DeleteIcon />}
                    onClick={() => {
                      setFormData(prev => ({ ...prev, featuredImage: null }));
                      setFeaturedImagePreview(null);
                    }}
                    sx={{ mt: 2 }}
                  >
                    Remove Image
                  </Button>
                )}
              </Card>

              {/* Tags */}
              <Card sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>🏷️ Tags</Typography>
                <TextField
                  fullWidth
                  label="Tags"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={handleAddTag}
                  placeholder="Press Enter to add a tag..."
                />
                {formData.tags.length > 0 && (
                  <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {formData.tags.map(tag => (
                      <Chip key={tag} label={tag} onDelete={() => handleRemoveTag(tag)} color="primary" variant="outlined" />
                    ))}
                  </Box>
                )}
              </Card>

              {/* Auto-Generated SEO Info */}
              <Alert severity="info">
                <strong>✨ Smart Features:</strong> SEO title, description, and keywords are automatically generated from your title, content, and tags for optimal search engine visibility.
              </Alert>
            </Stack>
          </Box>
        </Box>

        {/* Action Buttons */}
        <Stack direction="row" spacing={2} sx={{ justifyContent: 'flex-end', pt: 4 }}>
          <Button variant="outlined" onClick={() => router.push('/admin/blog')}>
            Cancel
          </Button>
          <Button
            variant="contained"
            type="submit"
            disabled={submitting}
            startIcon={submitting ? <CircularProgress size={20} /> : <Save />}
            size="large"
          >
            {submitting ? 'Creating...' : 'Create Blog'}
          </Button>
        </Stack>
      </form>
    </Container>
  );
}
