import crypto from "crypto";
import dbConnect from "@/lib/dbConnect";
import { ServiceImageUploadLink } from "@/models/ServiceImageUploadLink";
import Service from "@/models/Service";

const getSecret = () =>
  process.env.SERVICE_IMAGE_UPLOAD_SECRET ||
  process.env.BLOG_IMAGE_UPLOAD_SECRET ||
  process.env.AUTH_SECRET ||
  "dev-service-image-upload-secret";

export function hashServiceImageUploadToken(token) {
  return crypto.createHmac("sha256", getSecret()).update(token).digest("hex");
}

export function createRawServiceImageUploadToken() {
  return crypto.randomBytes(32).toString("base64url");
}

export async function createServiceImageUploadLink({
  service,
  targetEmail,
  createdBy = "system",
}) {
  await dbConnect();

  const rawToken = createRawServiceImageUploadToken();
  const tokenHash = hashServiceImageUploadToken(rawToken);
  const ttlHours = Number(process.env.SERVICE_IMAGE_UPLOAD_LINK_TTL_HOURS || 72);
  const expiresAt = new Date(Date.now() + ttlHours * 60 * 60 * 1000);

  const link = await ServiceImageUploadLink.create({
    serviceId: service._id,
    serviceTitle: service.title,
    serviceSlug: service.slug,
    targetEmail,
    tokenHash,
    expiresAt,
    createdBy,
  });

  return { rawToken, link };
}

export async function validateServiceImageUploadToken(rawToken) {
  if (!rawToken || rawToken.length < 32) {
    return { valid: false, code: "INVALID_TOKEN" };
  }

  await dbConnect();
  const tokenHash = hashServiceImageUploadToken(rawToken);
  const link = await ServiceImageUploadLink.findOne({ tokenHash });

  if (!link) return { valid: false, code: "INVALID_TOKEN" };

  if (link.status === "revoked") return { valid: false, code: "REVOKED", link };

  if (link.expiresAt && link.expiresAt.getTime() <= Date.now()) {
    if (link.status !== "expired") {
      link.status = "expired";
      await link.save().catch(() => {});
    }
    return { valid: false, code: "EXPIRED", link };
  }

  const service = await Service.findById(link.serviceId).lean();
  if (!service) return { valid: false, code: "SERVICE_NOT_FOUND", link };

  return {
    valid: true,
    isUsed: link.status === "used",
    code: link.status === "used" ? "USED" : "ACTIVE",
    link,
    service,
  };
}

export async function markServiceImageUploadLinkUsed(link, usedBy) {
  link.status = "used";
  link.usedAt = new Date();
  link.usedBy = usedBy;
  await link.save().catch(() => {});
}
