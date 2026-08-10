import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { Blog } from "@/models/Portfolio";
import { BloggerPost } from "@/models/BloggerPost";
import { auditAndFixBlogContent } from "@/lib/ai/blog/blogAuditEngine";
import { triggerBloggerPublishIfReady } from "@/lib/ai/blog/bloggerAutomationHook";
import { revalidatePath } from "next/cache";

// GET /api/admin/blog-audit/[id] -> Fast fetch of saved audit & backup comparison WITHOUT calling AI
export async function GET(req, { params }) {
  try {
    const { id } = await params;
    await dbConnect();

    const blog = await Blog.findById(id).lean();
    if (!blog) {
      return NextResponse.json({ success: false, error: "Blog not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      blogId: blog._id,
      slug: blog.slug,
      image: blog.image || blog.featuredImage?.url,
      auditStatus: blog.auditStatus,
      original: {
        title: blog.auditBackup?.title || blog.title,
        summary: blog.auditBackup?.summary || blog.summary || "",
        content: blog.auditBackup?.content || blog.content || "",
        seoTitle: blog.auditBackup?.seoTitle || blog.seoTitle || "",
        seoDescription: blog.auditBackup?.seoDescription || blog.seoDescription || "",
      },
      optimized: {
        title: blog.title,
        summary: blog.summary || "",
        content: blog.content || "",
        seoTitle: blog.seoTitle || "",
        seoDescription: blog.seoDescription || "",
      },
      metrics: blog.auditMetrics || {
        originalScore: 65,
        optimizedScore: 92,
        errorsFixedCount: 0,
        spellingFixes: [],
        syntaxFixes: [],
        keywordsAdded: [],
      },
      saved: true,
    });
  } catch (error) {
    console.error("[GET /api/admin/blog-audit/[id]] Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST /api/admin/blog-audit/[id] -> Triggers AI audit preview
export async function POST(req, { params }) {
  try {
    const { id } = await params;
    await dbConnect();

    const blog = await Blog.findById(id);
    if (!blog) {
      return NextResponse.json({ success: false, error: "Blog not found" }, { status: 404 });
    }

    const body = await req.json().catch(() => ({}));
    const { autoSave = false } = body;

    const auditResult = await auditAndFixBlogContent({
      title: blog.title,
      summary: blog.summary || "",
      content: blog.content || "",
      seoTitle: blog.seoTitle || blog.title,
      seoDescription: blog.seoDescription || blog.summary || "",
      focusKeyword: blog.focusKeyword || "",
      contentCategory: blog.contentCategory || "core_web_engineering",
    });

    if (!auditResult.success) {
      return NextResponse.json({ success: false, error: auditResult.error }, { status: 500 });
    }

    if (autoSave) {
      if (!blog.auditBackup || !blog.auditBackup.content) {
        blog.auditBackup = {
          title: blog.title,
          summary: blog.summary,
          content: blog.content,
          seoTitle: blog.seoTitle,
          seoDescription: blog.seoDescription,
          auditedAt: new Date(),
        };
      }

      blog.title = auditResult.optimized.title;
      blog.summary = auditResult.optimized.summary;
      blog.content = auditResult.optimized.content;
      blog.seoTitle = auditResult.optimized.seoTitle;
      blog.seoDescription = auditResult.optimized.seoDescription;

      blog.auditStatus = "optimized";
      blog.auditMetrics = auditResult.metrics;
      blog.auditedAt = new Date();

      await blog.save();
      revalidatePath("/blog");
      revalidatePath(`/blog/${blog.slug}`);
    }

    return NextResponse.json({
      success: true,
      blogId: blog._id,
      slug: blog.slug,
      image: blog.image || blog.featuredImage?.url,
      original: auditResult.original,
      optimized: auditResult.optimized,
      metrics: auditResult.metrics,
      saved: autoSave,
    });
  } catch (error) {
    console.error("[POST /api/admin/blog-audit/[id]] Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PUT /api/admin/blog-audit/[id] -> Explicitly saves approved optimized audit content
export async function PUT(req, { params }) {
  try {
    const { id } = await params;
    await dbConnect();

    const blog = await Blog.findById(id);
    if (!blog) {
      return NextResponse.json({ success: false, error: "Blog not found" }, { status: 404 });
    }

    const { title, summary, content, seoTitle, seoDescription, metrics } = await req.json();

    if (!blog.auditBackup || !blog.auditBackup.content) {
      blog.auditBackup = {
        title: blog.title,
        summary: blog.summary,
        content: blog.content,
        seoTitle: blog.seoTitle,
        seoDescription: blog.seoDescription,
        auditedAt: new Date(),
      };
    }

    if (title) blog.title = title;
    if (summary) blog.summary = summary;
    if (content) blog.content = content;
    if (seoTitle) blog.seoTitle = seoTitle;
    if (seoDescription) blog.seoDescription = seoDescription;

    blog.auditStatus = "optimized";
    if (metrics) blog.auditMetrics = metrics;
    blog.auditedAt = new Date();

    await blog.save();

    // Safe Sync: Update BloggerPost parent info & check if Blogger post is ready
    try {
      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://muhyotech.com";
      await BloggerPost.updateMany(
        { parentBlogId: blog._id },
        {
          parentBlogTitle: blog.title,
          parentBlogSlug: blog.slug,
          parentBlogUrl: `${baseUrl}/blog/${blog.slug}`,
        }
      );
      triggerBloggerPublishIfReady(blog._id).catch(() => {});
    } catch (bErr) {
      console.error("[Blogger Sync Safe Warning]:", bErr.message);
    }

    revalidatePath("/blog");
    revalidatePath(`/blog/${blog.slug}`);
    revalidatePath("/admin/blogs");

    return NextResponse.json({ success: true, message: "Blog successfully updated with AI fixes.", data: blog });
  } catch (error) {
    console.error("[PUT /api/admin/blog-audit/[id]] Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE /api/admin/blog-audit/[id] -> Reverts blog back to original auditBackup content
export async function DELETE(req, { params }) {
  try {
    const { id } = await params;
    await dbConnect();

    const blog = await Blog.findById(id);
    if (!blog) {
      return NextResponse.json({ success: false, error: "Blog not found" }, { status: 404 });
    }

    if (!blog.auditBackup || !blog.auditBackup.content) {
      return NextResponse.json(
        { success: false, error: "No original backup available to revert this blog." },
        { status: 400 }
      );
    }

    blog.title = blog.auditBackup.title;
    blog.summary = blog.auditBackup.summary;
    blog.content = blog.auditBackup.content;
    blog.seoTitle = blog.auditBackup.seoTitle;
    blog.seoDescription = blog.auditBackup.seoDescription;

    blog.auditStatus = "reverted";
    blog.auditedAt = new Date();

    await blog.save();

    revalidatePath("/blog");
    revalidatePath(`/blog/${blog.slug}`);
    revalidatePath("/admin/blogs");

    return NextResponse.json({ success: true, message: "Blog successfully reverted to original backup.", data: blog });
  } catch (error) {
    console.error("[DELETE /api/admin/blog-audit/[id]] Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
