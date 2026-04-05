'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Table,
  Button,
  Modal,
  Spin,
  Space,
  Card,
  Empty,
  message,
  Tooltip,
  Input,
  Form,
  Image,
  Switch,
  Divider,
  Row,
  Col,
  Upload
} from 'antd';
import {
  DeleteOutlined,
  ReloadOutlined,
  EditOutlined,
  EyeOutlined,
  PlusOutlined,
  CloudUploadOutlined,
  UserOutlined,
  LinkOutlined
} from '@ant-design/icons';
import type { RcFile } from 'antd/es/upload/interface';
import type { TableColumnsType } from 'antd';

interface Author {
  _id: string;
  name: string;
  bio?: string;
  profileImage?: string;
  isActive: boolean;
  socialLinks?: {
    twitter?: string;
    linkedin?: string;
    website?: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface FormData {
  name: string;
  bio?: string;
  isActive: boolean;
  socialLinks?: {
    twitter?: string;
    linkedin?: string;
    website?: string;
  };
}

export default function ManageAuthorsPage() {
  const [authors, setAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isPreviewModalVisible, setIsPreviewModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [previewAuthor, setPreviewAuthor] = useState<Author | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  const [searchTerm, setSearchTerm] = useState('');
  const [uploadedImage, setUploadedImage] = useState<RcFile | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isRedirecting, setIsRedirecting] = useState(false);

  const API_URL = 'https://wonder.shirijanga.com';

  // Helper function to handle auth errors
  const handleAuthError = (status: number, returnUrl: string = '/admin/authors') => {
    if (status === 401) {
      // Only redirect on 401 (session expired)
      setIsRedirecting(true);
      console.warn(`Auth error (401): Redirecting to login`);
      window.location.href = `/auth/login?redirect=${encodeURIComponent(returnUrl)}`;
      return true;
    }
    // For 403 (forbidden/no permission), don't redirect - let the error message show
    return false;
  };

  // Fetch authors
  const fetchAuthors = useCallback(async () => {
    try {
      setLoading(true);
      console.log('[Authors] Fetching authors from:', `${API_URL}/api/authors`);
      const response = await fetch(`${API_URL}/api/authors`, {
        credentials: 'include',
        headers: { 'Accept': 'application/json' }
      });

      console.log('[Authors] API response status:', response.status);

      if (!response.ok) {
        console.log('[Authors] Response not ok, checking auth error');
        // Check for auth errors first
        if (handleAuthError(response.status)) {
          console.log('[Authors] Redirecting due to auth error');
          return;
        }
        const errorText = await response.text();
        console.log('[Authors] Error response:', errorText);
        throw new Error(`Server error (${response.status}): ${errorText}`);
      }

      const data = await response.json();
      console.log('[Authors] Fetched data:', data);
      // Handle both array and object responses
      const authorsList = Array.isArray(data) ? data : (data.authors || data.data || []);
      console.log('[Authors] Authors list:', authorsList);
      setAuthors(authorsList);
    } catch (error) {
      if (!isRedirecting) {
        const errorMsg = error instanceof Error ? error.message : 'Failed to fetch authors';
        console.error('[Authors] Fetch error:', error);
        message.error(errorMsg);
      }
    } finally {
      if (!isRedirecting) {
        setLoading(false);
      }
    }
  }, [API_URL, isRedirecting]);

  // Initial fetch
  useEffect(() => {
    fetchAuthors();
  }, [fetchAuthors]);

  // Handle image upload
  const handleImageUpload = (file: RcFile) => {
    setUploadedImage(file);
    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
    return false;
  };

  // Handle create author
  const handleCreateAuthor = async (values: FormData) => {
    try {
      setSubmitting(true);
      
      // Check if photo is uploaded first
      if (!uploadedImage) {
        message.error('Photo is required. Please upload a profile photo.');
        setSubmitting(false);
        return;
      }

      console.log('[Authors] Creating author with photo required');

      // Step 1: Create temporary author entry to get ID for photo upload
      const tempPayload = {
        ...values,
        isActive: values.isActive !== undefined ? values.isActive : true,
        profileImage: 'pending' // Placeholder
      };

      console.log('[Authors] Creating author with temp photo path');
      const createResponse = await fetch(`${API_URL}/api/authors`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tempPayload)
      });

      if (!createResponse.ok) {
        if (handleAuthError(createResponse.status)) {
          return;
        }
        const errorData = await createResponse.json();
        throw new Error(errorData.error || 'Failed to create author');
      }

      const createdAuthor = await createResponse.json();
      console.log('[Authors] Author created:', createdAuthor._id);

      // Step 2: Upload photo for the created author
      console.log('[Authors] Uploading photo for author:', createdAuthor._id);
      const photoFormData = new FormData();
      photoFormData.append('photo', uploadedImage);

      const photoResponse = await fetch(`${API_URL}/api/authors/${createdAuthor._id}/photo`, {
        method: 'POST',
        credentials: 'include',
        body: photoFormData
      });

      if (!photoResponse.ok) {
        let errorMsg = 'Photo upload failed';
        try {
          const photoError = await photoResponse.json();
          errorMsg = photoError?.error || photoError?.message || 'Photo upload failed';
        } catch (e) {
          console.warn('[Authors] Could not parse error response:', e);
        }
        console.error('[Authors] Photo upload failed:', errorMsg);
        message.error('Author created but photo upload failed: ' + errorMsg);
        fetchAuthors(); // Refresh to show the author
      } else {
        const updatedAuthor = await photoResponse.json();
        console.log('[Authors] Photo uploaded successfully');
        message.success('Author created with photo successfully!');
        setIsModalVisible(false);
        form.resetFields();
        setUploadedImage(null);
        setImagePreview('');
        fetchAuthors();
      }
    } catch (error) {
      if (!isRedirecting) {
        const errorMsg = error instanceof Error ? error.message : 'Failed to create author';
        console.error('[Authors] Create author error:', errorMsg, error);
        message.error(errorMsg);
      }
    } finally {
      if (!isRedirecting) {
        setSubmitting(false);
      }
    }
  };

