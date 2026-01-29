import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/privacy.css';

function PrivacySettings({ user }) {
  const [settings, setSettings] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('settings');

  const token = localStorage.getItem('authToken');

  useEffect(() => {
    fetchPrivacyData();
  }, []);

  const fetchPrivacyData = async () => {
    try {
      const [settingsRes, logsRes] = await Promise.all([
        axios.get('http://localhost:5000/api/privacy/settings', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('http://localhost:5000/api/privacy/logs', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
      
      setSettings(settingsRes.data.settings);
      setLogs(logsRes.data.logs);
    } catch (error) {
      console.error('Failed to fetch privacy data:', error);
      setMessage('Failed to load privacy data');
    } finally {
      setLoading(false);
    }
  };

  const handleSettingChange = async (setting, value) => {
    setSaving(true);
    setMessage('');

    try {
      const updateData = {
        [setting]: value
      };

      const response = await axios.put(
        'http://localhost:5000/api/privacy/settings',
        updateData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSettings(response.data.settings);
      setMessage('Privacy settings updated successfully');
    } catch (error) {
      setMessage('Failed to update settings');
      console.error('Error:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleRequestDeletion = async () => {
    if (!window.confirm('Request data deletion? Your data will be deleted in 30 days.')) {
      return;
    }

    try {
      const response = await axios.post(
        'http://localhost:5000/api/privacy/request-deletion',
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessage(`Data deletion requested. Your data will be deleted by ${new Date(response.data.deletionDate).toLocaleDateString()}`);
    } catch (error) {
      setMessage('Failed to request data deletion');
      console.error('Error:', error);
    }
  };

  if (loading) {
    return <div className="loading">Loading privacy settings...</div>;
  }

  return (
    <div className="privacy-settings-container">
      <header className="privacy-header">
        <h1>🔐 Privacy & Security Settings</h1>
        <p>Manage your data and privacy preferences</p>
      </header>

      {message && (
        <div className={`alert ${message.includes('success') ? 'alert-success' : 'alert-info'}`}>
          {message}
        </div>
      )}

      <div className="privacy-tabs">
        <button
          className={`tab ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          ⚙️ Privacy Settings
        </button>
        <button
          className={`tab ${activeTab === 'logs' ? 'active' : ''}`}
          onClick={() => setActiveTab('logs')}
        >
          📋 Activity Log
        </button>
      </div>

      <div className="privacy-content">
        {activeTab === 'settings' && (
          <div className="settings-panel">
            <div className="settings-section">
              <h2>Communication Preferences</h2>
              
              <div className="setting-item">
                <div className="setting-info">
                  <label>Marketing Emails</label>
                  <p>Receive promotional emails about new features and updates</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings?.marketingEmails || false}
                  onChange={(e) => handleSettingChange('marketingEmails', e.target.checked)}
                  disabled={saving}
                />
              </div>

              <div className="setting-item">
                <div className="setting-info">
                  <label>Share Profile</label>
                  <p>Allow other users to see your public profile</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings?.shareProfile || false}
                  onChange={(e) => handleSettingChange('shareProfile', e.target.checked)}
                  disabled={saving}
                />
              </div>
            </div>

            <div className="settings-section">
              <h2>Security Settings</h2>
              
              <div className="setting-item">
                <div className="setting-info">
                  <label>Two-Factor Authentication</label>
                  <p>Add an extra layer of security to your account</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings?.twoFactorEnabled || false}
                  onChange={(e) => handleSettingChange('twoFactorEnabled', e.target.checked)}
                  disabled={saving}
                />
              </div>
            </div>

            <div className="settings-section danger-zone">
              <h2>Data Management</h2>
              
              <button 
                onClick={handleRequestDeletion}
                className="btn-warning"
              >
                🗑️ Request Data Deletion
              </button>
              <p className="danger-text">
                Request permanent deletion of your account and all associated data.
                Data will be deleted within 30 days. This action cannot be undone.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'logs' && (
          <div className="logs-panel">
            <h2>Activity Log</h2>
            <p className="info-text">
              This log shows all actions related to your account access and data.
            </p>
            
            {logs.length > 0 ? (
              <table className="logs-table">
                <thead>
                  <tr>
                    <th>Action</th>
                    <th>Data Accessed</th>
                    <th>Timestamp</th>
                    <th>IP Address</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id}>
                      <td>{log.action}</td>
                      <td>{log.dataAccessed}</td>
                      <td>{new Date(log.timestamp).toLocaleString()}</td>
                      <td>{log.ipAddress || 'Unknown'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No activity logs available</p>
            )}
          </div>
        )}
      </div>

      <footer className="privacy-footer">
        <a href="/">← Back to Dashboard</a>
      </footer>
    </div>
  );
}

export default PrivacySettings;
