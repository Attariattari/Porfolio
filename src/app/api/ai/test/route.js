import { NextResponse } from "next/server";
import { generateGeminiResponse } from "@/lib/geminiService";

export async function GET() {
    try {
        const testPrompt = `
You are an expert SEO content writer and digital marketing specialist. Your task is to write a highly optimized, engaging, and professional blog post.

STRICT REQUIREMENTS:
- Total length: Exactly 1500 characters (not words)
- Language: Clear, professional English
- Tone: Authoritative yet conversational

SEO STRUCTURE (follow exactly):
1. Title: Include primary keyword, max 60 characters
2. Meta Description: 150-160 characters, includes keyword + CTA
3. Introduction (150 chars): Hook the reader, state the problem
4. H2 Section 1 (300 chars): Main concept explanation with keyword
5. H2 Section 2 (300 chars): Key benefits or steps (use numbered points)
6. H2 Section 3 (300 chars): Expert tips or best practices
7. Conclusion (200 chars): Summary + strong CTA

SEO RULES:
- Primary keyword density: 1.5-2%
- Include 2-3 LSI (related) keywords naturally
- Use active voice throughout
- Every H2 must contain a keyword variation
- No keyword stuffing
- Include one internal link placeholder: [INTERNAL_LINK]
- Include one external authority link placeholder: [EXTERNAL_LINK]

OUTPUT FORMAT (JSON):
{
  "title": "",
  "meta_description": "",
  "slug": "",
  "primary_keyword": "",
  "lsi_keywords": [],
  "blog_content": "",
  "word_count": 0,
  "char_count": 0
}

Topic: [USER_TOPIC_HERE]
Primary Keyword: [KEYWORD_HERE]
`;
        const response = await generateGeminiResponse(testPrompt);

        return NextResponse.json({
            success: true,
            data: response,
        });
    } catch (error) {
        return NextResponse.json({
            success: false,
            message: error.message,
        }, { status: 500 }, );
    }
}