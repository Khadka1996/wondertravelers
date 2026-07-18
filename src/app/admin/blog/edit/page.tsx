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
  shares?: number;
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
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [typeFilter, setTypeFilter] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalBlogs, setTotalBlogs] = useState(0);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Use same-origin /api routes for admin requests so browser cookies remain attached
  // when the app is served from localhost in production mode.
  const API_URL = '';

  // Handle auth errors
  const handleAuthError = (status: number) => {
    if (status === 401 || status === 403) {
      setErrorMessage('Session validation failed while loading blogs. Please refresh and sign in again if needed.');
      return true;
    }
    return false;
  };

  // Fetch blogs
  const fetchBlogs = useCallback(async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams({
        page: String(currentPage),
        limit: String(pageSize),
      });

      if (searchQuery.trim()) {
        params.set('search', searchQuery.trim());
      }

      if (statusFilter.length > 0) {
        params.set('status', statusFilter.join(','));
      }

      if (typeFilter.length > 0) {
        params.set('type', typeFilter.join(','));
      }

      const response = await fetch(`${API_URL}/api/blogs/admin/all?${params.toString()}`, {
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
        setTotalBlogs(data.pagination?.total || 0);
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
  }, [API_URL, currentPage, pageSize, searchQuery, statusFilter, typeFilter]);

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
      filteredValue: statusFilter,
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
      filteredValue: typeFilter,
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
      title: 'Shares',
      dataIndex: 'shares',
      key: 'shares',
      width: 80,
      render: (value: number | undefined) => value ?? 0,
      sorter: (a, b) => (a.shares || 0) - (b.shares || 0),
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
          onChange={(e) => {
            const value = e.target.value;
            setSearchTerm(value);
            if (value === '') {
              setSearchQuery('');
              setCurrentPage(1);
            }
          }}
          onSearch={() => {
            setSearchQuery(searchTerm);
            setCurrentPage(1);
          }}
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
              dataSource={blogs}
              rowKey="_id"
              pagination={{
                current: currentPage,
                pageSize,
                total: totalBlogs,
                showSizeChanger: true,
                pageSizeOptions: ['10', '20', '50'],
                onChange: (page, size) => {
                  setCurrentPage(page);
                  setPageSize(size);
                }
              }}
              loading={loading}
              scroll={{ x: 1200 }}
              onChange={(pagination, filters) => {
                setCurrentPage(pagination.current || 1);
                setPageSize(pagination.pageSize || 10);
                setStatusFilter(Array.isArray(filters.status) ? filters.status.filter(Boolean) as string[] : []);
                setTypeFilter(Array.isArray(filters.type) ? filters.type.filter(Boolean) as string[] : []);
              }}
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
