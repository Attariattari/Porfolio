import crypto from "crypto";

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_IMAGE_SIZE = 8 * 1024 * 1024;

function getCloudinaryConfig() {
  return {
    cloudName:
      process.env.CLOUDINARY_CLOUD_NAME ||
      process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
  };
}

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

export function validateBlogImageFile(file) {
  if (!file) return { ok: false, message: "Image file is required." };
  if (!ALLOWED_TYPES.has(file.type)) {
    return { ok: false, message: "Only JPG, PNG, and WEBP images are allowed." };
  }
  if (file.size > MAX_IMAGE_SIZE) {
    return { ok: false, message: "Image must be 8MB or smaller." };
  }
  return { ok: true };
}

export async function uploadBlogImageToCloudinary(fileOrBuffer, options = {}) {
  const { cloudName, apiKey, apiSecret } = getCloudinaryConfig();
  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error("Cloudinary server credentials are not configured.");
  }

  let blob;
  let filename = options.filename || "blog-image.jpg";

  if (fileOrBuffer instanceof Buffer) {
    blob = new Blob([fileOrBuffer], { type: options.contentType || "image/jpeg" });
  } else {
    const validation = validateBlogImageFile(fileOrBuffer);
    if (!validation.ok) throw new Error(validation.message);
    blob = fileOrBuffer;
    filename = fileOrBuffer.name || filename;
  }

  const folder = options.folder || "Muhyo-Tech/blogs";
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const params = { folder, timestamp };
  const signature = signCloudinaryParams(params, apiSecret);

  const formData = new FormData();
  formData.append("file", blob, filename);
  formData.append("api_key", apiKey);
  formData.append("timestamp", timestamp);
  formData.append("folder", folder);
  formData.append("signature", signature);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    { method: "POST", body: formData },
  );

  if (!response.ok) {
    throw new Error("Cloudinary upload failed.");
  }

  const data = await response.json();
  if (!data.secure_url) throw new Error("Cloudinary did not return an image URL.");

  return {
    url: data.secure_url,
    publicId: data.public_id,
    width: data.width,
    height: data.height,
    format: data.format,
  };
}

