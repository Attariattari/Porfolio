import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { Blog } from "@/models/Portfolio";
import { auditAndFixBlogContent } from "@/lib/ai/blog/blogAuditEngine";
import { revalidatePath } from "next/cache";

export async function GET() {
  try {
    await dbConnect();
    const blogs = await Blog.find({})
      .select(
        "title slug summary content seoTitle seoDescription image featuredImage category readTime publishStatus auditStatus auditBackup auditMetrics auditedAt focusKeyword contentCategory updatedAt"
      )
      .sort({ updatedAt: -1 })
      .lean();

    const summaryStats = {
      total: blogs.length,
      optimized: blogs.filter((b) => b.auditStatus === "optimized").length,
      pending: blogs.filter((b) => !b.auditStatus || b.auditStatus === "pending").length,
      needsReview: blogs.filter((b) => b.auditStatus === "needs_review").length,
      avgOriginalScore: Math.round(
        blogs.reduce((acc, b) => acc + (b.auditMetrics?.originalScore || 60), 0) / (blogs.length || 1)
      ),
      avgOptimizedScore: Math.round(
        blogs.reduce((acc, b) => acc + (b.auditMetrics?.optimizedScore || 85), 0) / (blogs.length || 1)
      ),
    };

    return NextResponse.json({ success: true, stats: summaryStats, data: blogs });
  } catch (error) {
    console.error("[GET /api/admin/blog-audit] Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await dbConnect();
    const body = await req.json().catch(() => ({}));
    const { mode = "all", limit = 10 } = body;

    let query = {};
    if (mode === "pending_only") {
      query = { $or: [{ auditStatus: { $exists: false } }, { auditStatus: "pending" }] };
    }

    const blogs = await Blog.find(query).limit(limit);
    const results = [];

    for (const blog of blogs) {
      console.log(`[blog-audit bulk] Auditing blog ID ${blog._id} - ${blog.title}`);
      
      const auditResult = await auditAndFixBlogContent({
        title: blog.title,
        summary: blog.summary || "",
        content: blog.content || "",
        seoTitle: blog.seoTitle || blog.title,
        seoDescription: blog.seoDescription || blog.summary || "",
        focusKeyword: blog.focusKeyword || "",
        contentCategory: blog.contentCategory || "core_web_engineering",
      });

      if (auditResult.success) {
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
        results.push({ id: blog._id, title: blog.title, status: "optimized", metrics: auditResult.metrics });
      } else {
        results.push({ id: blog._id, title: blog.title, status: "failed", error: auditResult.error });
      }
    }

    revalidatePath("/blog");
    revalidatePath("/admin/blogs");

    return NextResponse.json({
      success: true,
      processedCount: results.length,
      results,
    });
  } catch (error) {
    console.error("[POST /api/admin/blog-audit] Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
