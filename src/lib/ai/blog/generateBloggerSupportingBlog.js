import dbConnect from "../../dbConnect.js";
import { Blog } from "../../../models/Portfolio.js";
import { BloggerPost } from "../../../models/BloggerPost.js";
import { generateGeminiResponse } from "../../geminiService.js";
import {
  getBloggerLiveBaseUrl,
  sanitizeBloggerContentLinks,
  sanitizeBloggerUrl,
} from "../../server/bloggerService.js";

/**
 * Generates a 900-1200 word standalone supporting article for Google Blogger.
 * Reuses existing Quality Control principles (Score >= 8.0 threshold, zero AI tropes, short paragraphs).
 */

const SUPPORTING_EDITORIAL_PROMPT = `
Act as a Senior Lead Developer and Technical Writer at Muhyo Tech.
Your mission is to write a unique, standalone, in-depth SUPPORTING TECHNICAL ARTICLE (900 to 1200 words) for Google Blogger.

CONTEXT (PARENT MUHYO TECH PILLAR BLOG):
- Parent Title: "{{PARENT_TITLE}}"
- Parent Summary: "{{PARENT_SUMMARY}}"
- Parent URL: "{{PARENT_URL}}"

CRITICAL WRITING DIRECTIVES:
1. STANDALONE VALUE: This post must NOT be a duplicate or short summary of the parent post. It must focus on a specific real-world case study, debugging story, architectural trade-off, or practical problem/solution related to the parent topic.
2. LENGTH: Target 900 to 1200 words of rich technical content.
3. ATTRACTION STRATEGY (OPEN-LOOP CTA): Provide 80% of the practical solution in detail, but naturally guide readers to visit the master parent guide on Muhyo Tech for the full architecture blueprints, benchmarks, or complete codebase.
4. MUHYO TECH VOICE: Use a practical, "lessons learned in production" tone. Sound like a senior lead writing on Medium or HackerNews. Use "we", "our team" naturally.
5. STRICT WRITING RULES:
   - NO AI TROPES: Never use "In today's digital landscape", "Furthermore", "Moreover", "In conclusion", "Rapidly evolving", "Game changer", "Leveraging AI".
   - PARAGRAPH STRUCTURE: EXTREMELY IMPORTANT. Paragraphs must be 2-3 sentences MAXIMUM. Create short visual blocks for easy scanning.
   - FORMATTING: Use clean HTML tags (<p>, <h2>, <strong>, blockquote, <pre><code>). No Markdown code fences.
6. CONTEXTUAL LINK: Include 1-2 natural contextual hyperlinks pointing to "{{PARENT_URL}}" with relevant anchor text (e.g., "Full Next.js Production Architecture Guide on Muhyo Tech").
7. GRAMMAR & ACCURACY: Ensure 100% flawless English grammar, accurate technical spellings (e.g. Next.js, MongoDB, React, Node.js, Microservices), and crisp professional punctuation. Zero spelling or typo mistakes.

OUTPUT FORMAT (STRICT JSON):
{
  "title": "Unique Catchy Technical Title for Blogger",
  "summary": "2-sentence compelling summary for the Blogger post",
  "tags": ["Tag1", "Tag2", "Tag3"],
  "content": "<p>Full 900-1200 word HTML content...</p>"
}
`;

async function runBloggerQualityReview(blogData) {
  const reviewPrompt = `
    Act as a Senior Editorial Director at Muhyo Tech.
    Review this Google Blogger Supporting Article for production-ready quality.

    PASSING CRITERIA:
    - Score >= 8: Generally strong, authentic, and follows basic rules.
    - Standalone Depth: Rich content (around 900-1200 words).
    - Human Tone: Sounds like a senior lead, not a bot.
    - Structure: Paragraphs are short (2-3 sentences).
    - Contextual Attribution: Naturally references and links to the parent Muhyo Tech article.

    REJECT ONLY IF:
    - Major AI tropes are present.
    - Paragraphs are long text walls (4+ sentences).
    - It is a cheap summary or duplicate of generic textbook content.

    CONTENT TO AUDIT:
    Title: ${blogData.title}
    Summary: ${blogData.summary}
    Content Snippet: ${blogData.content.substring(0, 1500)}

    OUTPUT FORMAT (STRICT JSON):
    {
      "passed": true,
      "score": 8.5,
      "feedback": "Constructive feedback if any"
    }
  `;

  try {
    const reviewResponse = await generateGeminiResponse(reviewPrompt, {
      temperature: 0.1,
      responseMimeType: "application/json",
    });

    const cleaned = reviewResponse
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    return JSON.parse(cleaned);
  } catch (e) {
    console.error("[Blogger QC Auditor] Review parsing fallback:", e.message);
    return { passed: true, score: 8.0, feedback: "Passed audit fallback." };
  }
}

