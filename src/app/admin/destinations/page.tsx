'use client';

import { useState, useEffect, useCallback } from 'react';
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
  Tooltip,
  Input,
  Form,
  Image,
  Switch,
  Tag,
  Row,
  Col,
  Divider,
  Select,
  InputNumber,
  Upload,
  Badge
} from 'antd';
import {
  DeleteOutlined,
  ReloadOutlined,
  EditOutlined,
  EyeOutlined,
  HeartOutlined,
  StarOutlined,
  StarFilled,
  CloudUploadOutlined,
  GlobalOutlined
} from '@ant-design/icons';
import type { RcFile } from 'antd/es/upload/interface';
import type { TableColumnsType } from 'antd';

interface Destination {
  _id: string;
  name: string;
  slug: string;
  category: string;
  shortDesc: string;
  longDesc?: string;
  image: {
    url: string;
    width?: number;
    height?: number;
  };
  gallery?: Array<{ url: string; caption?: string; order?: number }>;
  rating: number;
  reviewCount: number;
  featured: boolean;
  published: boolean;
  activities?: string[];
  difficulty?: string;
  duration?: { min: number; max: number };
  altitude?: { min: number; max: number };
  engagement: {
    views: number;
    saves: number;
  };
  location?: {
    region: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface FormData {
  name: string;
  category: string;
  shortDesc: string;
  longDesc?: string;
  featured: boolean;
  published: boolean;
  activities?: string[];
  difficulty?: string;
  durationMin?: number;
  durationMax?: number;
  altitudeMin?: number;
  altitudeMax?: number;
  region?: string;
}

const CATEGORIES = [
  'Mountains',
  'Lakes & Adventure',
  'Cultural Heritage',
  'Trekking',
  'Wildlife & Jungle',
  'Other'
];

const DIFFICULTY_LEVELS = ['Easy', 'Moderate', 'Challenging', 'Extreme'];

const SAMPLE_ACTIVITIES = [
  'Trekking', 'Hiking', 'Paragliding', 'Rafting', 'Rock Climbing',
  'Sightseeing', 'Photography', 'Wildlife Watching', 'Cultural Tour',
  'Adventure Sports', 'Camping', 'Bird Watching'
];

export default function ManageDestinationsPage() {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isPreviewModalVisible, setIsPreviewModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [previewDest, setPreviewDest] = useState<Destination | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [categories, setCategories] = useState<string[]>([]);
  const [uploadedImage, setUploadedImage] = useState<RcFile | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isRedirecting, setIsRedirecting] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  // Helper function to handle auth errors
  const handleAuthError = (status: number, returnUrl: string = '/admin/destinations') => {
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

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${API_URL}/api/destinations/categories`, {
          credentials: 'include'
        });
        const data = await response.json();
        if (data.success && Array.isArray(data.categories)) {
          setCategories(data.categories.filter((c: string) => c !== 'All'));
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    };
    fetchCategories();
  }, [API_URL]);

  // Fetch destinations
  const fetchDestinations = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/destinations/admin/all?limit=100`, {
        credentials: 'include',
        headers: { 'Accept': 'application/json' }
      });

      if (!response.ok) {
        // Check for auth errors first
        if (handleAuthError(response.status)) {
          return;
        }
        throw new Error(`Server error (${response.status})`);
      }

      const data = await response.json();
      if (data.success) {
        setDestinations(data.destinations);
      } else {
        message.error(data.message || 'Failed to load destinations');
      }
    } catch (error) {
      if (!isRedirecting) {
        const errorMsg = error instanceof Error ? error.message : 'Failed to fetch destinations';
        message.error(errorMsg);
        console.error('Fetch error:', error);
      }
    } finally {
      if (!isRedirecting) {
        setLoading(false);
      }
    }
  }, [API_URL, isRedirecting]);

  // Initial fetch
  useEffect(() => {
    fetchDestinations();
  }, [fetchDestinations]);

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

  // Handle create destination
  const handleCreateDestination = async (values: FormData) => {
    try {
      setSubmitting(true);

      if (!uploadedImage) {
        message.error('Please upload a destination image');
        return;
      }

      // In a real app, upload image to storage service and get URL
      // For now, we'll use a placeholder
      const imageUrl = imagePreview;

      const payload = {
        ...values,
        image: {
          url: imageUrl,
          width: 800,
          height: 600
        },
        duration: values.durationMin ? {
          min: values.durationMin,
          max: values.durationMax || values.durationMin
        } : undefined,
        altitude: values.altitudeMin ? {
          min: values.altitudeMin,
          max: values.altitudeMax || values.altitudeMin
        } : undefined,
        location: values.region ? { region: values.region } : undefined
      };

      const response = await fetch(`${API_URL}/api/destinations`, {
        method: 'POST',
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
        throw new Error(data.message || 'Failed to create destination');
      }

      message.success('Destination created successfully');
      setIsModalVisible(false);
      form.resetFields();
      setUploadedImage(null);
      setImagePreview('');
      fetchDestinations();
    } catch (error) {
      if (!isRedirecting) {
        const errorMsg = error instanceof Error ? error.message : 'Failed to create destination';
        message.error(errorMsg);
      }
    } finally {
      if (!isRedirecting) {
        setSubmitting(false);
      }
    }
  };

  // Handle edit destination
  const handleEditDestination = (destination: Destination) => {
    console.log('Edit destination clicked:', destination);
    setEditingId(destination._id);
    
    const formValues = {
      name: destination.name || '',
      category: destination.category || '',
      shortDesc: destination.shortDesc || '',
      longDesc: destination.longDesc || '',
      featured: destination.featured || false,
      published: destination.published || false,
      activities: destination.activities && Array.isArray(destination.activities) ? destination.activities : [],
      difficulty: destination.difficulty || '',
      durationMin: destination.duration?.min || null,
      durationMax: destination.duration?.max || null,
      altitudeMin: destination.altitude?.min || null,
      altitudeMax: destination.altitude?.max || null,
      region: destination.location?.region || ''
    };
    
    console.log('Setting form values:', formValues);
    editForm.setFieldsValue(formValues);
    
    // Set image preview
    if (destination.image && destination.image.url) {
      setImagePreview(destination.image.url);
    }
    setUploadedImage(null);
    // Show modal
    setIsEditModalVisible(true);
  };

  // Handle update destination
  const handleUpdateDestination = async (values: FormData) => {
    try {
      setSubmitting(true);

      const payload = {
        ...values,
        duration: values.durationMin ? {
          min: values.durationMin,
          max: values.durationMax || values.durationMin
        } : undefined,
        altitude: values.altitudeMin ? {
          min: values.altitudeMin,
          max: values.altitudeMax || values.altitudeMin
        } : undefined,
        location: values.region ? { region: values.region } : undefined
      };

      const response = await fetch(`${API_URL}/api/destinations/${editingId}`, {
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
        throw new Error(data.message || 'Failed to update destination');
      }

      message.success('Destination updated successfully');
      setIsEditModalVisible(false);
      editForm.resetFields();
      setEditingId(null);
      setUploadedImage(null);
      setImagePreview('');
      fetchDestinations();
    } catch (error) {
      if (!isRedirecting) {
        const errorMsg = error instanceof Error ? error.message : 'Failed to update destination';
        message.error(errorMsg);
      }
    } finally {
      if (!isRedirecting) {
        setSubmitting(false);
      }
    }
  };

  // Handle delete destination
  const handleDeleteDestination = (id: string) => {
    Modal.confirm({
      title: 'Delete Destination',
      content: 'Are you sure you want to delete this destination? This action cannot be undone.',
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          const response = await fetch(`${API_URL}/api/destinations/${id}`, {
            method: 'DELETE',
            credentials: 'include'
          });

          if (!response.ok) {
            // Check for auth errors first
            if (handleAuthError(response.status)) {
              return;
            }
            const data = await response.json();
            throw new Error(data.message || 'Failed to delete destination');
          }

          message.success('Destination deleted successfully');
          fetchDestinations();
        } catch (error) {
          if (!isRedirecting) {
            const errorMsg = error instanceof Error ? error.message : 'Failed to delete destination';
            message.error(errorMsg);
          }
        }
      }
    });
  };

  // Handle toggle featured
  const handleToggleFeatured = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`${API_URL}/api/destinations/${id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ featured: !currentStatus })
      });

      if (!response.ok) {
        // Check for auth errors first
        if (handleAuthError(response.status)) {
          return;
        }
        const data = await response.json();
        throw new Error(data.message || 'Failed to update destination');
      }

      message.success(currentStatus ? 'Removed from featured' : 'Added to featured');
      fetchDestinations();
    } catch (error) {
      if (!isRedirecting) {
        const errorMsg = error instanceof Error ? error.message : 'Failed to update destination';
        message.error(errorMsg);
      }
    }
  };

  // Handle toggle published
  const handleTogglePublished = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`${API_URL}/api/destinations/${id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ published: !currentStatus })
      });

      if (!response.ok) {
        // Check for auth errors first
        if (handleAuthError(response.status)) {
          return;
        }
        const data = await response.json();
        throw new Error(data.message || 'Failed to update destination');
      }

      message.success(currentStatus ? 'Unpublished' : 'Published');
      fetchDestinations();
    } catch (error) {
      if (!isRedirecting) {
        const errorMsg = error instanceof Error ? error.message : 'Failed to update destination';
        message.error(errorMsg);
      }
    }
  };

  // Handle preview
  const handlePreviewDestination = (destination: Destination) => {
    setPreviewDest(destination);
    setIsPreviewModalVisible(true);
  };

  // Filter destinations
  const filteredDestinations = destinations.filter(dest =>
    (dest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dest.shortDesc.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (!selectedCategory || dest.category === selectedCategory)
  );

  // Statistics
  const stats = {
    total: destinations.length,
    published: destinations.filter(d => d.published).length,
    featured: destinations.filter(d => d.featured).length,
    totalViews: destinations.reduce((sum, d) => sum + (d.engagement?.views || 0), 0),
    totalSaves: destinations.reduce((sum, d) => sum + (d.engagement?.saves || 0), 0)
  };

  // Table columns
  const columns: TableColumnsType<Destination> = [
    {
      title: 'Image',
      dataIndex: ['image', 'url'],
      key: 'image',
      width: 60,
      render: (url: string) => (
        <Image
          src={url}
          alt="destination"
          width={60}
          height={45}
          style={{ objectFit: 'cover', borderRadius: '4px' }}
          preview={false}
        />
      )
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      width: 150,
      render: (text: string) => <span className="font-medium">{text}</span>
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      width: 100,
      render: (category: string) => (
        <Tag color="blue">{category}</Tag>
      )
    },
    {
      title: 'Rating',
      dataIndex: 'rating',
      key: 'rating',
      width: 70,
      align: 'center' as const,
      render: (rating: number, record) => (
        <Space orientation="vertical" size={0} align="center">
          <StarFilled style={{ color: '#faad14' }} />
          <span className="text-xs">{rating.toFixed(1)}</span>
          <span className="text-xs text-gray-400">({record.reviewCount})</span>
        </Space>
      )
    },
    {
      title: 'Engagement',
      key: 'engagement',
      width: 100,
      align: 'center' as const,
      render: (_, record) => (
        <Space orientation="vertical" size={2} align="center">
          <span className="text-xs">
            <EyeOutlined className="mr-1" style={{ color: '#1890ff' }} />
            {record.engagement.views}
          </span>
          <span className="text-xs">
            <HeartOutlined className="mr-1" style={{ color: '#ff4d4f' }} />
            {record.engagement.saves}
          </span>
        </Space>
      )
    },
    {
      title: 'Status',
      key: 'status',
      width: 100,
      render: (_, record) => (
        <Space orientation="vertical" size={2}>
          <div className="flex items-center gap-2">
            <Badge
              status={record.published ? 'success' : 'default'}
              text={record.published ? 'Published' : 'Draft'}
            />
            <Switch
              size="small"
              checked={record.published}
              onChange={() => handleTogglePublished(record._id, record.published)}
            />
          </div>
          {record.featured && <Badge status="processing" text="Featured" />}
        </Space>
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
              onClick={() => handlePreviewDestination(record)}
            />
          </Tooltip>
          <Tooltip title={record.featured ? 'Remove Featured' : 'Add Featured'}>
            <Button
              type="text"
              size="small"
              icon={record.featured ? <StarFilled className="text-yellow-500" /> : <StarOutlined />}
              onClick={() => handleToggleFeatured(record._id, record.featured)}
            />
          </Tooltip>
          <Button
            type="text"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEditDestination(record)}
          />
          <Button
            type="text"
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteDestination(record._id)}
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
          <h1 className="text-3xl font-bold text-gray-800">Manage Destinations</h1>
          <p className="text-gray-500 mt-1">Create, manage, and publish travel destinations</p>
        </div>
        <Button
          type="primary"
          size="large"
          icon={<GlobalOutlined />}
          onClick={() => {
            form.resetFields();
            setUploadedImage(null);
            setImagePreview('');
            setIsModalVisible(true);
          }}
        >
          Add Destination
        </Button>
      </div>

      {/* Statistics */}
      <Row gutter={16}>
        <Col xs={24} sm={8} md={5}>
          <Card>
            <Statistic
              title="Total"
              value={stats.total}
              styles={{ content: { color: '#174fa2' } }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8} md={5}>
          <Card>
            <Statistic
              title="Published"
              value={stats.published}
              styles={{ content: { color: '#22c55e' } }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8} md={5}>
          <Card>
            <Statistic
              title="Featured"
              value={stats.featured}
              styles={{ content: { color: '#f59e0b' } }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={5}>
          <Card>
            <Statistic
              title="Total Views"
              value={stats.totalViews}
              prefix={<EyeOutlined />}
              styles={{ content: { color: '#1890ff', fontSize: '18px' } }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={4}>
          <Card>
            <Statistic
              title="Saves"
              value={stats.totalSaves}
              prefix={<HeartOutlined />}
              styles={{ content: { color: '#ff4d4f', fontSize: '18px' } }}
            />
          </Card>
        </Col>
      </Row>

      {/* Search & Filter */}
      <Card>
        <Space orientation="vertical" style={{ width: '100%' }} size="middle">
          <div className="flex gap-4 flex-wrap">
            <Input
              placeholder="Search by name or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              allowClear
              style={{ maxWidth: '300px' }}
            />
            <Select
              placeholder="Filter by category"
              value={selectedCategory || undefined}
              onChange={setSelectedCategory}
              allowClear
              style={{ width: '200px' }}
              options={categories.map(cat => ({ label: cat, value: cat }))}
            />
            <Button
              icon={<ReloadOutlined />}
              onClick={fetchDestinations}
              loading={loading}
            >
              Refresh
            </Button>
          </div>
        </Space>
      </Card>

      {/* Destinations Table */}
      <Card>
        <Spin spinning={loading}>
          {filteredDestinations.length === 0 ? (
            <Empty
              description={searchTerm ? 'No destinations match your search' : 'No destinations yet'}
              style={{ margin: '50px' }}
            >
              {!searchTerm && (
                <Button
                  type="primary"
                  size="large"
                  icon={<GlobalOutlined />}
                  onClick={() => {
                    form.resetFields();
                    setUploadedImage(null);
                    setImagePreview('');
                    setIsModalVisible(true);
                  }}
                >
                  Add Your First Destination
                </Button>
              )}
            </Empty>
          ) : (
            <Table
              columns={columns}
              dataSource={filteredDestinations}
              rowKey="_id"
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                pageSizeOptions: ['10', '20', '50'],
                showTotal: (total) => `Total ${total} destinations`
              }}
              scroll={{ x: 1200 }}
              size="small"
              tableLayout="fixed"
            />
          )}
        </Spin>
      </Card>

      {/* Create Destination Modal */}
      <Modal
        title="Add New Destination"
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
          onFinish={handleCreateDestination}
          requiredMark="optional"
        >
          {/* Image Upload */}
          <Form.Item label="Featured Image" required>
            <Upload
              accept="image/*"
              maxCount={1}
              beforeUpload={handleImageUpload}
              onRemove={() => {
                setUploadedImage(null);
                setImagePreview('');
              }}
            >
              <Button icon={<CloudUploadOutlined />}>Upload Image</Button>
            </Upload>
            {imagePreview && (
              <div className="mt-2">
                <Image src={imagePreview} width={150} height={110} alt="Preview" style={{ objectFit: 'cover', borderRadius: '4px' }} />
              </div>
            )}
          </Form.Item>

          {/* Basic Info */}
          <Form.Item
            label="Destination Name"
            name="name"
            rules={[
              { required: true, message: 'Please enter destination name' },
              { max: 100, message: 'Name must be 100 characters or less' }
            ]}
          >
            <Input placeholder="e.g., Everest Base Camp" maxLength={100} />
          </Form.Item>

          <Form.Item
            label="Category"
            name="category"
            rules={[{ required: true, message: 'Please select category' }]}
          >
            <Select placeholder="Select category" options={CATEGORIES.map(c => ({ label: c, value: c }))} />
          </Form.Item>

          <Form.Item
            label="Short Description"
            name="shortDesc"
            rules={[
              { required: true, message: 'Please enter short description' },
              { max: 200, message: 'Short description must be 200 characters or less' }
            ]}
          >
            <Input.TextArea placeholder="Brief description..." rows={2} maxLength={200} showCount />
          </Form.Item>

          <Form.Item
            label="Long Description"
            name="longDesc"
            rules={[{ max: 2000, message: 'Long description must be 2000 characters or less' }]}
          >
            <Input.TextArea placeholder="Detailed description..." rows={3} maxLength={2000} showCount />
          </Form.Item>

          {/* Location & Details */}
          <Divider>Location & Details</Divider>

          <Form.Item label="Region" name="region">
            <Input placeholder="e.g., Sagarmatha Zone" />
          </Form.Item>

          <Form.Item label="Difficulty" name="difficulty">
            <Select placeholder="Select difficulty" options={DIFFICULTY_LEVELS.map(d => ({ label: d, value: d }))} />
          </Form.Item>

          <Form.Item label="Activities" name="activities">
            <Select
              mode="multiple"
              placeholder="Select activities"
              options={SAMPLE_ACTIVITIES.map(a => ({ label: a, value: a }))}
            />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Duration Min (days)" name="durationMin">
                <InputNumber min={1} placeholder="Min days" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Duration Max (days)" name="durationMax">
                <InputNumber min={1} placeholder="Max days" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Altitude Min (m)" name="altitudeMin">
                <InputNumber min={0} placeholder="Min altitude" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Altitude Max (m)" name="altitudeMax">
                <InputNumber min={0} placeholder="Max altitude" />
              </Form.Item>
            </Col>
          </Row>

          {/* Status */}
          <Divider>Status</Divider>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Published" name="published" valuePropName="checked" initialValue={false}>
                <Switch />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Featured" name="featured" valuePropName="checked" initialValue={false}>
                <Switch />
              </Form.Item>
            </Col>
          </Row>

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
              Create Destination
            </Button>
          </Space>
        </Form>
      </Modal>

      {/* Edit Destination Modal */}
      <Modal
        title="Edit Destination"
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
          onFinish={handleUpdateDestination}
          requiredMark="optional"
        >
          {/* Image Upload */}
          <Form.Item label="Featured Image">
            {imagePreview && (
              <div className="mb-2">
                <Image src={imagePreview} width={150} height={110} alt="Preview" style={{ objectFit: 'cover', borderRadius: '4px' }} />
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
              <Button icon={<CloudUploadOutlined />}>Change Image</Button>
            </Upload>
          </Form.Item>

          <Form.Item
            label="Destination Name"
            name="name"
            rules={[
              { required: true, message: 'Please enter destination name' },
              { max: 100, message: 'Name must be 100 characters or less' }
            ]}
          >
            <Input placeholder="e.g., Everest Base Camp" maxLength={100} />
          </Form.Item>

          <Form.Item
            label="Category"
            name="category"
            rules={[{ required: true, message: 'Please select category' }]}
          >
            <Select placeholder="Select category" options={CATEGORIES.map(c => ({ label: c, value: c }))} />
          </Form.Item>

          <Form.Item
            label="Short Description"
            name="shortDesc"
            rules={[
              { required: true, message: 'Please enter short description' },
              { max: 200, message: 'Short description must be 200 characters or less' }
            ]}
          >
            <Input.TextArea placeholder="Brief description..." rows={2} maxLength={200} showCount />
          </Form.Item>

          <Form.Item
            label="Long Description"
            name="longDesc"
            rules={[{ max: 2000, message: 'Long description must be 2000 characters or less' }]}
          >
            <Input.TextArea placeholder="Detailed description..." rows={3} maxLength={2000} showCount />
          </Form.Item>

          <Divider>Location & Details</Divider>

          <Form.Item label="Region" name="region">
            <Input placeholder="e.g., Sagarmatha Zone" />
          </Form.Item>

          <Form.Item label="Difficulty" name="difficulty">
            <Select placeholder="Select difficulty" options={DIFFICULTY_LEVELS.map(d => ({ label: d, value: d }))} />
          </Form.Item>

          <Form.Item label="Activities" name="activities">
            <Select
              mode="multiple"
              placeholder="Select activities"
              options={SAMPLE_ACTIVITIES.map(a => ({ label: a, value: a }))}
            />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Duration Min (days)" name="durationMin">
                <InputNumber min={1} placeholder="Min days" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Duration Max (days)" name="durationMax">
                <InputNumber min={1} placeholder="Max days" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Altitude Min (m)" name="altitudeMin">
                <InputNumber min={0} placeholder="Min altitude" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Altitude Max (m)" name="altitudeMax">
                <InputNumber min={0} placeholder="Max altitude" />
              </Form.Item>
            </Col>
          </Row>

          <Divider>Status</Divider>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Published" name="published" valuePropName="checked">
                <Switch />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Featured" name="featured" valuePropName="checked">
                <Switch />
              </Form.Item>
            </Col>
          </Row>

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
              Update Destination
            </Button>
          </Space>
        </Form>
      </Modal>

      {/* Preview Modal */}
      <Modal
        title={previewDest?.name}
        open={isPreviewModalVisible}
        onCancel={() => {
          setIsPreviewModalVisible(false);
          setPreviewDest(null);
        }}
        footer={null}
        width={700}
      >
        {previewDest && (
          <div className="space-y-4">
            <Image
              src={previewDest.image.url}
              alt={previewDest.name}
              width="100%"
              height={300}
              style={{ objectFit: 'cover', borderRadius: '4px' }}
            />

            <Divider />

            <div className="space-y-3">
              <div>
                <label className="font-semibold text-gray-700">Name</label>
                <p className="text-gray-600">{previewDest.name}</p>
              </div>

              <div>
                <label className="font-semibold text-gray-700">Category</label>
                <p><Tag color="blue">{previewDest.category}</Tag></p>
              </div>

              <div>
                <label className="font-semibold text-gray-700">Description</label>
                <p className="text-gray-600">{previewDest.shortDesc}</p>
                {previewDest.longDesc && (
                  <p className="text-gray-500 text-sm mt-1">{previewDest.longDesc}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-gray-700">Rating</label>
                  <p className="text-gray-600">
                    <StarFilled style={{ color: '#faad14' }} /> {previewDest.rating.toFixed(1)} ({previewDest.reviewCount} reviews)
                  </p>
                </div>
                <div>
                  <label className="font-semibold text-gray-700">Difficulty</label>
                  <p className="text-gray-600">{previewDest.difficulty || 'Moderate'}</p>
                </div>
              </div>

              {previewDest.duration && (
                <div>
                  <label className="font-semibold text-gray-700">Duration</label>
                  <p className="text-gray-600">{previewDest.duration.min} - {previewDest.duration.max} days</p>
                </div>
              )}

              {previewDest.activities && previewDest.activities.length > 0 && (
                <div>
                  <label className="font-semibold text-gray-700">Activities</label>
                  <Space wrap>
                    {previewDest.activities.map((activity, idx) => (
                      <Tag key={idx}>{activity}</Tag>
                    ))}
                  </Space>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-gray-700">Views</label>
                  <p className="text-gray-600"><EyeOutlined /> {previewDest.engagement.views}</p>
                </div>
                <div>
                  <label className="font-semibold text-gray-700">Saves</label>
                  <p className="text-gray-600"><HeartOutlined /> {previewDest.engagement.saves}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-gray-700">Status</label>
                  <p>
                    <Badge
                      status={previewDest.published ? 'success' : 'default'}
                      text={previewDest.published ? 'Published' : 'Draft'}
                    />
                  </p>
                </div>
                {previewDest.featured && (
                  <div>
                    <label className="font-semibold text-gray-700">Featured</label>
                    <p><Badge status="processing" text="Featured" /></p>
                  </div>
                )}
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
