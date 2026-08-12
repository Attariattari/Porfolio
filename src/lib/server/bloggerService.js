/**
 * Google Blogger API v3 Integration Service
 * Uses official Google OAuth2 Refresh Flow & Blogger REST API v3
 */

async function getBloggerAccessToken() {
  const clientId =
    process.env.GOOGLE_BLOGGER_CLIENT_ID || process.env.GOOGLE_CLIENT_ID;
  const clientSecret =
    process.env.GOOGLE_BLOGGER_CLIENT_SECRET || process.env.GOOGLE_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_BLOGGER_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error(
      "Missing Google Blogger OAuth credentials (GOOGLE_BLOGGER_CLIENT_ID, GOOGLE_BLOGGER_CLIENT_SECRET, GOOGLE_BLOGGER_REFRESH_TOKEN) in .env.local"
    );
  }

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });

  const data = await response.json();
  if (!response.ok || !data.access_token) {
    throw new Error(
      `Failed to obtain Google access token: ${data.error_description || data.error || "Unknown OAuth error"}`
    );
  }

  return data.access_token;
}

const PUBLIC_LIVE_DOMAIN = "https://www.muhyotech.com";

export function getBloggerLiveBaseUrl() {
  const configured = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || process.env.APP_URL;
  if (configured && !configured.includes("localhost") && !configured.includes("127.0.0.1")) {
    return configured.replace(/\/$/, "");
  }
  return PUBLIC_LIVE_DOMAIN;
}

export function sanitizeBloggerContentLinks(content = "") {
  if (!content) return content;
  const liveBaseUrl = getBloggerLiveBaseUrl();

  let sanitized = content;
  sanitized = sanitized.replace(/https?:\/\/(?:localhost|127\.0\.0\.1)(?::\d+)?/gi, liveBaseUrl);
  sanitized = sanitized.replace(/(href=["'])\/(blog\/[^"']+)(["'])/gi, `$1${liveBaseUrl}/$2$3`);

  return sanitized;
}

export function sanitizeBloggerUrl(url = "") {
  if (!url) return `${getBloggerLiveBaseUrl()}/blog`;
  const liveBaseUrl = getBloggerLiveBaseUrl();
  return url.replace(/https?:\/\/(?:localhost|127\.0\.0\.1)(?::\d+)?/gi, liveBaseUrl);
}

