/**
 * Google Search Console (GSC) API Client (Phase 5)
 * 
 * Provides secure, lightweight Google Search Console v3 API integration 
 * using Service Account OAuth2 JWT assertion.
 * 
 * Never logs credentials, private keys, or secret tokens.
 * Gracefully degrades with available = false if unconfigured or on network/API failure.
 */

import crypto from "node:crypto";

function base64UrlEncode(data) {
  const buf = Buffer.isBuffer(data) ? data : Buffer.from(typeof data === "string" ? data : JSON.stringify(data));
  return buf.toString("base64").replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

async function createGoogleAccessToken(clientEmail, privateKey) {
  const header = { alg: "RS256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: clientEmail,
    scope: "https://www.googleapis.com/auth/webmasters.readonly",
    aud: "https://oauth2.googleapis.com/token",
    exp: now + 3600,
    iat: now,
  };

  const encodedHeader = base64UrlEncode(header);
  const encodedPayload = base64UrlEncode(payload);
  const unsignedToken = `${encodedHeader}.${encodedPayload}`;

  const signer = crypto.createSign("RSA-SHA256");
  signer.update(unsignedToken);
  signer.end();

  // Normalize private key formatting
  const formattedKey = privateKey.replace(/\\n/g, "\n");
  const signature = signer.sign(formattedKey);
  const jwt = `${unsignedToken}.${base64UrlEncode(signature)}`;

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });

  if (!response.ok) {
    const errText = await response.text().catch(() => "");
    throw new Error(`Google OAuth token request failed [${response.status}]: ${errText.slice(0, 100)}`);
  }

  const tokenData = await response.json();
  return tokenData.access_token;
}

export async function fetchGscSearchAnalytics({
  startDate = null,
  endDate = null,
  dimensions = ["query", "page"],
  rowLimit = 500,
} = {}) {
  const clientEmail = process.env.GSC_CLIENT_EMAIL;
  const privateKey = process.env.GSC_PRIVATE_KEY;
  const propertyUrl = process.env.GSC_PROPERTY_URL;

  if (!clientEmail || !privateKey || !propertyUrl) {
    return {
      available: false,
      source: "gsc_unconfigured",
      message: "GSC credentials not configured in environment variables.",
      rows: [],
      timestamp: new Date().toISOString(),
    };
  }

  try {
    const accessToken = await createGoogleAccessToken(clientEmail, privateKey);
    const end = endDate || new Date().toISOString().slice(0, 10);
    const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

    const siteUrlParam = encodeURIComponent(propertyUrl);
    const endpoint = `https://www.googleapis.com/webmasters/v3/sites/${siteUrlParam}/searchAnalytics/query`;

    const apiRes = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        startDate: start,
        endDate: end,
        dimensions,
        rowLimit,
      }),
    });

    if (!apiRes.ok) {
      const errorBody = await apiRes.text().catch(() => "");
      throw new Error(`GSC SearchAnalytics API HTTP ${apiRes.status}: ${errorBody.slice(0, 100)}`);
    }

    const data = await apiRes.json();
    const rows = Array.isArray(data.rows) ? data.rows : [];

    return {
      available: true,
      source: "gsc_api",
      rows,
      startDate: start,
      endDate: end,
      totalRows: rows.length,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.warn("[GSCClient] Search Console API call failed. Falling back gracefully:", error.message);
    return {
      available: false,
      source: "gsc_error",
      error: error.message,
      rows: [],
      timestamp: new Date().toISOString(),
    };
  }
}
