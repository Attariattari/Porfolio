import dbConnect from "../src/lib/dbConnect.js";
import { checkBloggerConfigStatus, publishToGoogleBlogger } from "../src/lib/server/bloggerService.js";

async function runLiveBloggerTest() {
  console.log("==================================================");
  console.log("🚀 TESTING GOOGLE BLOGGER API IN PORFOLIO WORKSPACE");
  console.log("==================================================\n");

  // Step 1: Check Config
  console.log("📌 STEP 1: Checking Environment Credentials...");
  const config = checkBloggerConfigStatus();
  console.log("Config Result:", JSON.stringify(config, null, 2));

  if (!config.configured) {
    console.error("❌ Configuration incomplete in .env.local!");
    process.exit(1);
  }
  console.log("✅ Credentials Validated!");

  // Step 2: Publish Test Draft Post to Google Blogger
  console.log("\n📌 STEP 2: Sending Test Draft Post to Google Blogger API v3...");
  const pubResult = await publishToGoogleBlogger({
    title: "[TEST DRAFT] Next.js & Google Blogger Integration Test",
    content: `
      <h2>Google Blogger Automated Integration Test</h2>
      <p>This is a test supporting draft post sent from Muhyo Tech Portfolio System.</p>
      <p>Paragraphs are kept short (2-3 sentences max) to match our high editorial quality standards.</p>
      <p>Check out our founders' master guide on <a href="https://muhyotech.com/blog">Muhyo Tech Official Blog</a>.</p>
    `,
    tags: ["Test", "Engineering", "BloggerAPI"],
    canonicalUrl: "https://muhyotech.com/blog/test-post",
    isDraft: true, // Send as DRAFT to Blogger Dashboard!
  });

  if (!pubResult.success) {
    console.error("❌ Google Blogger API Call Failed:", pubResult.error);
    process.exit(1);
  }

  console.log("\n==================================================");
  console.log("🎉 SUCCESS! DRAFT POST SENT TO YOUR GOOGLE BLOGGER!");
  console.log(`   - Blogger Post ID: ${pubResult.bloggerPostId}`);
  console.log(`   - Blogger Edit/Preview Link: ${pubResult.bloggerUrl}`);
  console.log("==================================================");

  process.exit(0);
}

runLiveBloggerTest().catch((err) => {
  console.error("❌ Test crashed:", err);
  process.exit(1);
});
