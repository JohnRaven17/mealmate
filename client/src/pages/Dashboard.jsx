import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/dashboard.css';

function Dashboard({ user, onLogout }) {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');

  const token = localStorage.getItem('authToken');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/user/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfile(response.data.user);
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    onLogout();
    navigate('/');
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>🍽️ MealMate Dashboard</h1>
          <div className="user-info">
            <span>Welcome, {profile?.firstName || profile?.username}!</span>
            <div className="header-actions">
              <button 
                onClick={() => navigate('/privacy-settings')}
                className="btn-secondary"
              >
                🔐 Privacy Settings
              </button>
              <button 
                onClick={handleLogout}
                className="btn-danger"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="dashboard-content">
        <div className="tabs">
          <button
            className={`tab ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            👤 Profile
          </button>
          <button
            className={`tab ${activeTab === 'meals' ? 'active' : ''}`}
            onClick={() => setActiveTab('meals')}
          >
            🍱 Meals
          </button>
          <button
            className={`tab ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            ⚙️ Settings
          </button>
        </div>

        <div className="tab-content">
          {activeTab === 'profile' && (
            <div className="profile-section">
              <h2>Your Profile</h2>
              <div className="profile-card">
                <div className="profile-field">
                  <label>Email:</label>
                  <span>{profile?.email}</span>
                </div>
                <div className="profile-field">
                  <label>Username:</label>
                  <span>{profile?.username}</span>
                </div>
                <div className="profile-field">
                  <label>Name:</label>
                  <span>
                    {profile?.firstName && profile?.lastName
                      ? `${profile.firstName} ${profile.lastName}`
                      : 'Not set'}
                  </span>
                </div>
                <div className="profile-field">
                  <label>Phone:</label>
                  <span>{profile?.phone || 'Not set'}</span>
                </div>
                <div className="profile-field">
                  <label>Member Since:</label>
                  <span>{new Date(profile?.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'meals' && (
            <div className="meals-section">
              <h2>Your Meals</h2>
              <p>Meal planning feature coming soon...</p>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="settings-section">
              <h2>Settings</h2>
              <button 
                onClick={() => navigate('/privacy-settings')}
                className="settings-link"
              >
                🔐 Manage Privacy Settings
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
