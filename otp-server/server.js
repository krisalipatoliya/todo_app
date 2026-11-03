
require('dotenv').config();

const express = require('express');
const twilio = require('twilio');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');

const app = express();
app.use(express.json({limit: '10kb'}));

const PORT = process.env.PORT || 3000;

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN,
);

const serviceSid =
  process.env.TWILIO_VERIFY_SERVICE_SID;

const JWT_SECRET = process.env.JWT_SECRET;

if (!serviceSid || !JWT_SECRET) {
  throw new Error('Missing OTP server configuration');
}

const phoneRegex = /^\+91[6-9]\d{9}$/;

// Temporary user name storage for local development.
// In production, save users in your database.
const pendingUsers = new Map();

const sendLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
});

const verifyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
});

// Send mobile OTP
app.post(
  '/auth/send-phone-otp',
  sendLimiter,
  async (req, res) => {
    const name = String(req.body?.name || '').trim();
    const phone = String(req.body?.phone || '').trim();

    if (
      !name ||
      name.length > 100 ||
      !phoneRegex.test(phone)
    ) {
      return res.status(400).json({
        message: 'Enter a valid name and mobile number.',
      });
    }

    try {
      await client.verify.v2
        .services(serviceSid)
        .verifications.create({
          to: phone,
          channel: 'sms',
        });

      pendingUsers.set(phone, name);

      return res.json({
        success: true,
        message: 'OTP sent successfully.',
      });
    } catch (error) {
      console.error('Send OTP error:', error.message);

      return res.status(500).json({
        message: 'Unable to send SMS OTP.',
      });
    }
  },
);

// Verify mobile OTP
app.post(
  '/auth/verify-phone-otp',
  verifyLimiter,
  async (req, res) => {
    const phone = String(req.body?.phone || '').trim();
    const otp = String(req.body?.otp || '').trim();

    if (
      !phoneRegex.test(phone) ||
      !/^\d{6}$/.test(otp)
    ) {
      return res.status(400).json({
        message: 'Invalid phone number or OTP.',
      });
    }

    try {
      const result = await client.verify.v2
        .services(serviceSid)
        .verificationChecks.create({
          to: phone,
          code: otp,
        });

      if (result.status !== 'approved') {
        return res.status(400).json({
          message: 'Incorrect or expired OTP.',
        });
      }

      const name = pendingUsers.get(phone) || 'User';
      pendingUsers.delete(phone);

      const token = jwt.sign(
        {sub: phone, phone},
        JWT_SECRET,
        {expiresIn: '7d'},
      );

      return res.json({
        success: true,
        token,
        user: {
          name,
          phone,
        },
      });
    } catch (error) {
      console.error('Verify OTP error:', error.message);

      return res.status(400).json({
        message: 'OTP verification failed.',
      });
    }
  },
);

app.listen(PORT, () => {
  console.log(`SMS OTP server running on port ${PORT}`);
});
