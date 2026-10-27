import { authenticateAdminRequest } from "@/lib/adminAuth";
import { apiResponse, withErrorHandling } from "@/lib/apiResponse";
import dbConnect from "@/lib/dbConnect";
import CloudinaryAccount from "@/models/CloudinaryAccount";
import {
  getAllPoolAccounts,
  getOptimalAccount,
  validateCredentials,
  syncAllPoolAccounts,
  invalidateCloudinaryCache,
} from "@/lib/server/cloudinary/poolManager";

/**
 * GET /api/admin/cloudinary-pool
 * Returns all pooled accounts with live usage metrics & health status.
 */
export const GET = withErrorHandling(async (req) => {
  const auth = await authenticateAdminRequest(req);
  if (auth.error) {
    return apiResponse.error(auth.error.message, auth.error.status);
  }

  const { searchParams } = new URL(req.url);
  const shouldSync = searchParams.get("sync") === "true";
  const isLive = searchParams.get("live") === "true";

  if (shouldSync) {
    await syncAllPoolAccounts();
  }

  const accounts = await getAllPoolAccounts({ forceSync: shouldSync, liveDb: isLive });
  const optimalTarget = await getOptimalAccount();

  // Compute aggregate pool telemetry
  let totalPoolCredits = 0;
  let usedPoolCredits = 0;
  let activeCount = 0;

  accounts.forEach((acc) => {
    if (acc.isActive && acc.status !== "paused") {
      activeCount++;
      totalPoolCredits += acc.usage?.totalCredits ?? 25;
      usedPoolCredits += acc.usage?.usedCredits ?? 0;
    }
  });

  const remainingPoolCredits = Math.max(
    0,
    Number((totalPoolCredits - usedPoolCredits).toFixed(2))
  );

  const res = apiResponse.success(
    {
      accounts,
      metrics: {
        totalAccounts: accounts.length,
        activeAccounts: activeCount,
        totalPoolCredits,
        usedPoolCredits: Number(usedPoolCredits.toFixed(2)),
        remainingPoolCredits,
        optimalTarget: {
          label: optimalTarget.label,
          cloudName: optimalTarget.cloudName,
          isMaster: optimalTarget.isMaster,
          remainingCredits: optimalTarget.remainingCredits,
        },
      },
    },
    "Cloudinary pool retrieved successfully"
  );
  res.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  return res;
});

/**
 * POST /api/admin/cloudinary-pool
 * Onboards a new secondary Cloudinary account with live credential ping validation.
 */
export const POST = withErrorHandling(async (req) => {
  const auth = await authenticateAdminRequest(req);
  if (auth.error) {
    return apiResponse.error(auth.error.message, auth.error.status);
  }

  const body = await req.json();
  const { label, cloudName, apiKey, apiSecret, uploadPreset, priority, cloudinaryUrl } = body;

  // 1. Live ping verification against Cloudinary API before saving (supports CLOUDINARY_URL or separate fields)
  const validation = await validateCredentials({
    cloudName,
    apiKey,
    apiSecret,
    cloudinaryUrl,
  });

  if (!validation.ok) {
    return apiResponse.error(
      `Credential validation failed: ${validation.message}`,
      400
    );
  }

  const { cloudName: cleanCloudName, apiKey: cleanApiKey, apiSecret: cleanApiSecret } = validation.credentials;

  await dbConnect();

  // 2. Prevent duplicate accounts
  const existing = await CloudinaryAccount.findOne({ cloudName: cleanCloudName });
  if (existing) {
    return apiResponse.error(
      `An account with cloud name '${cleanCloudName}' is already registered in the pool.`,
      400
    );
  }

  // 3. Determine initial health status based on usage
  const initialUsage = validation.usage;
  let initialStatus = "healthy";
  if (initialUsage.usagePercent >= 85) {
    initialStatus = "exhausted";
  } else if (initialUsage.usagePercent >= 70) {
    initialStatus = "warning";
  }

  // 4. Create and persist account
  const newAccount = await CloudinaryAccount.create({
    label: label?.trim() || `Secondary Pool (${cleanCloudName})`,
    cloudName: cleanCloudName,
    apiKey: cleanApiKey,
    apiSecret: cleanApiSecret,
    uploadPreset: uploadPreset?.trim() || "ml_default",
    priority: Number(priority) || 1,
    status: initialStatus,
    isActive: true,
    isMaster: false,
    usage: initialUsage,
  });

  // Purge Redis cache so new account appears immediately
  await invalidateCloudinaryCache(cleanCloudName);

  return apiResponse.success(
    newAccount,
    "Cloudinary account successfully validated and connected to pool.",
    201
  );
});

