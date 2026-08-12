import crypto from "crypto";
import os from "os";

let cachedWorkerId = null;

/**
 * Generates or retrieves a unique dynamic worker identity for the current deployment runtime.
 * Works seamlessly across Vercel deployments (Serverless/Edge/Node) without manual numbering environment variables.
 */
export function getWorkerId() {
  if (cachedWorkerId) {
    return cachedWorkerId;
  }

  const vercelDeploymentId = process.env.VERCEL_DEPLOYMENT_ID || process.env.VERCEL_URL;
  const vercelRegion = process.env.VERCEL_REGION || "global";
  const randomSuffix = crypto.randomBytes(4).toString("hex");

  if (vercelDeploymentId) {
    const sanitizedId = vercelDeploymentId.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 24);
    cachedWorkerId = `vercel_${vercelRegion}_${sanitizedId}_${randomSuffix}`;
  } else {
    const hostname = os.hostname().replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 16);
    const pid = process.pid || 1;
    cachedWorkerId = `worker_${hostname}_${pid}_${randomSuffix}`;
  }

  return cachedWorkerId;
}
