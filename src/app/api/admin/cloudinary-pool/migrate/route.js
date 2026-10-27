import { authenticateAdminRequest } from "@/lib/adminAuth";
import { apiResponse, withErrorHandling } from "@/lib/apiResponse";
import { getMigrationStatus, startMigration } from "@/lib/server/cloudinary/migrationEngine";

/**
 * GET /api/admin/cloudinary-pool/migrate
 * Returns live status and progress of ongoing or completed migration.
 */
export const GET = withErrorHandling(async (req) => {
  const auth = await authenticateAdminRequest(req);
  if (auth.error) {
    return apiResponse.error(auth.error.message, auth.error.status);
  }

  const status = getMigrationStatus();
  return apiResponse.success(status, "Migration status retrieved.");
});

/**
 * POST /api/admin/cloudinary-pool/migrate
 * Initiates a 0-risk safe migration from source to target account.
 */
export const POST = withErrorHandling(async (req) => {
  const auth = await authenticateAdminRequest(req);
  if (auth.error) {
    return apiResponse.error(auth.error.message, auth.error.status);
  }

  const body = await req.json();
  const {
    sourceCloudName,
    targetAccountId,
    dryRun = true,
    deleteFromSource = false,
    cleanBackupOnSuccess = true,
    collectionFilter = null,
  } = body;

  if (!targetAccountId) {
    return apiResponse.error("Target account ID is required for migration.", 400);
  }

  const result = await startMigration({
    sourceCloudName,
    targetAccountId,
    dryRun: Boolean(dryRun),
    deleteFromSource: Boolean(deleteFromSource),
    cleanBackupOnSuccess: Boolean(cleanBackupOnSuccess),
    collectionFilter,
  });

  return apiResponse.success(result, result.message);
});
