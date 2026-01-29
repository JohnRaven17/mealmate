# MealMate Server - Backend API

Secure authentication server with privacy-first approach and user data protection.

## 📦 Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create `.env` file:
   ```bash
   cp .env.example .env
   ```

3. Start server:
   ```bash
   npm run dev
   ```

## 📚 API Documentation

See [../README.md](../README.md) for full API documentation.

## 🔐 Security

- Passwords: bcryptjs (10 rounds)
- Tokens: JWT (7-day expiry)
- Database: SQLite with encryption ready
- Privacy: GDPR-compliant logging

## 🗄️ Database

SQLite database with 4 tables:
- users
- sessions
- privacy_settings
- privacy_logs

Automatically created on first run.

## 🚀 Production Ready Features

- ✅ Error handling
- ✅ Security headers
- ✅ CORS configuration
- ✅ Activity logging
- ✅ Data validation
- ✅ Transaction support ready
