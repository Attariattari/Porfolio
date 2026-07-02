import { sendEmail } from "@/lib/mailer";
import { SITE_URL } from "@/lib/config";

function getAppUrl(baseUrl = "") {
  if (baseUrl) return baseUrl;

  const explicitUrl =
    process.env.APP_URL ||
    process.env.NEXT_PUBLIC_BASE_URL ||
    process.env.NEXT_PUBLIC_SITE_URL;

  if (explicitUrl) return explicitUrl;

  const vercelUrl =
    process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;

  if (process.env.VERCEL && vercelUrl) {
    return vercelUrl.startsWith("http") ? vercelUrl : `https://${vercelUrl}`;
  }

  if (process.env.NODE_ENV !== "production") {
    return "http://localhost:3000";
  }

  return SITE_URL;
}

function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function sendBlogImagePromptEmail({
  to,
  blog,
  imagePrompt,
  uploadToken,
  expiresAt,
  baseUrl,
}) {
  const appUrl = getAppUrl(baseUrl).replace(/\/$/, "");
  const uploadUrl = `${appUrl}/blog-image-upload/${uploadToken}`;
  const reviewUrl = `${appUrl}/admin/blogs`;

  const html = `
    <div style="font-family:Arial,sans-serif;background:#0b1220;color:#e5eefc;padding:28px">
      <div style="max-width:720px;margin:0 auto;background:#111827;border:1px solid #263244;border-radius:18px;padding:28px">
        <p style="font-size:12px;letter-spacing:0.18em;text-transform:uppercase;color:#34d399;margin:0 0 12px">Muhyo Tech Automation</p>
        <h1 style="font-size:26px;line-height:1.2;margin:0 0 10px">Professional Blog Image Prompt Ready</h1>
        <p style="color:#a9b6ca;line-height:1.7">The AI blog was generated successfully, but the image generation needs your review or manual upload. A professional image prompt has been prepared based on the blog content.</p>

        <h2 style="font-size:18px;margin:26px 0 8px">${escapeHtml(blog.title)}</h2>
        <p style="color:#a9b6ca;line-height:1.7">${escapeHtml(blog.summary || "")}</p>
        <p style="font-size:12px;color:#7dd3fc;text-transform:uppercase;letter-spacing:.12em">${escapeHtml(blog.category || "Technology")}</p>

        <div style="margin:22px 0;padding:18px;border-radius:14px;background:#020617;border:1px solid #334155">
          <p style="font-size:12px;text-transform:uppercase;letter-spacing:.14em;color:#34d399;margin:0 0 10px">Full Image Generation Prompt</p>
          <p style="white-space:pre-wrap;color:#e2e8f0;line-height:1.7;margin:0">${escapeHtml(imagePrompt.prompt)}</p>
        </div>

        <div style="margin:18px 0;padding:16px;border-radius:14px;background:#0f172a;border:1px solid #334155">
          <p style="font-size:12px;text-transform:uppercase;letter-spacing:.14em;color:#94a3b8;margin:0 0 10px">Visual Direction</p>
          <p style="white-space:pre-wrap;color:#dbeafe;line-height:1.6;margin:0">${escapeHtml(imagePrompt.visualDirection || "")}</p>
        </div>

        <div style="margin:18px 0;padding:16px;border-radius:14px;background:#111827;border:1px solid #334155">
          <p style="font-size:12px;text-transform:uppercase;letter-spacing:.14em;color:#94a3b8;margin:0 0 10px">Negative Prompt</p>
          <p style="white-space:pre-wrap;color:#cbd5e1;line-height:1.6;margin:0">${escapeHtml(imagePrompt.negativePrompt || "")}</p>
        </div>

        <div style="margin-top:26px">
          <a href="${uploadUrl}" target="_blank" style="display:inline-block;background:#34d399;color:#031014;text-decoration:none;font-weight:700;padding:14px 20px;border-radius:12px;margin-right:10px">Upload Blog Image</a>
          <a href="${reviewUrl}" target="_blank" style="display:inline-block;background:#1f2937;color:#e5eefc;text-decoration:none;font-weight:700;padding:14px 20px;border-radius:12px;border:1px solid #334155">Review Blog in Admin</a>
        </div>

        <p style="margin-top:24px;color:#94a3b8;font-size:13px;line-height:1.6">This secure upload link is connected to one blog only and will expire automatically${expiresAt ? ` on ${new Date(expiresAt).toLocaleString()}` : ""}. Do not forward this email.</p>
      </div>
    </div>
  `;

  return sendEmail({
    to,
    subject: `AI Blog Image Needed: ${blog.title}`,
    html,
    text: `AI Blog Image Needed: ${blog.title}\n\n${blog.summary || ""}\n\nFull Image Generation Prompt:\n${imagePrompt.prompt}\n\nVisual Direction:\n${imagePrompt.visualDirection || ""}\n\nNegative Prompt:\n${imagePrompt.negativePrompt || ""}\n\nUpload: ${uploadUrl}`,
    fromName: "Muhyo Tech Automation",
  });
}
