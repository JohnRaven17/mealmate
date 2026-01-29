import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getOne, runQuery, getAll } from './database.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_here_change_in_production';
const JWT_EXPIRY = '7d';

// Hash password
export async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
}

// Compare password
export async function comparePassword(password, hash) {
  return await bcrypt.compare(password, hash);
}

// Create JWT token
export function createToken(userId) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRY });
}

// Verify JWT token
export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

// Register new user
export async function registerUser(userData) {
  const { email, username, password, firstName, lastName, phone } = userData;
  
  // Validate input
  if (!email || !username || !password) {
    throw new Error('Email, username, and password are required');
  }

  // Check if user already exists
  const existing = await getOne('SELECT id FROM users WHERE email = ? OR username = ?', [email, username]);
  if (existing) {
    throw new Error('Email or username already registered');
  }

  const passwordHash = await hashPassword(password);
  
  const result = await runQuery(
    `INSERT INTO users (email, username, password_hash, first_name, last_name, phone)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [email, username, passwordHash, firstName || null, lastName || null, phone || null]
  );

  // Create default privacy settings
  await runQuery(
    `INSERT INTO privacy_settings (user_id) VALUES (?)`,
    [result.id]
  );

  // Log privacy action
  await runQuery(
    `INSERT INTO privacy_logs (user_id, action, data_accessed) 
     VALUES (?, ?, ?)`,
    [result.id, 'ACCOUNT_CREATED', 'email, username']
  );

  const user = await getOne('SELECT id, email, username, first_name, last_name FROM users WHERE id = ?', [result.id]);
  return user;
}

// Login user
export async function loginUser(emailOrUsername, password) {
  const user = await getOne(
    'SELECT * FROM users WHERE email = ? OR username = ? LIMIT 1',
    [emailOrUsername, emailOrUsername]
  );

  if (!user) {
    throw new Error('Invalid credentials');
  }

  if (!user.is_active) {
    throw new Error('Account is inactive');
  }

  const passwordMatch = await comparePassword(password, user.password_hash);
  if (!passwordMatch) {
    throw new Error('Invalid credentials');
  }

  // Update last login
  await runQuery('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?', [user.id]);

  // Log privacy action
  await runQuery(
    `INSERT INTO privacy_logs (user_id, action, data_accessed) 
     VALUES (?, ?, ?)`,
    [user.id, 'LOGIN', 'authentication']
  );

  return {
    id: user.id,
    email: user.email,
    username: user.username,
    firstName: user.first_name,
    lastName: user.last_name
  };
}

// Create session
export async function createSession(userId, deviceInfo, ipAddress) {
  const token = createToken(userId);
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  await runQuery(
    `INSERT INTO sessions (user_id, token, device_info, ip_address, expires_at)
     VALUES (?, ?, ?, ?, ?)`,
    [userId, token, deviceInfo || null, ipAddress || null, expiresAt.toISOString()]
  );

  return token;
}

// Get user by ID
export async function getUserById(userId) {
  const user = await getOne(
    'SELECT id, email, username, first_name, last_name, phone, created_at FROM users WHERE id = ? AND is_active = 1',
    [userId]
  );
  return user;
}

// Get privacy settings
export async function getPrivacySettings(userId) {
  return await getOne(
    'SELECT * FROM privacy_settings WHERE user_id = ?',
    [userId]
  );
}

// Update privacy settings
export async function updatePrivacySettings(userId, settings) {
  const { marketingEmails, shareProfile, twoFactorEnabled } = settings;
  
  await runQuery(
    `UPDATE privacy_settings 
     SET marketing_emails = ?, share_profile = ?, two_factor_enabled = ?, last_updated = CURRENT_TIMESTAMP
     WHERE user_id = ?`,
    [marketingEmails ? 1 : 0, shareProfile ? 1 : 0, twoFactorEnabled ? 1 : 0, userId]
  );

  return await getPrivacySettings(userId);
}

// Get privacy logs
export async function getPrivacyLogs(userId, limit = 50) {
  return await getAll(
    'SELECT * FROM privacy_logs WHERE user_id = ? ORDER BY timestamp DESC LIMIT ?',
    [userId, limit]
  );
}

// Request data deletion
export async function requestDataDeletion(userId) {
  await runQuery(
    `UPDATE privacy_settings 
     SET data_deletion_requested = 1, last_updated = CURRENT_TIMESTAMP
     WHERE user_id = ?`,
    [userId]
  );

  await runQuery(
    `INSERT INTO privacy_logs (user_id, action, data_accessed) 
     VALUES (?, ?, ?)`,
    [userId, 'DATA_DELETION_REQUESTED', 'all_user_data']
  );

  return { message: 'Data deletion request submitted. Your data will be deleted within 30 days.' };
}

// Delete user and all associated data (for GDPR compliance)
export async function deleteUserAccount(userId) {
  // This will cascade delete all related records due to foreign keys
  await runQuery('DELETE FROM users WHERE id = ?', [userId]);
  return { message: 'User account and all associated data have been deleted.' };
}

export default {
  hashPassword,
  comparePassword,
  createToken,
  verifyToken,
  registerUser,
  loginUser,
  createSession,
  getUserById,
  getPrivacySettings,
  updatePrivacySettings,
  getPrivacyLogs,
  requestDataDeletion,
  deleteUserAccount
};
