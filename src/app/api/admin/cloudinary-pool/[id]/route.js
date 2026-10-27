import { authenticateAdminRequest } from "@/lib/adminAuth";
import { apiResponse, withErrorHandling } from "@/lib/apiResponse";
import dbConnect from "@/lib/dbConnect";
import CloudinaryAccount from "@/models/CloudinaryAccount";
import { syncAccountUsage, invalidateCloudinaryCache } from "@/lib/server/cloudinary/poolManager";

/**
 * PATCH /api/admin/cloudinary-pool/[id]
 * Updates status, pauses/resumes, or triggers usage sync.
 */
export const PATCH = withErrorHandling(async (req, context) => {
  const auth = await authenticateAdminRequest(req);
  if (auth.error) {
    return apiResponse.error(auth.error.message, auth.error.status);
  }

  const { id } = await context.params;
  const body = await req.json();
  const { action, label, priority, isActive, status } = body;

  if (id === "master_env_account") {
    if (action === "sync") {
      const syncResult = await syncAccountUsage("master_env_account");
      await invalidateCloudinaryCache();
      return apiResponse.success(syncResult, "Master account synced successfully");
    }
    return apiResponse.error(
      "Master environment configuration cannot be modified via database API.",
      400
    );
  }

  await dbConnect();
  const account = await CloudinaryAccount.findById(id);
  if (!account) {
    return apiResponse.error("Account not found.", 404);
  }

  if (action === "sync") {
    const syncResult = await syncAccountUsage(account);
    await invalidateCloudinaryCache(account.cloudName);
    return apiResponse.success(syncResult, "Account usage synced from Cloudinary.");
  }

  if (action === "toggle-pause") {
    const newStatus = account.status === "paused" ? "healthy" : "paused";
    account.status = newStatus;
    await account.save();
    await invalidateCloudinaryCache(account.cloudName);
    return apiResponse.success(
      account,
      `Account has been ${newStatus === "paused" ? "paused" : "resumed"}.`
    );
  }

  // General field updates
  if (typeof label === "string") account.label = label.trim();
  if (typeof priority === "number") account.priority = priority;
  if (typeof isActive === "boolean") account.isActive = isActive;
  if (typeof status === "string") account.status = status;

  await account.save();
  await invalidateCloudinaryCache(account.cloudName);

  return apiResponse.success(account, "Account updated successfully.");
});

/**
 * DELETE /api/admin/cloudinary-pool/[id]
 * Safely removes a secondary account from the pool.
 */
export const DELETE = withErrorHandling(async (req, context) => {
  const auth = await authenticateAdminRequest(req);
  if (auth.error) {
    return apiResponse.error(auth.error.message, auth.error.status);
  }

  const { id } = await context.params;

  if (id === "master_env_account") {
    return apiResponse.error(
      "Master root account cannot be deleted. It is defined in .env.local as a fail-safe.",
      400
    );
  }

  await dbConnect();
  const account = await CloudinaryAccount.findById(id);
  if (!account) {
    return apiResponse.error("Account not found.", 404);
  }

  if (account.isMaster) {
    return apiResponse.error("Master accounts cannot be removed from the pool.", 400);
  }

  await CloudinaryAccount.findByIdAndDelete(id);
  await invalidateCloudinaryCache(account.cloudName);

  return apiResponse.success(
    null,
    `Account '${account.label}' has been successfully removed from the pool.`
  );
});

