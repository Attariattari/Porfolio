import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { BloggerPost } from "@/models/BloggerPost";
import { publishToGoogleBlogger } from "@/lib/server/bloggerService";

export async function GET(request, { params }) {
  try {
    await dbConnect();
    const { id } = await params;
    const post = await BloggerPost.findById(id).lean();

    if (!post) {
      return NextResponse.json(
        { success: false, error: "Blogger post not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: post });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function PATCH(request, { params }) {
  try {
    await dbConnect();
    const { id } = await params;
    const body = await request.json();

    const post = await BloggerPost.findById(id);
    if (!post) {
      return NextResponse.json(
        { success: false, error: "Blogger post not found" },
        { status: 404 }
      );
    }

    // Action: Publish to Google Blogger API
    if (body.action === "publish") {
      // PRE-CHECK: If already published or has bloggerPostId, bypass duplicate API call
      if (post.publishStatus === "published" || post.bloggerPostId) {
        return NextResponse.json({
          success: true,
          message: "This post is already published on Google Blogger!",
          data: post,
        });
      }

      // Strict Image Validation Check
      const hasImage = post.content && post.content.includes("<img");
      if (!hasImage) {
        const parentBlog = await Blog.findById(post.parentBlogId);
        const parentImageUrl = parentBlog?.featuredImage?.url || parentBlog?.image;

        if (parentImageUrl) {
          post.content = `
            <div style="margin-bottom: 24px; text-align: center;">
              <img src="${parentImageUrl}" alt="${post.title}" style="width: 100%; max-height: 480px; object-fit: cover; border-radius: 12px;" />
            </div>
            ${post.content}
          `;
          await post.save();
        } else {
          return NextResponse.json(
            {
              success: false,
              error: "🖼️ Cover Picture Missing! Please generate or upload a featured image for this blog first before publishing to Blogger.",
            },
            { status: 400 }
          );
        }
      }

      // 🔒 ATOMIC LOCK: Transition status to "publishing" in MongoDB
      const lockedPost = await BloggerPost.findOneAndUpdate(
        {
          _id: post._id,
          publishStatus: { $nin: ["publishing", "published"] },
          $or: [{ bloggerPostId: { $exists: false } }, { bloggerPostId: null }, { bloggerPostId: "" }],
        },
        {
          $set: {
            publishStatus: "publishing",
            publishingStartedAt: new Date(),
          },
        },
        { new: true }
      );

      if (!lockedPost) {
        return NextResponse.json(
          {
            success: false,
            error: "🔒 Publishing in progress by another worker or already published.",
          },
          { status: 409 }
        );
      }

      const publishRes = await publishToGoogleBlogger({
        title: lockedPost.title,
        content: lockedPost.content,
        tags: lockedPost.tags,
        canonicalUrl: lockedPost.parentBlogUrl,
        isDraft: body.isDraft || false,
      });

      if (!publishRes.success) {
        lockedPost.publishStatus = "failed";
        lockedPost.errorLog = publishRes.error;
        await lockedPost.save();
        return NextResponse.json(
          { success: false, error: publishRes.error },
          { status: 500 }
        );
      }

      lockedPost.publishStatus = "published";
      lockedPost.bloggerUrl = publishRes.bloggerUrl;
      lockedPost.bloggerPostId = publishRes.bloggerPostId;
      lockedPost.publishedAt = new Date();
      lockedPost.errorLog = null;
      await lockedPost.save();

      return NextResponse.json({
        success: true,
        message: "Successfully published to Google Blogger!",
        data: lockedPost,
      });
    }

    // Standard Content Update
    if (body.title) post.title = body.title;
    if (body.content) post.content = body.content;
    if (body.summary) post.summary = body.summary;
    if (body.tags) post.tags = body.tags;
    if (body.publishStatus) post.publishStatus = body.publishStatus;

    await post.save();

    return NextResponse.json({
      success: true,
      message: "Blogger post updated successfully",
      data: post,
    });
  } catch (error) {
    console.error("[API PATCH /api/admin/blogger/[id] Error]:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    await dbConnect();
    const { id } = await params;
    const deleted = await BloggerPost.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: "Blogger post not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Blogger post deleted successfully",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