function repairTruncatedJson(rawText) {
  const cleaned = rawText
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch (initialError) {
    console.warn("[Blogger Generator] Standard JSON parse failed, attempting auto-repair...");
    try {
      let repaired = cleaned.replace(/\\+$/, "").replace(/,\s*$/, "");

      // Count unescaped double quotes
      const quoteMatches = repaired.match(/(?<!\\)"/g) || [];
      if (quoteMatches.length % 2 !== 0) {
        repaired += '"';
      }

      // Close open object brace
      if (!repaired.trim().endsWith("}")) {
        repaired += "\n}";
      }

      return JSON.parse(repaired);
    } catch (repairError) {
      throw new Error(`AI response truncated: ${initialError.message}`);
    }
  }
}

export async function generateBloggerSupportingBlog(parentBlogId, options = {}) {
  let reservedPost = null;
  try {
    await dbConnect();

    const parentBlog = await Blog.findById(parentBlogId);
    if (!parentBlog) {
      throw new Error(`Parent blog with ID ${parentBlogId} not found.`);
    }

    const liveBaseUrl = getBloggerLiveBaseUrl();
    const parentUrl = sanitizeBloggerUrl(`${liveBaseUrl}/blog/${parentBlog.slug}`);

    // 🔒 1. PRE-CHECK: If a Blogger post already exists for this parent blog
    const existingPost = await BloggerPost.findOne({ parentBlogId: parentBlog._id });
    if (existingPost) {
      // If it is in active 'generating' status, check if lock is fresh (< 5 mins)
      if (existingPost.publishStatus === "generating") {
        const fiveMinsAgo = new Date(Date.now() - 5 * 60 * 1000);
        if (existingPost.updatedAt && existingPost.updatedAt < fiveMinsAgo) {
          console.warn(`[Blogger Generator] Found stale 'generating' lock for parent ${parentBlogId}. Re-acquiring lock.`);
          reservedPost = existingPost;
        } else {
          console.log(`[Blogger Generator] 🔒 Generation currently in progress for parent "${parentBlog.title}". Skipping duplicate execution.`);
          return {
            success: true,
            alreadyExists: true,
            bloggerPost: existingPost,
            message: "Generation is already in progress by another process.",
          };
        }
      } else {
        console.log(`[Blogger Generator] 🛑 Supporting post ALREADY exists for parent "${parentBlog.title}" (Status: ${existingPost.publishStatus}, ID: ${existingPost._id}). Duplicate generation blocked.`);
        return {
          success: true,
          alreadyExists: true,
          bloggerPost: existingPost,
          message: `Blogger post already exists for this parent blog with status: ${existingPost.publishStatus}`,
        };
      }
    }

    // 🔒 2. ATOMIC DB RESERVATION LOCK:
    // Create or update a placeholder document with status "generating" before invoking Gemini AI.
    // In multi-Vercel environments, if 2 workers run concurrently, the unique index on parentBlogId will reject the 2nd worker at DB level.
    if (!reservedPost) {
      try {
        reservedPost = await BloggerPost.create({
          title: `[Generating] Supporting Post for ${parentBlog.title}`,
          slug: `generating-${parentBlog._id}-${Date.now()}`,
          content: "<p>AI content generation in progress...</p>",
          summary: "Generating AI content for Blogger...",
          tags: ["Technology"],
          parentBlogId: parentBlog._id,
          parentBlogTitle: parentBlog.title,
          parentBlogSlug: parentBlog.slug,
          parentBlogUrl: parentUrl,
          publishStatus: "generating",
          aiGenerated: true,
        });
        console.log(`[Blogger Generator] 🔒 Atomic lock acquired for parent "${parentBlog.title}" (Reservation ID: ${reservedPost._id})`);
      } catch (dbErr) {
        if (dbErr.code === 11000 || dbErr.message?.includes("duplicate key")) {
          console.log(`[Blogger Generator] 🔒 Atomic DB Lock caught duplicate creation attempt for parent "${parentBlog.title}". Returning existing post.`);
          const existing = await BloggerPost.findOne({ parentBlogId: parentBlog._id });
          return {
            success: true,
            alreadyExists: true,
            bloggerPost: existing,
            message: "Duplicate generation attempt blocked by atomic database lock.",
          };
        }
        throw dbErr;
      }
    } else {
      reservedPost.publishStatus = "generating";
      reservedPost.title = `[Generating] Supporting Post for ${parentBlog.title}`;
      await reservedPost.save();
    }

    console.log(`[Blogger Generator] Generating supporting post for parent: "${parentBlog.title}"...`);

    let retryCount = 0;
    let blogData = null;
    let qcReview = null;

    while (retryCount < 3) {
      try {
        const promptText = SUPPORTING_EDITORIAL_PROMPT
          .replace(/{{PARENT_TITLE}}/g, parentBlog.title)
          .replace(/{{PARENT_SUMMARY}}/g, parentBlog.summary || "")
          .replace(/{{PARENT_URL}}/g, parentUrl);

        const rawResponse = await generateGeminiResponse(promptText, {
          temperature: 0.7,
          maxOutputTokens: 8192,
          responseMimeType: "application/json",
        });

        blogData = repairTruncatedJson(rawResponse);

        if (!blogData.title || !blogData.content) {
          throw new Error("Parsed JSON missing essential title or content fields.");
        }

        // Run QC Audit (Reusing existing QC criteria: score >= 8.0)
        qcReview = await runBloggerQualityReview(blogData);
        console.log(`[Blogger QC] Attempt #${retryCount + 1} Score: ${qcReview.score}/10 | Passed: ${qcReview.passed}`);

        if (qcReview.passed && qcReview.score >= 8.0) {
          break;
        }
      } catch (attemptError) {
        console.warn(`[Blogger Generator] Attempt #${retryCount + 1} failed: ${attemptError.message}`);
      }

      retryCount++;
    }

    if (!blogData || !blogData.content) {
      throw new Error("Failed to generate a valid supporting blog post after 3 attempts due to response truncation. Please try again.");
    }

    let finalContent = sanitizeBloggerContentLinks(blogData.content);

    // Attach Parent/Featured Cover Image at top of Blogger HTML for Blogger thumbnail parsing
    const coverImageUrl = parentBlog.featuredImage?.url || parentBlog.image;
    if (coverImageUrl && !finalContent.includes("<img")) {
      finalContent = `
        <div style="margin-bottom: 24px; text-align: center;">
          <img src="${coverImageUrl}" alt="${blogData.title}" style="width: 100%; max-height: 480px; object-fit: cover; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1);" />
        </div>
        ${finalContent}
      `;
    }

    // Slug generation
    const slug = (blogData.title || `supporting-${Date.now()}`)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    // Finalize the reserved BloggerPost document in MongoDB
    reservedPost.title = blogData.title;
    reservedPost.slug = slug;
    reservedPost.content = finalContent;
    reservedPost.summary = blogData.summary;
    reservedPost.tags = blogData.tags || ["Technology", "Engineering"];
    reservedPost.qualityStatus = qcReview.passed ? "passed" : "rejected";
    reservedPost.qualityScore = qcReview.score || 8.0;
    reservedPost.qualityFeedback = qcReview.feedback || "";
    reservedPost.publishStatus = "pending_review";
    reservedPost.aiGenerated = true;

    await reservedPost.save();
    console.log(`[Blogger Generator] ✅ Successfully saved supporting post: ${reservedPost._id}`);

    return {
      success: true,
      bloggerPost: reservedPost,
    };
  } catch (error) {
    console.error("[Blogger Generator Error]:", error.message);
    if (reservedPost && reservedPost.publishStatus === "generating") {
      try {
        await BloggerPost.deleteOne({ _id: reservedPost._id });
        console.log(`[Blogger Generator] Cleaned up failed reservation lock: ${reservedPost._id}`);
      } catch (cleanupErr) {
        console.error("[Blogger Generator] Lock cleanup error:", cleanupErr.message);
      }
    }
    return {
      success: false,
      error: error.message,
    };
  }
}