export async function updateGoogleBloggerPost(bloggerPostId, { title, content, tags = [], canonicalUrl }) {
  try {
    const blogId = process.env.GOOGLE_BLOGGER_BLOG_ID;
    if (!blogId || !bloggerPostId) return { success: false, error: "Missing blogId or bloggerPostId" };

    const accessToken = await getBloggerAccessToken();
    const liveCanonicalUrl = sanitizeBloggerUrl(canonicalUrl);
    let formattedContent = sanitizeBloggerContentLinks(content);

    if (liveCanonicalUrl && !formattedContent.includes(liveCanonicalUrl)) {
      formattedContent += `
        <br/><hr/>
        <p style="font-size: 0.9em; color: #666;">
          <em>Originally published at <a href="${liveCanonicalUrl}" target="_blank" rel="noopener noreferrer">${liveCanonicalUrl}</a></em>
        </p>
      `;
    }

    const response = await fetch(
      `https://www.googleapis.com/blogger/v3/blogs/${blogId}/posts/${bloggerPostId}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          kind: "blogger#post",
          title: title,
          content: formattedContent,
          labels: tags.length > 0 ? tags : ["Technology", "Engineering"],
        }),
      }
    );

    const postData = await response.json();
    if (!response.ok) {
      throw new Error(`Google Blogger API update error: ${postData.error?.message || JSON.stringify(postData)}`);
    }

    console.log(`[Blogger API] Live Post ${bloggerPostId} updated on Google Blogger dashboard.`);
    return { success: true, postData };
  } catch (error) {
    console.error("[updateGoogleBloggerPost Error]:", error.message);
    return { success: false, error: error.message };
  }
}

export async function publishToGoogleBlogger({
  title,
  content,
  tags = [],
  canonicalUrl,
  isDraft = false,
}) {
  try {
    const blogId = process.env.GOOGLE_BLOGGER_BLOG_ID;
    if (!blogId) {
      throw new Error("Missing GOOGLE_BLOGGER_BLOG_ID in .env.local");
    }

    const accessToken = await getBloggerAccessToken();

    // Ensure canonical attribution link is present and strictly uses live production domain
    const liveCanonicalUrl = sanitizeBloggerUrl(canonicalUrl);
    let formattedContent = sanitizeBloggerContentLinks(content);

    if (liveCanonicalUrl && !formattedContent.includes(liveCanonicalUrl)) {
      formattedContent += `
        <br/><hr/>
        <p style="font-size: 0.9em; color: #666;">
          <em>Originally published at <a href="${liveCanonicalUrl}" target="_blank" rel="noopener noreferrer">${liveCanonicalUrl}</a></em>
        </p>
      `;
    }

    const bloggerResponse = await fetch(
      `https://www.googleapis.com/blogger/v3/blogs/${blogId}/posts?isDraft=${isDraft ? "true" : "false"}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          kind: "blogger#post",
          title: title,
          content: formattedContent,
          labels: tags.length > 0 ? tags : ["Technology", "Engineering"],
        }),
      }
    );

    const postData = await bloggerResponse.json();

    if (!bloggerResponse.ok || (!postData.url && !postData.id)) {
      throw new Error(
        `Google Blogger API error: ${postData.error?.message || JSON.stringify(postData)}`
      );
    }

    console.log(`[Blogger API] ${isDraft ? "Draft created" : "Published"} successfully:`, postData.url || postData.id);
    return {
      success: true,
      bloggerUrl: postData.url || `https://www.blogger.com/blog/post/edit/${blogId}/${postData.id}`,
      bloggerPostId: postData.id,
      isDraft: Boolean(isDraft),
    };
  } catch (error) {
    console.error("[Blogger API Error]:", error.message);
    return {
      success: false,
      error: error.message,
    };
  }
}

export function checkBloggerConfigStatus() {
  const hasClientId = Boolean(process.env.GOOGLE_BLOGGER_CLIENT_ID || process.env.GOOGLE_CLIENT_ID);
  const hasClientSecret = Boolean(process.env.GOOGLE_BLOGGER_CLIENT_SECRET || process.env.GOOGLE_CLIENT_SECRET);
  const hasRefreshToken = Boolean(process.env.GOOGLE_BLOGGER_REFRESH_TOKEN);
  const hasBlogId = Boolean(process.env.GOOGLE_BLOGGER_BLOG_ID);

  return {
    configured: Boolean(hasClientId && hasClientSecret && hasRefreshToken && hasBlogId),
    hasBlogId,
    hasClientId,
    hasClientSecret,
    hasRefreshToken,
    autoPublishEnabled: process.env.ENABLE_AUTO_BLOGGER_POST === "true",
  };
}

export async function checkIfBloggerPostExists(bloggerPostId) {
  try {
    const blogId = process.env.GOOGLE_BLOGGER_BLOG_ID;
    if (!blogId || !bloggerPostId) return { exists: false };

    const accessToken = await getBloggerAccessToken();
    const response = await fetch(
      `https://www.googleapis.com/blogger/v3/blogs/${blogId}/posts/${bloggerPostId}`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    if (response.status === 404) {
      return { exists: false, reason: "DELETED_ON_BLOGGER" };
    }

    const data = await response.json();
    if (data.status === "DELETED") {
      return { exists: false, reason: "DELETED_ON_BLOGGER" };
    }

    return { exists: response.ok, postData: data };
  } catch (error) {
    console.error("[checkIfBloggerPostExists Error]:", error.message);
    return { exists: false, error: error.message };
  }
}
