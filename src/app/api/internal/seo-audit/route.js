/**
 * SEO Audit API
 * Provides comprehensive SEO metrics and recommendations
 */

import { NextResponse } from "next/server";
import { seoAudit } from "@/lib/seoAudit";
import { apiResponse } from "@/lib/apiResponse";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action") || "health";

    let data;

    switch (action) {
      case "health":
        data = seoAudit.getHealthReport();
        break;

      case "score":
        data = seoAudit.getScoreDetails();
        break;

      case "issues":
        data = seoAudit.checkCommonIssues();
        break;

      case "keywords":
        data = seoAudit.getKeywordReport();
        break;

      case "checks":
        data = seoAudit.performSeoChecks();
        break;

      default:
        return apiResponse.error("Invalid action", 400);
    }

    return apiResponse.success(data, "SEO audit data retrieved");
  } catch (error) {
    console.error("[SEO Audit API] Error:", error.message);
    return apiResponse.error("Failed to retrieve SEO audit data", 500);
  }
}
