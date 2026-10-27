import crypto from "crypto";
import { getOptimalAccount, getMasterAccount, invalidateCloudinaryCache } from "./poolManager";

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB

function signCloudinaryParams(params, apiSecret) {
  const signatureBase = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join("&");

  return crypto
    .createHash("sha256")
    .update(signatureBase + apiSecret)
    .digest("hex");
}

export function validateServiceImageFile(file) {
  if (!file) return { ok: false, message: "Image file is required." };
  if (!ALLOWED_TYPES.has(file.type)) {
    return { ok: false, message: "Only JPG, PNG, and WEBP images are allowed." };
  }
  if (file.size > MAX_IMAGE_SIZE) {
    return { ok: false, message: "Image must be 10MB or smaller." };
  }
  return { ok: true };
}

export async function uploadServiceImageToCloudinary(fileOrBuffer, options = {}) {
  // 1. Resolve optimal account dynamically from pool with unshakeable Master fallback
  let activeAccount;
  try {
    activeAccount = await getOptimalAccount({ purpose: "service" });
  } catch (err) {
    console.warn("⚠️ [uploadServiceImage] Arbiter lookup failed, using master fallback:", err.message);
    activeAccount = getMasterAccount();
  }

  const cloudName =
    activeAccount.cloudName ||
    process.env.CLOUDINARY_CLOUD_NAME ||
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const apiKey = activeAccount.apiKey || process.env.CLOUDINARY_API_KEY;
  const apiSecret = activeAccount.apiSecret || process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error("Cloudinary server credentials are not configured.");
  }

  let blob;
  let filename = options.filename || "service-cover.jpg";

  if (fileOrBuffer instanceof Buffer) {
    blob = new Blob([fileOrBuffer], { type: options.contentType || "image/jpeg" });
  } else {
    const validation = validateServiceImageFile(fileOrBuffer);
    if (!validation.ok) throw new Error(validation.message);
    blob = fileOrBuffer;
    filename = fileOrBuffer.name || filename;
  }

  const folder = options.folder || "Muhyo-Tech/services";
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const params = { folder, timestamp };
  const signature = signCloudinaryParams(params, apiSecret);

  const formData = new FormData();
  formData.append("file", blob, filename);
  formData.append("api_key", apiKey);
  formData.append("timestamp", timestamp);
  formData.append("signature", signature);
  formData.append("folder", folder);

  const endpoint = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
  const response = await fetch(endpoint, {
    method: "POST",
    body: formData,
  });

  const data = await response.json();
  if (!response.ok || !data.secure_url) {
    throw new Error(data.error?.message || `Cloudinary upload failed (${response.status})`);
  }

  // Purge Redis cache so new service image is cached and telemetry updates immediately
  invalidateCloudinaryCache(cloudName).catch(() => {});

  return {
    url: data.secure_url,
    publicId: data.public_id,
    width: data.width,
    height: data.height,
    format: data.format,
    cloudName,
    accountLabel: activeAccount.label,
  };
}

