'use client';

import { useState, useEffect } from 'react';
import { Table, Button, Modal, Spin, Space, Card, Statistic, Empty, message, Upload, Tooltip, Segmented, Switch } from 'antd';
import { PlusOutlined, DeleteOutlined, ReloadOutlined, EditOutlined, CloudUploadOutlined, EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons';
import type { RcFile } from 'antd/es/upload/interface';

interface FeaturedImage {
  _id: string;
  imageUrl: string;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy?: {
    _id: string;
    username: string;
    fullName: string;
    email: string;
  };
}

export default function FeaturedImagesPage() {
  const [images, setImages] = useState<FeaturedImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingImage, setEditingImage] = useState<FeaturedImage | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<RcFile | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [editOrder, setEditOrder] = useState<number>(0);
  const [editIsActive, setEditIsActive] = useState<boolean>(true);

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  // Fetch featured images
  const fetchImages = async () => {
    try {
      setLoading(true);
      const url = '/api/featured-images';
      console.log('Fetching from:', url);
      
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
        throw new Error(errorMsg);
      }
      
      if (data.success) {
        // Normalize image URLs - convert absolute URLs to relative ones
        const normalizedImages = (data.data || []).map((img: FeaturedImage) => ({
          ...img,
          imageUrl: normalizeImageUrl(img.imageUrl)
        }));
        console.log('Fetched images with normalized URLs:', normalizedImages);
        setImages(normalizedImages);
      } else {
        message.error(data.error || 'Failed to load images');
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to fetch featured images';
      message.error(errorMsg);
      console.error('Fetch error:', error);
      setImages([]);
    } finally {
      setLoading(false);
    }
  };

  // Normalize image URLs - convert absolute localhost URLs to relative paths
  const normalizeImageUrl = (url: string): string => {
    if (!url) return '';
    // Convert absolute URLs like http://localhost:5000/uploads/... to /uploads/...
    if (url.includes('/uploads/')) {
      const normalizedUrl = url.substring(url.indexOf('/uploads/'));
      console.log('Normalized URL:', url, '→', normalizedUrl);
      return normalizedUrl;
    }
    console.log('URL already normalized:', url);
    return url;
  };

  useEffect(() => {
    fetchImages();
  }, []);

  // Handle file upload
  const handleFileUpload = async (file: RcFile) => {
    try {
      setUploading(true);
      const url = '/api/featured-images/upload';
      console.log('🖼️ Uploading featured image:', { 
        name: file.name, 
        size: file.size, 
        type: file.type,
        sizeInMB: (file.size / (1024 * 1024)).toFixed(2)
      });
      
      const formData = new FormData();
      formData.append('featured_image', file);

      let response;
      try {
        console.log('📤 Starting fetch to:', url);
        response = await fetch(url, {
          method: 'POST',
          credentials: 'include',
          body: formData
        });
        console.log('✅ Fetch completed, status:', response.status);
      } catch (fetchError) {
        console.error('❌ Fetch error details:', {
          error: fetchError,
          message: fetchError instanceof Error ? fetchError.message : String(fetchError),
          url,
          method: 'POST'
        });
        throw new Error(`Network error: ${fetchError instanceof Error ? fetchError.message : 'Unable to reach server'}. Make sure the backend server is running.`);
      }

      const responseText = await response.text();
      let data: any = {};
      
      if (responseText) {
        try {
          data = JSON.parse(responseText);
        } catch (e) {
          console.error('Failed to parse response:', responseText);
          data = {};
        }
      }
      
      if (!response.ok) {
        const errorMsg = getErrorMessage(response.status, data);
        console.error('❌ Upload failed:', {
          status: response.status, 
          data,
          backendMessage: data?.message || data?.error
        });
        throw new Error(errorMsg);
      }

      if (data.success) {
        message.success('Image uploaded successfully!');
        setIsModalVisible(false);
        setUploadedFile(null);
        setPreview('');
        fetchImages();
      } else {
        message.error(data.error || 'Upload failed');
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to upload image';
      message.error(errorMsg);
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  // Helper to get user-friendly error messages
  const getErrorMessage = (status: number, data: any): string => {
    // Try to use actual error message from backend first
    const backendMessage = data?.error || data?.message;
    
    switch (status) {
      case 400:
        // Provide more helpful error messages for common issues
        if (backendMessage?.includes('magic number') || backendMessage?.includes('Invalid image')) {
          return 'The file you uploaded is not a valid image. Please ensure:\n- File is a real image (JPEG, PNG, GIF, or WebP)\n- File is not corrupted\n- Try converting to JPG format if issues persist';
        }
        if (backendMessage?.includes('No file')) {
          return 'No file was selected. Please choose an image to upload.';
        }
        return backendMessage || 'Invalid request - please check your input';
      case 401:
        return backendMessage || 'Your session has expired - please log in again';
      case 403:
        return backendMessage || 'You do not have permission to access this feature';
      case 404:
        return 'Featured image not found';
      case 413:
        return 'Image file is too large - maximum 5MB allowed';
      case 500:
        return 'Server error - please try again later or contact support';
      default:
        return backendMessage || `Request failed - Error ${status}`;
    }
  };

  // Handle file selection for preview
  const handleFileSelect = (file: RcFile) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('Please upload an image file');
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

  // Handle delete
  const handleDelete = (id: string) => {
    Modal.confirm({
      title: 'Delete Featured Image',
      content: 'Are you sure you want to delete this featured image?',
      okText: 'Delete',
      okType: 'danger',
      onOk: async () => {
        try {
          const url = `/api/featured-images/${id}`;
          const response = await fetch(url, {
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
            const errorMsg = getErrorMessage(response.status, data);
            console.error('Delete failed:', response.status, data);
            throw new Error(errorMsg);
          }

          if (data.success) {
            message.success('Image deleted successfully');
            fetchImages();
          } else {
            message.error(data.error || 'Delete failed');
          }
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : 'Failed to delete featured image';
          message.error(errorMsg);
        }
      }
    });
  };

  // Handle edit - toggle visibility
  const handleEdit = (image: FeaturedImage) => {
    handleToggleActive(image._id, image.isActive);
  };

  // Handle toggle active
  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      const url = `/api/featured-images/${id}`;
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ isActive: !isActive })
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
        const errorMsg = getErrorMessage(response.status, data);
        console.error('Update failed:', response.status, data);
        throw new Error(errorMsg);
      }

      if (data.success) {
        message.success(isActive ? 'Image hidden' : 'Image shown');
        fetchImages();
      } else {
        message.error(data.error || 'Update failed');
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to update status';
      message.error(errorMsg);
      console.error(error);
    }
  };

  const handleAddNew = () => {
    setEditingId(null);
    setUploadedFile(null);
    setPreview('');
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingId(null);
    setUploadedFile(null);
    setPreview('');
  };

  // Handle edit - open edit modal
  const handleEditImage = (image: FeaturedImage) => {
    setEditingImage(image);
    setEditingId(image._id);
    setEditOrder(image.order);
    setEditIsActive(image.isActive);
    setUploadedFile(null);
    setPreview('');
    setIsEditModalVisible(true);
  };

  // Handle edit modal cancel
  const handleEditCancel = () => {
    setIsEditModalVisible(false);
    setEditingImage(null);
    setEditingId(null);
    setUploadedFile(null);
    setPreview('');
    setEditOrder(0);
    setEditIsActive(true);
  };

  // Handle edit form submission
  const handleEditSubmit = async () => {
    if (!editingId) return;

    try {
      setUploading(true);
      const url = `/api/featured-images/${editingId}`;

      if (uploadedFile) {
        // Update with new image file
        const formData = new FormData();
        formData.append('featured_image', uploadedFile);
        formData.append('order', JSON.stringify(editOrder));
        formData.append('isActive', JSON.stringify(editIsActive));

        console.log('Submitting edit with file:', {
          order: editOrder,
          isActive: editIsActive,
          hasFile: true
        });

        const response = await fetch(url, {
          method: 'PUT',
          credentials: 'include',
          body: formData
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
          const errorMsg = getErrorMessage(response.status, data);
          throw new Error(errorMsg);
        }

        if (data.success) {
          message.success('Image updated successfully!');
          handleEditCancel();
          fetchImages();
        } else {
          message.error(data.error || 'Update failed');
        }
      } else {
        // Update without image file (just order and visibility)
        const response = await fetch(url, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include',
          body: JSON.stringify({ order: editOrder, isActive: editIsActive })
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
          const errorMsg = getErrorMessage(response.status, data);
          throw new Error(errorMsg);
        }

        if (data.success) {
          message.success('Image updated successfully!');
          handleEditCancel();
          fetchImages();
        } else {
          message.error(data.error || 'Update failed');
        }
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to update image';
      console.error('Edit submit error:', error);
      message.error(errorMsg);
    } finally {
      setUploading(false);
    }
  };

  const columns = [
    {
      title: 'Image',
      dataIndex: 'imageUrl',
      key: 'imageUrl',
      width: 150,
      render: (url: string) => (
        <div className="flex items-center justify-center w-full h-24 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
          <img 
            src={url} 
            alt="featured" 
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              target.parentElement!.innerHTML = '<div class="flex items-center justify-center w-full h-full bg-gray-200 text-gray-500 text-sm">No Image</div>';
            }}
          />
        </div>
      )
    },
    {
      title: 'Created By',
      dataIndex: 'createdBy',
      key: 'createdBy',
      width: 150,
      render: (createdBy: FeaturedImage['createdBy']) => (
        <div className="text-sm">
          <div className="font-medium">{createdBy?.fullName || createdBy?.username || 'Unknown'}</div>
          <div className="text-gray-500 text-xs">{createdBy?.email}</div>
        </div>
      )
    },
    {
      title: 'Order',
      dataIndex: 'order',
      key: 'order',
      width: 80,
      sorter: (a: FeaturedImage, b: FeaturedImage) => a.order - b.order
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'status',
      width: 100,
      render: (isActive: boolean) => (
        <span style={{ color: isActive ? '#52c41a' : '#faad14' }}>
          {isActive ? '🟢 Visible' : '🔴 Hidden'}
        </span>
      )
    },
    {
      title: 'Uploaded',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 150,
      render: (date: string) => new Date(date).toLocaleDateString()
    },
    {
      title: 'Visibility',
      key: 'visibility',
      width: 120,
      render: (_: any, record: FeaturedImage) => (
        <Tooltip title={record.isActive ? "Click to hide" : "Click to show"}>
          <Switch
            checked={record.isActive}
            onChange={() => handleToggleActive(record._id, record.isActive)}
            checkedChildren={<EyeOutlined />}
            unCheckedChildren={<EyeInvisibleOutlined />}
          />
        </Tooltip>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 150,
      render: (_: any, record: FeaturedImage) => (
        <Space size="small">
          <Tooltip title="Edit">
            <Button 
              type="primary"
              size="small" 
              icon={<EditOutlined />}
              onClick={() => handleEditImage(record)}
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Button 
              danger 
              size="small" 
              icon={<DeleteOutlined />}
              onClick={() => handleDelete(record._id)}
            />
          </Tooltip>
        </Space>
      )
    }
  ];

  const activeCount = images.filter(img => img.isActive).length;
  const inactiveCount = images.filter(img => !img.isActive).length;

  return (
    <div className="w-full bg-gray-50 p-6 rounded-lg">
      <Card className="mb-6 shadow-sm">
        <Space>
          <Statistic 
            title="Total Images" 
            value={images.length}
            styles={{ content: { fontSize: '24px', fontWeight: '600' } }}
          />
          <Statistic 
            title="Active" 
            value={activeCount}
            styles={{ content: { fontSize: '24px', fontWeight: '600', color: '#52c41a' } }}
          />
          <Statistic 
            title="Inactive" 
            value={inactiveCount}
            styles={{ content: { fontSize: '24px', fontWeight: '600', color: '#faad14' } }}
          />
        </Space>
      </Card>

      <Card className="shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Featured Images</h2>
          <Space>
            <Button 
              type="primary" 
              icon={<ReloadOutlined />}
              onClick={fetchImages}
              loading={loading}
            >
              Refresh
            </Button>
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={handleAddNew}
            >
              Add Image
            </Button>
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={images}
          loading={loading}
          rowKey="_id"
          pagination={{
            pageSize: 10,
            showTotal: (total) => `Total ${total} images`
          }}
          locale={{ emptyText: <Empty description="No featured images yet" /> }}
        />
      </Card>

      {/* Upload Modal */}
      <Modal
        title="📸 Upload Featured Image"
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        width={700}
        centered
      >
        <div className="py-4">
          {/* Preview Section */}
          {preview ? (
            <div className="mb-6">
              <div className="mb-3 text-sm font-semibold text-gray-700">Preview</div>
              <div className="relative">
                <img 
                  src={preview} 
                  alt="preview" 
                  className="w-full max-h-64 object-cover rounded-lg shadow-md"
                />
                <button
                  onClick={() => {
                    setUploadedFile(null);
                    setPreview('');
                  }}
                  className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-lg leading-none"
                >
                  ✕
                </button>
              </div>
              <div className="mt-3 bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <span className="text-lg">✓</span>
                  <div className="text-sm">
                    <div className="font-medium text-green-800">{uploadedFile?.name}</div>
                    <div className="text-green-700 text-xs mt-1">
                      {(uploadedFile?.size! / 1024 / 1024).toFixed(2)}MB • Ready to upload
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="mb-6">
              {/* Drag & Drop Zone */}
              <Upload.Dragger
                maxCount={1}
                accept="image/*"
                beforeUpload={handleFileSelect}
                onRemove={() => {
                  setUploadedFile(null);
                  setPreview('');
                }}
                style={{
                  padding: '48px 24px',
                  border: '2px dashed #1890ff',
                  borderRadius: '8px',
                  backgroundColor: '#fafafa'
                }}
              >
                <div className="flex flex-col items-center justify-center">
                  <CloudUploadOutlined 
                    style={{ 
                      fontSize: '48px',
                      color: '#1890ff',
                      marginBottom: '16px'
                    }} 
                  />
                  <p className="text-base font-semibold text-gray-800">
                    Drag & drop your image here
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    or click to select a file
                  </p>
                  <div className="mt-4 text-xs text-gray-500 space-y-1">
                    <div>📷 Supported: JPG, PNG, WebP, GIF</div>
                    <div>📦 Maximum size: 5MB</div>
                  </div>
                </div>
              </Upload.Dragger>
            </div>
          )}

          {/* Processing Info */}
          {uploadedFile && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="text-sm font-semibold text-blue-800 mb-3">
                ⚙️ What happens next:
              </div>
              <ul className="space-y-2 text-xs text-blue-700">
                <li className="flex items-center gap-2">
                  <span className="text-base">✓</span>
                  Automatically converted to WebP format
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-base">✓</span>
                  Optimized to max 1600×1200px
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-base">✓</span>
                  Thumbnail created (400×300px)
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-base">✓</span>
                  Marked as visible
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-base">✓</span>
                  Order auto-assigned
                </li>
              </ul>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end">
            <Button 
              size="large"
              onClick={handleCancel}
              disabled={uploading}
            >
              Cancel
            </Button>
            <Button 
              type="primary" 
              size="large"
              icon={<CloudUploadOutlined />}
              loading={uploading}
              disabled={!uploadedFile}
              onClick={() => {
                if (uploadedFile) {
                  handleFileUpload(uploadedFile);
                }
              }}
            >
              Upload Image
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal
        title="✏️ Edit Featured Image"
        open={isEditModalVisible}
        onCancel={handleEditCancel}
        footer={null}
        width={700}
        centered
      >
        <div className="py-4">
          {/* Current Image */}
          {editingImage && (
            <div className="mb-6">
              <div className="mb-3 text-sm font-semibold text-gray-700">Current Image</div>
              <div className="w-full h-32 bg-gray-100 rounded-lg overflow-hidden border border-gray-200 flex items-center justify-center">
                <img 
                  src={editingImage.imageUrl} 
                  alt="current" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    (target.parentElement as HTMLElement).innerHTML = '<div class="text-gray-500 text-sm">No Image</div>';
                  }}
                />
              </div>
            </div>
          )}

          {/* New Image Upload (Optional) */}
          <div className="mb-6">
            <div className="mb-3 text-sm font-semibold text-gray-700">Replace Image (Optional)</div>
            {preview ? (
              <div className="relative">
                <img 
                  src={preview} 
                  alt="preview" 
                  className="w-full max-h-48 object-cover rounded-lg shadow-md"
                />
                <button
                  onClick={() => {
                    setUploadedFile(null);
                    setPreview('');
                  }}
                  className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-lg leading-none"
                >
                  ✕
                </button>
              </div>
            ) : (
              <Upload.Dragger
                maxCount={1}
                accept="image/*"
                beforeUpload={handleFileSelect}
                onRemove={() => {
                  setUploadedFile(null);
                  setPreview('');
                }}
                style={{
                  padding: '32px 16px',
                  border: '2px dashed #1890ff',
                  borderRadius: '8px',
                  backgroundColor: '#fafafa'
                }}
              >
                <div className="flex flex-col items-center justify-center">
                  <CloudUploadOutlined 
                    style={{ 
                      fontSize: '32px',
                      color: '#1890ff',
                      marginBottom: '12px'
                    }} 
                  />
                  <p className="text-sm font-semibold text-gray-800">
                    Drag & drop to replace
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    or click to select
                  </p>
                </div>
              </Upload.Dragger>
            )}
          </div>

          {/* Order */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Order</label>
            <input 
              type="number" 
              min="0"
              value={editOrder}
              onChange={(e) => setEditOrder(parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter order number"
            />
          </div>

          {/* Visibility Toggle */}
          <div className="mb-6 flex items-center justify-between bg-gray-50 p-4 rounded-lg">
            <span className="font-semibold text-gray-700">Visibility</span>
            <Switch
              checked={editIsActive}
              onChange={(checked) => setEditIsActive(checked)}
              checkedChildren={<EyeOutlined />}
              unCheckedChildren={<EyeInvisibleOutlined />}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end">
            <Button 
              size="large"
              onClick={handleEditCancel}
              disabled={uploading}
            >
              Cancel
            </Button>
            <Button 
              type="primary" 
              size="large"
              icon={<EditOutlined />}
              loading={uploading}
              onClick={handleEditSubmit}
            >
              Update Image
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}