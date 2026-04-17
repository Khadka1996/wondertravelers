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
  Switch,
  Divider,
  Row,
  Col,
  ColorPicker,
  Select,
  InputNumber
} from 'antd';
import {
  DeleteOutlined,
  ReloadOutlined,
  EditOutlined,
  EyeOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import type { TableColumnsType } from 'antd';

interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  parent?: string | null;
  color?: string;
  postCount: number;
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

interface FormData {
  name: string;
  slug: string;
  description?: string;
  parent?: string | null;
  color?: string;
  isActive: boolean;
  order: number;
}

export default function ManageCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isPreviewModalVisible, setIsPreviewModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [previewCategory, setPreviewCategory] = useState<Category | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  const [searchTerm, setSearchTerm] = useState('');
  const [isRedirecting, setIsRedirecting] = useState(false);

  const API_URL = '';

  // Helper function to handle auth errors
  const handleAuthError = (status: number, returnUrl: string = '/admin/categories') => {
    if (status === 401) {
      setIsRedirecting(true);
      console.warn(`Auth error (401): Redirecting to login`);
      window.location.href = `/auth/login?redirect=${encodeURIComponent(returnUrl)}`;
      return true;
    }
    return false;
  };

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      
      const fullUrl = `${API_URL}/api/categories`;
      console.log('[Categories] Fetching from:', fullUrl);
      
      const response = await fetch(fullUrl, {
        method: 'GET',
        credentials: 'include',
        headers: { 
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      console.log('[Categories] API response status:', response.status);

      if (!response.ok) {
        console.log('[Categories] Response not ok, checking auth error');
        if (handleAuthError(response.status)) {
          console.log('[Categories] Redirecting due to auth error');
          return;
        }
        const errorText = await response.text();
        console.log('[Categories] Error response:', errorText);
        throw new Error(`Server error (${response.status}): ${errorText}`);
      }

      const data = await response.json();
      console.log('[Categories] Fetched data:', data);
      
      // Handle both array and wrapped responses
      let categoriesList: Category[] = [];
      if (Array.isArray(data)) {
        categoriesList = data;
      } else if (data && typeof data === 'object') {
        categoriesList = data.data || data.categories || [];
      }
      
      console.log('[Categories] Categories list:', categoriesList);
      // Ensure it's an array
      if (!Array.isArray(categoriesList)) {
        categoriesList = [];
      }
      setCategories(categoriesList);
    } catch (error) {
      if (!isRedirecting) {
        let errorMsg = 'Failed to fetch categories';
        
        if (error instanceof TypeError) {
          // Network error or CORS issue
          console.error('[Categories] Network/CORS error:', error.message);
          errorMsg = 'Network error: Unable to reach the server. Is the backend running on port 5000?';
        } else if (error instanceof Error) {
          errorMsg = error.message;
        }
        
        console.error('[Categories] Fetch error:', error);
        message.error(errorMsg);
      }
    } finally {
      if (!isRedirecting) {
        setLoading(false);
      }
    }
  }, [API_URL, isRedirecting]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Handle create category
  const handleCreateCategory = async (values: FormData) => {
    try {
      setSubmitting(true);
      console.log('[Categories] Creating category with values:', values);

      const payload = {
        ...values,
        isActive: values.isActive !== undefined ? values.isActive : true,
        parent: values.parent || null,
        color: values.color || undefined
      };

      console.log('[Categories] POST payload:', payload);
      const response = await fetch(`${API_URL}/api/categories`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      console.log('[Categories] Create response status:', response.status);

      if (!response.ok) {
        if (handleAuthError(response.status)) {
          return;
        }
        const data = await response.json();
        console.log('[Categories] Error response:', data);
        throw new Error(data.error || data.message || 'Failed to create category');
      }

      const createdCategory = await response.json();
      console.log('[Categories] Category created successfully:', createdCategory);
      message.success('Category created successfully');
      setIsModalVisible(false);
      form.resetFields();
      fetchCategories();
    } catch (error) {
      if (!isRedirecting) {
        const errorMsg = error instanceof Error ? error.message : 'Failed to create category';
        console.error('[Categories] Create category error:', errorMsg, error);
        message.error(errorMsg);
      }
    } finally {
      if (!isRedirecting) {
        setSubmitting(false);
      }
    }
  };

  // Handle edit category
  const handleEditCategory = (category: Category) => {
    console.log('Edit category clicked:', category);
    setEditingId(category._id);

    const formValues = {
      name: category.name || '',
      slug: category.slug || '',
      description: category.description || '',
      parent: category.parent || null,
      color: category.color || undefined,
      isActive: category.isActive !== undefined ? category.isActive : true,
      order: category.order || 0
    };

    console.log('Setting form values:', formValues);
    editForm.setFieldsValue(formValues);
    setIsEditModalVisible(true);
  };

  // Handle update category
  const handleUpdateCategory = async (values: FormData) => {
    try {
      setSubmitting(true);

      const payload = {
        ...values,
        isActive: values.isActive !== undefined ? values.isActive : true,
        parent: values.parent || null,
        color: values.color || undefined
      };

      const response = await fetch(`${API_URL}/api/categories/${editingId}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        if (handleAuthError(response.status)) {
          return;
        }
        const data = await response.json();
        throw new Error(data.error || data.message || 'Failed to update category');
      }

      message.success('Category updated successfully');
      setIsEditModalVisible(false);
      editForm.resetFields();
      setEditingId(null);
      fetchCategories();
    } catch (error) {
      if (!isRedirecting) {
        const errorMsg = error instanceof Error ? error.message : 'Failed to update category';
        message.error(errorMsg);
      }
    } finally {
      if (!isRedirecting) {
        setSubmitting(false);
      }
    }
  };

  // Handle delete category
  const handleDeleteCategory = (id: string) => {
    const category = categories.find(c => c._id === id);
    Modal.confirm({
      title: 'Delete Category',
      content: `Are you sure you want to delete "${category?.name}"? This action cannot be undone.`,
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          const response = await fetch(`${API_URL}/api/categories/${id}`, {
            method: 'DELETE',
            credentials: 'include'
          });

          if (!response.ok) {
            if (handleAuthError(response.status)) {
              return;
            }
            const data = await response.json();
            throw new Error(data.error || data.message || 'Failed to delete category');
          }

          message.success('Category deleted successfully');
          fetchCategories();
        } catch (error) {
          if (!isRedirecting) {
            const errorMsg = error instanceof Error ? error.message : 'Failed to delete category';
            message.error(errorMsg);
          }
        }
      }
    });
  };

  // Handle toggle active status
  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`${API_URL}/api/categories/${id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus })
      });

      if (!response.ok) {
        if (handleAuthError(response.status)) {
          return;
        }
        const data = await response.json();
        throw new Error(data.error || data.message || 'Failed to update category status');
      }

      message.success(currentStatus ? 'Category deactivated' : 'Category activated');
      fetchCategories();
    } catch (error) {
      if (!isRedirecting) {
        const errorMsg = error instanceof Error ? error.message : 'Failed to update category status';
        message.error(errorMsg);
      }
    }
  };

  // Handle preview
  const handlePreviewCategory = (category: Category) => {
    setPreviewCategory(category);
    setIsPreviewModalVisible(true);
  };

  // Auto-generate slug from name
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>, isEdit: boolean = false) => {
    const name = e.target.value;
    const slug = name
      .toLowerCase()
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/[^a-z0-9-]/g, '') // Remove special characters
      .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
      .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens

    if (isEdit) {
      editForm.setFieldValue('slug', slug);
    } else {
      form.setFieldValue('slug', slug);
    }
  };

  // Filter categories
  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate stats
  const stats = {
    total: categories.length,
    active: categories.filter(c => c.isActive).length,
    inactive: categories.filter(c => !c.isActive).length
  };

  // Table columns
  const columns: TableColumnsType<Category> = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      width: 150,
      render: (text: string) => <span className="font-medium">{text}</span>
    },
    {
      title: 'Slug',
      dataIndex: 'slug',
      key: 'slug',
      width: 150,
      render: (text: string) => <code className="bg-gray-100 px-2 py-1 rounded text-sm">{text}</code>
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      width: 250,
      render: (text: string) => <span className="text-gray-600 line-clamp-2">{text || '-'}</span>
    },
    {
      title: 'Posts',
      dataIndex: 'postCount',
      key: 'postCount',
      width: 80,
      align: 'center' as const,
      render: (count: number) => <span className="font-semibold text-blue-600">{count}</span>
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
              onClick={() => handlePreviewCategory(record)}
            />
          </Tooltip>
          <Button
            type="text"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEditCategory(record)}
          />
          <Button
            type="text"
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteCategory(record._id)}
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
              <h1 className="text-3xl font-bold text-gray-800">Manage Categories</h1>
              <p className="text-gray-500 mt-1">Create, manage, and maintain blog categories</p>
            </div>
            <Button
              type="primary"
              size="large"
              icon={<PlusOutlined />}
              onClick={() => {
                form.resetFields();
                setIsModalVisible(true);
              }}
            >
              Add Category
            </Button>
          </div>

          {/* Statistics */}
          <Row gutter={16}>
            <Col xs={24} sm={8} md={8}>
              <Card>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">{stats.total}</div>
                  <div className="text-gray-500 text-sm mt-1">Total Categories</div>
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
                  placeholder="Search by name or slug..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  allowClear
                  style={{ maxWidth: '300px' }}
                />
                <Button
                  icon={<ReloadOutlined />}
                  onClick={fetchCategories}
                  loading={loading}
                >
                  Refresh
                </Button>
              </div>
            </Space>
          </Card>

          {/* Categories Table */}
          <Card>
            <Spin spinning={loading}>
              {filteredCategories.length === 0 ? (
                <Empty
                  description={searchTerm ? 'No categories match your search' : 'No categories yet'}
                  style={{ margin: '50px' }}
                >
                  {!searchTerm && (
                    <Button
                      type="primary"
                      size="large"
                      icon={<PlusOutlined />}
                      onClick={() => {
                        form.resetFields();
                        setIsModalVisible(true);
                      }}
                    >
                      Add Your First Category
                    </Button>
                  )}
                </Empty>
              ) : (
                <Table
                  columns={columns}
                  dataSource={filteredCategories}
                  rowKey="_id"
                  pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    pageSizeOptions: ['10', '20', '50'],
                    showTotal: (total) => `Total ${total} categories`
                  }}
                  scroll={{ x: 1000 }}
                  size="small"
                  tableLayout="fixed"
                />
              )}
            </Spin>
          </Card>

          {/* Create Category Modal */}
          <Modal
            title="Add New Category"
            open={isModalVisible}
            onCancel={() => {
              setIsModalVisible(false);
              form.resetFields();
            }}
            footer={null}
            width={700}
          >
            <Form
              form={form}
              layout="vertical"
              onFinish={handleCreateCategory}
              requiredMark="optional"
            >
              <Form.Item
                label="Category Name"
                name="name"
                rules={[
                  { required: true, message: 'Please enter category name' },
                  { max: 100, message: 'Name must be 100 characters or less' }
                ]}
              >
                <Input placeholder="e.g., Travel Tips" maxLength={100} onChange={(e) => handleNameChange(e, false)} />
              </Form.Item>

              <Form.Item
                label="Slug"
                name="slug"
                rules={[
                  { required: true, message: 'Please enter category slug' },
                  { pattern: /^[a-z0-9-]+$/, message: 'Slug can only contain lowercase letters, numbers, and hyphens' }
                ]}
                extra="Auto-generated from name (spaces become hyphens)"
              >
                <Input placeholder="e.g., travel-tips" maxLength={100} />
              </Form.Item>

              <Form.Item
                label="Description"
                name="description"
                rules={[{ max: 500, message: 'Description must be 500 characters or less' }]}
              >
                <Input.TextArea placeholder="Category description..." rows={3} maxLength={500} showCount />
              </Form.Item>

              <Form.Item label="Color">
                <Input type="color" style={{ height: '40px', cursor: 'pointer' }} />
              </Form.Item>

              <Form.Item label="Order" name="order" initialValue={0}>
                <InputNumber min={0} placeholder="Display order" />
              </Form.Item>

              <Divider>Status</Divider>

              <Form.Item label="Active" name="isActive" valuePropName="checked" initialValue={true}>
                <Switch />
              </Form.Item>

              <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                <Button onClick={() => {
                  setIsModalVisible(false);
                  form.resetFields();
                }}>
                  Cancel
                </Button>
                <Button type="primary" htmlType="submit" loading={submitting}>
                  Create Category
                </Button>
              </Space>
            </Form>
          </Modal>

          {/* Edit Category Modal */}
          <Modal
            title="Edit Category"
            open={isEditModalVisible}
            onCancel={() => {
              setIsEditModalVisible(false);
              editForm.resetFields();
              setEditingId(null);
            }}
            footer={null}
            width={700}
          >
            <Form
              form={editForm}
              layout="vertical"
              onFinish={handleUpdateCategory}
              requiredMark="optional"
            >
              <Form.Item
                label="Category Name"
                name="name"
                rules={[
                  { required: true, message: 'Please enter category name' },
                  { max: 100, message: 'Name must be 100 characters or less' }
                ]}
              >
                <Input placeholder="e.g., Travel Tips" maxLength={100} onChange={(e) => handleNameChange(e, true)} />
              </Form.Item>

              <Form.Item
                label="Slug"
                name="slug"
                rules={[
                  { required: true, message: 'Please enter category slug' },
                  { pattern: /^[a-z0-9-]+$/, message: 'Slug can only contain lowercase letters, numbers, and hyphens' }
                ]}
                extra="Auto-generated from name (spaces become hyphens)"
              >
                <Input placeholder="e.g., travel-tips" maxLength={100} />
              </Form.Item>

              <Form.Item
                label="Description"
                name="description"
                rules={[{ max: 500, message: 'Description must be 500 characters or less' }]}
              >
                <Input.TextArea placeholder="Category description..." rows={3} maxLength={500} showCount />
              </Form.Item>

              <Form.Item label="Color">
                <Input type="color" style={{ height: '40px', cursor: 'pointer' }} />
              </Form.Item>

              <Form.Item label="Order" name="order">
                <InputNumber min={0} placeholder="Display order" />
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
                }}>
                  Cancel
                </Button>
                <Button type="primary" htmlType="submit" loading={submitting}>
                  Update Category
                </Button>
              </Space>
            </Form>
          </Modal>

          {/* Preview Modal */}
          <Modal
            title={previewCategory?.name}
            open={isPreviewModalVisible}
            onCancel={() => {
              setIsPreviewModalVisible(false);
              setPreviewCategory(null);
            }}
            footer={null}
            width={600}
          >
            {previewCategory && (
              <div className="space-y-4">
                <Divider />

                <div className="space-y-3">
                  <div>
                    <label className="font-semibold text-gray-700">Name</label>
                    <p className="text-gray-600">{previewCategory.name}</p>
                  </div>

                  <div>
                    <label className="font-semibold text-gray-700">Slug</label>
                    <p className="text-gray-600"><code className="bg-gray-100 px-2 py-1 rounded">{previewCategory.slug}</code></p>
                  </div>

                  {previewCategory.description && (
                    <div>
                      <label className="font-semibold text-gray-700">Description</label>
                      <p className="text-gray-600">{previewCategory.description}</p>
                    </div>
                  )}

                  <div>
                    <label className="font-semibold text-gray-700">Posts</label>
                    <p className="text-gray-600 text-lg font-semibold">{previewCategory.postCount}</p>
                  </div>

                  {previewCategory.color && (
                    <div>
                      <label className="font-semibold text-gray-700">Color</label>
                      <div className="flex items-center gap-2">
                        <div 
                          style={{ 
                            backgroundColor: previewCategory.color, 
                            width: '40px', 
                            height: '40px', 
                            borderRadius: '4px',
                            border: '1px solid #ddd'
                          }} 
                        />
                        <span className="text-gray-600">{previewCategory.color}</span>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="font-semibold text-gray-700">Status</label>
                    <p className="text-gray-600">
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${previewCategory.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {previewCategory.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </p>
                  </div>

                  <div>
                    <label className="font-semibold text-gray-700">Order</label>
                    <p className="text-gray-600">{previewCategory.order}</p>
                  </div>
                </div>
              </div>
            )}
          </Modal>
        </div>
      )}
    </>
  );
}
