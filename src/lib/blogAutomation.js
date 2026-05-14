import { generateGeminiResponse } from "./geminiService.js";
import { uploadToCloudinary } from "./cloudinary.js";
import { Blog } from "../models/Portfolio.js";
import dbConnect from "./dbConnect.js";
import OpenAI from "openai";
import { cacheManager } from "./cache.js";

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * SENIOR AI CONTENT ARCHITECT - Editorial Pipeline v2.0
 * Upgraded with Human-First Validation, Readability Scoring, and Smart Retries.
 */

const EDITORIAL_GUIDELINES = `
Act as a Senior Tech Editorial Director for Muhyo Tech. 
Your goal is to produce blogs that are indistinguishable from the high-end engineering posts already in our data.js.

STRICT WRITING RULES:
1. NO AI TROPES: Never use "Furthermore", "In conclusion", "Moreover", "Additionally", "In today's digital landscape", "In the rapidly evolving world".
2. HUMAN RHYTHM: Mix short, punchy sentences with longer, descriptive ones. Use active voice.
3. NARRATIVE HOOK: Start with a real-world problem, a bold technical take, or a provocative question. No generic intros.
4. "SHOW, DON'T TELL": Instead of saying "It's efficient", explain the performance delta in a production context (e.g., "reduced LCP by 40%").
5. MUHYO TECH TONE: Professional but conversational. Use "we", "our", and "at Muhyo Tech". Like a senior engineer mentoring a peer.
6. NO TEXTBOOK STYLE: This is an editorial, not a manual. Avoid dry lists. Use section headings to guide the reader.
7. READABILITY: Paragraphs must be 2-3 sentences max. Use whitespace as a design tool.
8. FORMATTING: Use HTML tags (<p>, <h2>, <strong>, <blockquote>) instead of Markdown. 
9. DEPTH: Focus on high-level strategy, psychology of design, or architectural integrity rather than just "how to code x".
`;

/**
 * Step 1: Generate High-End Content
 */
async function generateEditorialContent(topic, retryFeedback = "", retryCount = 0) {
    const prompt = `
    TASK: Generate a professional Muhyo Tech style engineering blog post that matches the existing blogs in data.js.
    TOPIC: ${topic || "Modern Frontend Architecture and Edge Computing"}
    ${retryFeedback ? `PREVIOUS ATTEMPT FEEDBACK: ${retryFeedback}. Please fix these issues in this version.` : ""}

    OUTPUT FORMAT (STRICT JSON):
    {
      "title": "Engaging professional title",
      "slug": "url-friendly-slug",
      "summary": "High-impact summary (one sentence, 150-160 chars)",
      "category": "One of: Engineering, Design, Backend, SEO, Technology, Architecture, Culture, Security, Infrastructure",
      "tags": ["tag1", "tag2", "tag3"],
      "content": "Full HTML content. Use <p>, <h2>, <strong>, and <blockquote>. No Markdown. Short paragraphs (2-3 sentences).",
      "author": "One of: Pir Ghulam Muhyo Din, Sarah Jenkins, Alex Cameron",
      "authorRole": "Matching role: Founder, Lead Designer, or Senior Developer",
      "readTime": "e.g. 6 min read",
      "image_prompt": "Minimalist DALL-E 3 prompt for a high-end tech visual"
    }

    Constraints: No markdown wrappers. No AI conversational notes. Return ONLY the JSON object. Content must feel like a natural part of the existing portfolio.
    `;

    const response = await generateGeminiResponse(prompt, {
        systemInstruction: EDITORIAL_GUIDELINES,
        temperature: 0.85, // Higher for more creative human-like flow
        responseMimeType: "application/json"
    });

    try {
        const cleaned = response.replace(/```json/gi, "").replace(/```/g, "").trim();
        return JSON.parse(cleaned);
    } catch (e) {
        console.error("[Creator] JSON Parse Failed. Retrying...");
        if (retryCount < 2) return generateEditorialContent(topic, "Invalid JSON format", retryCount + 1);
        throw e;
    }
}

/**
 * Step 2: Internal AI Quality Review (The Critic)
 */
async function runQualityReview(blogData) {
    const reviewPrompt = `
    Act as a strict Editor-in-Chief at Muhyo Tech. Review this blog content for consistency with our existing editorial standards.
    
    CRITERIA:
    1. Human-ness: Does it sound like a real person or a bot? (Look for robotic transitions or AI tropes).
    2. Readability: Are the paragraphs 2-3 sentences max? Is the flow smooth?
    3. Technical Depth: Does it provide real insight or just generic fluff?
    4. Format: Does it use HTML tags (<p>, <h2>, etc.)? Reject if it uses Markdown (# headings) or lists (- bullet).
    5. Branding: Does it use "we", "our", and "at Muhyo Tech" naturally?
    6. Tone: Is it professional yet conversational (Senior Engineer tone)?

    CONTENT:
    Title: ${blogData.title}
    Summary: ${blogData.summary}
    Content Snippet: ${blogData.content.substring(0, 1500)}

    OUTPUT FORMAT (JSON):
    {
      "passed": true/false,
      "score": 0-10,
      "feedback": "Detailed feedback on what to improve",
      "metrics": {
         "readability": 0-10,
         "seo": 0-10,
         "humanTone": 0-10,
         "styleMatch": 0-10
      }
    }
    `;

    const reviewResponse = await generateGeminiResponse(reviewPrompt, {
        temperature: 0.1,
        responseMimeType: "application/json"
    });

    try {
        return JSON.parse(reviewResponse.replace(/```json/gi, "").replace(/```/g, "").trim());
    } catch (e) {
        return { passed: true, score: 7, feedback: "Review failed to parse, assuming safe." };
    }
}

