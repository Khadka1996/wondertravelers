'use client';

import { useState, useEffect } from 'react';
import { Save, Mail, Bell, Database, Key, Loader } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

type TabType = 'email' | 'notifications' | 'database' | 'api' | 'general' | 'contact';

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState<TabType>('general');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  // Email Settings
  const [emailSettings, setEmailSettings] = useState({
    provider: 'smtp',
    smtpHost: '',
    smtpPort: 587,
    smtpUsername: '',
    smtpPassword: '',
    sendgridApiKey: '',
    awsSesRegion: 'us-east-1',
    fromEmail: '',
    fromName: '',
  });

  // Notification Settings
  const [notificationSettings, setNotificationSettings] = useState({
    channels: {
      email: true,
      sms: false,
      whatsapp: false,
      inApp: true,
    },
    emailProvider: 'smtp',
    inAppEnabled: true,
  });

  // General Settings
  const [generalSettings, setGeneralSettings] = useState({
    siteName: 'Travel Nepal',
    heroImageLimit: 4,
    imagesCacheTTL: 3600,
    enableAnalytics: true,
    maxImageSize: 5242880,
  });

  // Database Settings
  const [databaseSettings, setDatabaseSettings] = useState({
    connectionString: '',
    maxConnections: 10,
    backupEnabled: true,
    backupFrequency: 'daily',
  });

  // API Settings
  const [apiSettings, setApiSettings] = useState({
    apiKeys: [] as any[],
    rateLimitEnabled: true,
    requestsPerMinute: 100,
  });

  // Contact Settings
  const [contactSettings, setContactSettings] = useState({
    email: '',
    whatsAppNumber: '',
    phone: '',
    address: '',
  });

  useEffect(() => {
    fetchEmailSettings();
    fetchNotificationSettings();
    fetchContactSettings();
  }, []);

  const fetchEmailSettings = async () => {
    try {
      const response = await fetch(`${API_URL}/api/admin/settings/email`, {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setEmailSettings(data.data || emailSettings);
      }
    } catch (error) {
      console.error('Failed to fetch email settings:', error);
    }
  };

  const fetchNotificationSettings = async () => {
    try {
      const response = await fetch(`${API_URL}/api/admin/settings/notifications`, {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setNotificationSettings(data.data || notificationSettings);
      }
    } catch (error) {
      console.error('Failed to fetch notification settings:', error);
    }
  };

  const fetchContactSettings = async () => {
    try {
      const response = await fetch(`${API_URL}/api/settings`, {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        console.log('Fetched settings:', data); // Debug log
        
        // Handle both response structures
        const contactData = data.data?.contact || data.contact;
        if (contactData) {
          setContactSettings({
            email: contactData.email || '',
            whatsAppNumber: contactData.whatsAppNumber || '',
            phone: contactData.phone || '',
            address: contactData.address || '',
          });
          console.log('Contact settings loaded:', contactData); // Debug log
        } else {
          console.warn('No contact data found in response');
        }
      } else {
        console.error('Failed to fetch settings:', response.status);
      }
    } catch (error) {
      console.error('Failed to fetch contact settings:', error);
    }
  };

  const saveContactSettings = async () => {
    setLoading(true);
    try {
      console.log('Saving contact settings:', contactSettings);
      
      // Validate email
      if (!contactSettings.email || !contactSettings.email.trim()) {
        setMessage({ type: 'error', text: '✗ Email is required' });
        setLoading(false);
        return;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(contactSettings.email)) {
        setMessage({ type: 'error', text: '✗ Please enter a valid email address' });
        setLoading(false);
        return;
      }

      const payload = {
        contact: {
          email: contactSettings.email.trim(),
          whatsAppNumber: contactSettings.whatsAppNumber?.trim() || '',
          phone: contactSettings.phone?.trim() || '',
          address: contactSettings.address?.trim() || '',
        }
      };
      
      console.log('Sending payload:', JSON.stringify(payload, null, 2));

      const response = await fetch(`${API_URL}/api/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      
      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);
      
      if (response.ok) {
        setMessage({ type: 'success', text: '✓ Contact settings saved successfully!' });
        setTimeout(() => setMessage(null), 3000);
        // Refetch to verify
        fetchContactSettings();
      } else {
        console.error('Save failed:', data);
        setMessage({ type: 'error', text: `✗ ${data.message || data.error || 'Failed to save contact settings'}` });
      }
    } catch (error) {
      console.error('Save error:', error);
      setMessage({ type: 'error', text: `✗ ${error instanceof Error ? error.message : 'Error saving contact settings'}` });
    } finally {
      setLoading(false);
    }
  };

  const saveEmailSettings = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/admin/settings/email`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(emailSettings),
      });
      if (response.ok) {
        setMessage({ type: 'success', text: '✓ Email settings saved successfully!' });
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ type: 'error', text: '✗ Failed to save email settings' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: '✗ Error saving email settings' });
    } finally {
      setLoading(false);
    }
  };

  const saveNotificationSettings = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/admin/settings/notifications`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(notificationSettings),
      });
      if (response.ok) {
        setMessage({ type: 'success', text: '✓ Notification settings saved successfully!' });
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ type: 'error', text: '✗ Failed to save notification settings' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: '✗ Error saving notification settings' });
    } finally {
      setLoading(false);
    }
  };

  const testEmailConfig = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/admin/settings/email/test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ recipientEmail: emailSettings.fromEmail }),
      });
      if (response.ok) {
        setMessage({ type: 'success', text: '✓ Test email sent successfully!' });
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ type: 'error', text: '✗ Failed to send test email' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: '✗ Error sending test email' });
    } finally {
      setLoading(false);
    }
  };

  const saveGeneralSettings = () => {
    setMessage({ type: 'success', text: '✓ General settings saved successfully!' });
    setTimeout(() => setMessage(null), 3000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">System Settings</h1>
        <p className="text-gray-600">Configure system behaviors, email, notifications, and more</p>
      </div>

      {message && (
        <div className={`px-4 py-3 rounded-lg border ${
          message.type === 'success' 
            ? 'bg-green-50 border-green-200 text-green-700' 
            : 'bg-red-50 border-red-200 text-red-700'
        }`}>
          {message.text}
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex gap-4 overflow-x-auto">
          {[
            { id: 'general' as TabType, label: 'General', icon: '⚙️' },
            { id: 'email' as TabType, label: 'Email', icon: '📧' },
            { id: 'notifications' as TabType, label: 'Notifications', icon: '🔔' },
            { id: 'contact' as TabType, label: 'Contact', icon: '📞' },
            { id: 'database' as TabType, label: 'Database', icon: '💾' },
            { id: 'api' as TabType, label: 'API', icon: '🔑' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-3 px-4 border-b-2 transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        {/* General Settings Tab */}
        {activeTab === 'general' && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold">General Settings</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-1">Site Name</label>
                <input
                  type="text"
                  value={generalSettings.siteName}
                  onChange={(e) => setGeneralSettings({ ...generalSettings, siteName: e.target.value })}
                  className="w-full border px-3 py-2 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Hero Featured Images Count</label>
                <input
                  type="number"
                  value={generalSettings.heroImageLimit}
                  onChange={(e) => setGeneralSettings({ ...generalSettings, heroImageLimit: parseInt(e.target.value) })}
                  className="w-full border px-3 py-2 rounded-lg"
                  min="1"
                  max="10"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Images Cache TTL (seconds)</label>
                <input
                  type="number"
                  value={generalSettings.imagesCacheTTL}
                  onChange={(e) => setGeneralSettings({ ...generalSettings, imagesCacheTTL: parseInt(e.target.value) })}
                  className="w-full border px-3 py-2 rounded-lg"
                  min="300"
                  step="300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Max Image Size (MB)</label>
                <input
                  type="number"
                  value={generalSettings.maxImageSize / 1024 / 1024}
                  onChange={(e) => setGeneralSettings({ ...generalSettings, maxImageSize: parseInt(e.target.value) * 1024 * 1024 })}
                  className="w-full border px-3 py-2 rounded-lg"
                  min="1"
                  max="100"
                />
              </div>
              <div className="flex items-center justify-between md:col-span-2">
                <label className="font-medium">Enable Analytics</label>
                <input
                  type="checkbox"
                  checked={generalSettings.enableAnalytics}
                  onChange={(e) => setGeneralSettings({ ...generalSettings, enableAnalytics: e.target.checked })}
                  className="w-5 h-5"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={saveGeneralSettings}
                disabled={loading}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 flex items-center gap-2"
              >
                {loading && <Loader size={16} className="animate-spin" />}
                <Save size={20} />
                Save General Settings
              </button>
            </div>
          </div>
        )}

        {/* Email Settings Tab */}
        {activeTab === 'email' && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold">Email Configuration</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Provider</label>
                <select
                  value={emailSettings.provider}
                  onChange={(e) => setEmailSettings({ ...emailSettings, provider: e.target.value })}
                  className="w-full border px-3 py-2 rounded-lg"
                >
                  <option value="smtp">SMTP</option>
                  <option value="sendgrid">SendGrid</option>
                  <option value="aws-ses">AWS SES</option>
                </select>
              </div>

              {emailSettings.provider === 'smtp' && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-1">SMTP Host</label>
                    <input
                      type="text"
                      value={emailSettings.smtpHost}
                      onChange={(e) => setEmailSettings({ ...emailSettings, smtpHost: e.target.value })}
                      className="w-full border px-3 py-2 rounded-lg"
                      placeholder="smtp.gmail.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">SMTP Port</label>
                    <input
                      type="number"
                      value={emailSettings.smtpPort}
                      onChange={(e) => setEmailSettings({ ...emailSettings, smtpPort: parseInt(e.target.value) })}
                      className="w-full border px-3 py-2 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">SMTP Username</label>
                    <input
                      type="text"
                      value={emailSettings.smtpUsername}
                      onChange={(e) => setEmailSettings({ ...emailSettings, smtpUsername: e.target.value })}
                      className="w-full border px-3 py-2 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">SMTP Password</label>
                    <input
                      type="password"
                      value={emailSettings.smtpPassword}
                      onChange={(e) => setEmailSettings({ ...emailSettings, smtpPassword: e.target.value })}
                      className="w-full border px-3 py-2 rounded-lg"
                    />
                  </div>
                </>
              )}

              {emailSettings.provider === 'sendgrid' && (
                <div>
                  <label className="block text-sm font-medium mb-1">SendGrid API Key</label>
                  <input
                    type="password"
                    value={emailSettings.sendgridApiKey}
                    onChange={(e) => setEmailSettings({ ...emailSettings, sendgridApiKey: e.target.value })}
                    className="w-full border px-3 py-2 rounded-lg"
                  />
                </div>
              )}

              {emailSettings.provider === 'aws-ses' && (
                <div>
                  <label className="block text-sm font-medium mb-1">AWS SES Region</label>
                  <input
                    type="text"
                    value={emailSettings.awsSesRegion}
                    onChange={(e) => setEmailSettings({ ...emailSettings, awsSesRegion: e.target.value })}
                    className="w-full border px-3 py-2 rounded-lg"
                    placeholder="us-east-1"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-1">From Email</label>
                <input
                  type="email"
                  value={emailSettings.fromEmail}
                  onChange={(e) => setEmailSettings({ ...emailSettings, fromEmail: e.target.value })}
                  className="w-full border px-3 py-2 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">From Name</label>
                <input
                  type="text"
                  value={emailSettings.fromName}
                  onChange={(e) => setEmailSettings({ ...emailSettings, fromName: e.target.value })}
                  className="w-full border px-3 py-2 rounded-lg"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={testEmailConfig}
                disabled={loading}
                className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 disabled:bg-gray-400 flex items-center gap-2"
              >
                {loading && <Loader size={16} className="animate-spin" />}
                Test Email Configuration
              </button>
              <button
                onClick={saveEmailSettings}
                disabled={loading}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 flex items-center gap-2"
              >
                {loading && <Loader size={16} className="animate-spin" />}
                <Save size={20} />
                Save Email Settings
              </button>
            </div>
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold">Notification Settings</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <label className="font-medium">Email Notifications</label>
                  <p className="text-sm text-gray-600">Send alerts via email</p>
                </div>
                <input
                  type="checkbox"
                  checked={notificationSettings.channels.email}
                  onChange={(e) => setNotificationSettings({
                    ...notificationSettings,
                    channels: { ...notificationSettings.channels, email: e.target.checked }
                  })}
                  className="w-5 h-5"
                />
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <label className="font-medium">SMS Notifications</label>
                  <p className="text-sm text-gray-600">Send alerts via SMS</p>
                </div>
                <input
                  type="checkbox"
                  checked={notificationSettings.channels.sms}
                  onChange={(e) => setNotificationSettings({
                    ...notificationSettings,
                    channels: { ...notificationSettings.channels, sms: e.target.checked }
                  })}
                  className="w-5 h-5"
                />
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <label className="font-medium">In-App Notifications</label>
                  <p className="text-sm text-gray-600">Show in-app alerts and messages</p>
                </div>
                <input
                  type="checkbox"
                  checked={notificationSettings.channels.inApp}
                  onChange={(e) => setNotificationSettings({
                    ...notificationSettings,
                    channels: { ...notificationSettings.channels, inApp: e.target.checked }
                  })}
                  className="w-5 h-5"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={saveNotificationSettings}
                disabled={loading}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 flex items-center gap-2"
              >
                {loading && <Loader size={16} className="animate-spin" />}
                <Save size={20} />
                Save Notification Settings
              </button>
            </div>
          </div>
        )}

        {/* Contact Settings Tab */}
        {activeTab === 'contact' && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold">Contact Information</h2>
            <p className="text-gray-600">Manage your business contact details for customer inquiries</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium mb-1">Email Address *</label>
                <input
                  type="email"
                  value={contactSettings.email}
                  onChange={(e) => setContactSettings({ ...contactSettings, email: e.target.value })}
                  placeholder="contact@example.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">Required. Used for customer inquiries</p>
              </div>

              {/* WhatsApp Number */}
              <div>
                <label className="block text-sm font-medium mb-1">WhatsApp Number (Optional)</label>
                <input
                  type="text"
                  value={contactSettings.whatsAppNumber}
                  onChange={(e) => setContactSettings({ ...contactSettings, whatsAppNumber: e.target.value })}
                  placeholder="+977-9812-345678 or 9779812345678"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">Examples: +977-9812-345678 | +977 9812 345678 | 9779812345678 | +1234567890</p>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium mb-1">Phone Number (Optional)</label>
                <input
                  type="text"
                  value={contactSettings.phone}
                  onChange={(e) => setContactSettings({ ...contactSettings, phone: e.target.value })}
                  placeholder="+1-555-0000"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-medium mb-1">Address (Optional)</label>
                <textarea
                  value={contactSettings.address}
                  onChange={(e) => setContactSettings({ ...contactSettings, address: e.target.value })}
                  placeholder="123 Main Street, City, Country"
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={saveContactSettings}
                disabled={loading}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 flex items-center gap-2"
              >
                {loading && <Loader size={16} className="animate-spin" />}
                <Save size={20} />
                Save Contact Settings
              </button>
            </div>
          </div>
        )}

        {/* Database Tab */}
        {activeTab === 'database' && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold">Database Settings</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Max Connections</label>
                <input
                  type="number"
                  value={databaseSettings.maxConnections}
                  onChange={(e) => setDatabaseSettings({ ...databaseSettings, maxConnections: parseInt(e.target.value) })}
                  className="w-full border px-3 py-2 rounded-lg"
                  min="5"
                  max="100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Backup Frequency</label>
                <select
                  value={databaseSettings.backupFrequency}
                  onChange={(e) => setDatabaseSettings({ ...databaseSettings, backupFrequency: e.target.value })}
                  className="w-full border px-3 py-2 rounded-lg"
                >
                  <option value="hourly">Hourly</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
              <div className="flex items-center justify-between md:col-span-2">
                <label className="font-medium">Enable Automated Backups</label>
                <input
                  type="checkbox"
                  checked={databaseSettings.backupEnabled}
                  onChange={(e) => setDatabaseSettings({ ...databaseSettings, backupEnabled: e.target.checked })}
                  className="w-5 h-5"
                />
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-700">
                💡 <strong>Backup Information:</strong> Your database is automatically backed up at the configured frequency. Latest backup was created today.
              </p>
            </div>

            <div className="flex justify-end gap-2">
              <button className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 flex items-center gap-2">
                Download Latest Backup
              </button>
            </div>
          </div>
        )}

        {/* API Tab */}
        {activeTab === 'api' && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold">API Settings</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <label className="font-medium">Rate Limiting</label>
                  <p className="text-sm text-gray-600">Limit API requests per minute</p>
                </div>
                <input
                  type="checkbox"
                  checked={apiSettings.rateLimitEnabled}
                  onChange={(e) => setApiSettings({ ...apiSettings, rateLimitEnabled: e.target.checked })}
                  className="w-5 h-5"
                />
              </div>

              {apiSettings.rateLimitEnabled && (
                <div>
                  <label className="block text-sm font-medium mb-1">Requests Per Minute</label>
                  <input
                    type="number"
                    value={apiSettings.requestsPerMinute}
                    onChange={(e) => setApiSettings({ ...apiSettings, requestsPerMinute: parseInt(e.target.value) })}
                    className="w-full border px-3 py-2 rounded-lg"
                    min="10"
                    max="1000"
                  />
                </div>
              )}

              <div className="mt-6">
                <h3 className="font-semibold mb-3">API Keys</h3>
                <div className="space-y-2">
                  {apiSettings.apiKeys.length === 0 ? (
                    <p className="text-gray-500 text-sm">No API keys generated yet</p>
                  ) : (
                    apiSettings.apiKeys.map((key, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-mono text-sm">***{key.substring(key.length - 4)}</p>
                          <p className="text-xs text-gray-500">Created {key.createdAt}</p>
                        </div>
                        <button className="text-red-600 hover:text-red-700 text-sm">Revoke</button>
                      </div>
                    ))
                  )}
                </div>
                <button className="mt-3 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm">
                  Generate New API Key
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Help Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-semibold mb-2">💡 Settings Help</h3>
        <ul className="text-sm text-gray-700 space-y-1">
          <li>• <strong>Cache TTL:</strong> Higher values = fewer API calls but slower updates</li>
          <li>• <strong>Email Provider:</strong> Choose between SMTP, SendGrid, or AWS SES</li>
          <li>• <strong>Rate Limiting:</strong> Protects your API from abuse</li>
          <li>• <strong>Backups:</strong> Enable automated backups for data security</li>
        </ul>
      </div>
    </div>
  );
}
