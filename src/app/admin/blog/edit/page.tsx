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
  Tooltip,
  Input,
  Tag,
  Popconfirm,
  Row,
  Col,
  Badge,
  Alert
} from 'antd';
import {
  DeleteOutlined,
  ReloadOutlined,
  EditOutlined,
  EyeOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import type { TableColumnsType } from 'antd';
import Link from 'next/link';

interface Blog {
  _id: string;
  title: string;
  subHeading: string;
  author?: { name: string };
  category?: { name: string };
  status: 'draft' | 'published' | 'scheduled' | 'archived';
  type: 'blog' | 'news';
  views: number;
  likesCount: number;
  isFeatured: boolean;
  isBreaking: boolean;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export default function ManageBlogsPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const API_URL = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BASE_URL || 'https://www.wondertravelers.com';

  // Handle auth errors
  const handleAuthError = (status: number) => {
    if (status === 401) {
      setIsRedirecting(true);
      window.location.href = `/auth/login?redirect=/admin/blog`;
      return true;
    }
    return false;
  };

  // Fetch blogs
  const fetchBlogs = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/blogs/admin/all`, {
        credentials: 'include',
        headers: { 'Accept': 'application/json' }
      });

      if (!response.ok) {
        if (handleAuthError(response.status)) {
          return;
        }
        throw new Error(`Server error (${response.status})`);
      }

      const data = await response.json();
      if (data.success) {
        setBlogs(data.data || []);
        setErrorMessage('');
      } else {
        setErrorMessage(data.error || 'Failed to load blogs');
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to fetch blogs';
      setErrorMessage(errorMsg);
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  }, [API_URL]);

  useEffect(() => {
    fetchBlogs();
  }, [fetchBlogs]);

  // Delete blog
  const handleDelete = async (id: string) => {
    try {
      setSubmitting(true);
      const response = await fetch(`${API_URL}/api/blogs/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        if (handleAuthError(response.status)) {
          return;
        }
        throw new Error(`Failed to delete blog`);
      }

      setSuccessMessage('Blog deleted successfully');
      setErrorMessage('');
      fetchBlogs();
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to delete blog';
      setErrorMessage(errorMsg);
      setSuccessMessage('');
    } finally {
      setSubmitting(false);
    }
  };

  // Get status badge color
  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'published': 'green',
      'draft': 'orange',
      'scheduled': 'blue',
      'archived': 'red'
    };
    return colors[status] || 'default';
  };

  // Table columns
  const columns: TableColumnsType<Blog> = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      width: 300,
      render: (text: string) => (
        <Tooltip title={text}>
          <span className="truncate">{text}</span>
        </Tooltip>
      ),
      sorter: (a, b) => a.title.localeCompare(b.title),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Tag>
      ),
      filters: [
        { text: 'Published', value: 'published' },
        { text: 'Draft', value: 'draft' },
        { text: 'Scheduled', value: 'scheduled' },
        { text: 'Archived', value: 'archived' },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: (type: string) => (
        <Tag color={type === 'news' ? 'red' : 'blue'}>
          {type.charAt(0).toUpperCase() + type.slice(1)}
        </Tag>
      ),
      filters: [
        { text: 'Blog', value: 'blog' },
        { text: 'News', value: 'news' },
      ],
      onFilter: (value, record) => record.type === value,
    },
    {
      title: 'Views',
      dataIndex: 'views',
      key: 'views',
      width: 100,
      sorter: (a, b) => (a.views || 0) - (b.views || 0),
    },
    {
      title: 'Likes',
      dataIndex: 'likesCount',
      key: 'likes',
      width: 80,
      sorter: (a, b) => a.likesCount - b.likesCount,
    },
    {
      title: 'Featured',
      dataIndex: 'isFeatured',
      key: 'featured',
      width: 100,
      render: (isFeatured: boolean) => (
        isFeatured ? <Badge status="success" text="Yes" /> : <Badge status="default" text="No" />
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 150,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="View">
            <a href={`/blog/${record._id}`} target="_blank" rel="noreferrer">
              <EyeOutlined />
            </a>
          </Tooltip>
          <Tooltip title="Edit">
            <Link href={`/admin/blog/edit/${record._id}`}>
              <EditOutlined />
            </Link>
          </Tooltip>
          <Popconfirm
            title="Delete Blog"
            description="Are you sure you want to delete this blog?"
            onConfirm={() => handleDelete(record._id)}
            okText="Yes"
            cancelText="No"
          >
            <Tooltip title="Delete">
              <DeleteOutlined className="text-red-500 cursor-pointer" />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6">
      {/* Error and Success Messages */}
      {errorMessage && (
        <Alert
          message="Error"
          description={errorMessage}
          type="error"
          showIcon
          closable
          onClose={() => setErrorMessage('')}
          style={{ marginBottom: '20px' }}
        />
      )}
      {successMessage && (
        <Alert
          message="Success"
          description={successMessage}
          type="success"
          showIcon
          closable
          onClose={() => setSuccessMessage('')}
          style={{ marginBottom: '20px' }}
        />
      )}

      {/* Header */}
      <Row gutter={16} className="mb-6">
        <Col flex="auto">
          <h1 className="text-3xl font-bold">📝 Manage Blogs</h1>
        </Col>
        <Col>
          <Link href="/admin/blog/add">
            <Button type="primary" icon={<PlusOutlined />} size="large">
              Add New Blog
            </Button>
          </Link>
        </Col>
      </Row>

      {/* Search Bar */}
      <Card className="mb-6">
        <Input.Search
          placeholder="Search blogs by title..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          allowClear
          size="large"
          prefix="🔍"
        />
      </Card>

      {/* Blogs Table */}
      <Card loading={loading} title="All Blogs">
        <Spin spinning={submitting} description="Processing...">
          {blogs.length === 0 ? (
            <Empty
              description="No blogs found"
              style={{ marginTop: 50, marginBottom: 50 }}
            />
          ) : (
            <Table
              columns={columns}
              dataSource={blogs.filter(blog =>
                blog.title.toLowerCase().includes(searchTerm.toLowerCase())
              )}
              rowKey="_id"
              pagination={{ pageSize: 10 }}
              loading={loading}
              scroll={{ x: 1200 }}
            />
          )}
        </Spin>
      </Card>

      {/* Actions */}
      <div className="mt-6 text-center">
        <Button
          type="dashed"
          icon={<ReloadOutlined />}
          onClick={fetchBlogs}
          loading={loading}
        >
          Refresh
        </Button>
      </div>
    </div>
  );
}