/**
 * Main Pipeline Function
 */
export async function runBlogAutomationPipeline(retryCount = 0, onProgress = null) {
    const report = (status, details = {}) => {
        if (onProgress) onProgress({ status, details, retryCount });
        console.log(`[Editorial-Pipeline] ${status}:`, details.message || "");
    };

    if (retryCount >= 3) {
        report("FAILED", { message: "Maximum quality retries reached. Content rejected." });
        return { success: false, message: "Quality threshold not met after 3 attempts." };
    }

    try {
        await dbConnect();
        report("GENERATING", { message: "Creator is drafting editorial content..." });
        
        // 1. GENERATE
        const blogData = await generateEditorialContent(null, "", retryCount);
        
        // 2. REVIEW
        report("REVIEWING", { message: "Critic is analyzing human quality score..." });
        const review = await runQualityReview(blogData);
        
        console.log(`[Review] Score: ${review.score}/10 | HumanTone: ${review.metrics?.humanTone}/10`);

        // 3. VALIDATE
        if (!review.passed || review.score < 8) {
            report("REJECTED", { message: `Quality too low (${review.score}/10). Feedback: ${review.feedback}` });
            return runBlogAutomationPipeline(retryCount + 1, onProgress);
        }

        // 4. CHECK UNIQUENESS
        const existing = await Blog.findOne({ slug: blogData.slug });
        if (existing) {
            return runBlogAutomationPipeline(retryCount + 1, onProgress);
        }

        // 5. SAVE WITH QUALITY METRICS
        const newBlog = new Blog({
            ...blogData,
            publishStatus: "pending", 
            aiGenerated: true,
            qualityStatus: "passed",
            qualityScore: review.score,
            qualityMetrics: review.metrics,
            generatedAt: new Date(),
            date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }), // Matches "Mar 14, 2026"
            createdAt: new Date(),
        });

        await newBlog.save();
        await cacheManager.invalidateByTag("blogs");
        
        report("COMPLETED", { message: "High-quality human-friendly blog saved to database.", id: newBlog._id });
        return { success: true, blogId: newBlog._id, step: 1 };

    } catch (error) {
        report("ERROR", { message: error.message });
        return { success: false, error: error.message };
    }
}

/**
 * Image Generation Pipeline (Step 2)
 */
export async function finalizeBlogPipeline(blogId, options = {}, onProgress = null) {
    const report = (status, details = {}) => {
        if (onProgress) onProgress({ status, details });
        console.log(`[Pipeline-Step2] ${status}:`, details.message || "");
    };

    try {
        await dbConnect();
        const blog = await Blog.findById(blogId);
        if (!blog) throw new Error("Blog not found");

        report("STARTING_IMAGE", { message: "Generating high-end technical visual..." });
        
        blog.imageStatus = "generating";
        await blog.save();

        const imagePrompt = `
        Premium cinematic technical 8k render for: ${blog.title}. 
        Style: Minimalist software engineering aesthetic, dark mode, neon accents, clean composition.
        `.trim();
        
        try {
            const cloudinaryUrl = await generateImage(imagePrompt);
            
            const updatedBlog = await Blog.findByIdAndUpdate(blogId, {
                image: cloudinaryUrl,
                imageGenerated: true,
                imageStatus: "completed",
                publishStatus: "published", // Automatically publish once quality + image are both ready
                updatedAt: new Date()
            }, { new: true });

            await cacheManager.invalidateByTag("blogs");
            report("COMPLETED", { message: "Visual ready. Blog is now LIVE!", url: cloudinaryUrl });
            
            return { success: true, url: cloudinaryUrl, blog: updatedBlog };

        } catch (error) {
            await Blog.findByIdAndUpdate(blogId, { imageStatus: "failed" });
            report("ERROR", { message: `Image failed: ${error.message}` });
            throw error;
        }
    } catch (error) {
        return { success: false, error: error.message };
    }
}

/**
 * Image Generator Wrapper
 */
async function generateImage(prompt) {
    try {
        let imageUrl;
        if (process.env.OPENAI_API_KEY) {
            const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
            const response = await openai.images.generate({
                model: "dall-e-3",
                prompt: prompt,
                n: 1,
                size: "1024x1024",
            });
            imageUrl = response.data[0].url;
        } else {
            const seed = Math.floor(Math.random() * 1000000);
            imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1024&height=1024&nologo=true&seed=${seed}`;
        }
        return await uploadImageFromUrl(imageUrl);
    } catch (e) {
        return "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?q=80&w=2070&auto=format&fit=crop";
    }
}

async function uploadImageFromUrl(url) {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
    const formData = new FormData();
    formData.append('file', url);
    formData.append('upload_preset', uploadPreset);
    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, { method: 'POST', body: formData });
    const data = await response.json();
    return data.secure_url;
}

export async function runFullBlogPipeline(onProgress) {
    const step1 = await runBlogAutomationPipeline(0, onProgress);
    if (step1.success) {
        return await finalizeBlogPipeline(step1.blogId, {}, onProgress);
    }
    return step1;
}
