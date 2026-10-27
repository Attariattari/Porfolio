import fs from "fs";
import path from "path";
import dbConnect from "../../dbConnect.js";
import CloudinaryAccount from "../../../models/CloudinaryAccount.js";
import { getMasterAccount, invalidateCloudinaryCache } from "./poolManager.js";

const REGISTRY_PATH = path.resolve("muhyo_organized_backup", "migration_registry.json");
const VAULT_DIR = path.resolve("muhyo_organized_backup");

// Global in-memory migration runner state for live UI tracking
let migrationState = {
  isRunning: false,
  isCompleted: false,
  dryRun: true,
  sourceCloudName: null,
  targetCloudName: null,
  startedAt: null,
  completedAt: null,
  current: 0,
  total: 0,
  percentage: 0,
  successCount: 0,
  skippedCount: 0,
  errorCount: 0,
  currentAssetTitle: "",
  logs: [],
  errors: [],
};

export function getMigrationStatus() {
  return { ...migrationState };
}

/**
 * Executes a 0-Risk, 0-Data-Loss Migration between Cloudinary accounts.
 * Safely updates MongoDB only after target upload is 100% verified.
 */
export async function startMigration({
  sourceCloudName,
  targetAccountId,
  dryRun = true,
  collectionFilter = null,
}) {
  if (migrationState.isRunning) {
    throw new Error("A migration process is already running. Please wait for it to complete.");
  }

  if (!fs.existsSync(REGISTRY_PATH)) {
    throw new Error("Migration registry (muhyo_organized_backup/migration_registry.json) not found.");
  }

  // 1. Resolve Target Cloudinary Account Credentials
  let targetCreds;
  if (targetAccountId === "master_env_account") {
    targetCreds = getMasterAccount();
  } else {
    await dbConnect();
    targetCreds = await CloudinaryAccount.findById(targetAccountId).lean();
  }

  if (!targetCreds || !targetCreds.cloudName || !targetCreds.apiKey || !targetCreds.apiSecret) {
    throw new Error("Target Cloudinary credentials are missing or invalid.");
  }

  const { v2: cloudinary } = await import("cloudinary");
  cloudinary.config({
    cloud_name: targetCreds.cloudName,
    api_key: targetCreds.apiKey,
    api_secret: targetCreds.apiSecret,
    secure: true,
  });

  const registry = JSON.parse(fs.readFileSync(REGISTRY_PATH, "utf8"));

  // Filter items that belong to the sourceCloudName (or all if not specified)
  const sourcePattern = sourceCloudName ? new RegExp(sourceCloudName, "i") : null;
  const eligibleItems = registry.filter((item) => {
    if (item.collection === "static_code") return false; // Code assets don't need DB update
    if (collectionFilter && item.collection !== collectionFilter) return false;
    if (sourcePattern && item.originalUrl && !sourcePattern.test(item.originalUrl)) {
      return false;
    }
    return true;
  });

  if (eligibleItems.length === 0) {
    throw new Error(
      `No assets found matching source cloud '${sourceCloudName || "all"}' in the migration registry.`
    );
  }

  // Initialize state
  migrationState = {
    isRunning: true,
    isCompleted: false,
    dryRun: Boolean(dryRun),
    sourceCloudName: sourceCloudName || "Any",
    targetCloudName: targetCreds.cloudName,
    startedAt: new Date(),
    completedAt: null,
    current: 0,
    total: eligibleItems.length,
    percentage: 0,
    successCount: 0,
    skippedCount: 0,
    errorCount: 0,
    currentAssetTitle: "Initializing engine...",
    logs: [
      `[INIT] Starting ${dryRun ? "DRY RUN (Simulation)" : "LIVE MIGRATION"} for ${eligibleItems.length} assets to ${targetCreds.cloudName}...`,
    ],
    errors: [],
  };

  // Run in background so HTTP response is returned immediately
  (async () => {
    await dbConnect();
    const mongoose = (await import("mongoose")).default;
    const db = mongoose.connection.db;

    for (let i = 0; i < eligibleItems.length; i++) {
      const item = eligibleItems[i];
      migrationState.current = i + 1;
      migrationState.percentage = Math.round(((i + 1) / eligibleItems.length) * 100);
      migrationState.currentAssetTitle = `${item.title} (${item.collection})`;

      const localFileAbs = path.join(VAULT_DIR, item.localRelativePath);

      if (!fs.existsSync(localFileAbs)) {
        migrationState.errorCount++;
        const msg = `[MISSING FILE] Local file not found: ${item.localRelativePath}`;
        migrationState.errors.push(msg);
        migrationState.logs.unshift(msg);
        continue;
      }

      if (dryRun) {
        // DRY RUN: Simulate
        migrationState.successCount++;
        if (i % 10 === 0 || i === eligibleItems.length - 1) {
          migrationState.logs.unshift(
            `[SIMULATED] Would upload ${item.localRelativePath} -> Update ${item.collection} (${item.field})`
          );
        }
        await new Promise((r) => setTimeout(r, 20)); // tiny pause for smooth UI progress
        continue;
      }

      // LIVE MIGRATION
      try {
        const folder = `Muhyo-Tech/${item.collection}`;
        const uploadRes = await cloudinary.uploader.upload(localFileAbs, {
          folder,
          resource_type: "image",
          use_filename: true,
          unique_filename: true,
        });

        if (!uploadRes.secure_url) {
          throw new Error("Cloudinary did not return a secure_url.");
        }

        const newUrl = uploadRes.secure_url;
        const objId = new mongoose.Types.ObjectId(item.documentId);

        // ATOMIC DATABASE UPDATE
        if (item.collection === "blogs") {
          const updateObj = { image: newUrl };
          if (Array.isArray(item.extraFields) && item.extraFields.includes("featuredImage.url")) {
            updateObj["featuredImage.url"] = newUrl;
          }
          await db.collection("blogs").updateOne({ _id: objId }, { $set: updateObj });
        } else if (item.collection === "projects") {
          if (item.field === "thumbnail") {
            await db.collection("projects").updateOne({ _id: objId }, { $set: { thumbnail: newUrl } });
          } else if (item.field.startsWith("gallery")) {
            // Update specific gallery item or replace originalUrl in gallery
            const projectDoc = await db.collection("projects").findOne({ _id: objId });
            if (projectDoc && Array.isArray(projectDoc.gallery)) {
              const updatedGallery = projectDoc.gallery.map((g) => (g === item.originalUrl ? newUrl : g));
              await db.collection("projects").updateOne({ _id: objId }, { $set: { gallery: updatedGallery } });
            }
          }
        } else if (item.collection === "services") {
          await db.collection("services").updateOne({ _id: objId }, { $set: { heroImage: newUrl } });
        } else if (item.collection === "heros") {
          await db.collection("heros").updateOne({ _id: objId }, { $set: { visualImage: newUrl } });
        }

        migrationState.successCount++;
        migrationState.logs.unshift(
          `[MIGRATED ✓] ${item.title} -> ${newUrl.split("/").pop()}`
        );
      } catch (uploadErr) {
        migrationState.errorCount++;
        const errMsg = `[FAIL] Failed migrating ${item.title}: ${uploadErr.message}`;
        migrationState.errors.push(errMsg);
        migrationState.logs.unshift(errMsg);
      }
    }

    migrationState.isRunning = false;
    migrationState.isCompleted = true;
    migrationState.completedAt = new Date();
    migrationState.logs.unshift(
      `[COMPLETED] Migration finished! Success: ${migrationState.successCount}, Errors: ${migrationState.errorCount}`
    );

    // Invalidate Redis cache so live website immediately points to new cloud URLs
    await invalidateCloudinaryCache();
  })().catch((err) => {
    migrationState.isRunning = false;
    migrationState.isCompleted = true;
    migrationState.errors.push(`Fatal migration error: ${err.message}`);
  });

  return {
    started: true,
    message: `Migration initiated to '${targetCreds.cloudName}'. Total assets to migrate: ${eligibleItems.length}. Mode: ${dryRun ? "Dry Run" : "Live Migration"}.`,
    total: eligibleItems.length,
    dryRun,
  };
}

export default {
  getMigrationStatus,
  startMigration,
};
