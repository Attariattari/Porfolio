import { runBlogAutomationPipeline } from "../src/lib/blogAutomation.js";

async function test() {
    console.log("------------------------------------------");
    console.log("🛠️  MANUAL PIPELINE TEST STARTING...");
    console.log("------------------------------------------");
    try {
        const result = await runBlogAutomationPipeline();
        
        if (result.success) {
            console.log("✅ SUCCESS!");
            console.log("📝 Status:", result.status);
            console.log("🆔 Blog ID:", result.blogId);
        } else {
            console.log("❌ PIPELINE STOPPED:", result.message || result.error);
        }
        
        console.log("------------------------------------------");
    } catch (error) {
        console.error("❌ UNEXPECTED ERROR:", error);
    }
    process.exit(0);
}

test();
