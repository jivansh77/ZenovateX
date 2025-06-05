const emailService = require('../services/email.service');
const admin = require('firebase-admin');

class EmailController {
  async createEmailCampaign(req, res) {
    try {
      const { prompt, subject, campaignType } = req.body;
      
      // File upload is accepted but not processed
      // The actual file handling can be implemented later if needed
      const result = await emailService.createEmailCampaign({
        prompt,
        subject,
        campaignType
      });
      
      res.json(result);
    } catch (error) {
      console.error('Controller Error:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async generateEmailPreview(req, res) {
    try {
      const { prompt, campaignType } = req.body;
      const content = await emailService.generateEmailContent(
        `Create a ${campaignType} email with the following requirements: ${prompt}`
      );
      res.json({ 
        content,
        allowedEmails: [
          'jivansh777@gmail.com',
          'jvmusic777@gmail.com',
          'arnavdas167@gmail.com',
          'lordorigami4703@gmail.com',
          'kavya422chetwani@gmail.com',
        ]
      });
    } catch (error) {
      console.error('Controller Error:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async trackEmailOpen(req, res) {
    try {
      const { trackingId } = req.params;
      console.log('Email opened! Tracking ID:', trackingId);
      
      // Get the tracking document
      const trackingRef = admin.firestore().collection('emailTracking').doc(trackingId);
      const doc = await trackingRef.get();

      if (!doc.exists) {
        console.log('No tracking document found for ID:', trackingId);
        return res.status(404).send('Not found');
      }

      // Update tracking data
      await trackingRef.update({
        opens: admin.firestore.FieldValue.increment(1),
        lastOpenedAt: admin.firestore.FieldValue.serverTimestamp(),
        openedBy: admin.firestore.FieldValue.arrayUnion(req.ip || 'unknown')
      });

      console.log('Successfully updated tracking data for ID:', trackingId);

      // Return a 1x1 transparent GIF
      const transparentPixel = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
      res.writeHead(200, {
        'Content-Type': 'image/gif',
        'Content-Length': transparentPixel.length,
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      });
      res.end(transparentPixel);
    } catch (error) {
      console.error('Tracking Error:', error);
      res.status(500).send('Error tracking email open');
    }
  }

  async getEmailAnalytics(req, res) {
    try {
      const { trackingId } = req.params;
      console.log('Fetching analytics for ID:', trackingId);
      const analytics = await emailService.getEmailAnalytics(trackingId);
      res.json(analytics);
    } catch (error) {
      console.error('Analytics Error:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async getAllCampaignAnalytics(req, res) {
    try {
      console.log('Fetching all campaign analytics');
      const analytics = await emailService.getAllCampaignAnalytics();
      console.log('Found analytics:', analytics.length, 'campaigns');
      res.json(analytics);
    } catch (error) {
      console.error('Analytics Error:', error);
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new EmailController(); 