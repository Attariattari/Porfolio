
const { sendEmail } = require('./src/lib/mailer');
const fs = require('fs');
const path = require('path');

// Manually load env for this script
const envPath = path.resolve(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
envContent.split('\n').forEach(line => {
  const parts = line.split('=');
  if (parts.length >= 2) {
    process.env[parts[0].trim()] = parts.slice(1).join('=').trim();
  }
});

async function test() {
  console.log("Testing with src/lib/mailer.js...");
  console.log("SMTP_USER:", process.env.SMTP_USER);
  
  const result = await sendEmail({
    to: process.env.SMTP_USER,
    subject: "Test from Muhyo Mailer",
    text: "This is a test to verify the mailer utility is working."
  });
  
  console.log("Result:", result);
}

test();
