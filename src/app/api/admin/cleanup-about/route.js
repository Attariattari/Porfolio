// CLEANUP API: Remove socials field from About collection
// GET /api/admin/cleanup-about

import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { About } from "@/models/Portfolio";

export async function GET() {
  try {
    await dbConnect();

    // Remove socials field from all About documents
    const result = await About.updateMany(
      { socials: { $exists: true } },
      { $unset: { socials: 1 } }
    );

    console.log(`✅ Cleanup: Removed socials from ${result.modifiedCount} document(s)`);

    // Verify cleanup
    const verifyCount = await About.countDocuments({ socials: { $exists: true } });

    return NextResponse.json({
      success: true,
      message: "Socials field removed from About documents",
      modified: result.modifiedCount,
      matchedCount: result.matchedCount,
      remaining: verifyCount,
    });
  } catch (error) {
    console.error("Cleanup error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
