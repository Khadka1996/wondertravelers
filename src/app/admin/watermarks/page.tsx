'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Card,
  Button,
  Form,
  Input,
  Slider,
  Radio,
  Spin,
  message,
  Space,
  Divider,
  Tag,
  Table,
  Modal,
  Upload,
  Alert,
} from 'antd';
import {
  SaveOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  PoweroffOutlined,
  CheckCircleOutlined,
  WarningOutlined
} from '@ant-design/icons';
import type { TableColumnsType } from 'antd';
import type { RcFile } from 'antd/es/upload';

interface Watermark {
  _id: string;
  name: string;
  description: string;
  type: 'text' | 'image';
  text?: {
    content: string;
    xOffset: number;
    yOffset: number;
    fontSize: number;
    opacity: number;
    color: string;
  };
  imageUrl?: string;
  imageXOffset?: number;
  imageYOffset?: number;
  imageOpacity?: number;
  isActive: boolean;
  usageCount: number;
  createdAt: string;
  createdBy: {
    _id: string;
    username: string;
    fullName: string;
  };
}

export default function WatermarkManagementPage() {
  const [watermarks, setWatermarks] = useState<Watermark[]>([]);
  const [selectedWatermark, setSelectedWatermark] = useState<Watermark | null>(null);
  const [loading, setLoading] = useState(true); // Start as true to prevent flickering
  const [saving, setSaving] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [watermarkType, setWatermarkType] = useState<'text' | 'image'>('text');

  // Canvas states
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvasImage, setCanvasImage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 30, y: 30 });

  // Form states
  const [textContent, setTextContent] = useState('Wonder Travelers');
  const [textFontSize, setTextFontSize] = useState(40);
  const [textOpacity, setTextOpacity] = useState(0.7);
  const [textColor, setTextColor] = useState('#FFFFFF');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null); // Store the actual file
  const [imageOpacity, setImageOpacity] = useState(0.5);
  const [imageLoading, setImageLoading] = useState(false);

  // Fetch watermarks
  const fetchWatermarks = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/watermarks?limit=50');
      const data = await response.json();
      if (data.success) {
        setWatermarks(data.watermarks || []);
      } else {
        message.error(data.error || 'Failed to fetch watermarks');
      }
    } catch (error) {
      message.error('Error fetching watermarks');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWatermarks();
  }, []);

  // Draw canvas with watermark preview
  const drawCanvas = (type: 'text' | 'image', xOffset: number, yOffset: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw gradient background
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#f5f5f5');
    gradient.addColorStop(1, '#e0e0e0');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw border
    ctx.strokeStyle = '#999';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    ctx.strokeStyle = '#ddd';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= 10; i++) {
      ctx.beginPath();
      ctx.moveTo((canvas.width / 10) * i, 0);
      ctx.lineTo((canvas.width / 10) * i, canvas.height);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, (canvas.height / 10) * i);
      ctx.lineTo(canvas.width, (canvas.height / 10) * i);
      ctx.stroke();
    }

    if (type === 'text') {
      // Draw text watermark
      ctx.font = `bold ${textFontSize}px Arial`;
      ctx.fillStyle = textColor;
      ctx.globalAlpha = textOpacity;
      ctx.textAlign = 'right';
      ctx.textBaseline = 'bottom';

      const x = canvas.width - xOffset;
      const y = canvas.height - yOffset;

      // Draw text
      ctx.fillText(textContent || 'Sample Text', x, y);

      // Draw position indicator
      ctx.globalAlpha = 1;
      ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
      ctx.fillRect(x - 5, y - 5, 10, 10);
      ctx.strokeStyle = '#FF0000';
      ctx.strokeRect(x - 5, y - 5, 10, 10);

      // Draw offset labels
      ctx.fillStyle = '#333';
      ctx.font = '12px Arial';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText(`X: ${xOffset}px, Y: ${yOffset}px`, 10, 10);
    } else if (canvasImage) {
      // Draw image watermark preview
      const img = new window.Image();
      img.onload = () => {
        ctx.globalAlpha = imageOpacity;
        const watermarkSize = Math.floor(canvas.width * 0.15);
        const x = canvas.width - watermarkSize - xOffset;
        const y = canvas.height - watermarkSize - yOffset;
        ctx.drawImage(img, x, y, watermarkSize, watermarkSize);

        // Draw position indicator
        ctx.globalAlpha = 1;
        ctx.strokeStyle = '#FF0000';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, watermarkSize, watermarkSize);

        // Draw offset labels
        ctx.fillStyle = '#333';
        ctx.font = '12px Arial';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillText(`X: ${xOffset}px, Y: ${yOffset}px`, 10, 10);
      };
      img.src = canvasImage;
    }
  };

  // Redraw when settings change
  useEffect(() => {
    drawCanvas(watermarkType, dragOffset.x, dragOffset.y);
  }, [watermarkType, textContent, textFontSize, textOpacity, textColor, imageOpacity, dragOffset, canvasImage]);

  // Canvas mouse handlers
  const handleCanvasMouseDown = () => {
    setIsDragging(true);
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newX = Math.max(0, Math.min(200, canvas.width - x));
    const newY = Math.max(0, Math.min(200, canvas.height - y));

    setDragOffset({ x: Math.round(newX), y: Math.round(newY) });
  };

  const handleCanvasMouseUp = () => {
    setIsDragging(false);
  };

  // Handle image upload
  const handleImageUpload = async (file: RcFile) => {
    try {
      setImageLoading(true);

      // Create FormData for file upload
      const formData = new FormData();
      formData.append('watermark_image', file);

      // Upload to backend
      const response = await fetch('/api/watermarks/upload-image', {
        method: 'POST',
        credentials: 'include',
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        // Store the returned imageUrl (file path on server)
        setImageUrl(data.imageUrl);
        setImageFile(file);

        // Also create a preview for canvas
        const reader = new FileReader();
        reader.onload = (e) => {
          setCanvasImage(e.target?.result as string);
        };
        reader.readAsDataURL(file);

        message.success('Image uploaded successfully');
      } else {
        message.error(data.error || 'Failed to upload image');
      }
    } catch (error) {
      message.error('Error uploading image');
      console.error(error);
    } finally {
      setImageLoading(false);
    }

    return false;
  };

  // Save watermark
  const handleSaveWatermark = async (values: any) => {
    try {
      setSaving(true);

      const payload: any = {
        name: values.name,
        description: values.description || '',
        type: watermarkType
      };

      if (watermarkType === 'text') {
        payload.text = {
          content: textContent,
          xOffset: dragOffset.x,
          yOffset: dragOffset.y,
          fontSize: textFontSize,
          opacity: textOpacity,
          color: textColor
        };
      } else {
        if (!imageUrl) {
          message.error('Please upload an image for image watermark');
          return;
        }
        payload.imageUrl = imageUrl;
        payload.imageXOffset = dragOffset.x;
        payload.imageYOffset = dragOffset.y;
        payload.imageOpacity = imageOpacity;
      }

      const url = selectedWatermark
        ? `/api/watermarks/${selectedWatermark._id}`
        : '/api/watermarks';
      const method = selectedWatermark ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include'
      });

      const data = await response.json();

      if (data.success) {
        message.success(
          selectedWatermark
            ? 'Watermark updated successfully'
            : 'Watermark created successfully'
        );
        setIsModalVisible(false);
        form.resetFields();
        resetFormStates();
        fetchWatermarks();
      } else {
        message.error(data.error || 'Failed to save watermark');
      }
    } catch (error) {
      message.error('Error saving watermark');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  // Reset form
  const resetFormStates = () => {
    setSelectedWatermark(null);
    setWatermarkType('text');
    setTextContent('Wonder Travelers');
    setTextFontSize(40);
    setTextOpacity(0.7);
    setTextColor('#FFFFFF');
    setImageUrl(null);
    setImageFile(null);
    setImageOpacity(0.5);
    setDragOffset({ x: 30, y: 30 });
    setCanvasImage(null);
  };

  // Edit watermark
  const handleEditWatermark = (watermark: Watermark) => {
    setSelectedWatermark(watermark);
    setWatermarkType(watermark.type);

    if (watermark.type === 'text' && watermark.text) {
      setTextContent(watermark.text.content);
      setTextFontSize(watermark.text.fontSize);
      setTextOpacity(watermark.text.opacity);
      setTextColor(watermark.text.color);
      setDragOffset({
        x: watermark.text.xOffset,
        y: watermark.text.yOffset
      });
    } else if (watermark.type === 'image') {
      setImageUrl(watermark.imageUrl || null);
      setImageOpacity(watermark.imageOpacity || 0.5);
      setDragOffset({
        x: watermark.imageXOffset || 30,
        y: watermark.imageYOffset || 30
      });
      // Set canvas preview to the server image URL
      if (watermark.imageUrl) {
        setCanvasImage(watermark.imageUrl);
      }
      // Note: imageFile is not set for edits since we can't re-upload an existing image
      // Only upload a new image if the user wants to change it
      setImageFile(null);
    }

    form.setFieldsValue({
      name: watermark.name,
      description: watermark.description
    });
    setIsModalVisible(true);
  };

  // Delete watermark
  const handleDeleteWatermark = async (id: string) => {
    Modal.confirm({
      title: 'Delete Watermark',
      content: 'Are you sure you want to delete this watermark?',
      onOk: async () => {
        try {
          const response = await fetch(`/api/watermarks/${id}`, {
            method: 'DELETE',
            credentials: 'include'
          });
          const data = await response.json();
          if (data.success) {
            message.success('Watermark deleted successfully');
            fetchWatermarks();
          } else {
            message.error(data.error || 'Failed to delete watermark');
          }
        } catch (error) {
          message.error('Error deleting watermark');
        }
      }
    });
  };

  // Toggle active status
  const handleToggleActive = async (watermark: Watermark) => {
    try {
      const response = await fetch(`/api/watermarks/${watermark._id}/toggle`, {
        method: 'PATCH',
        credentials: 'include'
      });
      const data = await response.json();
      if (data.success) {
        message.success(data.message);
        fetchWatermarks();
      } else {
        message.error(data.error || 'Failed to toggle status');
      }
    } catch (error) {
      message.error('Error toggling status');
    }
  };

  // Table columns
  const columns: TableColumnsType<Watermark> = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => <strong>{text}</strong>
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => (
        <Tag color={type === 'text' ? 'blue' : 'green'}>
          {type === 'text' ? '📝 Text' : '🖼️ Image'}
        </Tag>
      )
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? (
            <>
              <CheckCircleOutlined /> Active
            </>
          ) : (
            <>
              <WarningOutlined /> Inactive
            </>
          )}
        </Tag>
      )
    },
    {
      title: 'Usage',
      dataIndex: 'usageCount',
      key: 'usageCount',
      render: (count: number) => `${count} photos`
    },
    {
      title: 'Created By',
      dataIndex: ['createdBy', 'fullName'],
      key: 'createdBy'
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 320,
      render: (_, record) => (
        <Space size="small">
          <Button
            type={record.isActive ? 'default' : 'primary'}
            icon={<PoweroffOutlined />}
            size="small"
            onClick={() => handleToggleActive(record)}
          >
            {record.isActive ? 'Deactivate' : 'Activate'}
          </Button>
          <Button
            type="default"
            icon={<EditOutlined />}
            size="small"
            onClick={() => handleEditWatermark(record)}
          >
            Edit
          </Button>
          <Button
            type="primary"
            danger
            icon={<DeleteOutlined />}
            size="small"
            onClick={() => handleDeleteWatermark(record._id)}
          >
            Delete
          </Button>
        </Space>
      )
    }
  ];

  const activeWatermark = watermarks.find((w) => w.isActive);

  return (
    <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">🎨 Watermark Management</h1>
        <p className="text-gray-600">
          Create and manage watermarks for your photos. Set one as active to automatically apply it to uploaded images.
        </p>
      </div>

      {/* Active Watermark Status */}
      {activeWatermark ? (
        <Alert
          title="✓ Active Watermark Set"
          description={`"${activeWatermark.name}" (${activeWatermark.type}) is currently active and will be applied to all photo uploads.`}
          type="success"
          showIcon
          className="mb-6"
        />
      ) : (
        <Alert
          title="⚠️ No Active Watermark"
          description="Please create a watermark and set it as active before uploading photos. Without an active watermark, photos cannot be uploaded."
          type="warning"
          showIcon
          className="mb-6"
        />
      )}

      <Spin spinning={loading}>
        {/* Watermark List Section */}
        <Card
          title={
            <div className="flex items-center justify-between w-full">
              <span>📋 Watermark Templates</span>
              <Button
                type="primary"
                size="large"
                icon={<PlusOutlined />}
                onClick={() => {
                  resetFormStates();
                  form.resetFields();
                  setIsModalVisible(true);
                }}
              >
                Create New Watermark
              </Button>
            </div>
          }
          className="shadow-md"
        >
          <Alert
            title="💡 Important Rules"
            description="Only ONE watermark can be active at a time. When you activate a watermark, all others are automatically deactivated. Each watermark is either Text OR Image type."
            type="info"
            showIcon
            className="mb-4"
          />
          <Table
            loading={loading}
            dataSource={watermarks}
            columns={columns}
            rowKey="_id"
            pagination={{ pageSize: 10 }}
          />
          {watermarks.length === 0 && !loading && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No watermarks created yet. Create your first one to get started!</p>
            </div>
          )}
        </Card>
      </Spin>

      {/* Create/Edit Watermark Modal */}
      <Modal
        title={selectedWatermark ? '✏️ Edit Watermark' : '➕ Create New Watermark'}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
          resetFormStates();
        }}
        footer={null}
        width={1200}
        className="rounded-lg"
      >
        <Divider />

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSaveWatermark}
          requiredMark="optional"
        >
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <Form.Item
              label="Watermark Name"
              name="name"
              rules={[
                { required: true, message: 'Please enter watermark name' },
                { min: 3, message: 'Name must be at least 3 characters' }
              ]}
            >
              <Input placeholder="e.g., Logo Watermark" />
            </Form.Item>

            <Form.Item
              label="Description (Optional)"
              name="description"
            >
              <Input placeholder="Describe this watermark..." />
            </Form.Item>
          </div>

          {/* Type Selection */}
          <Form.Item label="Watermark Type (Choose ONE)" required>
            <Alert
              title="📌 Select Type"
              description="Choose either Text OR Image watermark. You cannot combine both types in a single watermark. When you activate a watermark, it applies to all new photo uploads."
              type="info"
              showIcon
              className="mb-3"
            />
            <Radio.Group
              value={watermarkType}
              onChange={(e) => {
                setWatermarkType(e.target.value);
                setDragOffset({ x: 30, y: 30 });
              }}
              className="space-y-3"
            >
              <div className="p-3 border rounded hover:bg-blue-50 cursor-pointer">
                <Radio value="text">
                  <span className="font-semibold">📝 Text Watermark</span>
                  <p className="text-sm text-gray-600">Add custom text with adjustable size, color, and opacity</p>
                </Radio>
              </div>
              <div className="p-3 border rounded hover:bg-blue-50 cursor-pointer">
                <Radio value="image">
                  <span className="font-semibold">🖼️ Image Watermark</span>
                  <p className="text-sm text-gray-600">Upload a logo or image file with adjustable opacity</p>
                </Radio>
              </div>
            </Radio.Group>
          </Form.Item>

          <Divider />

          {/* Watermark Settings */}
          <div className="grid grid-cols-2 gap-6">
            {/* Left: Canvas Preview */}
            <div className="border rounded-lg p-4 bg-gray-50">
              <p className="font-semibold mb-2">📍 Position Preview</p>
              <p className="text-sm text-gray-600 mb-3">
                Click and drag on the canvas to position your watermark from the <strong>bottom-right</strong> corner.
              </p>
              <canvas
                ref={canvasRef}
                width={400}
                height={300}
                className="border-2 border-gray-300 rounded cursor-move w-full bg-white hover:border-blue-500 transition-colors"
                onMouseDown={handleCanvasMouseDown}
                onMouseMove={handleCanvasMouseMove}
                onMouseUp={handleCanvasMouseUp}
                onMouseLeave={handleCanvasMouseUp}
              />
              <div className="mt-3 p-3 bg-blue-50 rounded text-sm">
                <p><strong>Position:</strong> X: {dragOffset.x}px, Y: {dragOffset.y}px</p>
              </div>
            </div>

            {/* Right: Settings */}
            <div className="space-y-4">
              {watermarkType === 'text' ? (
                <>
                  {/* Text Settings */}
                  <div>
                    <label className="block text-sm font-semibold mb-2">✏️ Text Content</label>
                    <Input
                      value={textContent}
                      onChange={(e) => setTextContent(e.target.value)}
                      placeholder="Enter watermark text"
                      maxLength={50}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      🔤 Font Size: {textFontSize}px
                    </label>
                    <Slider
                      min={10}
                      max={100}
                      value={textFontSize}
                      onChange={setTextFontSize}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      👁️ Opacity: {(textOpacity * 100).toFixed(0)}%
                    </label>
                    <Slider
                      min={0}
                      max={1}
                      step={0.1}
                      value={textOpacity}
                      onChange={setTextOpacity}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">🎨 Color</label>
                    <input
                      type="color"
                      value={textColor}
                      onChange={(e) => setTextColor(e.target.value)}
                      className="w-full h-10 rounded cursor-pointer border"
                    />
                  </div>
                </>
              ) : (
                <>
                  {/* Image Settings */}
                  <div>
                    <label className="block text-sm font-semibold mb-2">🖼️ Upload Image</label>
                    <Upload
                      maxCount={1}
                      accept="image/*"
                      beforeUpload={handleImageUpload}
                    >
                      <Button>
                        {imageUrl ? '✓ Change Image' : '📤 Upload Image'}
                      </Button>
                    </Upload>
                    {imageUrl && (
                      <div className="mt-2 text-sm text-green-600">✓ Image uploaded and ready</div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      👁️ Opacity: {(imageOpacity * 100).toFixed(0)}%
                    </label>
                    <Slider
                      min={0}
                      max={1}
                      step={0.1}
                      value={imageOpacity}
                      onChange={setImageOpacity}
                    />
                  </div>

                  {!imageUrl && (
                    <Alert
                      title="Image required"
                      description="Please upload an image to create an image watermark"
                      type="warning"
                      showIcon
                    />
                  )}
                </>
              )}

              {/* Offset Controls */}
              <div className="p-3 bg-blue-50 rounded border border-blue-200">
                <p className="text-sm font-semibold mb-3">📐 Position Controls (Bottom-Right)</p>
                <div>
                  <label className="block text-sm font-medium mb-1">X Offset: {dragOffset.x}px</label>
                  <Slider
                    min={0}
                    max={200}
                    value={dragOffset.x}
                    onChange={(value) =>
                      setDragOffset({ ...dragOffset, x: value })
                    }
                  />
                </div>
                <div className="mt-3">
                  <label className="block text-sm font-medium mb-1">Y Offset: {dragOffset.y}px</label>
                  <Slider
                    min={0}
                    max={200}
                    value={dragOffset.y}
                    onChange={(value) =>
                      setDragOffset({ ...dragOffset, y: value })
                    }
                  />
                </div>
              </div>
            </div>
          </div>

          <Divider />

          {/* Save Button */}
          <Form.Item className="mb-0 flex justify-end">
            <Space>
              <Button onClick={() => {
                setIsModalVisible(false);
                form.resetFields();
                resetFormStates();
              }}>
                Cancel
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                icon={<SaveOutlined />}
                loading={saving}
                size="large"
              >
                {selectedWatermark ? '💾 Update Watermark' : '💾 Create Watermark'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
