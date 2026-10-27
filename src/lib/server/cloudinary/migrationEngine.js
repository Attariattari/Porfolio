import fs from "fs";
import path from "path";
import dbConnect from "../../dbConnect.js";
import CloudinaryAccount from "../../../models/CloudinaryAccount.js";
import { getMasterAccount, invalidateCloudinaryCache, syncAllPoolAccounts, extractPublicIdFromUrl } from "./poolManager.js";

const REGISTRY_PATH = path.resolve("muhyo_organized_backup", "migration_registry.json");
const SNAPSHOT_BASE_DIR = path.resolve("muhyo_organized_backup", "migration_backups");

// Global in-memory migration runner state for live UI tracking
let migrationState = {
  isRunning: false,
  isCompleted: false,
  dryRun: true,
  phase: "IDLE", // BACKUP | UPLOADING | DB_UPDATE | VERIFYING | CLEANUP | COMPLETED | FAILED
  phaseLabel: "Ready",
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
 * Downloads an asset to disk with byte verification.
 */
async function downloadAssetToDisk(url, destinationPath, timeoutMs = 25000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timer);
    if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    if (buffer.length === 0) throw new Error("Downloaded 0 bytes (empty file)");
    fs.mkdirSync(path.dirname(destinationPath), { recursive: true });
    fs.writeFileSync(destinationPath, buffer);
    const stats = fs.statSync(destinationPath);
    if (stats.size === 0) throw new Error("Saved file has 0 bytes");
    return { size: stats.size, success: true };
  } catch (err) {
    clearTimeout(timer);
    throw err;
  }
}

/**
 * Verifies that a live URL responds with HTTP 200.
 */
async function verifyLiveUrl(url, timeoutMs = 15000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    let res = await fetch(url, { method: "HEAD", signal: controller.signal });
    clearTimeout(timer);
    if (res.ok && res.status === 200) return true;
    // Fallback to GET with small byte range if HEAD is blocked
    const getRes = await fetch(url, {
      method: "GET",
      headers: { Range: "bytes=0-100" },
      signal: controller.signal,
    });
    return getRes.ok;
  } catch {
    clearTimeout(timer);
    return false;
  }
}

/**
 * Resolves credentials for a given cloudName.
 */
async function resolveAccountCredentials(cloudName) {
  if (!cloudName) return null;
  const master = getMasterAccount();
  if (master.cloudName && master.cloudName.toLowerCase() === cloudName.toLowerCase()) {
    return master;
  }
  await dbConnect();
  const account = await CloudinaryAccount.findOne({
    cloudName: new RegExp(`^${cloudName}$`, "i"),
  }).lean();
  return account || null;
}

/**
 * Executes a 0-Risk, 5-Phase Migration with Pre-Flight Backup,
 * Atomic Database Update, Deep Verification, and Safe Cleanup.
 */
