import { authenticateAdminRequest } from "@/lib/adminAuth";
import { apiResponse, withErrorHandling } from "@/lib/apiResponse";
import {
  getVaultStats,
  syncVault,
  clearVaultLocalFiles,
  downloadFullVaultBackup,
} from "@/lib/server/cloudinary/assetVault";

/**
 * GET /api/admin/cloudinary-pool/vault
 * Returns summary of local zero-data-loss asset backup vault.
 */
export const GET = withErrorHandling(async (req) => {
  const auth = await authenticateAdminRequest(req);
  if (auth.error) {
    return apiResponse.error(auth.error.message, auth.error.status);
  }

  const stats = await getVaultStats();
  const res = apiResponse.success(stats, "Vault statistics retrieved successfully.");
  res.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  return res;
});

/**
 * POST /api/admin/cloudinary-pool/vault
 * Syncs new assets or downloads full structured backup from MongoDB.
 */
export const POST = withErrorHandling(async (req) => {
  const auth = await authenticateAdminRequest(req);
  if (auth.error) {
    return apiResponse.error(auth.error.message, auth.error.status);
  }

  let body = {};
  try {
    body = await req.json();
  } catch {}

  if (body.action === "download_full_backup") {
    const result = await downloadFullVaultBackup();
    return apiResponse.success(
      result,
      `Full vault backup downloaded (${result.totalDownloaded} assets, ${result.megabytesDownloaded} MB).`
    );
  }

  const result = await syncVault();
  return apiResponse.success(
    result,
    `Vault synchronized. ${result.newlyAdded} new assets mirrored to local vault.`
  );
});

/**
 * DELETE /api/admin/cloudinary-pool/vault
 * Removes local image files from disk to free ~400+ MB of disk space,
 * while safely preserving migration_registry.json metadata and structure.
 */
export const DELETE = withErrorHandling(async (req) => {
  const auth = await authenticateAdminRequest(req);
  if (auth.error) {
    return apiResponse.error(auth.error.message, auth.error.status);
  }

  const result = await clearVaultLocalFiles();
  return apiResponse.success(
    result,
    `Local media files cleared (${result.filesRemoved} files, ${result.megabytesFreed} MB freed). Registry preserved.`
  );
});
