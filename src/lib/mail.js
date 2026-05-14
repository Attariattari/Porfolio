import mailer from "./mailer";

/**
 * Legacy wrapper for mailer.js
 * Standardizing on the unified mailer singleton.
 */
export const sendEmail = mailer.sendEmail;
export default mailer;
