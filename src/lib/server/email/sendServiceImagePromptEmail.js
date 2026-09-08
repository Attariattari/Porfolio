import { sendEmail } from "@/lib/mailer";
import { SITE_URL } from "@/lib/config";

const PUBLIC_SITE_URL = "https://www.muhyotech.com";

function isLocalUrl(value = "") {
  try {
    const hostname = new URL(value).hostname;
    return ["localhost", "127.0.0.1", "0.0.0.0", "::1"].includes(hostname);
  } catch {
    return false;
  }
}

function isVercelDeploymentUrl(value = "") {
  try {
    return new URL(value).hostname.toLowerCase().endsWith(".vercel.app");
  } catch {
    return false;
  }
}

function getAppUrl(baseUrl = "") {
  // If an active baseUrl was supplied by the caller (e.g. localhost during development or custom domain in staging/prod),
  // honor it directly so that email links preserve the originating environment and login cookies.
  if (baseUrl && !isVercelDeploymentUrl(baseUrl)) {
    return baseUrl;
  }

  // During local development, allow localhost baseUrl or dev APP_URL so the developer can access the upload page immediately
  if (process.env.NODE_ENV === "development") {
    return baseUrl || process.env.APP_URL || "http://localhost:3000";
  }

  const explicitUrl =
    process.env.APP_URL ||
    process.env.NEXT_PUBLIC_BASE_URL ||
    process.env.NEXT_PUBLIC_SITE_URL;

  if (explicitUrl && !isLocalUrl(explicitUrl) && !isVercelDeploymentUrl(explicitUrl)) {
    return explicitUrl;
  }

  return isLocalUrl(SITE_URL) || isVercelDeploymentUrl(SITE_URL)
    ? PUBLIC_SITE_URL
    : SITE_URL || PUBLIC_SITE_URL;
}

