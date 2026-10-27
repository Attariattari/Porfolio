import { NextResponse } from "next/server";
import { authenticateAdminRequest } from "@/lib/adminAuth";
import { getOptimalAccount, getMasterAccount, invalidateCloudinaryCache } from "@/lib/server/cloudinary/poolManager";
import { v2 as cloudinary } from "cloudinary";

export const dynamic = "force-dynamic";

/**
 * POST /api/admin/cloudinary-pool/upload
 * Unified upload endpoint that dynamically routes files to the account with the most remaining credits.
 * Supports manual uploads from all Admin Forms (Hero, About, Blog, Project, Service).
 */
export async function POST(req) {
  try {
    const auth = await authenticateAdminRequest(req);
    if (auth.error) {
      return NextResponse.json(
        { success: false, error: auth.error.message || "Unauthorized" },
        { status: auth.error.status || 401 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || typeof file === "string") {
      return NextResponse.json(
        { success: false, error: "No valid file provided for upload" },
        { status: 400 }
      );
    }

    const folder = formData.get("folder") || "Muhyo-Tech/uploads";
    const purpose = formData.get("purpose") || "admin-upload";

    // 1. Resolve optimal account from pool (Highest remaining credits)
    let activeAccount;
    try {
      activeAccount = await getOptimalAccount({ purpose });
    } catch (err) {
      console.warn("⚠️ [DynamicUploadAPI] Arbiter error, falling back to Master:", err.message);
      activeAccount = getMasterAccount();
    }

    // 2. Configure Cloudinary instance for target account
    cloudinary.config({
      cloud_name: activeAccount.cloudName,
      api_key: activeAccount.apiKey,
      api_secret: activeAccount.apiSecret,
      secure: true,
    });

    // 3. Convert file to Buffer and stream to Cloudinary
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: "image",
          transformation: [
            { width: 1920, crop: "limit" },
            { quality: "auto:good" },
          ],
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(buffer);
    });

    // 4. Invalidate Redis asset list cache so new asset appears in Media Pool
    await invalidateCloudinaryCache(activeAccount.cloudName);

    return NextResponse.json({
      success: true,
      url: uploadResult.secure_url,
      publicId: uploadResult.public_id,
      cloudName: activeAccount.cloudName,
      width: uploadResult.width,
      height: uploadResult.height,
      format: uploadResult.format,
      bytes: uploadResult.bytes,
    });
  } catch (error) {
    console.error("❌ [DynamicUploadAPI] Upload error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to upload asset" },
      { status: 500 }
    );
  }
}
