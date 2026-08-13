import nodemailer from "nodemailer";
import dbConnect from "./dbConnect.js";
import { SystemEmail } from "../models/SystemEmail.js";

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
      setTimeout(() => reject(new Error("SMTP send timed out.")), timeoutMs)
    ),
  ]);
}

const getTransporter = () => {
  if (transporter) return transporter;

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
 * Infer email type from subject if not explicitly provided
 */
function inferEmailType(subject = "", type = null) {
  if (type) return type;
  const lower = subject.toLowerCase();
  if (lower.includes("password") || lower.includes("reset")) return "password_reset";
  if (lower.includes("setup") || lower.includes("account") || lower.includes("welcome") || lower.includes("passkey")) return "account_setup";
  if (lower.includes("restore") || lower.includes("appeal") || lower.includes("access")) return "account_restore";
  if (lower.includes("reply") || lower.includes("support")) return "admin_reply";
  return "general_notification";
}

/**
 * Send an email with automatic error logging & DB auditing
 * @param {Object} options - { to, subject, html, text, fromName, type, metadata }
 */
export const sendEmail = async ({ to, subject, html, text, fromName = "Muhyo Tech", type = null, metadata = {} }) => {
  const emailType = inferEmailType(subject, type);
  const senderEmail = process.env.SMTP_FROM || `"${fromName}" <${process.env.SMTP_USER}>`;

  try {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS?.replace(/\s+/g, "")) {
      console.error("[Mailer] Missing SMTP credentials. Check .env.local");
      const errMessage = "Missing SMTP credentials";

      // Log failed email attempt
      try {
        await dbConnect();
        await SystemEmail.create({
          to,
          from: senderEmail,
          subject,
          html,
          text: text || "",
          type: emailType,
          status: "failed",
          error: errMessage,
          metadata,
        });
      } catch (logErr) {
        console.error("[Mailer] Failed to log missing creds email:", logErr.message);
      }

      return { success: false, error: errMessage };
    }

    const mailOptions = {
      from: senderEmail,
      to,
      subject,
      html,
      text: text || "",
    };

    console.log(`[Mailer] Attempting to send email to: ${to} (Subject: ${subject})`);
    
    const info = await withTimeout(
      getTransporter().sendMail(mailOptions),
      SEND_TIMEOUT_MS
    );
    
    console.log(`[Mailer] Success! MessageID: ${info.messageId}`);

    // Log successful email in DB
    try {
      await dbConnect();
      await SystemEmail.create({
        to,
        from: senderEmail,
        subject,
        html,
        text: text || "",
        type: emailType,
        status: "sent",
        metadata: { ...metadata, messageId: info.messageId },
      });
    } catch (logErr) {
      console.error("[Mailer] DB Email Log Error:", logErr.message);
    }

    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("[Mailer] CRITICAL FAILURE:", error);
    
    let errorMessage = error.message;
    if (error.code === 'EAUTH') errorMessage = "Authentication failed. Check your SMTP_USER and SMTP_PASS.";
    if (error.code === 'ECONNECTION') errorMessage = "Could not connect to SMTP server.";
    if (error.code === 'ETIMEDOUT' || error.message === "SMTP send timed out.") {
      errorMessage = "Email server is taking too long. Please try again.";
    }

    if (error.code === 'ECONNECTION' || error.code === 'ETIMEDOUT' || error.message === "SMTP send timed out.") {
      transporter = null;
    }

    // Log failure in DB
    try {
      await dbConnect();
      await SystemEmail.create({
        to,
        from: senderEmail,
        subject,
        html,
        text: text || "",
        type: emailType,
        status: "failed",
        error: errorMessage,
        metadata,
      });
    } catch (logErr) {
      console.error("[Mailer] DB Email Failure Log Error:", logErr.message);
    }

    return { success: false, error: errorMessage };
  }
};

// Legacy support for default export if needed
const mailer = { sendEmail };
export default mailer;