function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function sendServiceImagePromptEmail({
  to,
  service,
  imagePrompt,
  uploadToken,
  expiresAt,
  baseUrl,
}) {
  const recipient =
    to ||
    process.env.SUPER_ADMIN_EMAIL ||
    process.env.ROOT_ADMIN_EMAIL ||
    process.env.ADMIN_EMAIL ||
    process.env.SMTP_USER;

  if (!recipient) {
    console.warn("[sendServiceImagePromptEmail] No recipient email configured.");
    return { success: false, message: "No recipient email configured" };
  }

  const appUrl = getAppUrl(baseUrl).replace(/\/$/, "");
  const uploadUrl = uploadToken
    ? `${appUrl}/service-image-upload/${uploadToken}`
    : `${appUrl}/admin/services`;
  const adminServicesUrl = `${appUrl}/admin/services`;
  const liveServiceUrl = `${appUrl}/services/${service.slug || ""}`;

  const problemsList = Array.isArray(service.problemsSolved)
    ? service.problemsSolved
        .map((p) => (typeof p === "string" ? p : p?.title || p?.description))
        .filter(Boolean)
        .slice(0, 3)
    : [];

  const deliverablesList = Array.isArray(service.deliverables)
    ? service.deliverables
        .map((d) => (typeof d === "string" ? d : d?.title || d?.description))
        .filter(Boolean)
        .slice(0, 4)
    : [];

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New AI Service Generated - Cover Image Prompt | Muhyo Tech</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #090d16; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #090d16; padding: 40px 16px;">
          <tr>
            <td align="center">
              <!-- Main Card Container -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 680px; background-color: #0f172a; border: 1px solid #1e293b; border-radius: 24px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);">
                
                <!-- Header Banner -->
                <tr>
                  <td style="background: linear-gradient(135deg, #0b1329 0%, #1e1b4b 50%, #6366f1 100%); padding: 36px 32px; border-bottom: 1px solid rgba(255, 255, 255, 0.1);">
                    <table width="100%" border="0" cellspacing="0" cellpadding="0">
                      <tr>
                        <td>
                          <span style="display: inline-block; padding: 6px 14px; background: rgba(99, 102, 241, 0.15); border: 1px solid rgba(99, 102, 241, 0.3); border-radius: 9999px; font-size: 11px; font-weight: 800; letter-spacing: 0.15em; text-transform: uppercase; color: #a5b4fc;">
                            ⚡ MUHYO TECH SERVICE AUTOMATION
                          </span>
                          <h1 style="margin: 16px 0 8px; font-size: 24px; font-weight: 800; color: #ffffff; letter-spacing: -0.025em; line-height: 1.3;">
                            New AI Service Generated: Image Prompt Ready
                          </h1>
                          <p style="margin: 0; font-size: 14px; color: #94a3b8; line-height: 1.6;">
                            A new commercial service has been drafted. Review the 4K image generation prompt below or upload your custom hero visual.
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Content Body -->
                <tr>
                  <td style="padding: 32px;">
                    
                    <!-- Service Details Card -->
                    <div style="background: #182238; border: 1px solid #26334d; border-radius: 16px; padding: 20px; margin-bottom: 24px;">
                      <span style="font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.15em; color: #818cf8; display: block; margin-bottom: 6px;">
                        ${escapeHtml(service.category || "COMMERCIAL SERVICE")}
                      </span>
                      <h2 style="margin: 0 0 10px; font-size: 18px; font-weight: 700; color: #f8fafc; line-height: 1.4;">
                        ${escapeHtml(service.title)}
                      </h2>
                      <p style="margin: 0 0 14px; font-size: 13px; color: #94a3b8; line-height: 1.6;">
                        ${escapeHtml(service.shortDescription || service.overview || "")}
                      </p>

                      ${deliverablesList.length ? `
                        <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid rgba(255, 255, 255, 0.08);">
                          <span style="font-size: 11px; font-weight: 700; color: #cbd5e1; display: block; margin-bottom: 6px;">Key Deliverables:</span>
                          <ul style="margin: 0; padding-left: 18px; font-size: 12px; color: #94a3b8; line-height: 1.6;">
                            ${deliverablesList.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
                          </ul>
                        </div>
                      ` : ""}
                    </div>

                    <!-- Prompt Instructions Box -->
                    <div style="background: #090d16; border: 1px solid #1e293b; border-radius: 16px; padding: 20px; margin-bottom: 20px;">
                      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
                        <span style="font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.12em; color: #34d399;">
                          🎨 Full 4K Service Image Prompt
                        </span>
                      </div>
                      <div style="font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace; font-size: 12px; color: #e2e8f0; line-height: 1.7; white-space: pre-wrap; background: #020617; padding: 14px; border-radius: 12px; border: 1px solid #1e293b;">
                        ${escapeHtml(imagePrompt.prompt)}
                      </div>
                    </div>

                    ${imagePrompt.visualDirection ? `
                    <div style="background: #0f172a; border: 1px solid #1e293b; border-radius: 14px; padding: 16px; margin-bottom: 16px;">
                      <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #cbd5e1; display: block; margin-bottom: 6px;">
                        🎯 Visual Direction & Palette
                      </span>
                      <p style="margin: 0; font-size: 13px; color: #94a3b8; line-height: 1.6;">
                        ${escapeHtml(imagePrompt.visualDirection)}
                      </p>
                    </div>
                    ` : ""}

                    ${imagePrompt.negativePrompt ? `
                    <div style="background: #0f172a; border: 1px solid #1e293b; border-radius: 14px; padding: 16px; margin-bottom: 20px;">
                      <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #f87171; display: block; margin-bottom: 6px;">
                        🛑 Negative Prompt (What to Avoid)
                      </span>
                      <p style="margin: 0; font-size: 12px; color: #94a3b8; line-height: 1.5;">
                        ${escapeHtml(imagePrompt.negativePrompt)}
                      </p>
                    </div>
                    ` : ""}

                    <!-- Primary Action Buttons -->
                    <div style="margin-top: 32px; text-align: center;">
                      <a href="${uploadUrl}" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: #ffffff; text-decoration: none; font-weight: 800; font-size: 14px; padding: 16px 32px; border-radius: 14px; box-shadow: 0 10px 25px -5px rgba(99, 102, 241, 0.4); margin-bottom: 12px;">
                        📸 Upload Service Picture 🚀
                      </a>
                      <br>
                      <a href="${adminServicesUrl}" target="_blank" style="display: inline-block; color: #94a3b8; text-decoration: none; font-weight: 600; font-size: 12px; margin-top: 8px;">
                        Open Service in Admin Dashboard →
                      </a>
                    </div>

                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background-color: #090d16; padding: 24px 32px; border-top: 1px solid #1e293b; text-align: center;">
                    <p style="margin: 0 0 6px; font-size: 12px; color: #64748b;">
                      Secure one-time upload token. Automatically expires${expiresAt ? ` on ${new Date(expiresAt).toLocaleDateString()}` : ""}.
                    </p>
                    <p style="margin: 0; font-size: 11px; font-weight: 700; color: #475569; letter-spacing: 0.1em; text-transform: uppercase;">
                      MUHYO TECH • ENTERPRISE SOFTWARE PLATFORM
                    </p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;

  return sendEmail({
    to: recipient,
    subject: `📸 AI Service Image Needed: ${service.title}`,
    html,
    text: `AI Service Image Needed: ${service.title}\nCategory: ${service.category}\n\nFull Image Prompt:\n${imagePrompt.prompt}\n\nUpload Service Picture: ${uploadUrl}\n\nAdmin Dashboard: ${adminServicesUrl}`,
    fromName: "Muhyo Tech Automation",
  });
}
