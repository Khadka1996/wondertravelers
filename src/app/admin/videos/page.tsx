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
  Tooltip,
  Input,
  Form,
  Image,
  Switch,
  Tag,
  Row,
  Col,
  Divider
} from 'antd';
import {
  DeleteOutlined,
  ReloadOutlined,
  EditOutlined,
  EyeOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  YoutubeOutlined,
  LinkOutlined
} from '@ant-design/icons';
import type { TableColumnsType } from 'antd';

interface Video {
  _id: string;
  videoUrl: string;
  title: string;
  description?: string;
  order: number;
  isActive: boolean;
  embedUrl?: string;
  thumbnailUrl?: string;
  createdAt: string;
  updatedAt: string;
}

interface FormData {
  videoUrl: string;
  title: string;
  description?: string;
}

export default function ManageVideosPage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isPreviewModalVisible, setIsPreviewModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [previewVideo, setPreviewVideo] = useState<Video | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  const [searchTerm, setSearchTerm] = useState('');

  const API_URL = '';

  // Fetch videos
  const fetchVideos = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/videos`, {
        credentials: 'include',
        headers: { 'Accept': 'application/json' }
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Avoid hard redirect loops. Server layout already protects admin routes.
          throw new Error('Unauthorized while loading videos. Please refresh and sign in again if needed.');
        }
        throw new Error(`Server error (${response.status})`);
      }

      const data = await response.json();
      if (data.success) {
        setVideos(data.data);
      } else {
        message.error(data.error || 'Failed to load videos');
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to fetch videos';
      message.error(errorMsg);
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchVideos();
  }, []);

  // Handle create video
  const handleCreateVideo = async (values: FormData) => {
    try {
      setSubmitting(true);
      const response = await fetch(`${API_URL}/api/videos`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create video');
      }

      message.success('Video created successfully');
      setIsModalVisible(false);
      form.resetFields();
      fetchVideos();
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to create video';
      message.error(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle edit video
  const handleEditVideo = (video: Video) => {
    setEditingId(video._id);
    editForm.setFieldsValue({
      videoUrl: video.videoUrl,
      title: video.title,
      description: video.description,
      isActive: video.isActive
    });
    setIsEditModalVisible(true);
  };

  // Handle update video
  const handleUpdateVideo = async (values: Record<string, unknown>) => {
    try {
      setSubmitting(true);
      const response = await fetch(`${API_URL}/api/videos/${editingId}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update video');
      }

      message.success('Video updated successfully');
      setIsEditModalVisible(false);
      editForm.resetFields();
      setEditingId(null);
      fetchVideos();
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to update video';
      message.error(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle delete video
  const handleDeleteVideo = (id: string) => {
    Modal.confirm({
      title: 'Delete Video',
      content: 'Are you sure you want to delete this video? This action cannot be undone.',
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          const response = await fetch(`${API_URL}/api/videos/${id}`, {
            method: 'DELETE',
            credentials: 'include'
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.error || 'Failed to delete video');
          }

          message.success('Video deleted successfully');
          fetchVideos();
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : 'Failed to delete video';
          message.error(errorMsg);
        }
      }
    });
  };

  // Handle reorder videos
  const handleMoveVideo = async (id: string, direction: 'up' | 'down') => {
    try {
      const currentIndex = videos.findIndex(v => v._id === id);
      if ((direction === 'up' && currentIndex === 0) || 
          (direction === 'down' && currentIndex === videos.length - 1)) {
        return;
      }

      const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
      const reorderedIds = [...videos.map(v => v._id)];
      [reorderedIds[currentIndex], reorderedIds[newIndex]] = [reorderedIds[newIndex], reorderedIds[currentIndex]];

      const response = await fetch(`${API_URL}/api/videos/reorder`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoIds: reorderedIds })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to reorder videos');
      }

      message.success('Video order updated');
      fetchVideos();
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to reorder video';
      message.error(errorMsg);
    }
  };

  // Handle preview video
  const handlePreviewVideo = (video: Video) => {
    setPreviewVideo(video);
    setIsPreviewModalVisible(true);
  };

  // Extract YouTube ID
  const extractYouTubeId = (url: string): string | null => {
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/))([^&\n?#]+)/);
    return match ? match[1] : null;
  };

  // Get thumbnail URL
  const getThumbnailUrl = (videoUrl: string): string => {
    const videoId = extractYouTubeId(videoUrl);
    return videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : '';
  };

  // Filter videos
  const filteredVideos = videos.filter(video =>
    video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    video.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    video.videoUrl.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Table columns
  const columns: TableColumnsType<Video> = [
    {
      title: 'Thumbnail',
      dataIndex: 'videoUrl',
      key: 'thumbnail',
      width: 60,
      render: (url: string) => (
        <Image
          src={getThumbnailUrl(url)}
          alt="thumbnail"
          width={60}
          height={45}
          style={{ objectFit: 'cover', borderRadius: '4px' }}
          preview={false}
        />
      )
    },
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      width: 180,
      render: (text: string) => <span className="font-medium">{text}</span>
    },
    {
      title: 'Order',
      dataIndex: 'order',
      key: 'order',
      width: 60,
      align: 'center' as const,
      sorter: (a, b) => a.order - b.order
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'status',
      width: 70,
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'green' : 'default'}>
          {isActive ? 'Active' : 'Inactive'}
        </Tag>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 140,
      render: (_, record, index) => (
        <Space size={2}>
          <Tooltip title="Preview">
            <Button
              type="text"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => handlePreviewVideo(record)}
            />
          </Tooltip>
          <Tooltip title="Move Up">
            <Button
              type="text"
              size="small"
              icon={<ArrowUpOutlined />}
              disabled={index === 0}
              onClick={() => handleMoveVideo(record._id, 'up')}
            />
          </Tooltip>
          <Tooltip title="Move Down">
            <Button
              type="text"
              size="small"
              icon={<ArrowDownOutlined />}
              disabled={index === filteredVideos.length - 1}
              onClick={() => handleMoveVideo(record._id, 'down')}
            />
          </Tooltip>
          <Button
            type="text"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEditVideo(record)}
          />
          <Button
            type="text"
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteVideo(record._id)}
          />
        </Space>
      )
    }
  ];

  // Statistics
  const stats = {
    totalVideos: videos.length,
    activeVideos: videos.filter(v => v.isActive).length,
    inactiveVideos: videos.filter(v => !v.isActive).length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Manage Videos</h1>
          <p className="text-gray-500 mt-1">Upload, manage, and organize your YouTube videos</p>
        </div>
        <Button
          type="primary"
          size="large"
          icon={<YoutubeOutlined />}
          onClick={() => {
            form.resetFields();
            setIsModalVisible(true);
          }}
        >
          Add Video
        </Button>
      </div>

      {/* Statistics */}
      <Row gutter={16}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Total Videos"
              value={stats.totalVideos}
              styles={{ content: { color: '#174fa2' } }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Active"
              value={stats.activeVideos}
              styles={{ content: { color: '#22c55e' } }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Inactive"
              value={stats.inactiveVideos}
              styles={{ content: { color: '#ef4444' } }}
            />
          </Card>
        </Col>
      </Row>

      {/* Search & Filter */}
      <Card>
        <Space orientation="vertical" style={{ width: '100%' }} size="middle">
          <Input
            placeholder="Search by title, description, or URL..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            allowClear
            style={{ maxWidth: '400px' }}
          />
          <div className="flex gap-2">
            <Button
              icon={<ReloadOutlined />}
              onClick={fetchVideos}
              loading={loading}
            >
              Refresh
            </Button>
          </div>
        </Space>
      </Card>

      {/* Videos Table */}
      <Card>
        <Spin spinning={loading}>
          {filteredVideos.length === 0 ? (
            <Empty
              description={searchTerm ? 'No videos match your search' : 'No videos yet'}
              style={{ margin: '50px 0' }}
            >
              {!searchTerm && (
                <Button
                  type="primary"
                  size="large"
                  icon={<YoutubeOutlined />}
                  onClick={() => {
                    form.resetFields();
                    setIsModalVisible(true);
                  }}
                >
                  Add Your First Video
                </Button>
              )}
            </Empty>
          ) : (
            <Table
              columns={columns}
              dataSource={filteredVideos}
              rowKey="_id"
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                pageSizeOptions: ['10', '20', '50'],
                showTotal: (total) => `Total ${total} videos`
              }}
              scroll={{ x: 1000 }}
              size="small"
              tableLayout="fixed"
            />
          )}
        </Spin>
      </Card>

      {/* Create Video Modal */}
      <Modal
        title="Add New Video"
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateVideo}
          requiredMark="optional"
        >
          <Form.Item
            label="YouTube URL"
            name="videoUrl"
            rules={[
              { required: true, message: 'Please enter a YouTube URL' },
              {
                pattern: /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/))([^&\n?#]+)/,
                message: 'Please enter a valid YouTube URL'
              }
            ]}
            tooltip="Paste your YouTube video URL (e.g., https://www.youtube.com/watch?v=..."
          >
            <Input
              placeholder="https://www.youtube.com/watch?v=..."
              prefix={<YoutubeOutlined />}
            />
          </Form.Item>

          <Form.Item
            label="Video Title"
            name="title"
            rules={[
              { required: true, message: 'Please enter a title' },
              { max: 200, message: 'Title must be 200 characters or less' }
            ]}
          >
            <Input
              placeholder="e.g., Everest Base Camp Trek"
              maxLength={200}
            />
          </Form.Item>

          <Form.Item
            label="Description"
            name="description"
            rules={[{ max: 1000, message: 'Description must be 1000 characters or less' }]}
          >
            <Input.TextArea
              placeholder="Optional description..."
              rows={3}
              maxLength={1000}
              showCount
            />
          </Form.Item>

          <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
            <Button onClick={() => {
              setIsModalVisible(false);
              form.resetFields();
            }}>
              Cancel
            </Button>
            <Button type="primary" htmlType="submit" loading={submitting}>
              Create Video
            </Button>
          </Space>
        </Form>
      </Modal>

      {/* Edit Video Modal */}
      <Modal
        title="Edit Video"
        open={isEditModalVisible}
        onCancel={() => {
          setIsEditModalVisible(false);
          editForm.resetFields();
          setEditingId(null);
        }}
        footer={null}
        width={600}
      >
        <Form
          form={editForm}
          layout="vertical"
          onFinish={handleUpdateVideo}
          requiredMark="optional"
        >
          <Form.Item
            label="YouTube URL"
            name="videoUrl"
            rules={[
              { required: true, message: 'Please enter a YouTube URL' },
              {
                pattern: /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/))([^&\n?#]+)/,
                message: 'Please enter a valid YouTube URL'
              }
            ]}
          >
            <Input
              placeholder="https://www.youtube.com/watch?v=..."
              prefix={<YoutubeOutlined />}
            />
          </Form.Item>

          <Form.Item
            label="Video Title"
            name="title"
            rules={[
              { required: true, message: 'Please enter a title' },
              { max: 200, message: 'Title must be 200 characters or less' }
            ]}
          >
            <Input
              placeholder="e.g., Everest Base Camp Trek"
              maxLength={200}
            />
          </Form.Item>

          <Form.Item
            label="Description"
            name="description"
            rules={[{ max: 1000, message: 'Description must be 1000 characters or less' }]}
          >
            <Input.TextArea
              placeholder="Optional description..."
              rows={3}
              maxLength={1000}
              showCount
            />
          </Form.Item>

          <Form.Item
            label="Active Status"
            name="isActive"
            valuePropName="checked"
          >
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
              Update Video
            </Button>
          </Space>
        </Form>
      </Modal>

      {/* Preview Video Modal */}
      <Modal
        title={previewVideo?.title}
        open={isPreviewModalVisible}
        onCancel={() => {
          setIsPreviewModalVisible(false);
          setPreviewVideo(null);
        }}
        footer={null}
        width={800}
      >
        {previewVideo && (
          <div className="space-y-4">
            <div className="flex justify-center bg-black rounded">
              <iframe
                width="100%"
                height="450"
                src={`https://www.youtube.com/embed/${extractYouTubeId(previewVideo.videoUrl)}`}
                title={previewVideo.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={{ borderRadius: '4px' }}
              />
            </div>

            <Divider />

            <div className="space-y-3">
              <div>
                <label className="font-semibold text-gray-700">Title</label>
                <p className="text-gray-600">{previewVideo.title}</p>
              </div>

              {previewVideo.description && (
                <div>
                  <label className="font-semibold text-gray-700">Description</label>
                  <p className="text-gray-600">{previewVideo.description}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-gray-700">Order</label>
                  <p className="text-gray-600">#{previewVideo.order}</p>
                </div>
                <div>
                  <label className="font-semibold text-gray-700">Status</label>
                  <p>
                    <Tag color={previewVideo.isActive ? 'green' : 'default'}>
                      {previewVideo.isActive ? 'Active' : 'Inactive'}
                    </Tag>
                  </p>
                </div>
              </div>

              <div>
                <label className="font-semibold text-gray-700">YouTube URL</label>
                <div className="flex items-center gap-2 mt-1">
                  <code className="bg-gray-100 px-2 py-1 rounded text-xs break-all flex-1">
                    {previewVideo.videoUrl}
                  </code>
                  <Button
                    type="text"
                    size="small"
                    icon={<LinkOutlined />}
                    href={previewVideo.videoUrl}
                    target="_blank"
                  />
                </div>
              </div>

              <div className="text-xs text-gray-400 pt-2">
                Created: {new Date(previewVideo.createdAt).toLocaleString()}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
