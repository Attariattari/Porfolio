import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { getAuthSession, checkPermission } from "@/lib/auth";
import { Blog } from "@/models/Portfolio";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function slugify(text = "") {
  return String(text)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function getUniqueSlug(baseSlug) {
  let slug = slugify(baseSlug) || "blog-entry";
  let count = 0;
  while (await Blog.exists({ slug: count === 0 ? slug : `${slug}-${count}` })) {
    count++;
  }
  return count === 0 ? slug : `${slug}-${count}`;
}

export async function POST(request) {
  try {
    const session = await getAuthSession();
    if (!checkPermission(session, "blogs", "edit")) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    let rawBlogs = [];

    if (Array.isArray(body)) {
      rawBlogs = body;
    } else if (body && Array.isArray(body.blogs)) {
      rawBlogs = body.blogs;
    } else if (body && typeof body === "object" && (body.title || body.content)) {
      rawBlogs = [body];
    }

    if (!rawBlogs.length) {
      return NextResponse.json(
        { success: false, error: "No valid blog entries found in JSON file." },
        { status: 400 }
      );
    }

    await dbConnect();
    const importedBlogs = [];

    for (const item of rawBlogs) {
      if (!item || typeof item !== "object") continue;
      const title = String(item.title || "Untitled Article").trim();
      const rawSlug = item.slug || title;
      const slug = await getUniqueSlug(rawSlug);

      const tags = Array.isArray(item.tags)
        ? item.tags.map((t) => String(t).trim()).filter(Boolean)
        : typeof item.tags === "string"
          ? item.tags.split(",").map((t) => t.trim()).filter(Boolean)
          : [];

      const relatedServiceSlugs = Array.isArray(item.relatedServiceSlugs)
        ? item.relatedServiceSlugs.map((s) => String(s).trim()).filter(Boolean)
        : [];

      const publishStatus = ["draft", "pending", "published"].includes(item.publishStatus)
        ? item.publishStatus
        : "draft";

      const searchIntent = ["informational", "commercial", "transactional", "navigational"].includes(item.searchIntent)
        ? item.searchIntent
        : "informational";

      const doc = {
        title,
        slug,
        summary: String(item.summary || "").trim(),
        content: String(item.content || "").trim(),
        seoTitle: String(item.seoTitle || title).trim(),
        seoDescription: String(item.seoDescription || item.summary || "").trim().slice(0, 160),
        focusKeyword: String(item.focusKeyword || "").trim(),
        searchIntent,
        category: String(item.category || "Engineering").trim(),
        tags,
        relatedServiceSlugs,
        publishStatus,
        featured: Boolean(item.featured),
        author: String(item.author || "Pir Ghulam Muhyo Din").trim(),
        authorRole: String(item.authorRole || "Founder").trim(),
        readTime: String(item.readTime || "5 min read").trim(),
        image: typeof item.image === "string" ? item.image : item.featuredImage?.url || "",
        createdAt: item.createdAt ? new Date(item.createdAt) : new Date(),
        updatedAt: new Date(),
      };

      const newBlog = await Blog.create(doc);
      importedBlogs.push(newBlog);
    }

    return NextResponse.json({
      success: true,
      count: importedBlogs.length,
      message: `Successfully imported ${importedBlogs.length} blog article${importedBlogs.length === 1 ? "" : "s"}.`,
    });
  } catch (error) {
    console.error("Blog Import Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to import blogs." },
      { status: 500 }
    );
  }
}
