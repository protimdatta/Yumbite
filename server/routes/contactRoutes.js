import express from 'express';
import { sendContactEmail } from '../utils/email.js';

const router = express.Router();

// Public: visitor contact form -> owner inbox via Resend.
// API key stays on the backend; frontend only posts name/email/message.
router.post('/', async (req, res) => {
  try {
    const { name, email, phone = '', subject = '', message } = req.body || {};

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Please provide your name' });
    }
    if (!email || !/^\S+@\S+\.\S+$/.test(email.trim())) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address' });
    }
    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: 'Please write your message' });
    }
    if (message.trim().length > 5000) {
      return res.status(400).json({ success: false, message: 'Message is too long (max 5000 characters)' });
    }

    try {
      await sendContactEmail({
        name: name.trim(),
        email: email.trim(),
        phone: String(phone || '').trim(),
        subject: String(subject || '').trim(),
        message: message.trim(),
      });
    } catch (err) {
      if (err.code === 'EMAIL_NOT_CONFIGURED') {
        return res.status(503).json({
          success: false,
          message: 'Email service is not configured yet. Please call us or message on Facebook.',
        });
      }
      throw err;
    }

    res.json({ success: true, message: 'Message sent successfully! We will get back to you soon.' });
  } catch (error) {
    console.error('Contact email error:', error);
    res.status(500).json({ success: false, message: 'Could not send your message. Please try again later.' });
  }
});

export default router;
