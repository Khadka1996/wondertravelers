'use client';

import { useState } from 'react';
import { Button, Input, InputNumber, Select, Card, Row, Col, Divider, Space, Tooltip, Empty, Modal, message } from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined, CopyOutlined, CheckOutlined } from '@ant-design/icons';

export interface Route {
  name?: string;
  startingPoint?: string;
  endingPoint?: string;
  waypoints?: string[];
  distance?: number;
  estimatedDays?: number;
  difficulty?: string;
  description?: string;
}

interface RoutesBuilderProps {
  routes?: Route[] | string;
  onChange?: (routes: Route[]) => void;
}

export default function RoutesBuilder({ routes = [], onChange }: RoutesBuilderProps) {
  const safeRoutes: Route[] = (() => {
    if (Array.isArray(routes)) return routes;
    if (typeof routes === 'string') {
      try {
        return routes ? JSON.parse(routes) : [];
      } catch (e) {
        console.warn('Failed to parse routes JSON:', e);
        return [];
      }
    }
    return [];
  })();
  
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState<Route>({
    name: '',
    startingPoint: '',
    endingPoint: '',
    waypoints: [],
    distance: 0,
    estimatedDays: 0,
    difficulty: 'Moderate',
    description: ''
  });
  const [waypointInput, setWaypointInput] = useState('');
  const handleChange = onChange ?? (() => {});

  const handleOpenModal = (index?: number) => {
    if (index !== undefined) {
      setFormData(safeRoutes[index] || {});
      setEditingIndex(index);
    } else {
      setFormData({
        name: '',
        startingPoint: '',
        endingPoint: '',
        waypoints: [],
        distance: 0,
        estimatedDays: 0,
        difficulty: 'Moderate',
        description: ''
      });
      setEditingIndex(null);
    }
    setWaypointInput('');
    setIsModalVisible(true);
  };

  const handleAddWaypoint = () => {
    if (waypointInput.trim()) {
      setFormData({
        ...formData,
        waypoints: [...(formData.waypoints || []), waypointInput.trim()]
      });
      setWaypointInput('');
    }
  };

  const handleRemoveWaypoint = (index: number) => {
    const updated = [...(formData.waypoints || [])];
    updated.splice(index, 1);
    setFormData({ ...formData, waypoints: updated });
  };

  const handleSaveRoute = () => {
    if (!formData.name || !formData.startingPoint || !formData.endingPoint) {
      message.error('Name, Starting Point, and Ending Point are required');
      return;
    }

    const updatedRoutes = [...safeRoutes];
    if (editingIndex !== null) {
      updatedRoutes[editingIndex] = formData;
      message.success('Route updated!');
    } else {
      updatedRoutes.push(formData);
      message.success('Route added!');
    }
    handleChange(updatedRoutes);
    setIsModalVisible(false);
  };

  const handleDeleteRoute = (index: number) => {
    Modal.confirm({
      title: 'Delete Route',
      content: 'Are you sure you want to delete this route?',
      okText: 'Delete',
      okType: 'danger',
      onOk: () => {
        const updated = safeRoutes.filter((_, i) => i !== index);
        handleChange(updated);
        message.success('Route deleted!');
      }
    });
  };

  const handleDuplicateRoute = (index: number) => {
    const duplicate = JSON.parse(JSON.stringify(safeRoutes[index]));
    duplicate.name = `${duplicate.name} (Copy)`;
    handleChange([...safeRoutes, duplicate]);
    message.success('Route duplicated!');
  };

  return (
    <div className="space-y-4">
      {/* Routes List */}
      <div className="space-y-3">
        {safeRoutes.length === 0 ? (
          <Empty description="No routes added" style={{ marginTop: '20px' }} />
        ) : (
          safeRoutes.map((route, index) => (
            <Card
              key={index}
              size="small"
              className="border border-blue-200 hover:border-blue-500 transition-colors"
              title={
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-blue-600">{route.name || `Route ${index + 1}`}</span>
                  <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">
                    {route.difficulty || 'N/A'}
                  </span>
                </div>
              }
            >
              <div className="grid grid-cols-2 gap-4 mb-3">
                <div>
                  <p className="text-xs text-gray-500 mb-1">From</p>
                  <p className="font-medium">{route.startingPoint}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">To</p>
                  <p className="font-medium">{route.endingPoint}</p>
                </div>
              </div>

              {route.waypoints && route.waypoints.length > 0 && (
                <div className="mb-3 pb-3 border-b">
                  <p className="text-xs text-gray-500 mb-1">Via</p>
                  <div className="flex flex-wrap gap-1">
                    {route.waypoints.map((wp, i) => (
                      <span key={i} className="bg-gray-100 text-xs px-2 py-1 rounded">
                        {wp}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-3 gap-2 text-xs mb-3">
                <div>
                  <p className="text-gray-500">Distance</p>
                  <p className="font-medium">{route.distance} km</p>
                </div>
                <div>
                  <p className="text-gray-500">Duration</p>
                  <p className="font-medium">{route.estimatedDays} days</p>
                </div>
                <div>
                  <p className="text-gray-500">Difficulty</p>
                  <p className="font-medium">{route.difficulty}</p>
                </div>
              </div>

              {route.description && (
                <div className="mb-3 pb-3 border-t text-sm text-gray-600">
                  {route.description}
                </div>
              )}

              <Space>
                <Button
                  type="primary"
                  size="small"
                  icon={<EditOutlined />}
                  onClick={() => handleOpenModal(index)}
                >
                  Edit
                </Button>
                <Button
                  type="default"
                  size="small"
                  icon={<CopyOutlined />}
                  onClick={() => handleDuplicateRoute(index)}
                >
                  Duplicate
                </Button>
                <Button
                  type="text"
                  danger
                  size="small"
                  icon={<DeleteOutlined />}
                  onClick={() => handleDeleteRoute(index)}
                >
                  Delete
                </Button>
              </Space>
            </Card>
          ))
        )}
      </div>

      {/* Add Route Button */}
      <Button
        type="dashed"
        block
        icon={<PlusOutlined />}
        onClick={() => handleOpenModal()}
        size="large"
        className="h-10"
      >
        Add New Route
      </Button>

      {/* Modal */}
      <Modal
        title={editingIndex !== null ? 'Edit Route' : 'Add New Route'}
        open={isModalVisible}
        onOk={handleSaveRoute}
        onCancel={() => setIsModalVisible(false)}
        width={600}
        okText={editingIndex !== null ? 'Update' : 'Add'}
        cancelText="Cancel"
      >
        <div className="space-y-4">
          {/* Route Name */}
          <div>
            <label className="block text-sm font-medium mb-1">Route Name *</label>
            <Input
              placeholder="e.g., Everest Base Camp Trek"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          {/* Starting Point & Ending Point */}
          <Row gutter={16}>
            <Col span={12}>
              <label className="block text-sm font-medium mb-1">Starting Point *</label>
              <Input
                placeholder="e.g., Kathmandu"
                value={formData.startingPoint}
                onChange={(e) => setFormData({ ...formData, startingPoint: e.target.value })}
              />
            </Col>
            <Col span={12}>
              <label className="block text-sm font-medium mb-1">Ending Point *</label>
              <Input
                placeholder="e.g., Base Camp"
                value={formData.endingPoint}
                onChange={(e) => setFormData({ ...formData, endingPoint: e.target.value })}
              />
            </Col>
          </Row>

          {/* Waypoints */}
          <div>
            <label className="block text-sm font-medium mb-1">Waypoints (Via)</label>
            <div className="flex gap-2 mb-2">
              <Input
                placeholder="Add a waypoint (e.g., Namche Bazaar)"
                value={waypointInput}
                onChange={(e) => setWaypointInput(e.target.value)}
                onPressEnter={handleAddWaypoint}
              />
              <Button type="primary" onClick={handleAddWaypoint}>
                Add
              </Button>
            </div>
            {formData.waypoints && formData.waypoints.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.waypoints.map((wp, i) => (
                  <span key={i} className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full flex items-center gap-2">
                    {wp}
                    <DeleteOutlined
                      className="cursor-pointer hover:text-red-600"
                      onClick={() => handleRemoveWaypoint(i)}
                    />
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Distance & Days */}
          <Row gutter={16}>
            <Col span={12}>
              <label className="block text-sm font-medium mb-1">Distance (km)</label>
              <InputNumber
                placeholder="e.g., 250"
                value={formData.distance}
                onChange={(val) => setFormData({ ...formData, distance: val || 0 })}
                min={0}
                style={{ width: '100%' }}
              />
            </Col>
            <Col span={12}>
              <label className="block text-sm font-medium mb-1">Estimated Days</label>
              <InputNumber
                placeholder="e.g., 14"
                value={formData.estimatedDays}
                onChange={(val) => setFormData({ ...formData, estimatedDays: val || 0 })}
                min={0}
                style={{ width: '100%' }}
              />
            </Col>
          </Row>

          {/* Difficulty */}
          <div>
            <label className="block text-sm font-medium mb-1">Difficulty</label>
            <Select
              value={formData.difficulty}
              onChange={(val) => setFormData({ ...formData, difficulty: val })}
              options={[
                { label: 'Easy', value: 'Easy' },
                { label: 'Moderate', value: 'Moderate' },
                { label: 'Challenging', value: 'Challenging' },
                { label: 'Extreme', value: 'Extreme' }
              ]}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <Input.TextArea
              placeholder="Add details about this route..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
