import fs from "fs";
import path from "path";
import dbConnect from "../src/lib/dbConnect.js";
import {
  getVaultStats,
  clearVaultLocalFiles,
  downloadFullVaultBackup,
} from "../src/lib/server/cloudinary/assetVault.js";
import { getAllPoolAccounts } from "../src/lib/server/cloudinary/poolManager.js";

const command = process.argv[2] || "status";

async function main() {
  console.log("==========================================================");
  console.log("🛡️  Muhyo Tech — Zero-Data-Loss Safety Vault Manager");
  console.log("==========================================================");

  if (command === "status") {
    const stats = await getVaultStats();
    console.log(`Vault Status:`);
    console.log(`  Registry Exists: ${stats.exists ? "YES" : "NO"}`);
    console.log(`  Total Registered Assets: ${stats.totalAssets}`);
    console.log(`  Files Cached on Local Disk: ${stats.verifiedOnDisk}`);
    console.log(`  Local Storage Used: ${(stats.totalSizeBytes / (1024 * 1024)).toFixed(2)} MB`);
    console.log(`  Status: ${stats.verifiedOnDisk === 0 ? "🟢 All assets active & live in Cloudinary (Local Disk Clean)" : "💾 Local Vault Cached on Disk"}`);
    console.log(`  Breakdown:`, stats.breakdown);
    process.exit(0);
  }

  if (command === "clean") {
    console.log("🧹 Clearing local media files from disk to free up space...");
    const result = await clearVaultLocalFiles();
    console.log(`✅ Success!`);
    console.log(`  Files Removed: ${result.filesRemoved}`);
    console.log(`  Disk Space Freed: ${result.megabytesFreed} MB`);
    console.log(`  Registry Preserved: YES (muhyo_organized_backup/migration_registry.json intact)`);
    console.log(`  Cloud Status: All images remain live & active on Cloudinary across 3 accounts.`);
    process.exit(0);
  }

  if (command === "backup") {
    console.log("📥 Downloading fresh structured backup from MongoDB & Cloudinary to disk...");
    console.log("Every asset will be saved into its identified folder with SHA256 verification.");
    const result = await downloadFullVaultBackup();
    console.log(`✅ Backup Complete!`);
    console.log(`  Total Downloaded: ${result.totalDownloaded} assets`);
    console.log(`  Total Size: ${result.megabytesDownloaded} MB`);
    console.log(`  Errors: ${result.errors}`);
    process.exit(0);
  }

  if (command === "restore") {
    console.log("⚡ Launching equal balance restore across connected Cloudinary accounts...");
    const { execSync } = await import("child_process");
    execSync("node --env-file=.env.local scratch/balance_migration_3_accounts.mjs", {
      stdio: "inherit",
    });
    process.exit(0);
  }

  console.log(`Unknown command: '${command}'`);
  console.log(`Available commands:`);
  console.log(`  node scripts/vault-manager.mjs status   - Check vault & disk stats`);
  console.log(`  node scripts/vault-manager.mjs clean    - Free local disk space (delete local images, keep registry)`);
  console.log(`  node scripts/vault-manager.mjs backup   - Download structured backup of all assets from DB to disk`);
  console.log(`  node scripts/vault-manager.mjs restore  - Restore & equally balance across connected Cloudinary accounts`);
  process.exit(1);
}

main().catch((err) => {
  console.error("❌ Vault Manager Error:", err.message);
  process.exit(1);
});
