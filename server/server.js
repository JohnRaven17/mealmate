import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initializeDatabase } from './database.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/user.js';
import privacyRoutes from './routes/privacy.js';
import { authMiddleware } from './middleware/auth.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Security headers middleware
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'Server is running', timestamp: new Date() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', authMiddleware, userRoutes);
app.use('/api/privacy', authMiddleware, privacyRoutes);

// Privacy Policy
app.get('/api/privacy-policy', (req, res) => {
  res.json({
    title: 'MealMate Privacy Policy',
    version: '1.0',
    lastUpdated: new Date(),
    content: `
MEALMATE PRIVACY POLICY

1. DATA COLLECTION
We collect only essential information needed for your account and service delivery:
- Email address and username for account identification
- Hashed password for secure authentication
- Optional profile information (name, phone)
- Device information and IP address for security
- Activity logs for account security and fraud prevention

2. DATA STORAGE
All passwords are encrypted using bcryptjs (salt rounds: 10)
All sensitive data is stored in encrypted SQLite database
Database is protected with access controls

3. DATA USAGE
Your data is used exclusively for:
- Account authentication and authorization
- Service delivery and user support
- Security and fraud prevention
- Compliance with legal obligations

4. DATA SHARING
We DO NOT share your personal data with third parties without explicit consent

5. DATA RETENTION
- Account data is retained as long as your account is active
- You can request data deletion anytime
- Deleted data will be permanently removed within 30 days

6. YOUR RIGHTS
- Access: View all your personal data
- Correction: Update your information
- Deletion: Request complete account deletion (GDPR compliant)
- Consent: Withdraw consent at any time

7. SECURITY
- Passwords are hashed with bcryptjs
- Sessions expire after 7 days
- All API endpoints use HTTPS
- Security headers protect against common attacks

8. CONTACT
For privacy inquiries, contact: privacy@mealmate.app
    `
  });
});

// Terms of Service
app.get('/api/terms', (req, res) => {
  res.json({
    title: 'MealMate Terms of Service',
    version: '1.0',
    lastUpdated: new Date(),
    content: `
MEALMATE TERMS OF SERVICE

By using MealMate, you agree to these terms.

1. ACCOUNT RESPONSIBILITY
You are responsible for maintaining account security and password confidentiality.

2. PROHIBITED CONDUCT
- Sharing account credentials
- Attempting unauthorized access
- Using the service for illegal purposes
- Harassing other users

3. LIABILITY LIMITATION
MealMate provides the service "as is" without warranties.

4. CHANGES TO SERVICE
We may modify these terms or service at any time with notice.

5. TERMINATION
We may terminate accounts that violate these terms.
    `
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error'
  });
});

// Initialize database and start server
async function startServer() {
  try {
    await initializeDatabase();
    app.listen(PORT, () => {
      console.log(`\n🍽️  MealMate Server running on http://localhost:${PORT}`);
      console.log(`📚 API Documentation: http://localhost:${PORT}/api`);
      console.log(`🔐 Privacy Policy: http://localhost:${PORT}/api/privacy-policy`);
      console.log(`📋 Terms: http://localhost:${PORT}/api/terms\n`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

export default app;
