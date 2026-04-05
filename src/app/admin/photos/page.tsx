'use client';

import { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Modal,
  Spin,
  Space,
  Card,
  Statistic,
  Empty,
  message,
  Upload,
  Tooltip,
  Input,
  Select,
  Form,
  Image,
  Switch,
  Tag,
  InputNumber,
  Tabs,
  Row,
  Col
} from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  ReloadOutlined,
  EditOutlined,
  CloudUploadOutlined,
  EyeOutlined,
  StarOutlined,
  StarFilled,
  DownloadOutlined,
  HeartOutlined,
  EyeInvisibleOutlined
} from '@ant-design/icons';
import type { RcFile } from 'antd/es/upload/interface';
import type { TableColumnsType } from 'antd';

interface Photo {
  _id: string;
  title: string;
  slug: string;
  description?: string;
  category: string;
  watermarkedImage: {
    url: string;
    width?: number;
    height?: number;
  };
  thumbnail: {
    url: string;
  };
  pricing: {
    price: number;
    currency: string;
    license: string;
  };
  engagement: {
    likes: number;
    downloads: number;
    views: number;
  };
  status: {
    published: boolean;
    featured: boolean;
    archived: boolean;
  };
  metadata?: {
    location?: string;
    date?: string;
    camera?: string;
    lens?: string;
    iso?: string;
    aperture?: string;
    shutterSpeed?: string;
  };
  uploadedBy?: {
    _id: string;
    username: string;
    fullName: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface UploadFormData {
  title: string;
  description?: string;
  category: string;
  price: number;
  license?: string;
}

export default function ManagePhotosPage() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const [lastError, setLastError] = useState<string | null>(null);
  const [isUploadModalVisible, setIsUploadModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isInfoModalVisible, setIsInfoModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingPhoto, setEditingPhoto] = useState<Photo | null>(null);
  const [infoPhoto, setInfoPhoto] = useState<Photo | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<RcFile | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [editUploadedFile, setEditUploadedFile] = useState<RcFile | null>(null);
  const [editPreview, setEditPreview] = useState<string>('');
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  const API_URL = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BASE_URL || 'https://www.wondertravelers.com';

  // Fetch photos with retry logic
  const fetchPhotos = async (page = 1, attemptNumber = 0) => {
    try {
      setLoading(true);
      setLastError(null);
      const skip = (page - 1) * pagination.pageSize;
      const url = `/api/photos/admin/all?skip=${skip}&limit=${pagination.pageSize}`;

      const response = await fetch(url, {
        credentials: 'include',
        headers: {
          'Accept': 'application/json'
        }
      });

      const responseText = await response.text();
      let data;

      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.error('Failed to parse response:', responseText);
        throw new Error('Invalid server response');
      }

      if (!response.ok) {
        const errorMsg = data?.error || data?.message || `Server error (${response.status})`;
        
        // Handle authentication errors - redirect to login
        if (response.status === 401 || response.status === 403) {
          console.error('[AUTH-ERROR] Received', response.status, 'error, redirecting to login');
          // If we've already retried, redirect to login
          if (attemptNumber >= 1) {
            setTimeout(() => {
              window.location.href = '/auth/login?redirect=/admin/photos';
            }, 500);
            return;
          }
          // First attempt - retry once after delay
          console.warn(`Auth error on attempt ${attemptNumber + 1}, retrying in 1 second...`);
          setRetryCount(attemptNumber + 1);
          await new Promise(resolve => setTimeout(resolve, 1000));
          return fetchPhotos(page, attemptNumber + 1);
        }
        
        throw new Error(errorMsg);
      }

      if (data.success) {
        const normalizedPhotos = (data.photos || []).map((photo: Photo) => ({
          ...photo,
          watermarkedImage: {
            ...photo.watermarkedImage,
            url: normalizeImageUrl(photo.watermarkedImage.url)
          },
          thumbnail: {
            ...photo.thumbnail,
            url: normalizeImageUrl(photo.thumbnail.url)
          }
        }));
        setPhotos(normalizedPhotos);
        setPagination({
          current: page,
          pageSize: pagination.pageSize,
          total: data.total
        });
        setRetryCount(0);
      } else {
        const errorMsg = data.error || 'Failed to load photos';
        setLastError(errorMsg);
        message.error(errorMsg);
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to fetch photos';
      setLastError(errorMsg);
      message.error(errorMsg);
      console.error('Fetch error:', error);
      setPhotos([]);
    } finally {
      setLoading(false);
    }
  };

  // Normalize image URLs
  const normalizeImageUrl = (url: string): string => {
    if (!url) return '';
    if (url.includes('/uploads/')) {
      return url.substring(url.indexOf('/uploads/'));
    }
    return url;
  };

  // Initial fetch
  useEffect(() => {
    fetchPhotos(1);
  }, []);

  // Handle upload before
  const handleUploadBefore = (file: RcFile) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('You can only upload image files');
      return false;
    }
    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      message.error('Image must be smaller than 5MB');
      return false;
    }

    setUploadedFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onload = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    return false;
  };

  // Handle create photo
  const handleCreatePhoto = async () => {
    try {
      // Validate form fields
      let values;
      try {
        values = await form.validateFields();
      } catch (validationError: unknown) {
        // Form validation failed - Ant Design already shows errors in the UI
        // Just log and return early
        console.warn('[FORM VALIDATION ERROR] Fields have validation errors');
        if (validationError && typeof validationError === 'object') {
          const errObj = validationError as Record<string, unknown>;
          if (errObj.errorFields && Array.isArray(errObj.errorFields)) {
            const fieldNames = (errObj.errorFields as Array<{name: string[]}>)
              .map(f => f.name?.[0])
              .filter(Boolean);
            console.warn('[FORM VALIDATION ERROR] Invalid fields:', fieldNames);
          }
        }
        return; // Early exit - form errors are already displayed in the UI
      }

      if (!uploadedFile) {
        message.error('Please upload an image');
        return;
      }

      setUploading(true);

      const formData = new FormData();
      formData.append('title', values.title);
      formData.append('description', values.description || '');
      formData.append('category', values.category);
      formData.append('price', values.price.toString());
      formData.append('license', values.license || 'Standard');
      formData.append('image', uploadedFile);

      console.log('Uploading photo with data:', {
        title: values.title,
        description: values.description,
        category: values.category,
        price: values.price,
        license: values.license,
        imageSize: uploadedFile.size,
        imageName: uploadedFile.name
      });

      const response = await fetch('/api/photos', {
        method: 'POST',
        credentials: 'include',
        body: formData
      });

      const responseText = await response.text();
      console.log('Server response status:', response.status);
      console.log('Server response text:', responseText.substring(0, 500));

      let data;

      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.error('Failed to parse response:', responseText);
        throw new Error('Invalid server response');
      }

      if (!response.ok) {
        const errorMsg = data?.error || data?.message || `Server error (${response.status})`;
        const errorCode = data?.errorCode;
        
        console.error('Server returned error:', {
          status: response.status,
          error: data?.error,
          message: data?.message,
          errorCode: errorCode,
          fullData: data
        });

        // Handle specific error codes
        if (errorCode === 'WATERMARK_NOT_CONFIGURED') {
          message.error('⚠️ Watermark not configured - Please set up a watermark in Admin > Watermarks first');
          return;
        }

        throw new Error(errorMsg);
      }

      if (data.success) {
        message.success('✅ Photo uploaded successfully with watermark!');
        setIsUploadModalVisible(false);
        setUploadedFile(null);
        setPreview('');
        form.resetFields();
        fetchPhotos(1);
      } else {
        const errorCode = data?.errorCode;
        if (errorCode === 'WATERMARK_NOT_CONFIGURED') {
          message.error('⚠️ Watermark not configured - Please set up a watermark in Admin > Watermarks first');
        } else {
          message.error(data.error || 'Upload failed');
        }
      }
    } catch (error: unknown) {
      // At this point, form validation errors are already handled above
      // This catch block is for actual upload/network errors
      
      let errorMsg = 'Failed to upload photo';
      let errorType = 'Unknown';

      // Log error diagnostics
      console.error('[UPLOAD ERROR] Type:', typeof error);
      console.error('[UPLOAD ERROR] Is Error instance:', error instanceof Error);

      // Handle different error types
      if (error instanceof Error) {
        errorType = 'Error Instance';
        errorMsg = error.message;
        console.error('[UPLOAD ERROR] Error message:', error.message);
        console.error('[UPLOAD ERROR] Error name:', error.name);
      } else if (error && typeof error === 'object' && !Array.isArray(error)) {
        const errorObj = error as Record<string, unknown>;
        errorType = 'Object';
        errorMsg = (errorObj.message as string) || (errorObj.error as string) || 'Unknown error';
        console.error('[UPLOAD ERROR] Object:', {
          message: errorObj.message,
          error: errorObj.error,
          keys: Object.keys(errorObj)
        });
      } else if (typeof error === 'string') {
        errorType = 'String';
        errorMsg = error;
        console.error('[UPLOAD ERROR] String:', error);
      } else {
        console.error('[UPLOAD ERROR] Unknown error type:', error);
      }

      // Display user-friendly error message
      if (errorMsg.toLowerCase().includes('not configured') || 
          errorMsg.toLowerCase().includes('watermark not found')) {
        message.error('⚠️ Watermark Configuration Required\n\nPlease go to Admin > Watermarks and create/activate a watermark before uploading photos.');
      } else if (errorMsg.toLowerCase().includes('invalid input')) {
        message.error('⚠️ Photo processing failed. The image might be corrupted or incompatible.');
      } else {
        message.error(errorMsg || 'Upload failed. Please try again.');
      }
    } finally {
      setUploading(false);
    }
  };

  // Handle show photo info
  const handleShowPhotoInfo = (photo: Photo) => {
    setInfoPhoto(photo);
    setIsInfoModalVisible(true);
  };

  // Handle delete photo
  const handleDeletePhoto = (id: string) => {
    Modal.confirm({
      title: 'Delete Photo',
      content: 'Are you sure you want to delete this photo? This action cannot be undone.',
      okText: 'Delete',
      okType: 'danger',
      onOk: async () => {
        try {
          const response = await fetch(`/api/photos/${id}`, {
            method: 'DELETE',
            credentials: 'include'
          });

          const responseText = await response.text();
          let data;

          try {
            data = JSON.parse(responseText);
          } catch (e) {
            console.error('Failed to parse response:', responseText);
            throw new Error('Invalid server response');
          }

          if (!response.ok) {
            const errorMsg = data?.error || data?.message || `Server error (${response.status})`;
            throw new Error(errorMsg);
          }

          if (data.success) {
            message.success('Photo deleted successfully');
            fetchPhotos(pagination.current);
          } else {
            message.error(data.error || 'Delete failed');
          }
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : 'Failed to delete photo';
          message.error(errorMsg);
          console.error(error);
        }
      }
    });
  };

  // Handle edit file upload
  const handleEditUploadBefore = (file: RcFile) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('You can only upload image files');
      return false;
    }
    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      message.error('Image must be smaller than 5MB');
      return false;
    }

    setEditUploadedFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onload = () => {
      setEditPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    return false;
  };

  // Handle edit photo
  const handleEditPhoto = (photo: Photo) => {
    setEditingPhoto(photo);
    setEditingId(photo._id);
    setEditUploadedFile(null);
    setEditPreview('');
    editForm.setFieldsValue({
      title: photo.title,
      description: photo.description,
      category: photo.category,
      price: photo.pricing.price,
      license: photo.pricing.license,
      featured: photo.status.featured,
      published: photo.status.published,
      archived: photo.status.archived
    });
    setIsEditModalVisible(true);
  };

  // Handle update photo
  const handleUpdatePhoto = async () => {
    try {
      const values = await editForm.validateFields();

      // Build FormData if there's a new file, otherwise use JSON
      let body: FormData | string;
      let headers: Record<string, string> = {};

      if (editUploadedFile) {
        // File upload - use FormData
        body = new FormData();
        body.append('title', values.title);
        body.append('description', values.description || '');
        body.append('category', values.category);
        body.append('price', values.price.toString());
        body.append('license', values.license || 'Standard');
        body.append('published', values.published.toString());
        body.append('featured', values.featured.toString());
        body.append('archived', values.archived.toString());
        body.append('image', editUploadedFile);
        // FormData automatically sets the right Content-Type with boundary
      } else {
        // No file - use JSON
        headers['Content-Type'] = 'application/json';
        body = JSON.stringify({
          title: values.title,
          description: values.description,
          category: values.category,
          pricing: {
            price: values.price,
            currency: 'NPR',
            license: values.license
          },
          status: {
            published: values.published,
            featured: values.featured,
            archived: values.archived
          }
        });
      }

      setUploading(true);

      const response = await fetch(`/api/photos/${editingId}`, {
        method: 'PUT',
        credentials: 'include',
        headers,
        body
      });

      const responseText = await response.text();
      let data;

      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.error('Failed to parse response:', responseText);
        throw new Error('Invalid server response');
      }

      if (!response.ok) {
        const errorMsg = data?.error || data?.message || `Server error (${response.status})`;
        throw new Error(errorMsg);
      }

      if (data.success) {
        message.success(editUploadedFile ? '✅ Photo updated with watermark!' : '✅ Photo updated successfully');
        setIsEditModalVisible(false);
        setEditUploadedFile(null);
        setEditPreview('');
        
        // Refetch photos immediately - cache is disabled on backend
        fetchPhotos(pagination.current);
      } else {
        message.error(data.error || 'Update failed');
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to update photo';
      message.error(errorMsg);
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  // Handle toggle featured
  const handleToggleFeatured = async (id: string, isFeatured: boolean) => {
    try {
      const response = await fetch(`/api/photos/${id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: {
            featured: !isFeatured
          }
        })
      });

      const responseText = await response.text();
      let data;

      try {
        data = JSON.parse(responseText);
      } catch (e) {
        throw new Error('Invalid server response');
      }

      if (!response.ok) {
        throw new Error(data?.error || 'Failed to update');
      }

      message.success(isFeatured ? 'Removed from featured' : 'Added to featured');
      fetchPhotos(pagination.current);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to update featured status';
      message.error(errorMsg);
    }
  };

  // Table columns
  const columns: TableColumnsType<Photo> = [
    {
      title: 'Thumbnail',
      dataIndex: ['watermarkedImage', 'url'],
      key: 'thumbnail',
      width: 80,
      render: (url) => (
        <Image
          src={url}
          alt="thumbnail"
          width={80}
          height={60}
          style={{ objectFit: 'cover', borderRadius: '4px' }}
          preview={false}
        />
      )
    },
    {
      title: 'Price (NPR)',
      dataIndex: ['pricing', 'price'],
      key: 'price',
      width: 70,
      align: 'right' as const,
      sorter: (a, b) => a.pricing.price - b.pricing.price
    },
    {
      title: 'Engagement',
      key: 'engagement',
      width: 120,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Views">
            <span>
              <EyeOutlined className="text-blue-500" /> {record.engagement.views}
            </span>
          </Tooltip>
          <Tooltip title="Likes">
            <span>
              <HeartOutlined className="text-red-500" /> {record.engagement.likes}
            </span>
          </Tooltip>
          <Tooltip title="Downloads">
            <span>
              <DownloadOutlined className="text-green-500" /> {record.engagement.downloads}
            </span>
          </Tooltip>
        </Space>
      )
    },
    {
      title: 'Status',
      key: 'status',
      width: 100,
      render: (_, record) => (
        <Space wrap>
          {record.status.published && <Tag color="green">Published</Tag>}
          {!record.status.published && <Tag color="red">Draft</Tag>}
          {record.status.featured && <Tag color="gold">Featured</Tag>}
          {record.status.archived && <Tag color="default">Archived</Tag>}
        </Space>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 140,
      render: (_, record) => (
        <Space size="small" wrap>
          <Tooltip title="View Info">
            <Button
              type="text"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => handleShowPhotoInfo(record)}
            />
          </Tooltip>
          <Tooltip title={record.status.featured ? 'Remove Featured' : 'Add Featured'}>
            <Button
              type="text"
              size="small"
              icon={record.status.featured ? <StarFilled className="text-yellow-500" /> : <StarOutlined />}
              onClick={() => handleToggleFeatured(record._id, record.status.featured)}
            />
          </Tooltip>
          <Button
            type="text"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEditPhoto(record)}
          />
          <Button
            type="text"
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDeletePhoto(record._id)}
          />
        </Space>
      )
    }
  ];

  // Statistics
  const stats = {
    totalPhotos: photos.length,
    totalViews: photos.reduce((sum, p) => sum + (p.engagement?.views || 0), 0),
    totalLikes: photos.reduce((sum, p) => sum + (p.engagement?.likes || 0), 0),
    totalDownloads: photos.reduce((sum, p) => sum + (p.engagement?.downloads || 0), 0)
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Manage Photos</h1>
          <p className="text-gray-500 mt-1">Upload, manage, and monitor your photo gallery</p>
        </div>
        <Button
          type="primary"
          size="large"
          icon={<CloudUploadOutlined />}
          onClick={() => {
            setIsUploadModalVisible(true);
            setUploadedFile(null);
            setPreview('');
            form.resetFields();
          }}
        >
          Upload Photo
        </Button>
      </div>

      {/* Statistics */}
      <Row gutter={16}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Photos"
              value={stats.totalPhotos}
              prefix={<CloudUploadOutlined />}
              styles={{ content: { color: '#174fa2' } }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Views"
              value={stats.totalViews}
              prefix={<EyeOutlined />}
              styles={{ content: { color: '#3f8600' } }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Likes"
              value={stats.totalLikes}
              prefix={<HeartOutlined />}
              styles={{ content: { color: '#cf1322' } }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Downloads"
              value={stats.totalDownloads}
              prefix={<DownloadOutlined />}
              styles={{ content: { color: '#d48806' } }}
            />
          </Card>
        </Col>
      </Row>

      {/* Main Table Card */}
      <Card
        title="Photos Library"
        extra={
          <Button
            type="text"
            icon={<ReloadOutlined />}
            onClick={() => fetchPhotos(pagination.current)}
            loading={loading}
          >
            Refresh
          </Button>
        }
      >
        <Spin spinning={loading}>
          {lastError && photos.length === 0 ? (
            // Error state - show error message and retry button
            <Empty
              description={`Failed to load photos: ${lastError}`}
              style={{ marginTop: 50, marginBottom: 50 }}
            >
              <Space>
                <Button
                  type="primary"
                  onClick={() => fetchPhotos(1)}
                  loading={loading}
                >
                  Retry Loading Photos
                </Button>
                <Button
                  type="default"
                  onClick={() => {
                    setIsUploadModalVisible(true);
                    setUploadedFile(null);
                    setPreview('');
                    form.resetFields();
                  }}
                >
                  Upload Photo Anyway
                </Button>
              </Space>
            </Empty>
          ) : photos.length === 0 ? (
            // Normal empty state - no photos uploaded
            <Empty
              description="No photos uploaded yet"
              style={{ marginTop: 50, marginBottom: 50 }}
            >
              <Button
                type="primary"
                onClick={() => {
                  setIsUploadModalVisible(true);
                  setUploadedFile(null);
                  setPreview('');
                  form.resetFields();
                }}
              >
                Upload First Photo
              </Button>
            </Empty>
          ) : (
            <Table
              columns={columns}
              dataSource={photos}
              rowKey="_id"
              pagination={{
                current: pagination.current,
                pageSize: pagination.pageSize,
                total: pagination.total,
                onChange: (page) => fetchPhotos(page),
                showSizeChanger: true,
                pageSizeOptions: ['10', '20', '50'],
                showTotal: (total) => `Total ${total} photos`
              }}
              scroll={{ x: 1200 }}
              size="small"
              style={{ 
                fontSize: '13px',
                borderSpacing: '0',
                borderCollapse: 'collapse'
              }}
              tableLayout="fixed"
            />
          )}
        </Spin>
      </Card>

      {/* Upload Modal */}
      <Modal
        title="Upload New Photo"
        open={isUploadModalVisible}
        onOk={handleCreatePhoto}
        onCancel={() => {
          setIsUploadModalVisible(false);
          setUploadedFile(null);
          setPreview('');
          form.resetFields();
        }}
        width={600}
        okText="Upload"
        cancelText="Cancel"
        confirmLoading={uploading}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            license: 'Standard',
            price: 100
          }}
        >
          <Form.Item
            label="Photo Title"
            name="title"
            rules={[
              { required: true, message: 'Please enter photo title' },
              { min: 3, message: 'Title must be at least 3 characters' }
            ]}
          >
            <Input placeholder="Enter photo title" />
          </Form.Item>

          <Form.Item
            label="Description"
            name="description"
            rules={[{ max: 2000, message: 'Description must be less than 2000 characters' }]}
          >
            <Input.TextArea placeholder="Enter photo description" rows={3} />
          </Form.Item>

          <Form.Item
            label="Category"
            name="category"
            rules={[{ required: true, message: 'Please select a category' }]}
          >
            <Select
              placeholder="Select category"
              options={[
                { label: 'Landscape', value: 'Landscape' },
                { label: 'Adventure', value: 'Adventure' },
                { label: 'Culture', value: 'Culture' },
                { label: 'Wildlife', value: 'Wildlife' },
                { label: 'Architecture', value: 'Architecture' },
                { label: 'Food', value: 'Food' },
                { label: 'Other', value: 'Other' }
              ]}
            />
          </Form.Item>

          <Form.Item
            label="Price (NPR)"
            name="price"
            rules={[{ required: true, message: 'Please enter price' }]}
          >
            <InputNumber min={0} style={{ width: '100%' }} placeholder="Enter price" />
          </Form.Item>

          <Form.Item
            label="License Type"
            name="license"
          >
            <Select
              options={[
                { label: 'Standard', value: 'Standard' },
                { label: 'Premium', value: 'Premium' },
                { label: 'Enterprise', value: 'Enterprise' }
              ]}
            />
          </Form.Item>

          <Form.Item label="Upload Image" required>
            <Upload
              accept="image/*"
              maxCount={1}
              beforeUpload={handleUploadBefore}
              listType="picture-card"
            >
              <div>
                <PlusOutlined />
                <div style={{ marginTop: 8 }}>Upload</div>
              </div>
            </Upload>
          </Form.Item>

          {preview && (
            <div style={{ marginBottom: 16 }}>
              <p className="text-sm text-gray-600 mb-2">Preview:</p>
              <Image
                src={preview}
                alt="preview"
                style={{ borderRadius: '4px', maxWidth: '100%', maxHeight: '300px' }}
              />
            </div>
          )}
        </Form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        title="Edit Photo"
        open={isEditModalVisible}
        onOk={handleUpdatePhoto}
        onCancel={() => {
          setIsEditModalVisible(false);
          setEditingPhoto(null);
          setEditingId(null);
          setEditUploadedFile(null);
          setEditPreview('');
        }}
        width={600}
        okText="Update"
        cancelText="Cancel"
      >
        <Tabs
          items={[
            {
              key: 'photo',
              label: 'Photo Image',
              children: (
                <div style={{ marginTop: 16 }}>
                  {editingPhoto && (
                    <div style={{ marginBottom: 20 }}>
                      <p className="text-sm text-gray-700 font-semibold mb-2">Current Photo:</p>
                      <Image
                        src={editingPhoto.watermarkedImage.url}
                        alt="current"
                        style={{ borderRadius: '4px', maxWidth: '100%', maxHeight: '250px' }}
                      />
                    </div>
                  )}
                  <Form layout="vertical">
                    <Form.Item
                      label="Replace Photo (Optional)"
                      help="Upload a new photo to replace the current one. Watermark will be applied automatically."
                    >
                      <Upload
                        maxCount={1}
                        beforeUpload={handleEditUploadBefore}
                        accept="image/*"
                        fileList={[]}
                        listType="picture-card"
                      >
                        <div>
                          <PlusOutlined />
                          <div style={{ marginTop: 8 }}>Upload New Photo</div>
                        </div>
                      </Upload>
                    </Form.Item>

                    {editPreview && (
                      <div>
                        <p className="text-sm text-gray-600 mb-2">New Photo Preview:</p>
                        <Image
                          src={editPreview}
                          alt="new-preview"
                          style={{ borderRadius: '4px', maxWidth: '100%', maxHeight: '250px' }}
                        />
                      </div>
                    )}
                  </Form>
                </div>
              )
            },
            {
              key: 'details',
              label: 'Details',
              children: (
                <Form
                  form={editForm}
                  layout="vertical"
                  style={{ marginTop: 16 }}
                >
                  <Form.Item
                    label="Photo Title"
                    name="title"
                    rules={[{ required: true, message: 'Please enter title' }]}
                  >
                    <Input />
                  </Form.Item>

                  <Form.Item
                    label="Description"
                    name="description"
                  >
                    <Input.TextArea rows={3} />
                  </Form.Item>

                  <Form.Item
                    label="Category"
                    name="category"
                    rules={[{ required: true, message: 'Please select category' }]}
                  >
                    <Select
                      options={[
                        { label: 'Landscape', value: 'Landscape' },
                        { label: 'Adventure', value: 'Adventure' },
                        { label: 'Culture', value: 'Culture' },
                        { label: 'Wildlife', value: 'Wildlife' },
                        { label: 'Architecture', value: 'Architecture' },
                        { label: 'Food', value: 'Food' },
                        { label: 'Other', value: 'Other' }
                      ]}
                    />
                  </Form.Item>

                  <Form.Item
                    label="Price (NPR)"
                    name="price"
                    rules={[{ required: true, message: 'Please enter price' }]}
                  >
                    <InputNumber min={0} style={{ width: '100%' }} />
                  </Form.Item>

                  <Form.Item
                    label="License Type"
                    name="license"
                  >
                    <Select
                      options={[
                        { label: 'Standard', value: 'Standard' },
                        { label: 'Premium', value: 'Premium' },
                        { label: 'Enterprise', value: 'Enterprise' }
                      ]}
                    />
                  </Form.Item>
                </Form>
              )
            },
            {
              key: 'status',
              label: 'Status',
              children: (
                <Form
                  form={editForm}
                  layout="vertical"
                  style={{ marginTop: 16 }}
                >
                  <Form.Item
                    label="Published"
                    name="published"
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>

                  <Form.Item
                    label="Featured"
                    name="featured"
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>

                  <Form.Item
                    label="Archived"
                    name="archived"
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>
                </Form>
              )
            },
            {
              key: 'preview',
              label: 'Preview',
              children: editingPhoto ? (
                <div style={{ marginTop: 16 }}>
                  <Image
                    src={normalizeImageUrl(editingPhoto.watermarkedImage.url)}
                    alt="preview"
                    style={{ maxWidth: '100%', borderRadius: '4px' }}
                  />
                  <div className="mt-4 grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <p className="text-gray-500 text-sm">Views</p>
                      <p className="text-2xl font-bold">{editingPhoto.engagement.views}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-gray-500 text-sm">Likes</p>
                      <p className="text-2xl font-bold">{editingPhoto.engagement.likes}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-gray-500 text-sm">Downloads</p>
                      <p className="text-2xl font-bold">{editingPhoto.engagement.downloads}</p>
                    </div>
                  </div>
                </div>
              ) : null
            }
          ]}
        />
      </Modal>

      {/* Info Modal */}
      <Modal
        title={infoPhoto ? `Photo: ${infoPhoto.title}` : 'Photo Information'}
        open={isInfoModalVisible}
        onCancel={() => {
          setIsInfoModalVisible(false);
          setInfoPhoto(null);
        }}
        footer={[
          <Button key="close" type="primary" onClick={() => {
            setIsInfoModalVisible(false);
            setInfoPhoto(null);
          }}>
            Close
          </Button>
        ]}
        width={700}
      >
        {infoPhoto && (
          <div className="space-y-6">
            {/* Photo Preview */}
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-2">Photo</p>
              <Image
                src={normalizeImageUrl(infoPhoto.watermarkedImage.url)}
                alt={infoPhoto.title}
                style={{ maxWidth: '100%', borderRadius: '4px', maxHeight: '350px' }}
              />
            </div>

            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Title</p>
                <p className="text-base font-semibold text-gray-900">{infoPhoto.title}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Category</p>
                <p className="text-base font-semibold text-gray-900">{infoPhoto.category}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Price (NPR)</p>
                <p className="text-base font-semibold text-gray-900">NPR {infoPhoto.pricing.price}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">License</p>
                <p className="text-base font-semibold text-gray-900">{infoPhoto.pricing.license || 'Standard'}</p>
              </div>
            </div>

            {/* Description */}
            {infoPhoto.description && (
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Description</p>
                <p className="text-sm text-gray-700 leading-relaxed">{infoPhoto.description}</p>
              </div>
            )}

            {/* Engagement Stats */}
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-3">Engagement</p>
              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <div className="text-center">
                    <EyeOutlined className="text-2xl text-blue-500 mb-2" />
                    <p className="text-2xl font-bold">{infoPhoto.engagement.views}</p>
                    <p className="text-xs text-gray-500">Views</p>
                  </div>
                </Card>
                <Card>
                  <div className="text-center">
                    <HeartOutlined className="text-2xl text-red-500 mb-2" />
                    <p className="text-2xl font-bold">{infoPhoto.engagement.likes}</p>
                    <p className="text-xs text-gray-500">Likes</p>
                  </div>
                </Card>
                <Card>
                  <div className="text-center">
                    <DownloadOutlined className="text-2xl text-green-500 mb-2" />
                    <p className="text-2xl font-bold">{infoPhoto.engagement.downloads}</p>
                    <p className="text-xs text-gray-500">Downloads</p>
                  </div>
                </Card>
              </div>
            </div>

            {/* Status */}
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Status</p>
              <Space wrap>
                {infoPhoto.status.published && <Tag color="green">Published</Tag>}
                {!infoPhoto.status.published && <Tag color="red">Draft</Tag>}
                {infoPhoto.status.featured && <Tag color="gold">Featured</Tag>}
                {infoPhoto.status.archived && <Tag color="default">Archived</Tag>}
              </Space>
            </div>

            {/* Metadata */}
            {infoPhoto.metadata && (
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Metadata</p>
                <div className="bg-gray-50 p-3 rounded text-sm space-y-1">
                  {infoPhoto.metadata.camera && (
                    <p><span className="font-semibold">Camera:</span> {infoPhoto.metadata.camera}</p>
                  )}
                  {infoPhoto.metadata.lens && (
                    <p><span className="font-semibold">Lens:</span> {infoPhoto.metadata.lens}</p>
                  )}
                  {infoPhoto.metadata.iso && (
                    <p><span className="font-semibold">ISO:</span> {infoPhoto.metadata.iso}</p>
                  )}
                  {infoPhoto.metadata.aperture && (
                    <p><span className="font-semibold">Aperture:</span> {infoPhoto.metadata.aperture}</p>
                  )}
                  {infoPhoto.metadata.shutterSpeed && (
                    <p><span className="font-semibold">Shutter Speed:</span> {infoPhoto.metadata.shutterSpeed}</p>
                  )}
                  {infoPhoto.metadata.location && (
                    <p><span className="font-semibold">Location:</span> {infoPhoto.metadata.location}</p>
                  )}
                </div>
              </div>
            )}

            {/* Upload Info */}
            <div className="border-t pt-4">
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Upload Info</p>
              <div className="text-sm text-gray-600 space-y-1">
                {infoPhoto.uploadedBy && (
                  <p><span className="font-semibold">Uploaded by:</span> {infoPhoto.uploadedBy.fullName} ({infoPhoto.uploadedBy.email})</p>
                )}
                <p><span className="font-semibold">Upload Date:</span> {new Date(infoPhoto.createdAt).toLocaleString()}</p>
                <p><span className="font-semibold">Last Updated:</span> {new Date(infoPhoto.updatedAt).toLocaleString()}</p>
                <p><span className="font-semibold">Slug:</span> {infoPhoto.slug}</p>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
