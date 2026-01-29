import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/auth.css';

function SignUp({ onSignUp }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
    privacyConsent: false,
    termsConsent: false
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState('weak');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));

    // Check password strength
    if (name === 'password') {
      checkPasswordStrength(value);
    }
  };

  const checkPasswordStrength = (password) => {
    if (password.length < 8) {
      setPasswordStrength('weak');
    } else if (/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(password)) {
      setPasswordStrength('strong');
    } else {
      setPasswordStrength('medium');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validation
    if (!formData.privacyConsent || !formData.termsConsent) {
      setError('You must accept the Privacy Policy and Terms of Service');
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/api/auth/signup', {
        email: formData.email,
        username: formData.username,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        privacyConsent: formData.privacyConsent
      });

      onSignUp(response.data);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Sign up failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card signup-card">
        <div className="auth-header">
          <h1>🍽️ MealMate</h1>
          <p>Join Us Today</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <h2>Create Your Account</h2>
          
          {error && <div className="alert alert-error">{error}</div>}

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="email">Email Address *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={loading}
                placeholder="your@email.com"
              />
            </div>

            <div className="form-group">
              <label htmlFor="username">Username *</label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                disabled={loading}
                placeholder="Choose a username"
                pattern="[a-zA-Z0-9_-]{3,20}"
                title="3-20 characters: letters, numbers, underscore, hyphen"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="firstName">First Name</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                disabled={loading}
                placeholder="John"
              />
            </div>

            <div className="form-group">
              <label htmlFor="lastName">Last Name</label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                disabled={loading}
                placeholder="Doe"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="phone">Phone (Optional)</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              disabled={loading}
              placeholder="+1 (555) 000-0000"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password *</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              disabled={loading}
              placeholder="At least 8 characters"
            />
            <div className="password-strength">
              <small>Strength: <span className={`strength-${passwordStrength}`}>{passwordStrength}</span></small>
              <p className="password-requirements">
                Requires: uppercase, lowercase, number, special character
              </p>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password *</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              disabled={loading}
              placeholder="Confirm your password"
            />
          </div>

          <div className="form-group checkbox">
            <input
              type="checkbox"
              id="privacyConsent"
              name="privacyConsent"
              checked={formData.privacyConsent}
              onChange={handleChange}
              disabled={loading}
            />
            <label htmlFor="privacyConsent">
              I agree to the <Link to="/privacy">Privacy Policy</Link> *
            </label>
          </div>

          <div className="form-group checkbox">
            <input
              type="checkbox"
              id="termsConsent"
              name="termsConsent"
              checked={formData.termsConsent}
              onChange={handleChange}
              disabled={loading}
            />
            <label htmlFor="termsConsent">
              I agree to the <a href="#terms">Terms of Service</a> *
            </label>
          </div>

          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="auth-footer">
          <p>Already have an account? <Link to="/">Login here</Link></p>
        </div>
      </div>

      <div className="auth-info">
        <h3>🔒 Your Privacy Matters</h3>
        <ul>
          <li>✅ Encrypted password storage</li>
          <li>✅ No sharing of personal data</li>
          <li>✅ GDPR compliant</li>
          <li>✅ Secure session management</li>
          <li>✅ Activity logging for security</li>
          <li>✅ Request data deletion anytime</li>
        </ul>
      </div>
    </div>
  );
}

export default SignUp;
