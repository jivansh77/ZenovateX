const { Resend } = require('resend');
const { HfInference } = require('@huggingface/inference');
const dotenv = require('dotenv');
const { v4: uuidv4 } = require('uuid');
const admin = require('firebase-admin');
const path = require('path');

// Load environment variables from the correct path
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Verify API key is loaded
if (!process.env.RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY is not defined in environment variables');
}

// Initialize clients with API keys
const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);
const resend = new Resend(process.env.RESEND_API_KEY);

// Initialize Firebase Admin with service account
if (!admin.apps.length) {
  const serviceAccount = require('../../firebase-service-account.json');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://ace-hackathon-24596.firebaseio.com"
  });
}

// List of allowed email addresses
const ALLOWED_EMAILS = [
  'jivansh777@gmail.com',
  'jvmusic777@gmail.com',
  'arnavdas167@gmail.com',
  'lordorigami4703@gmail.com',
  'kavya422chetwani@gmail.com',
];

class EmailService {
  async generateEmailContent(prompt) {
    try {
      const response = await hf.textGeneration({
        model: "mistralai/Mistral-7B-Instruct-v0.3",
        inputs: `<s>[INST] Write a professional marketing email with the following details:

${prompt}

Requirements:
- Use clear, professional language
- Include a compelling subject line
- Format with proper HTML structure
- Add engaging call-to-action
- Keep content concise and focused [/INST]</s>`,
        parameters: {
          max_new_tokens: 500,
          temperature: 0.7,
          top_p: 0.95,
          repetition_penalty: 1.15
        }
      });

      const cleanedResponse = response.generated_text
        .replace(/^.*?\[\/INST\]\s*/s, '')
        .trim();

      // Wrap the content in proper HTML structure
      return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          ${cleanedResponse}
        </div>
      `;
    } catch (error) {
      console.error('Error generating email content:', error);
      throw new Error('Failed to generate email content');
    }
  }

  async sendEmail({ to, subject, content, from = "onboarding@resend.dev" }) {
    try {
      // Validate that all recipient emails are in the allowed list
      const invalidEmails = to.filter(email => !ALLOWED_EMAILS.includes(email));
      if (invalidEmails.length > 0) {
        throw new Error(`Invalid email recipients: ${invalidEmails.join(', ')}`);
      }

      // Generate a unique tracking ID for this email campaign
      const trackingId = uuidv4();
      console.log('Generated tracking ID:', trackingId);

      // Add tracking pixel to the email content
      const trackingUrl = `${process.env.BACKEND_URL}/api/email/track/${trackingId}`;
      console.log('Tracking URL:', trackingUrl);
      
      // Create a proper HTML email with tracking pixel
      const emailHtml = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${subject}</title>
          </head>
          <body style="margin: 0; padding: 0; background-color: #f6f6f6;">
            ${content}
            <img src="${trackingUrl}" width="1" height="1" alt="" style="display: none;" />
          </body>
        </html>
      `;

      const response = await resend.emails.send({
        from,
        to,
        subject,
        html: emailHtml,
      });

      // Store initial tracking data in Firebase
      const trackingRef = admin.firestore().collection('emailTracking').doc(trackingId);
      await trackingRef.set({
        campaignId: trackingId,
        subject,
        recipients: to,
        sentAt: admin.firestore.FieldValue.serverTimestamp(),
        opens: 0,
        openedBy: [],
        lastOpenedAt: null
      });

      console.log('Tracking data stored in Firebase');

      return {
        ...response,
        trackingId
      };
    } catch (error) {
      console.error('Error sending email:', error);
      throw new Error('Failed to send email');
    }
  }

  async createEmailCampaign(campaignData) {
    try {
      const { prompt, subject, campaignType } = campaignData;
      
      // Generate email content using mistral
      const emailContent = await this.generateEmailContent(
        `Create a ${campaignType} email with the following requirements: ${prompt}`
      );

      // Send to all allowed emails
      const result = await this.sendEmail({
        to: ALLOWED_EMAILS,
        subject,
        content: emailContent,
      });

      return {
        success: true,
        messageId: result.id,
        trackingId: result.trackingId,
        content: emailContent,
        sentTo: ALLOWED_EMAILS
      };
    } catch (error) {
      console.error('Error creating email campaign:', error);
      throw new Error('Failed to create email campaign');
    }
  }

  async getEmailAnalytics(trackingId) {
    try {
      console.log('Fetching analytics for tracking ID:', trackingId);
      const trackingRef = admin.firestore().collection('emailTracking').doc(trackingId);
      const doc = await trackingRef.get();
      
      if (!doc.exists) {
        console.log('No tracking data found for ID:', trackingId);
        throw new Error('Tracking data not found');
      }

      const data = doc.data();
      console.log('Found tracking data:', data);
      return data;
    } catch (error) {
      console.error('Error fetching email analytics:', error);
      throw new Error('Failed to fetch email analytics');
    }
  }

  async getAllCampaignAnalytics() {
    try {
      console.log('Fetching all campaign analytics');
      const trackingRef = admin.firestore().collection('emailTracking');
      const snapshot = await trackingRef.orderBy('sentAt', 'desc').get();
      
      const analytics = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          // Convert Firestore timestamps to ISO strings
          sentAt: data.sentAt ? data.sentAt.toDate().toISOString() : null,
          lastOpenedAt: data.lastOpenedAt ? data.lastOpenedAt.toDate().toISOString() : null
        };
      });

      console.log('Found analytics for', analytics.length, 'campaigns');
      return analytics;
    } catch (error) {
      console.error('Error fetching all campaign analytics:', error);
      throw new Error('Failed to fetch campaign analytics');
    }
  }
}

module.exports = new EmailService(); 