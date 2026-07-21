import nodemailer from "nodemailer";

/**
 * Unified Mailer Utility
 * Handles SMTP transporter creation and email dispatch with robust error handling.
 */

let transporter = null;
const SEND_TIMEOUT_MS = Number(process.env.SMTP_SEND_TIMEOUT_MS || 8000);

function withTimeout(promise, timeoutMs) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("SMTP send timed out.")), timeoutMs),
    ),
  ]);
}

const getTransporter = () => {
  if (transporter) return transporter;

  // Gmail displays app passwords in four groups. Environment files often
  // preserve those spaces, while SMTP authentication requires the raw value.
  const smtpPassword = process.env.SMTP_PASS?.replace(/\s+/g, "");

  const config = {
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: process.env.SMTP_PORT === "465",
    auth: {
      user: process.env.SMTP_USER,
      pass: smtpPassword,
    },
    connectionTimeout: Number(process.env.SMTP_CONNECTION_TIMEOUT_MS || 5000),
    greetingTimeout: Number(process.env.SMTP_GREETING_TIMEOUT_MS || 5000),
    socketTimeout: Number(process.env.SMTP_SOCKET_TIMEOUT_MS || 10000),
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
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS?.replace(/\s+/g, "")) {
      console.error("[Mailer] Missing SMTP credentials. Check .env.local");
      return { success: false, error: "Missing SMTP credentials" };
    }

    const mailOptions = {
      from: process.env.SMTP_FROM || `"${fromName}" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
      text: text || "", // Fallback to plain text if provided
    };

    console.log(`[Mailer] Attempting to send email to: ${to} (Subject: ${subject})`);
    
    const info = await withTimeout(
      getTransporter().sendMail(mailOptions),
      SEND_TIMEOUT_MS,
    );
    
    console.log(`[Mailer] Success! MessageID: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("[Mailer] CRITICAL FAILURE:", error);
    
    // Provide a more descriptive error message
    let errorMessage = error.message;
    if (error.code === 'EAUTH') errorMessage = "Authentication failed. Check your SMTP_USER and SMTP_PASS (use App Password for Gmail).";
    if (error.code === 'ECONNECTION') errorMessage = "Could not connect to SMTP server. Check your SMTP_HOST and SMTP_PORT.";
    if (error.code === 'ETIMEDOUT' || error.message === "SMTP send timed out.") {
      errorMessage = "Email server is taking too long. Please try again.";
    }

    // If it's a connection error, clear the transporter so it recreates next time
    if (error.code === 'ECONNECTION' || error.code === 'ETIMEDOUT' || error.message === "SMTP send timed out.") {
        transporter = null;
    }
    return { success: false, error: errorMessage };
  }
};

// Legacy support for default export if needed
const mailer = { sendEmail };
export default mailer;
