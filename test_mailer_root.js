const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

// Manually read .env.local
const envPath = path.resolve(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const parts = line.split('=');
  if (parts.length >= 2) {
    const key = parts[0].trim();
    const value = parts.slice(1).join('=').trim();
    env[key] = value;
  }
});

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(env.SMTP_PORT || '587'),
  secure: env.SMTP_PORT === '465',
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  },
  debug: true,
  logger: true
});

async function testMail() {
  console.log("Testing SMTP connection...");
  console.log("User:", env.SMTP_USER);
  
  try {
    const info = await transporter.sendMail({
      from: `"Test" <${env.SMTP_USER}>`,
      to: env.SMTP_USER,
      subject: "Mailer Test",
      text: "Testing Nodemailer integration."
    });
    console.log("Email sent successfully!", info.messageId);
  } catch (error) {
    console.error("Email failed:", error);
  }
}

testMail();