  // Handle edit author
  const handleEditAuthor = (author: Author) => {
    console.log('Edit author clicked:', author);
    setEditingId(author._id);

    const formValues = {
      name: author.name || '',
      bio: author.bio || '',
      isActive: author.isActive !== undefined ? author.isActive : true,
      socialLinks: {
        twitter: author.socialLinks?.twitter || '',
        linkedin: author.socialLinks?.linkedin || '',
        website: author.socialLinks?.website || ''
      }
    };

    console.log('Setting form values:', formValues);
    editForm.setFieldsValue(formValues);

    // Set image preview
    if (author.profileImage) {
      setImagePreview(author.profileImage);
    }
    setUploadedImage(null);
    setIsEditModalVisible(true);
  };

  // Handle update author
  const handleUpdateAuthor = async (values: FormData) => {
    try {
      setSubmitting(true);

      const payload = {
        ...values,
        isActive: values.isActive !== undefined ? values.isActive : true
      };

      const response = await fetch(`${API_URL}/api/authors/${editingId}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        // Check for auth errors first
        if (handleAuthError(response.status)) {
          return;
        }
        const data = await response.json();
        throw new Error(data.error || data.message || 'Failed to update author');
      }
      const updatedAuthor = await response.json();
      console.log('[Authors] Author updated successfully:', updatedAuthor);

      // Upload photo if one was selected
      if (uploadedImage) {
        console.log('[Authors] Uploading new photo for author:', editingId);
        const formData = new FormData();
        formData.append('photo', uploadedImage);

        const photoResponse = await fetch(`${API_URL}/api/authors/${editingId}/photo`, {
          method: 'POST',
          credentials: 'include',
          body: formData
        });

        if (!photoResponse.ok) {
          let errorMsg = 'Photo upload failed';
          try {
            const photoError = await photoResponse.json();
            errorMsg = photoError?.error || photoError?.message || 'Photo upload failed';
          } catch (e) {
            console.warn('[Authors] Could not parse error response:', e);
          }
          console.warn('[Authors] Photo upload failed:', errorMsg);
          message.warning('Author updated but photo upload failed: ' + errorMsg);
        } else {
          console.log('[Authors] Photo uploaded successfully');
          message.success('Author updated with new photo successfully');
        }
      } else {
        message.success('Author updated successfully');
      }

      setIsEditModalVisible(false);
      editForm.resetFields();
      setEditingId(null);
      setUploadedImage(null);
      setImagePreview('');
      fetchAuthors();
    } catch (error) {
      if (!isRedirecting) {
        const errorMsg = error instanceof Error ? error.message : 'Failed to update author';
        message.error(errorMsg);
      }
    } finally {
      if (!isRedirecting) {
        setSubmitting(false);
      }
    }
  };

  // Handle delete author
  const handleDeleteAuthor = (id: string) => {
    const author = authors.find(a => a._id === id);
    Modal.confirm({
      title: 'Delete Author',
      content: `Are you sure you want to delete "${author?.name}"? This action cannot be undone.`,
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          const response = await fetch(`${API_URL}/api/authors/${id}`, {
            method: 'DELETE',
            credentials: 'include'
          });

          if (!response.ok) {
            // Check for auth errors first
            if (handleAuthError(response.status)) {
              return;
            }
            const data = await response.json();
            throw new Error(data.error || data.message || 'Failed to delete author');
          }

          message.success('Author deleted successfully');
          fetchAuthors();
        } catch (error) {
          if (!isRedirecting) {
            const errorMsg = error instanceof Error ? error.message : 'Failed to delete author';
            message.error(errorMsg);
          }
        }
      }
    });
  };

  // Handle toggle active status
  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`${API_URL}/api/authors/${id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus })
      });

