import express from 'express';
import { 
  getPrivacySettings, 
  updatePrivacySettings, 
  getPrivacyLogs, 
  requestDataDeletion,
  deleteUserAccount 
} from '../auth.js';

const router = express.Router();

// Get privacy settings
router.get('/settings', async (req, res) => {
  try {
    const settings = await getPrivacySettings(req.userId);

    res.json({
      settings: {
        marketingEmails: settings.marketing_emails === 1,
        shareProfile: settings.share_profile === 1,
        twoFactorEnabled: settings.two_factor_enabled === 1,
        dataRetentionDays: settings.data_retention_days,
        lastUpdated: settings.last_updated
      }
    });
  } catch (error) {
    console.error('Privacy settings fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch privacy settings' });
  }
});

// Update privacy settings
router.put('/settings', async (req, res) => {
  try {
    const { marketingEmails, shareProfile, twoFactorEnabled } = req.body;

    const updated = await updatePrivacySettings(req.userId, {
      marketingEmails,
      shareProfile,
      twoFactorEnabled
    });

    res.json({
      message: 'Privacy settings updated successfully',
      settings: {
        marketingEmails: updated.marketing_emails === 1,
        shareProfile: updated.share_profile === 1,
        twoFactorEnabled: updated.two_factor_enabled === 1,
        lastUpdated: updated.last_updated
      }
    });
  } catch (error) {
    console.error('Privacy settings update error:', error);
    res.status(500).json({ error: 'Failed to update privacy settings' });
  }
});

// Get privacy logs (activity history)
router.get('/logs', async (req, res) => {
  try {
    const logs = await getPrivacyLogs(req.userId, 100);

    res.json({
      logs: logs.map(log => ({
        id: log.id,
        action: log.action,
        dataAccessed: log.data_accessed,
        timestamp: log.timestamp,
        ipAddress: log.ip_address
      }))
    });
  } catch (error) {
    console.error('Privacy logs fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch privacy logs' });
  }
});

// Request data deletion (GDPR)
router.post('/request-deletion', async (req, res) => {
  try {
    const result = await requestDataDeletion(req.userId);
    
    res.json({
      message: result.message,
      deletionRequestSubmitted: true,
      deletionDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    });
  } catch (error) {
    console.error('Data deletion request error:', error);
    res.status(500).json({ error: 'Failed to submit deletion request' });
  }
});

// Permanently delete account (with confirmation)
router.delete('/delete-account', async (req, res) => {
  try {
    const { confirmationCode } = req.body;

    if (confirmationCode !== '1234') { // In production, use email confirmation
      return res.status(400).json({ error: 'Invalid confirmation code' });
    }

    const result = await deleteUserAccount(req.userId);
    
    res.json({
      message: result.message,
      accountDeleted: true
    });
  } catch (error) {
    console.error('Account deletion error:', error);
    res.status(500).json({ error: 'Failed to delete account' });
  }
});

export default router;
