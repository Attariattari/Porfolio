import crypto from "crypto";
import dbConnect from "@/lib/dbConnect";
import { BlogImageUploadLink } from "@/models/BlogImageUploadLink";
import { Blog } from "@/models/Portfolio";

const getSecret = () =>
  process.env.BLOG_IMAGE_UPLOAD_SECRET || process.env.AUTH_SECRET || "dev-blog-image-upload-secret";

export function hashBlogImageUploadToken(token) {
  return crypto.createHmac("sha256", getSecret()).update(token).digest("hex");
}

export function createRawBlogImageUploadToken() {
  return crypto.randomBytes(32).toString("base64url");
}

export async function createBlogImageUploadLink({
  blog,
  targetEmail,
  createdBy = "system",
}) {
  await dbConnect();

  const rawToken = createRawBlogImageUploadToken();
  const tokenHash = hashBlogImageUploadToken(rawToken);
  const ttlHours = Number(process.env.BLOG_IMAGE_UPLOAD_LINK_TTL_HOURS || 48);
  const expiresAt = new Date(Date.now() + ttlHours * 60 * 60 * 1000);

  const link = await BlogImageUploadLink.create({
    blogId: blog._id,
    blogTitle: blog.title,
    targetEmail,
    tokenHash,
    expiresAt,
    createdBy,
  });

  await Blog.findByIdAndUpdate(blog._id, {
    manualImageUploadTokenId: link._id,
  });

  return { rawToken, link };
}

export async function validateBlogImageUploadToken(rawToken) {
  if (!rawToken || rawToken.length < 32) {
    return { valid: false, code: "INVALID_TOKEN" };
  }

  await dbConnect();
  const tokenHash = hashBlogImageUploadToken(rawToken);
  const link = await BlogImageUploadLink.findOne({ tokenHash });

  if (!link) return { valid: false, code: "INVALID_TOKEN" };

  if (link.status === "used") return { valid: false, code: "USED", link };
  if (link.status === "revoked") return { valid: false, code: "REVOKED", link };

  if (link.expiresAt.getTime() <= Date.now()) {
    if (link.status !== "expired") {
      link.status = "expired";
      await link.save();
    }
    return { valid: false, code: "EXPIRED", link };
  }

  if (link.status !== "active") {
    return { valid: false, code: "INVALID_STATUS", link };
  }

  const blog = await Blog.findById(link.blogId).lean();
  if (!blog) return { valid: false, code: "BLOG_NOT_FOUND", link };

  return { valid: true, link, blog };
}

export async function markBlogImageUploadLinkUsed(link, usedBy) {
  link.status = "used";
  link.usedAt = new Date();
  link.usedBy = usedBy;
  await link.save();
}

