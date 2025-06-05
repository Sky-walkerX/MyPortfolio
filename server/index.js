const express = require('express');
const dotenv = require('dotenv');
const nodemailer = require('nodemailer');
const otpGenerator = require('otp-generator');
const cors = require('cors'); // For local development, allows frontend to talk to backend

dotenv.config(); // Load environment variables from .env

const app = express();
const PORT = process.env.PORT || 5000;
// console.log(process.env.CLIENT_ORIGIN)
// Middleware
app.use(cors({
  origin: [
    process.env.CLIENT_ORIGIN || 'http://localhost:5173',
    'https://vercel.com/namans-projects-6a370d2d/my-portfolio/3vxBcLhguYaH6Kp5i3p8GnYx91Cb',
    'https://www.namankhandelwal.me'
  ] // Allow your frontend to access
}));
app.use(express.json()); // To parse JSON request bodies

// --- In-memory OTP store (FOR DEMO ONLY - use Redis/DB in production) ---
const otpStore = {}; // { email: { code: '123456', expiry: timestamp, name: '', message: '' } }

// --- Nodemailer Transporter Configuration ---
const transporter = nodemailer.createTransport({
  service: 'gmail', // Use 'gmail' for Gmail. For others, specify host/port/secure
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Test Nodemailer connection (optional, good for debugging setup)
transporter.verify(function (error, success) {
  if (error) {
    console.error("Nodemailer connection failed:", error);
  } else {
    console.log("Nodemailer server is ready to take our messages");
  }
});

// --- API Endpoint: Send OTP ---
app.post('/api/send-otp', async (req, res) => {
  const { email, name, message } = req.body; // Capture name and message here

  if (!email || !name || !message) {
    return res.status(400).json({ message: 'Name, Email, and Message are required.' });
  }

  try {
    const otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      specialChars: false,
      lowerCaseAlphabets: false,
    });
    const expiry = Date.now() + 5 * 60 * 1000; // OTP valid for 5 minutes

    // Store OTP along with name and message for later use
    otpStore[email] = { code: otp, expiry: expiry, name: name, message: message };
    console.log(`Generated OTP for ${email}: ${otp}`);

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Your OTP for Contact Form Verification',
      html: `
        <p>Hello,</p>
        <p>Your One-Time Password (OTP) for verifying your contact form submission is:</p>
        <h2 style="color: #007bff;">${otp}</h2>
        <p>This OTP is valid for 5 minutes. Please do not share it with anyone.</p>
        <p>If you did not request this, please ignore this email.</p>
        <p>Best regards,<br>Your Portfolio Site</p>
      `,
    });

    res.status(200).json({ message: 'OTP sent to your email. Please check your inbox and spam folder.' });
  } catch (error) {
    console.error('Error sending OTP:', error);
    res.status(500).json({ message: 'Failed to send OTP.', error: error.message });
  }
});

// --- API Endpoint: Verify OTP ---
app.post('/api/verify-otp', async (req, res) => { // Made async to use await for transporter.sendMail
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ message: 'Email and OTP are required.' });
  }

  const storedOtpData = otpStore[email];

  if (!storedOtpData) {
    return res.status(404).json({ message: 'No OTP found for this email or it has expired. Please request a new one.' });
  }

  // Destructure name and message from storedOtpData
  const { code, expiry, name, message } = storedOtpData;

  if (code !== otp) {
    return res.status(401).json({ message: 'Invalid OTP. Please try again.' });
  }

  if (Date.now() > expiry) {
    delete otpStore[email]; // Clear expired OTP
    return res.status(401).json({ message: 'OTP has expired. Please request a new one.' });
  }

  // OTP is valid and not expired, remove it from store
  delete otpStore[email];
  console.log(`OTP for ${email} successfully verified.`);

  try {
    // --- Send Notification Email to Portfolio Owner ---
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: 'namankhandelwal.dev@gmail.com', // Replace with your email
      subject: `New Contact Form Message from ${name} (${email})`,
      html: `
        <p>You've received a new message from your portfolio contact form:</p>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <p style="white-space: pre-wrap; border: 1px solid #eee; padding: 10px;">${message}</p>
        <p>Sent on: ${new Date().toLocaleDateString('en-US')}</p>
        <p>Best regards,<br>Your Portfolio Site</p>
      `,
    });
    console.log('Notification email sent to Naman via backend.');

    // --- Send Auto-Reply to User ---
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email, // User's email
      subject: 'Thanks for contacting Naman Khandelwal!',
      html: `
        <p>Hi ${name},</p>
        <p>Thanks a ton for reaching out!</p>
        <p>I've received your message and will get back to you as soon as I can &mdash; usually within 1-2 days.</p>
        <p>Meanwhile, feel free to check out more of my work or connect with me on socials:</p>
        <p><a href="https://www.linkedin.com/in/naman-khandelwal-53161829a/">LinkedIn</a></p>
        <p><a href="https://github.com/Sky-walkerX">GitHub</a></p>
        <p>Cheers,<br>Naman Khandelwal</p>
      `,
    });
    console.log('Auto-reply sent to user via backend.');

    res.status(200).json({ message: 'OTP verified and message sent successfully!' });
  } catch (emailError) {
    console.error('Error sending confirmation/auto-reply emails after OTP verification:', emailError);
    // Even if email sending fails, OTP was verified. You might want to log this but still respond success for OTP.
    res.status(500).json({ message: 'OTP verified, but failed to send confirmation emails. Please contact Naman directly.', error: emailError.message });
  }
});

// --- Start the Server ---
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});