import dbConnect from "@/lib/dbConnect";
import { BlogTopicPlan } from "@/models/BlogTopicPlan";
import { getBlogAutomationSettings } from "@/lib/blogAutomationSettings";
import { appendAiClusters, appendAuthorityTopics, rebuildClusterTopicCatalog } from "./topicQueue";

export async function maintainProfessionalTopicReserve() {
  await dbConnect();
  const settings = await getBlogAutomationSettings();
  const result = { settings, core: null, authority: null };
  const [allCorePillars, activeCorePillars] = await Promise.all([
    BlogTopicPlan.countDocuments({ source: "ai", articleType: "pillar" }),
    BlogTopicPlan.countDocuments({ source: "ai", articleType: "pillar", status: { $in: ["planned", "processing"] } }),
  ]);
  try {
    if (allCorePillars === 0) result.core = await rebuildClusterTopicCatalog({ targetClusters: 5 });
    else if (activeCorePillars === 0) result.core = await appendAiClusters({ targetClusters: 5 });
    else result.core = { success: true, skipped: true, activePillars: activeCorePillars, totalPillars: allCorePillars };
  } catch (error) {
    result.core = { success: false, message: error.message };
  }

  const [readyAuthority, readyTotal] = await Promise.all([
    BlogTopicPlan.countDocuments({ articleType: "standalone_authority", status: "ready", professionalScore: { $gte: 70 } }),
    BlogTopicPlan.countDocuments({ status: { $in: ["planned", "ready"] }, articleType: { $in: ["pillar", "supporting", "standalone_authority", "verified_trend"] } }),
  ]);
  const requiredWeeklyReserve = Math.max(21, settings.dailyQuantity * 7);
  const reserveDeficit = Math.max(0, requiredWeeklyReserve - readyTotal);
  if (readyAuthority < 10 || reserveDeficit > 0) {
    try {
      const target = Math.min(12, Math.max(5, reserveDeficit, 10 - readyAuthority));
      result.authority = await appendAuthorityTopics({ target });
      result.authority.requiredWeeklyReserve = requiredWeeklyReserve;
      result.authority.readyBeforeRefill = readyTotal;
    } catch (error) {
      result.authority = { success: false, message: error.message };
    }
  } else {
    result.authority = { success: true, skipped: true, ready: readyAuthority, readyTotal, requiredWeeklyReserve };
  }
  result.success = result.core?.success !== false && result.authority?.success !== false;
  result.generated = Number(result.core?.ai?.topics || result.core?.topics || 0) + Number(result.authority?.generated || 0);
  return result;
}
