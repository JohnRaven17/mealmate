import express from 'express';
import validator from 'validator';
import { registerUser, loginUser, createSession, verifyToken } from '../auth.js';

const router = express.Router();

// Validation helper
function validateEmail(email) {
  return validator.isEmail(email);
}

function validatePassword(password) {
  // At least 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
}

function validateUsername(username) {
  return /^[a-zA-Z0-9_-]{3,20}$/.test(username);
}

// Sign up route
router.post('/signup', async (req, res) => {
  try {
    const { email, username, password, confirmPassword, firstName, lastName, phone, privacyConsent } = req.body;

    // Validation
    if (!email || !validateEmail(email)) {
      return res.status(400).json({ error: 'Valid email is required' });
    }

    if (!username || !validateUsername(username)) {
      return res.status(400).json({ 
        error: 'Username must be 3-20 characters (letters, numbers, underscore, hyphen)' 
      });
    }

    if (!password || !validatePassword(password)) {
      return res.status(400).json({ 
        error: 'Password must be at least 8 characters with uppercase, lowercase, number, and special character' 
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match' });
    }

    if (!privacyConsent) {
      return res.status(400).json({ error: 'You must consent to the privacy policy' });
    }

    // Register user
    const user = await registerUser({
      email: email.toLowerCase(),
      username: username.toLowerCase(),
      password,
      firstName,
      lastName,
      phone
    });

    // Create session
    const deviceInfo = req.headers['user-agent'];
    const ipAddress = req.ip || req.connection.remoteAddress;
    const token = await createSession(user.id, deviceInfo, ipAddress);

    res.status(201).json({
      message: 'Account created successfully',
      user: {
        id: user.id,
        email: user.email,
        username: user.username
      },
      token,
      expiresIn: '7d'
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(400).json({ error: error.message });
  }
});

// Login route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Login user
    const user = await loginUser(email, password);

    // Create session
    const deviceInfo = req.headers['user-agent'];
    const ipAddress = req.ip || req.connection.remoteAddress;
    const token = await createSession(user.id, deviceInfo, ipAddress);

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName
      },
      token,
      expiresIn: '7d'
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(401).json({ error: error.message });
  }
});

// Verify token route
router.post('/verify', (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ error: 'Token is required' });
  }

  const decoded = verifyToken(token);
  
  if (!decoded) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  res.json({
    valid: true,
    userId: decoded.userId,
    expiresIn: '7d'
  });
});

// Logout route (client-side mainly, but can track on server)
router.post('/logout', (req, res) => {
  // In a production app, you would invalidate the session in the database
  res.json({ message: 'Logged out successfully' });
});

export default router;
