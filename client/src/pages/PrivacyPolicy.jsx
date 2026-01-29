import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/privacy.css';

function PrivacyPolicy() {
  const navigate = useNavigate();
  const [policy, setPolicy] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPolicy();
  }, []);

  const fetchPolicy = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/privacy-policy');
      setPolicy(response.data);
    } catch (error) {
      console.error('Failed to fetch privacy policy:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="privacy-policy-container">
      <header className="policy-header">
        <button onClick={() => navigate(-1)} className="btn-back">← Back</button>
        <h1>Privacy Policy</h1>
        <p>Last updated: {new Date(policy?.lastUpdated).toLocaleDateString()}</p>
      </header>

      <main className="policy-content">
        <div className="policy-text">
          {policy?.content.split('\n\n').map((section, index) => (
            <div key={index} className="policy-section">
              {section.split('\n').map((line, i) => (
                line.trim() ? (
                  <p key={i}>{line}</p>
                ) : null
              ))}
            </div>
          ))}
        </div>

        <div className="policy-actions">
          <button onClick={() => navigate('/')} className="btn-primary">
            Accept and Continue
          </button>
          <button onClick={() => navigate(-1)} className="btn-secondary">
            Go Back
          </button>
        </div>
      </main>

      <footer className="policy-footer">
        <p>Last Updated: {new Date(policy?.lastUpdated).toLocaleDateString()}</p>
      </footer>
    </div>
  );
}

export default PrivacyPolicy;