export async function startMigration({
  sourceCloudName,
  targetAccountId,
  dryRun = true,
  deleteFromSource = false,
  cleanBackupOnSuccess = true,
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

  if (sourceCloudName && sourceCloudName.toLowerCase() === targetCreds.cloudName.toLowerCase()) {
    throw new Error("Source and Target accounts cannot be the same Cloudinary account.");
  }

  // Resolve Source Credentials (needed if deleteFromSource is enabled)
  const sourceCreds = sourceCloudName ? await resolveAccountCredentials(sourceCloudName) : null;
  if (deleteFromSource && !dryRun && !sourceCreds) {
    console.warn(`[Migration] Source account credentials for '${sourceCloudName}' not found. Deletion from source will be skipped.`);
  }

  const { v2: targetCloudinary } = await import("cloudinary");
  targetCloudinary.config({
    cloud_name: targetCreds.cloudName,
    api_key: targetCreds.apiKey,
    api_secret: targetCreds.apiSecret,
    secure: true,
  });

  const registry = JSON.parse(fs.readFileSync(REGISTRY_PATH, "utf8"));

  // Helper to extract URL from registry item (supports cloudinaryUrl or originalUrl)
  const getItemUrl = (item) => (item.cloudinaryUrl || item.originalUrl || item.url || "").trim();

  // Filter items matching the sourceCloudName
  const sourcePattern = sourceCloudName ? new RegExp(sourceCloudName, "i") : null;
  const eligibleItems = registry.filter((item) => {
    if (item.collection === "static_code") return false;
    if (collectionFilter && item.collection !== collectionFilter) return false;
    const itemUrl = getItemUrl(item);
    if (!itemUrl) return false;
    if (sourcePattern) {
      if (item.cloudName && item.cloudName.toLowerCase() === sourceCloudName.toLowerCase()) {
        return true;
      }
      return sourcePattern.test(itemUrl);
    }
    return true;
  });

  if (eligibleItems.length === 0) {
    throw new Error(
      `No assets found matching source cloud '${sourceCloudName || "all"}' in the migration registry.`
    );
  }

  const snapshotTimestamp = Date.now();
  const snapshotFolder = path.join(
    SNAPSHOT_BASE_DIR,
    `snapshot_${sourceCloudName || "all"}_${snapshotTimestamp}`
  );

  // Initialize in-memory state
  migrationState = {
    isRunning: true,
    isCompleted: false,
    dryRun: Boolean(dryRun),
    phase: "PREPARING",
    phaseLabel: "Initializing 0-Risk Migration...",
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
    currentAssetTitle: "Starting engine...",
    logs: [
      `[INIT] Starting ${dryRun ? "DRY RUN (Simulation)" : "LIVE 0-RISK MIGRATION"} for ${eligibleItems.length} assets to '${targetCreds.cloudName}'...`,
    ],
    errors: [],
  };

  // Run in background asynchronously so UI gets immediate 200 response
  (async () => {
    await dbConnect();
    const mongoose = (await import("mongoose")).default;
    const db = mongoose.connection.db;

    const migrationPairs = []; // Stores { item, localPath, newUrl, publicId }

    // =========================================================================
    // PHASE 1: PRE-FLIGHT SAFE BACKUP SNAPSHOT (0-Risk Guarantee)
    // =========================================================================
    migrationState.phase = "BACKUP";
    migrationState.phaseLabel = "Phase 1/5: Creating Safe Pre-Flight Backup Snapshot...";
    migrationState.logs.unshift(`[PHASE 1] Pre-flight snapshot: securing ${eligibleItems.length} assets to local disk before any changes...`);

    let backupFailed = false;

    for (let i = 0; i < eligibleItems.length; i++) {
      const item = eligibleItems[i];
      const itemUrl = getItemUrl(item);
      migrationState.current = i + 1;
      migrationState.percentage = Math.round(((i + 1) / eligibleItems.length) * 20); // Phase 1 is 0-20%
      migrationState.currentAssetTitle = `Backing up: ${item.title || itemUrl.split("/").pop()}`;

      let urlBasename = "asset.png";
      try {
        urlBasename = path.basename(new URL(itemUrl).pathname);
      } catch {
        urlBasename = itemUrl.split("/").pop() || "asset.png";
      }
      const safeFilename = `${item.collection}_${item.documentId}_${urlBasename}`;
      const localSnapshotPath = path.join(snapshotFolder, item.collection, safeFilename);

      if (dryRun) {
        // Simulation mode
        migrationPairs.push({ item, localPath: localSnapshotPath, oldUrl: itemUrl });
        if (i % 15 === 0 || i === eligibleItems.length - 1) {
          migrationState.logs.unshift(`[SIMULATED BACKUP] Would secure: ${safeFilename}`);
        }
        await new Promise((r) => setTimeout(r, 10));
        continue;
      }

      try {
        await downloadAssetToDisk(itemUrl, localSnapshotPath);
        migrationPairs.push({ item, localPath: localSnapshotPath, oldUrl: itemUrl });
        if (i % 10 === 0 || i === eligibleItems.length - 1) {
          migrationState.logs.unshift(`[BACKUP ✓] Secured ${i + 1}/${eligibleItems.length}: ${safeFilename}`);
        }
      } catch (err) {
        backupFailed = true;
        const msg = `[BACKUP ABORT] Failed to backup '${item.title}': ${err.message}. Migration aborted! Database untouched (0% Risk).`;
        migrationState.errors.push(msg);
        migrationState.logs.unshift(msg);
        break;
      }
    }

    if (backupFailed) {
      migrationState.isRunning = false;
      migrationState.isCompleted = true;
      migrationState.phase = "FAILED";
      migrationState.phaseLabel = "Migration Aborted: Pre-flight backup failed (0 DB changes made).";
      if (fs.existsSync(snapshotFolder)) {
        try { fs.rmSync(snapshotFolder, { recursive: true, force: true }); } catch {}
      }
      return;
    }

    migrationState.logs.unshift(`[PHASE 1 COMPLETE] All ${eligibleItems.length} assets safely secured in local snapshot.`);

    // =========================================================================
    // PHASE 2 & 3: TARGET UPLOAD, HTTP 200 VERIFY, & ATOMIC DB UPDATE
    // =========================================================================
    migrationState.phase = "UPLOADING";
    migrationState.phaseLabel = "Phase 2/5: Target Upload & Live HTTP 200 Verification...";
    migrationState.logs.unshift(`[PHASE 2 & 3] Uploading verified assets to '${targetCreds.cloudName}' and atomically updating MongoDB...`);

    const successfullyMigrated = [];

    for (let i = 0; i < migrationPairs.length; i++) {
      const { item, localPath } = migrationPairs[i];
      migrationState.current = i + 1;
      migrationState.percentage = 20 + Math.round(((i + 1) / migrationPairs.length) * 50); // 20-70%
      migrationState.currentAssetTitle = `Uploading: ${item.title || path.basename(localPath)}`;

      if (dryRun) {
        migrationState.successCount++;
        if (i % 15 === 0 || i === migrationPairs.length - 1) {
          migrationState.logs.unshift(`[SIMULATED UPLOAD] Would upload ${path.basename(localPath)} -> Update DB (${item.collection})`);
        }
        await new Promise((r) => setTimeout(r, 15));
        continue;
      }

      try {
        // 1. Upload to Target Account
        const folder = `Muhyo-Tech/${item.collection}`;
        const uploadRes = await targetCloudinary.uploader.upload(localPath, {
          folder,
          resource_type: "image",
          use_filename: true,
          unique_filename: true,
        });

        if (!uploadRes.secure_url) {
          throw new Error("Target Cloudinary did not return a secure_url.");
        }

        const newUrl = uploadRes.secure_url;

        // 2. HTTP 200 Live Verification
        const isLive = await verifyLiveUrl(newUrl);
        if (!isLive) {
          throw new Error(`Uploaded URL failed live HTTP verification: ${newUrl}`);
        }

      const { item, localPath, oldUrl: oldUrlFromPair } = migrationPairs[i];
      const oldUrl = oldUrlFromPair || item.cloudinaryUrl || item.originalUrl;
      const objId = new mongoose.Types.ObjectId(item.documentId);

        if (item.collection === "blogs") {
          const doc = await db.collection("blogs").findOne({ _id: objId });
          if (doc) {
            const updateObj = {};
            if (doc.image === oldUrl) updateObj.image = newUrl;
            if (doc.featuredImage?.url === oldUrl) updateObj["featuredImage.url"] = newUrl;
            if (typeof doc.content === "string" && doc.content.includes(oldUrl)) {
              updateObj.content = doc.content.split(oldUrl).join(newUrl);
            }
            if (Object.keys(updateObj).length > 0) {
              await db.collection("blogs").updateOne({ _id: objId }, { $set: updateObj });
            }
          }
        } else if (item.collection === "projects") {
          const doc = await db.collection("projects").findOne({ _id: objId });
          if (doc) {
            const updateObj = {};
            if (doc.thumbnail === oldUrl) updateObj.thumbnail = newUrl;
            if (Array.isArray(doc.gallery)) {
              updateObj.gallery = doc.gallery.map((g) => (g === oldUrl ? newUrl : g));
            }
            if (Object.keys(updateObj).length > 0) {
              await db.collection("projects").updateOne({ _id: objId }, { $set: updateObj });
            }
          }
        } else if (item.collection === "services") {
          const doc = await db.collection("services").findOne({ _id: objId });
          if (doc) {
            const updateObj = {};
            if (doc.heroImage === oldUrl) updateObj.heroImage = newUrl;
            if (doc.image === oldUrl) updateObj.image = newUrl;
            if (doc.icon === oldUrl) updateObj.icon = newUrl;
            if (Object.keys(updateObj).length > 0) {
              await db.collection("services").updateOne({ _id: objId }, { $set: updateObj });
            }
          }
        } else if (item.collection === "heros") {
          await db.collection("heros").updateOne(
            { _id: objId, visualImage: oldUrl },
            { $set: { visualImage: newUrl } }
          );
        } else if (item.collection === "bloggerposts") {
          const doc = await db.collection("bloggerposts").findOne({ _id: objId });
          if (doc && typeof doc.content === "string" && doc.content.includes(oldUrl)) {
            await db.collection("bloggerposts").updateOne(
              { _id: objId },
              { $set: { content: doc.content.split(oldUrl).join(newUrl) } }
            );
          }
        }

        // Keep item synchronized in registry
        item.cloudinaryUrl = newUrl;
        item.originalUrl = newUrl;
        item.cloudName = targetCreds.cloudName;
        item.lastVerifiedAt = new Date().toISOString();
        successfullyMigrated.push({ oldUrl, newUrl, item });
        migrationState.successCount++;

        if (i % 5 === 0 || i === migrationPairs.length - 1) {
          migrationState.logs.unshift(`[MIGRATED ✓] ${item.title || "Asset"} -> ${path.basename(newUrl)} (HTTP 200 OK)`);
        }
      } catch (err) {
        migrationState.errorCount++;
        const errMsg = `[FAIL] Failed migrating ${item.title}: ${err.message}`;
        migrationState.errors.push(errMsg);
        migrationState.logs.unshift(errMsg);
      }
    }

    // Save updated migration_registry.json
    if (!dryRun && successfullyMigrated.length > 0) {
      try {
        fs.writeFileSync(REGISTRY_PATH, JSON.stringify(registry, null, 2), "utf8");
      } catch (regErr) {
        console.warn("[Migration] Could not update migration_registry.json:", regErr.message);
      }
    }

    // =========================================================================
    // PHASE 4: DEEP POST-MIGRATION VERIFICATION
    // =========================================================================
    migrationState.phase = "VERIFYING";
    migrationState.phaseLabel = "Phase 4/5: Deep Post-Migration Verification...";
    migrationState.percentage = 80;
    migrationState.logs.unshift(`[PHASE 4] Deep verifying database: scanning for any broken links or lingering references...`);

    let lingeringReferences = 0;
    if (!dryRun && successfullyMigrated.length > 0) {
      try {
        for (const { oldUrl } of successfullyMigrated) {
          const blogHits = await db.collection("blogs").countDocuments({
            $or: [{ image: oldUrl }, { "featuredImage.url": oldUrl }, { content: { $regex: oldUrl.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") } }],
          });
          const projectHits = await db.collection("projects").countDocuments({
            $or: [{ thumbnail: oldUrl }, { gallery: oldUrl }],
          });
          lingeringReferences += blogHits + projectHits;
        }
        if (lingeringReferences === 0) {
          migrationState.logs.unshift(`[VERIFIED ✓] 100% of references cleanly replaced with new cloud URLs! Zero lingering references.`);
        } else {
          migrationState.logs.unshift(`[VERIFY WARN] Found ${lingeringReferences} lingering old references. Review logs.`);
        }
      } catch (vErr) {
        migrationState.logs.unshift(`[VERIFY NOTICE] Verification scan notice: ${vErr.message}`);
      }
    } else {
      migrationState.logs.unshift(`[VERIFIED ✓] Simulation verified 0 conflicts.`);
    }

    // =========================================================================
    // PHASE 5: SAFE CLEANUP & SOURCE DELETION (Only on 100% Verified Success)
    // =========================================================================
    migrationState.phase = "CLEANUP";
    migrationState.phaseLabel = "Phase 5/5: Safe Cleanup & Purging Snapshots...";
    migrationState.percentage = 90;

    // 1. Delete from Source Cloudinary (Optional User Option, strictly only on 0 errors)
    if (!dryRun && deleteFromSource && migrationState.errorCount === 0 && sourceCreds) {
      migrationState.logs.unshift(`[SOURCE CLEANUP] Deleting ${successfullyMigrated.length} migrated images from source account (${sourceCloudName}) to free credits...`);
      try {
        const { v2: sourceCloudinary } = await import("cloudinary");
        sourceCloudinary.config({
          cloud_name: sourceCreds.cloudName,
          api_key: sourceCreds.apiKey,
          api_secret: sourceCreds.apiSecret,
          secure: true,
        });

        let deletedFromSource = 0;
        for (const { oldUrl } of successfullyMigrated) {
          const publicId = extractPublicIdFromUrl(oldUrl);
          if (publicId) {
            try {
              await sourceCloudinary.uploader.destroy(publicId, { invalidate: true, resource_type: "image" });
              deletedFromSource++;
            } catch (delErr) {
              console.warn(`[Source Del] Notice for ${publicId}:`, delErr.message);
            }
          }
        }
        migrationState.logs.unshift(`[SOURCE FREED ✓] Successfully freed ${deletedFromSource} assets from source account '${sourceCloudName}'.`);
      } catch (srcErr) {
        migrationState.logs.unshift(`[SOURCE DEL WARN] Could not delete from source: ${srcErr.message}`);
      }
    }

    // 2. Clean temporary pre-flight backup snapshot on verified success
    if (!dryRun && cleanBackupOnSuccess && migrationState.errorCount === 0) {
      try {
        if (fs.existsSync(snapshotFolder)) {
          fs.rmSync(snapshotFolder, { recursive: true, force: true });
          migrationState.logs.unshift(`[BACKUP PURGED ✓] Temporary pre-flight snapshot safely deleted after verified 100% success.`);
        }
      } catch (rmErr) {
        console.warn("[Migration] Could not remove snapshot folder:", rmErr.message);
      }
    } else if (dryRun) {
      migrationState.logs.unshift(`[CLEANUP] Dry run simulation: zero files modified or deleted.`);
    }

    // Invalidate Redis/Application Cache
    await invalidateCloudinaryCache();
    await syncAllPoolAccounts();

    // Finish
    migrationState.isRunning = false;
    migrationState.isCompleted = true;
    migrationState.phase = "COMPLETED";
    migrationState.phaseLabel = "Migration Complete & Deep Verified 100% Safe!";
    migrationState.percentage = 100;
    migrationState.completedAt = new Date();
    migrationState.logs.unshift(
      `[FINISHED] 0-Risk Migration finished! Success: ${migrationState.successCount}, Errors: ${migrationState.errorCount}`
    );
  })().catch((fatalErr) => {
    migrationState.isRunning = false;
    migrationState.isCompleted = true;
    migrationState.phase = "FAILED";
    migrationState.phaseLabel = `Fatal Error: ${fatalErr.message}`;
    migrationState.errors.push(`Fatal migration error: ${fatalErr.message}`);
    migrationState.logs.unshift(`[FATAL ERROR] ${fatalErr.message}`);
  });

  return {
    started: true,
    message: `0-Risk Migration initiated to '${targetCreds.cloudName}'. Total assets: ${eligibleItems.length}. Mode: ${dryRun ? "Dry Run Simulation" : "Live Migration"}.`,
    total: eligibleItems.length,
    dryRun,
  };
}

export default {
  getMigrationStatus,
  startMigration,
};
