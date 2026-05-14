import nodemailer from "nodemailer";

/**
 * Unified Mailer Utility
 * Handles SMTP transporter creation and email dispatch with robust error handling.
 */

let transporter = null;

const getTransporter = () => {
  if (transporter) return transporter;

  const config = {
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: process.env.SMTP_PORT === "465",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    // Adding timeout settings to prevent hanging
    connectionTimeout: 10000, // 10s
    greetingTimeout: 10000,
    socketTimeout: 30000,
  };

  console.log(`[Mailer] Initializing transporter for ${config.host}:${config.port} (Secure: ${config.secure})`);
  
  transporter = nodemailer.createTransport(config);
  return transporter;
};

/**
 * Send an email with automatic error logging
 * @param {Object} options - { to, subject, html, text, fromName }
 */
export const sendEmail = async ({ to, subject, html, text, fromName = "Muhyo Tech" }) => {
  try {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.error("[Mailer] Missing SMTP credentials. Check .env.local");
      return { success: false, error: "Missing SMTP credentials" };
    }

    const mailOptions = {
      from: `"${fromName}" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
      text: text || "", // Fallback to plain text if provided
    };

    console.log(`[Mailer] Attempting to send email to: ${to} (Subject: ${subject})`);
    
    const info = await getTransporter().sendMail(mailOptions);
    
    console.log(`[Mailer] Success! MessageID: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("[Mailer] CRITICAL FAILURE:", error);
    
    // Provide a more descriptive error message
    let errorMessage = error.message;
    if (error.code === 'EAUTH') errorMessage = "Authentication failed. Check your SMTP_USER and SMTP_PASS (use App Password for Gmail).";
    if (error.code === 'ECONNECTION') errorMessage = "Could not connect to SMTP server. Check your SMTP_HOST and SMTP_PORT.";
    if (error.code === 'ETIMEDOUT') errorMessage = "Connection to SMTP server timed out.";

    // If it's a connection error, clear the transporter so it recreates next time
    if (error.code === 'ECONNECTION' || error.code === 'ETIMEDOUT') {
        transporter = null;
    }
    return { success: false, error: errorMessage };
  }
};

// Legacy support for default export if needed
export default { sendEmail };
