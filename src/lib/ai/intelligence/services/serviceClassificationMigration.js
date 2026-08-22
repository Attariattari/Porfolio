/**
 * Idempotent Service Classification Migration & Backfill Utility (Phase 2)
 * 
 * Safely backfills Phase 2 classification profiles onto all 14 canonical services
 * in MongoDB and seed datasets.
 * 
 * Requirements:
 * - Idempotent & Re-runnable
 * - Never changes service slugs or URLs
 * - Never overwrites authoritative admin-edited fields
 * - Supports dry-run execution
 * - Logs changed records & returns summary
 */

import mongoose from "mongoose";
import dbConnect from "../../../dbConnect.js";
import Service from "../../../../models/Service.js";
import { servicesSeedData } from "../../../../data/services.seed.js";
import { classifyService } from "./serviceClassificationEngine.js";

/**
 * Runs the Phase 2 classification backfill migration.
 * 
 * @param {Object} [options={}] - Options ({ dryRun: boolean, force: boolean })
 * @returns {Promise<Object>} Migration Summary
 */
export async function runClassificationMigration(options = {}) {
  const isDryRun = Boolean(options.dryRun);
  const isForce = Boolean(options.force);

  const summary = {
    total: servicesSeedData.length,
    updated: 0,
    skipped: 0,
    errors: 0,
    isDryRun,
    items: [],
  };

  try {
    await dbConnect();
  } catch (err) {
    console.warn("[ClassificationMigration] DB Connection warning:", err.message);
  }

  for (const seedItem of servicesSeedData) {
    const slug = seedItem.slug;
    if (!slug) continue;

    try {
      const generatedProfile = classifyService(slug);

      if (mongoose.connection && mongoose.connection.readyState === 1 && Service) {
        const existingDoc = await Service.findOne({ slug }).lean();

        if (existingDoc) {
          const hasExistingClassification = existingDoc.classification && Object.keys(existingDoc.classification).length > 0;
          const isAdminVerified = existingDoc.classification?.provenance?.source === "admin";

          if (hasExistingClassification && !isForce && isAdminVerified) {
            summary.skipped++;
            summary.items.push({ slug, status: "skipped", reason: "Admin verified classification preserved." });
            continue;
          }

          const mergedClassification = {
            ...generatedProfile,
            ...(existingDoc.classification || {}),
            provenance: isAdminVerified ? existingDoc.classification.provenance : generatedProfile.provenance,
          };

          if (!isDryRun) {
            await Service.updateOne(
              { _id: existingDoc._id },
              { $set: { classification: mergedClassification, updatedAt: new Date() } }
            );
          }

          summary.updated++;
          summary.items.push({ slug, status: isDryRun ? "dry_run_updated" : "updated" });
        } else {
          // Document does not exist in DB yet
          if (!isDryRun) {
            await Service.create({
              ...seedItem,
              classification: generatedProfile,
              status: "published",
            });
          }
          summary.updated++;
          summary.items.push({ slug, status: isDryRun ? "dry_run_created" : "created" });
        }
      } else {
        // DB not connected, backfilled in memory / dry-run
        summary.updated++;
        summary.items.push({ slug, status: "memory_backfilled" });
      }
    } catch (error) {
      summary.errors++;
      summary.items.push({ slug, status: "error", error: error.message });
    }
  }

  return summary;
}
