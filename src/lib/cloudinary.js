/**
 * Smart Cloudinary helper to upload files across the Dynamic Multi-Account Pool.
 * Automatically chooses the account with maximum remaining credits.
 * Fallbacks to client-side Master Cloudinary upload if server API is unavailable.
 */
export const uploadToCloudinary = async (file, options = {}) => {
  if (!file) return null;

  // 1. Try smart dynamic multi-account pool upload via server (Highest remaining credits)
  try {
    const formData = new FormData();
    formData.append("file", file);
    if (options.folder) formData.append("folder", options.folder);
    if (options.purpose) formData.append("purpose", options.purpose);

    const res = await fetch("/api/admin/cloudinary-pool/upload", {
      method: "POST",
      body: formData,
    });

    if (res.ok) {
      const data = await res.json();
      if (data.success && data.url) {
        return data.url;
      }
    }
  } catch (err) {
    console.warn("⚠️ [uploadToCloudinary] Dynamic pool upload failed, attempting fallback:", err.message);
  }

  // 2. Fallback to direct client-side Master upload if server endpoint is unreachable
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "muhyo_unsigned";

  const fallbackData = new FormData();
  fallbackData.append("file", file);
  fallbackData.append("upload_preset", uploadPreset);

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: "POST",
        body: fallbackData,
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || "Upload failed");
    }

    const data = await response.json();
    return data.secure_url;
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error);
    throw error;
  }
};

