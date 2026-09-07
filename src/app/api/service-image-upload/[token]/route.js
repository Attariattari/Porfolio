import { NextResponse } from "next/server";
import Service from "@/models/Service";
import { getAuthSession } from "@/lib/auth";
import { checkRateLimit, getClientIP } from "@/lib/rateLimit";
import {
  validateServiceImageUploadToken,
  markServiceImageUploadLinkUsed,
} from "@/lib/server/serviceImageUploadToken";
import {
  uploadServiceImageToCloudinary,
  validateServiceImageFile,
} from "@/lib/server/cloudinary/uploadServiceImage";
import { invalidateServiceSnapshotCache } from "@/lib/ai/intelligence/services/serviceIntelligenceSnapshot";
import { cacheManager } from "@/lib/cache";
import dbConnect from "@/lib/dbConnect";

function isAuthorizedAdmin(session) {
  return (
    session?.role === "admin" ||
    session?.role === "super-admin" ||
    session?.role === "root-super-admin"
  );
}

export async function POST(request, { params }) {
  const ip = getClientIP(request);
  const limit = await checkRateLimit(`service-upload-post:${ip}`, {
    maxRequests: 10,
    windowMs: 60 * 1000,
  });

  if (!limit.allowed) {
    return NextResponse.json(
      { success: false, code: "RATE_LIMITED", message: "Too many requests. Please try again later." },
      { status: 429 },
    );
  }

  const session = await getAuthSession();
  if (!isAuthorizedAdmin(session)) {
    return NextResponse.json(
      { success: false, code: "ADMIN_REQUIRED", message: "Admin login required." },
      { status: 403 },
    );
  }

  const { token } = await params;
  const tokenResult = await validateServiceImageUploadToken(token);
  if (!tokenResult.valid) {
    return NextResponse.json(
      { success: false, code: tokenResult.code, message: "Upload token is invalid, expired, or revoked." },
      { status: 400 },
    );
  }

  const formData = await request.formData();
  const file = formData.get("image") || formData.get("file");
  const validation = validateServiceImageFile(file);
  if (!validation.ok) {
    return NextResponse.json(
      { success: false, code: "INVALID_FILE", message: validation.message },
      { status: 400 },
    );
  }

  try {
    const uploadResult = await uploadServiceImageToCloudinary(file, {
      filename: `service-${tokenResult.service.slug || "cover"}-${Date.now()}.jpg`,
      folder: "Muhyo-Tech/services",
    });

    await dbConnect();
    const service = await Service.findById(tokenResult.service._id);
    if (!service) {
      return NextResponse.json(
        { success: false, code: "SERVICE_NOT_FOUND", message: "Target service could not be found in database." },
        { status: 404 },
      );
    }

    service.heroImage = uploadResult.url;
    service.banner = uploadResult.url;
    service.image = uploadResult.url;
    if (!service.images || service.images.length === 0) {
      service.images = [uploadResult.url];
    } else if (!service.images.includes(uploadResult.url)) {
      service.images = [uploadResult.url, ...service.images];
    }
    service.imageStatus = "generated";
    service.imageGenerated = true;
    await service.save();

    await markServiceImageUploadLinkUsed(tokenResult.link, session.email || session.user?.email || "admin");
    invalidateServiceSnapshotCache();
    await cacheManager.invalidateByTag("services").catch(() => {});

    return NextResponse.json({
      success: true,
      status: "uploaded",
      imageUrl: uploadResult.url,
      redirectUrl: service.slug ? `/services/${service.slug}` : "/services",
      serviceTitle: service.title,
      serviceSlug: service.slug,
      message: `Image successfully attached to '${service.title}'.`,
    });
  } catch (error) {
    console.error("[ServiceImageUpload API Error]:", error);
    return NextResponse.json(
      { success: false, code: "UPLOAD_FAILED", message: error.message || "Failed to upload image to Cloudinary." },
      { status: 500 },
    );
  }
}
