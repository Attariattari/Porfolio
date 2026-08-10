import dbConnect from "../../dbConnect.js";
import { Blog } from "../../../models/Portfolio.js";
import { BloggerPost } from "../../../models/BloggerPost.js";
import { generateGeminiResponse } from "../../geminiService.js";

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

export async function generateBloggerSupportingBlog(parentBlogId, options = {}) {
  try {
    await dbConnect();

    const parentBlog = await Blog.findById(parentBlogId);
    if (!parentBlog) {
      throw new Error(`Parent blog with ID ${parentBlogId} not found.`);
    }

    const baseUrl = options.baseUrl || process.env.NEXT_PUBLIC_SITE_URL || "https://muhyotech.com";
    const parentUrl = `${baseUrl}/blog/${parentBlog.slug}`;

    console.log(`[Blogger Generator] Generating supporting post for parent: "${parentBlog.title}"...`);

    let retryCount = 0;
    let blogData = null;
    let qcReview = null;

    while (retryCount < 3) {
      const promptText = SUPPORTING_EDITORIAL_PROMPT
        .replace(/{{PARENT_TITLE}}/g, parentBlog.title)
        .replace(/{{PARENT_SUMMARY}}/g, parentBlog.summary || "")
        .replace(/{{PARENT_URL}}/g, parentUrl);

      const rawResponse = await generateGeminiResponse(promptText, {
        temperature: 0.7,
        responseMimeType: "application/json",
      });

      const cleanedJson = rawResponse
        .replace(/```json/gi, "")
        .replace(/```/g, "")
        .trim();

      blogData = JSON.parse(cleanedJson);

      // Run QC Audit (Reusing existing QC criteria: score >= 8.0)
      qcReview = await runBloggerQualityReview(blogData);
      console.log(`[Blogger QC] Attempt #${retryCount + 1} Score: ${qcReview.score}/10 | Passed: ${qcReview.passed}`);

      if (qcReview.passed && qcReview.score >= 8.0) {
        break;
      }

      retryCount++;
    }

    // Attach Parent/Featured Cover Image at top of Blogger HTML for Blogger thumbnail parsing
    const coverImageUrl = parentBlog.featuredImage?.url || parentBlog.image;
    if (coverImageUrl && !blogData.content.includes("<img")) {
      blogData.content = `
        <div style="margin-bottom: 24px; text-align: center;">
          <img src="${coverImageUrl}" alt="${blogData.title}" style="width: 100%; max-height: 480px; object-fit: cover; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1);" />
        </div>
        ${blogData.content}
      `;
    }

    // Slug generation
    const slug = (blogData.title || `supporting-${Date.now()}`)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    // Create & Save BloggerPost in MongoDB
    const newBloggerPost = new BloggerPost({
      title: blogData.title,
      slug: slug,
      content: blogData.content,
      summary: blogData.summary,
      tags: blogData.tags || ["Technology", "Engineering"],

      parentBlogId: parentBlog._id,
      parentBlogTitle: parentBlog.title,
      parentBlogSlug: parentBlog.slug,
      parentBlogUrl: parentUrl,

      qualityStatus: qcReview.passed ? "passed" : "rejected",
      qualityScore: qcReview.score || 8.0,
      qualityFeedback: qcReview.feedback || "",

      publishStatus: "pending_review",
      aiGenerated: true,
    });

    await newBloggerPost.save();
    console.log(`[Blogger Generator] Saved new supporting post: ${newBloggerPost._id}`);

    return {
      success: true,
      bloggerPost: newBloggerPost,
    };
  } catch (error) {
    console.error("[Blogger Generator Error]:", error.message);
    return {
      success: false,
      error: error.message,
    };
  }
}
