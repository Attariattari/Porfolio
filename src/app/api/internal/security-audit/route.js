/**
 * Security Audit API
 * Provides security compliance and recommendations
 */

import { NextResponse } from "next/server";
import securityAudit from "@/lib/securityAudit";
import { apiResponse } from "@/lib/apiResponse";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action") || "audit";

    let data;

    switch (action) {
      case "audit":
        data = securityAudit.getAuditReport();
        break;

      case "compliance":
        data = securityAudit.getComplianceStatus();
        break;

      case "header":
        const headerName = searchParams.get("name");
        if (!headerName) {
          return apiResponse.error("header name required", 400);
        }
        data = securityAudit.verifyHeader(headerName);
        break;

      default:
        return apiResponse.error("Invalid action", 400);
    }

    return apiResponse.success(data, "Security audit data retrieved");
  } catch (error) {
    console.error("[Security Audit API] Error:", error.message);
    return apiResponse.error("Failed to retrieve security audit data", 500);
  }
}
