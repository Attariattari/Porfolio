import { authenticateAdminRequest } from "@/lib/adminAuth";
import { apiResponse, withErrorHandling } from "@/lib/apiResponse";
import dbConnect from "@/lib/dbConnect";
import CloudinaryAccount from "@/models/CloudinaryAccount";
import {
  getMasterAccount,
  getAssetsForCloudName,
  deleteAssetFromCloudinaryAndDb,
} from "@/lib/server/cloudinary/poolManager";

/**
 * GET /api/admin/cloudinary-pool/[id]/assets
 * Returns row-by-row hosted media assets and details for a specific Cloudinary account.
 */
export const GET = withErrorHandling(async (req, context) => {
  const auth = await authenticateAdminRequest(req);
  if (auth.error) {
    return apiResponse.error(auth.error.message, auth.error.status);
  }

  const { id } = await context.params;
  let cloudName = "";
  let accountLabel = "";

  let accountCreds = null;

  if (id === "master_env_account") {
    const master = getMasterAccount();
    cloudName = master.cloudName;
    accountLabel = master.label;
    accountCreds = master;
  } else {
    await dbConnect();
    const account = await CloudinaryAccount.findById(id).lean();
    if (!account) {
      return apiResponse.error("Cloudinary account not found.", 404);
    }
    cloudName = account.cloudName;
    accountLabel = account.label;
    accountCreds = account;
  }

  const { assets, summary } = await getAssetsForCloudName(cloudName, accountCreds);

  return apiResponse.success(
    {
      cloudName,
      accountLabel,
      summary,
      assets,
    },
    `Found ${assets.length} assets hosted in account '${accountLabel}'.`
  );
});

/**
 * DELETE /api/admin/cloudinary-pool/[id]/assets
 * Permanently deletes a specific asset from Cloudinary and unbinds from MongoDB.
 */
export const DELETE = withErrorHandling(async (req, context) => {
  const auth = await authenticateAdminRequest(req);
  if (auth.error) {
    return apiResponse.error(auth.error.message, auth.error.status);
  }

  const { id } = await context.params;
  const body = await req.json();
  const { publicId, url, entity, documentId, field } = body || {};

  if (!publicId && !url) {
    return apiResponse.error("Either publicId or image url is required.", 400);
  }

  const result = await deleteAssetFromCloudinaryAndDb({
    accountId: id,
    publicId,
    url,
    entity,
    documentId,
    field,
  });

  return apiResponse.success(
    result,
    "Asset successfully deleted from Cloudinary and database unlinked."
  );
});