      if (!response.ok) {
        // Check for auth errors first
        if (handleAuthError(response.status)) {
          return;
        }
        const data = await response.json();
        throw new Error(data.error || data.message || 'Failed to update author status');
      }

      message.success(currentStatus ? 'Author deactivated' : 'Author activated');
      fetchAuthors();
    } catch (error) {
      if (!isRedirecting) {
        const errorMsg = error instanceof Error ? error.message : 'Failed to update author status';
        message.error(errorMsg);
      }
    }
  };

  // Handle preview
  const handlePreviewAuthor = (author: Author) => {
    setPreviewAuthor(author);
    setIsPreviewModalVisible(true);
  };

  // Filter authors
  const filteredAuthors = authors.filter(author =>
    author.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    author.bio?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Statistics
  const stats = {
    total: authors.length,
    active: authors.filter(a => a.isActive).length,
    inactive: authors.filter(a => !a.isActive).length
  };

  // Table columns
  const columns: TableColumnsType<Author> = [
    {
      title: 'Photo',
      dataIndex: 'profileImage',
      key: 'profileImage',
      width: 60,
      render: (url: string) => {
        // Construct full URL if relative path
        const fullUrl = url ? (url.startsWith('http') ? url : `${API_URL}/${url}`) : null;
        return fullUrl ? (
          <Image
            src={fullUrl}
            alt="author"
            width={60}
            height={60}
            style={{ objectFit: 'cover', borderRadius: '50%' }}
            preview={false}
          />
        ) : (
          <div className="w-15 h-15 bg-gray-200 rounded-full flex items-center justify-center">
            <UserOutlined />
          </div>
        );
      }
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      width: 150,
      render: (text: string) => <span className="font-medium">{text}</span>
    },
    {
      title: 'Bio',
      dataIndex: 'bio',
      key: 'bio',
      width: 250,
      render: (text: string) => <span className="text-gray-600 line-clamp-2">{text || '-'}</span>
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 100,
      align: 'center' as const,
      render: (isActive: boolean, record) => (
        <Switch
          checked={isActive}
          onChange={() => handleToggleActive(record._id, isActive)}
        />
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 140,
      render: (_, record) => (
        <Space size={2}>
          <Tooltip title="Preview">
            <Button
              type="text"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => handlePreviewAuthor(record)}
            />
          </Tooltip>
          <Button
            type="text"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEditAuthor(record)}
          />
          <Button
            type="text"
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteAuthor(record._id)}
          />
        </Space>
      )
    }
  ];

  return (
    <>
      {isRedirecting && (
        <div className="flex items-center justify-center h-screen">
          <Spin size="large" description="Redirecting to login..." />
        </div>
      )}
      {!isRedirecting && (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Manage Authors</h1>
              <p className="text-gray-500 mt-1">Create, manage, and maintain author profiles</p>
            </div>
            <Button
              type="primary"
              size="large"
              icon={<PlusOutlined />}
              onClick={() => {
                form.resetFields();
                setUploadedImage(null);
                setImagePreview('');
                setIsModalVisible(true);
              }}
            >
              Add Author
            </Button>
          </div>

          {/* Statistics */}
          <Row gutter={16}>
            <Col xs={24} sm={8} md={8}>
              <Card>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">{stats.total}</div>
                  <div className="text-gray-500 text-sm mt-1">Total Authors</div>
                </div>
              </Card>
            </Col>
            <Col xs={24} sm={8} md={8}>
              <Card>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">{stats.active}</div>
                  <div className="text-gray-500 text-sm mt-1">Active</div>
                </div>
              </Card>
            </Col>
            <Col xs={24} sm={8} md={8}>
              <Card>
                <div className="text-center">
                  <div className="text-3xl font-bold text-red-600">{stats.inactive}</div>
                  <div className="text-gray-500 text-sm mt-1">Inactive</div>
                </div>
              </Card>
            </Col>
          </Row>

          {/* Search & Filter */}
          <Card>
            <Space orientation="vertical" style={{ width: '100%' }} size="middle">
              <div className="flex gap-4 flex-wrap">
                  <Input
                    placeholder="Search by name or bio..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    allowClear
                    style={{ maxWidth: '300px' }}
                  />
                  <Button
                    icon={<ReloadOutlined />}
                    onClick={fetchAuthors}
                    loading={loading}
                  >
                    Refresh
                  </Button>
                </div>
            </Space>
          </Card>

          {/* Authors Table */}
          <Card>
            <Spin spinning={loading}>
              {filteredAuthors.length === 0 ? (
                <Empty
                  description={searchTerm ? 'No authors match your search' : 'No authors yet'}
                  style={{ margin: '50px' }}
                >
                  {!searchTerm && (
                    <Button
                      type="primary"
                      size="large"
                      icon={<PlusOutlined />}
                      onClick={() => {
                        form.resetFields();
                        setUploadedImage(null);
                        setImagePreview('');
                        setIsModalVisible(true);
                      }}
                    >
                      Add Your First Author
                    </Button>
                  )}
                </Empty>
              ) : (
                <Table
                  columns={columns}
                  dataSource={filteredAuthors}
                  rowKey="_id"
                  pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    pageSizeOptions: ['10', '20', '50'],
                    showTotal: (total) => `Total ${total} authors`
                  }}
                  scroll={{ x: 1000 }}
                  size="small"
                  tableLayout="fixed"
                />
              )}
            </Spin>
          </Card>

          {/* Create Author Modal */}
          <Modal
            title="Add New Author"
            open={isModalVisible}
            onCancel={() => {
              setIsModalVisible(false);
              form.resetFields();
              setUploadedImage(null);
              setImagePreview('');
            }}
            footer={null}
            width={700}
          >
            <Form
              form={form}
              layout="vertical"
              onFinish={handleCreateAuthor}
              requiredMark="optional"
            >
              {/* Profile Image Upload */}
              <Form.Item 
                label="Profile Photo" 
                required
                rules={[
                  {
                    validator: () => {
                      if (!uploadedImage) {
                        return Promise.reject(new Error('Please upload a profile photo'));
                      }
                      return Promise.resolve();
                    }
                  }
                ]}
              >
                <Upload
                  accept="image/*"
                  maxCount={1}
                  beforeUpload={handleImageUpload}
                  onRemove={() => {
                    setUploadedImage(null);
                    setImagePreview('');
                  }}
                >
                  <Button icon={<CloudUploadOutlined />} type="primary">Upload Photo</Button>
                </Upload>
                {imagePreview && (
                  <div className="mt-2">
                    <Image src={imagePreview} width={150} height={150} alt="Preview" style={{ objectFit: 'cover', borderRadius: '8px' }} />
                  </div>
                )}
              </Form.Item>

              {/* Basic Info */}
              <Form.Item
                label="Author Name"
                name="name"
                rules={[
                  { required: true, message: 'Please enter author name' },
                  { max: 100, message: 'Name must be 100 characters or less' }
                ]}
              >
                <Input placeholder="e.g., Subash Thapa" maxLength={100} />
              </Form.Item>

              <Form.Item
                label="Bio"
                name="bio"
                rules={[{ max: 500, message: 'Bio must be 500 characters or less' }]}
              >
                <Input.TextArea placeholder="Author biography..." rows={3} maxLength={500} showCount />
              </Form.Item>

              {/* Social Links */}
              <Divider>Social Links</Divider>

              <Form.Item label="Twitter" name={['socialLinks', 'twitter']}>
                <Input
                  placeholder="https://twitter.com/handle"
                  prefix={<LinkOutlined />}
                />
              </Form.Item>

              <Form.Item label="LinkedIn" name={['socialLinks', 'linkedin']}>
                <Input
                  placeholder="https://linkedin.com/in/handle"
                  prefix={<LinkOutlined />}
                />
              </Form.Item>

              <Form.Item label="Website" name={['socialLinks', 'website']}>
                <Input
                  placeholder="https://example.com"
                  prefix={<LinkOutlined />}
                />
              </Form.Item>

              {/* Status */}
              <Divider>Status</Divider>

              <Form.Item label="Active" name="isActive" valuePropName="checked" initialValue={true}>
                <Switch />
              </Form.Item>

              <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                <Button onClick={() => {
                  setIsModalVisible(false);
                  form.resetFields();
                  setUploadedImage(null);
                  setImagePreview('');
                }}>
                  Cancel
                </Button>
                <Button type="primary" htmlType="submit" loading={submitting}>
                  Create Author
                </Button>
              </Space>
            </Form>
          </Modal>

          {/* Edit Author Modal */}
          <Modal
            title="Edit Author"
            open={isEditModalVisible}
            onCancel={() => {
              setIsEditModalVisible(false);
              editForm.resetFields();
              setEditingId(null);
              setUploadedImage(null);
              setImagePreview('');
            }}
            footer={null}
            width={700}
          >
            <Form
              form={editForm}
              layout="vertical"
              onFinish={handleUpdateAuthor}
              requiredMark="optional"
            >
              {/* Profile Image */}
              <Form.Item label="Profile Photo">
                {imagePreview && (
                  <div className="mb-2">
                    <Image src={imagePreview} width={150} height={150} alt="Preview" style={{ objectFit: 'cover', borderRadius: '8px' }} />
                  </div>
                )}
                <Upload
                  accept="image/*"
                  maxCount={1}
                  beforeUpload={handleImageUpload}
                  onRemove={() => {
                    setUploadedImage(null);
                    setImagePreview('');
                  }}
                >
                  <Button icon={<CloudUploadOutlined />}>Change Photo</Button>
                </Upload>
              </Form.Item>

              <Form.Item
                label="Author Name"
                name="name"
                rules={[
                  { required: true, message: 'Please enter author name' },
                  { max: 100, message: 'Name must be 100 characters or less' }
                ]}
              >
                <Input placeholder="e.g., Subash Thapa" maxLength={100} />
              </Form.Item>

              <Form.Item
                label="Bio"
                name="bio"
                rules={[{ max: 500, message: 'Bio must be 500 characters or less' }]}
              >
                <Input.TextArea placeholder="Author biography..." rows={3} maxLength={500} showCount />
              </Form.Item>

              <Divider>Social Links</Divider>

              <Form.Item label="Twitter" name={['socialLinks', 'twitter']}>
                <Input
                  placeholder="https://twitter.com/handle"
                  prefix={<LinkOutlined />}
                />
              </Form.Item>

              <Form.Item label="LinkedIn" name={['socialLinks', 'linkedin']}>
                <Input
                  placeholder="https://linkedin.com/in/handle"
                  prefix={<LinkOutlined />}
                />
              </Form.Item>

              <Form.Item label="Website" name={['socialLinks', 'website']}>
                <Input
                  placeholder="https://example.com"
                  prefix={<LinkOutlined />}
                />
              </Form.Item>

              <Divider>Status</Divider>

              <Form.Item label="Active" name="isActive" valuePropName="checked">
                <Switch />
              </Form.Item>

              <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                <Button onClick={() => {
                  setIsEditModalVisible(false);
                  editForm.resetFields();
                  setEditingId(null);
                  setUploadedImage(null);
                  setImagePreview('');
                }}>
                  Cancel
                </Button>
                <Button type="primary" htmlType="submit" loading={submitting}>
                  Update Author
                </Button>
              </Space>
            </Form>
          </Modal>

          {/* Preview Modal */}
          <Modal
            title={previewAuthor?.name}
            open={isPreviewModalVisible}
            onCancel={() => {
              setIsPreviewModalVisible(false);
              setPreviewAuthor(null);
            }}
            footer={null}
            width={600}
          >
            {previewAuthor && (
              <div className="space-y-4">
                <div className="flex justify-center mb-4">
                  {previewAuthor.profileImage ? (
                    <Image
                      src={previewAuthor.profileImage.startsWith('http') ? previewAuthor.profileImage : `${API_URL}/${previewAuthor.profileImage}`}
                      alt={previewAuthor.name}
                      width={200}
                      height={200}
                      style={{ objectFit: 'cover', borderRadius: '8px' }}
                    />
                  ) : (
                    <div className="w-50 h-50 bg-gray-200 rounded-lg flex items-center justify-center">
                      <UserOutlined style={{ fontSize: '48px', color: '#999' }} />
                    </div>
                  )}
                </div>

                <Divider />

                <div className="space-y-3">
                  <div>
                    <label className="font-semibold text-gray-700">Name</label>
                    <p className="text-gray-600">{previewAuthor.name}</p>
                  </div>

                  {previewAuthor.bio && (
                    <div>
                      <label className="font-semibold text-gray-700">Bio</label>
                      <p className="text-gray-600">{previewAuthor.bio}</p>
                    </div>
                  )}

                  <div>
                    <label className="font-semibold text-gray-700">Status</label>
                    <p className="text-gray-600">{previewAuthor.isActive ? '✓ Active' : '✗ Inactive'}</p>
                  </div>

                  {(previewAuthor.socialLinks?.twitter || previewAuthor.socialLinks?.linkedin || previewAuthor.socialLinks?.website) && (
                    <div>
                      <label className="font-semibold text-gray-700">Social Links</label>
                      <div className="space-y-1">
                        {previewAuthor.socialLinks?.twitter && (
                          <p><a href={previewAuthor.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Twitter</a></p>
                        )}
                        {previewAuthor.socialLinks?.linkedin && (
                          <p><a href={previewAuthor.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">LinkedIn</a></p>
                        )}
                        {previewAuthor.socialLinks?.website && (
                          <p><a href={previewAuthor.socialLinks.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Website</a></p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </Modal>
        </div>
      )}
    </>
  );
}
