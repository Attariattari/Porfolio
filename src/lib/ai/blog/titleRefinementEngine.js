import dbConnect from "@/lib/mongoose";
import { Blog, BlogTopicPlan } from "@/models/Portfolio";
import { generateGeminiResponse } from "@/lib/geminiService";

/**
 * Modernizes and refines titles of today's generated blogs and/or queued topic plans
 * into natural, human-crafted, dynamic titles without formulaic stock openers.
 *
 * @param {Object} options
 * @param {boolean} [options.includeTodayBlogs=true]
 * @param {boolean} [options.includeQueuedTopics=true]
 * @param {boolean} [options.dryRun=true]
 * @returns {Promise<{ success: boolean, refined: Array, executed: boolean }>}
 */
export async function refineAndModernizeTitles({
  includeTodayBlogs = true,
  includeQueuedTopics = true,
  dryRun = true,
} = {}) {
  await dbConnect();

  const startOfToday = new Date();
  startOfToday.setUTCHours(0, 0, 0, 0);

  const candidates = [];

  // 1. Fetch today's blogs
  if (includeTodayBlogs) {
    const todayBlogs = await Blog.find({ createdAt: { $gte: startOfToday } })
      .select("_id title focusKeyword summary category slug content")
      .lean();

    for (const b of todayBlogs) {
      candidates.push({
        id: b._id.toString(),
        type: "today_blog",
        oldTitle: b.title,
        focusKeyword: b.focusKeyword,
        summary: b.summary,
        slug: b.slug,
      });
    }
  }

  // 2. Fetch queued topic plans
  if (includeQueuedTopics) {
    const queuedPlans = await BlogTopicPlan.find({ status: { $in: ["planned", "ready"] } })
      .select("_id title focusKeyword problem solutionAngle")
      .lean();

    for (const t of queuedPlans) {
      candidates.push({
        id: t._id.toString(),
        type: "queued_topic",
        oldTitle: t.title,
        focusKeyword: t.focusKeyword,
        problem: t.problem,
        solutionAngle: t.solutionAngle,
      });
    }
  }

  if (candidates.length === 0) {
    return { success: true, message: "No items found to refine.", refined: [], executed: false };
  }

  const prompt = `You are a Principal Content Architect at a top engineering organization (like Stripe, Netflix, Figma, Vercel).
Refine and modernize these repetitive blog and topic titles into natural, human, punchy, and compelling tech titles.

STRICT TITLE RULES:
- NEVER start titles with repetitive clichés like "Engineering for...", "Engineering [X]...", "Architecting for...", "Architecting...", "AI in...", "AI's Role in...", "An Engineering Guide to...", or "The Complete Guide to...".
- Each title must be bespoke and dynamically centered on the specific technical problem, technology stack, architecture pattern, or trade-off.
- Keep titles professional, concise (under 75 characters), and developer-focused.

INPUT ITEMS:
${JSON.stringify(candidates, null, 2)}

Return strict JSON:
{
  "refined": [
    {
      "id": "item_id",
      "type": "today_blog | queued_topic",
      "oldTitle": "Old Title",
      "newTitle": "New Dynamic Modern Title",
      "reason": "Why this title is punchier and more natural"
    }
  ]
}`;

  let refinedList = [];
  try {
    const raw = await generateGeminiResponse(prompt, {
      temperature: 0.7,
      responseMimeType: "application/json",
      maxOutputTokens: 8192,
      timeoutMs: 60000,
    });
    const parsed = JSON.parse(raw.replace(/```json/gi, "").replace(/```/g, "").trim());
    refinedList = Array.isArray(parsed.refined) ? parsed.refined : [];
  } catch (err) {
    console.error("[TitleRefinementEngine] Gemini refinement failed:", err);
    throw new Error(`Failed to generate refined titles: ${err.message}`);
  }

  if (dryRun) {
    return {
      success: true,
      dryRun: true,
      count: refinedList.length,
      refined: refinedList,
    };
  }

  // Execute database updates
  const updatedBlogs = [];
  const updatedTopics = [];

  for (const item of refinedList) {
    if (!item.newTitle || item.newTitle === item.oldTitle) continue;

    if (item.type === "today_blog") {
      const blog = await Blog.findById(item.id);
      if (blog) {
        const oldTitle = blog.title;
        blog.title = item.newTitle;
        blog.seoTitle = `${item.newTitle} | Muhyo Tech`;

        // Update H1 in HTML content if present
        if (typeof blog.content === "string" && blog.content.includes(oldTitle)) {
          blog.content = blog.content.replaceAll(oldTitle, item.newTitle);
        }

        await blog.save();
        updatedBlogs.push({ id: item.id, oldTitle, newTitle: item.newTitle });

        // Update internal links in other blogs referencing oldTitle text
        await Blog.updateMany(
          { content: { $regex: oldTitle, $options: "i" } },
          [{
            $set: {
              content: {
                $replaceAll: {
                  input: "$content",
                  find: oldTitle,
                  replacement: item.newTitle,
                },
              },
            },
          }]
        ).catch(() => {});
      }
    } else if (item.type === "queued_topic") {
      const topic = await BlogTopicPlan.findById(item.id);
      if (topic) {
        topic.title = item.newTitle;
        await topic.save();
        updatedTopics.push({ id: item.id, oldTitle: item.oldTitle, newTitle: item.newTitle });
      }
    }
  }

  return {
    success: true,
    dryRun: false,
    updatedBlogsCount: updatedBlogs.length,
    updatedTopicsCount: updatedTopics.length,
    refined: refinedList,
  };
}
