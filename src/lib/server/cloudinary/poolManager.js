import dbConnect from "../../dbConnect.js";
import CloudinaryAccount from "../../../models/CloudinaryAccount.js";
import { getCache, setCache, deleteCache } from "../../cache.js";

export const CACHE_KEY_POOL_ACCOUNTS = "cloudinary:pool:all_accounts";
export const CACHE_KEY_OPTIMAL_ACCOUNT = "cloudinary:optimal:account";
export const CACHE_KEY_ASSETS_PREFIX = "cloudinary:assets:";

/**
 * Robust Cache Invalidation Arbiter
 * Purges cached accounts and assets on Redis so new data is reflected immediately on mutation.
 */
export async function invalidateCloudinaryCache(cloudName = null) {
  try {
    const tasks = [
      deleteCache(CACHE_KEY_POOL_ACCOUNTS),
      deleteCache(CACHE_KEY_OPTIMAL_ACCOUNT),
    ];
    if (cloudName) {
      tasks.push(deleteCache(`${CACHE_KEY_ASSETS_PREFIX}${String(cloudName).trim().toLowerCase()}`));
    }
    await Promise.allSettled(tasks);
  } catch (err) {
    console.warn("⚠️ [CloudinaryPool] Cache invalidation warning:", err.message);
  }
}

/**
 * SMART CLOUDINARY ACCOUNT POOL ARBITER
 * High-performance, zero-breakage routing layer that balances uploads across
 * multiple Cloudinary accounts based on real-time remaining credit headroom.
 */

/**
 * Returns root Master account configured in environment variables.
 * Acts as the unshakeable fallback node.
 */
export function getMasterAccount() {
  const cloudName =
    process.env.CLOUDINARY_CLOUD_NAME ||
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ||
    "";
  const apiKey = process.env.CLOUDINARY_API_KEY || "";
  const apiSecret = process.env.CLOUDINARY_API_SECRET || "";
  const uploadPreset =
    process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "ml_default";

  return {
    _id: "master_env_account",
    label: "Master Account (.env.local)",
    cloudName,
    apiKey,
    apiSecret,
    uploadPreset,
    isMaster: true,
    isActive: true,
    priority: 1,
    status: "healthy",
    usage: {
      totalCredits: 25,
      usedCredits: 0,
      remainingCredits: 25,
      usagePercent: 0,
      lastSyncedAt: null,
    },
  };
}

/**
 * Parses a Cloudinary environment variable string (CLOUDINARY_URL).
 * Handles:
 * - "CLOUDINARY_URL=cloudinary://<apiKey>:<apiSecret>@<cloudName>"
 * - "export CLOUDINARY_URL=cloudinary://<apiKey>:<apiSecret>@<cloudName>"
 * - "cloudinary://<apiKey>:<apiSecret>@<cloudName>"
 */
export function parseCloudinaryUrl(str) {
  if (!str || typeof str !== "string") return null;
  let clean = str.trim();
  clean = clean.replace(/^(export\s+)?CLOUDINARY_URL\s*=\s*/i, "");
  clean = clean.replace(/^['"]+|['"]+$/g, "").trim();
  const match = clean.match(/^cloudinary:\/\/([^:]+):([^@]+)@([^/?#]+)/i);
  if (!match) return null;
  return {
    apiKey: decodeURIComponent(match[1].trim()),
    apiSecret: decodeURIComponent(match[2].trim()),
    cloudName: decodeURIComponent(match[3].trim().toLowerCase()),
  };
}

/**
 * Validates Cloudinary credentials against Cloudinary Usage API.
 * Supports direct parameters OR a full CLOUDINARY_URL environment variable string.
 * Used during account onboarding in Admin UI.
 */
export async function validateCredentials(input) {
  let { cloudName, apiKey, apiSecret, cloudinaryUrl } = input || {};

  // 1. If a full CLOUDINARY_URL was provided
  if (cloudinaryUrl && typeof cloudinaryUrl === "string") {
    const parsed = parseCloudinaryUrl(cloudinaryUrl);
    if (parsed) {
      cloudName = parsed.cloudName || cloudName;
      apiKey = parsed.apiKey || apiKey;
      // Never overwrite a manual real secret with masked asterisks from CLOUDINARY_URL
      const parsedIsMasked = parsed.apiSecret.includes("*") || parsed.apiSecret.includes("•");
      if (!parsedIsMasked || !apiSecret) {
        apiSecret = parsed.apiSecret;
      }
    }
  } else {
    // 2. Check if user accidentally pasted the full CLOUDINARY_URL inside apiKey or apiSecret
    for (const val of [apiKey, apiSecret, cloudName]) {
      if (val && typeof val === "string" && val.includes("cloudinary://")) {
        const parsed = parseCloudinaryUrl(val);
        if (parsed) {
          cloudName = parsed.cloudName || cloudName;
          apiKey = parsed.apiKey || apiKey;
          const parsedIsMasked = parsed.apiSecret.includes("*") || parsed.apiSecret.includes("•");
          if (!parsedIsMasked || !apiSecret) {
            apiSecret = parsed.apiSecret;
          }
          break;
        }
      }
    }
  }

  // 3. Sanitize inputs: trim and remove surrounding quotes
  const cleanCloud = cloudName ? String(cloudName).trim().replace(/^['"]+|['"]+$/g, "").toLowerCase() : "";
  const cleanKey = apiKey ? String(apiKey).trim().replace(/^['"]+|['"]+$/g, "") : "";
  const cleanSecret = apiSecret ? String(apiSecret).trim().replace(/^['"]+|['"]+$/g, "") : "";

  if (!cleanCloud || !cleanKey || !cleanSecret) {
    return {
      ok: false,
      message: "Cloud Name, API Key, and API Secret are required (or paste a valid CLOUDINARY_URL API Environment Variable).",
      httpCode: 400,
    };
  }

  // Check if API Secret was copied with masked asterisks or dots from Cloudinary dashboard
  if (cleanSecret.includes("*") || cleanSecret.includes("•")) {
    return {
      ok: false,
      message: "API Secret contains masked asterisks (*********). In your Cloudinary dashboard, click the Eye icon next to API Secret to reveal the actual secret characters, or click the Copy button directly.",
      httpCode: 400,
    };
  }

  try {
    const authHeader = Buffer.from(`${cleanKey}:${cleanSecret}`).toString("base64");
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cleanCloud}/usage`,
      {
        headers: {
          Authorization: `Basic ${authHeader}`,
        },
        cache: "no-store",
      }
    );

    if (response.status === 401) {
      const errJson = await response.json().catch(() => null);
      const rawMsg = errJson?.error?.message;
      let msg = "Invalid credentials: Cloudinary rejected API Key or Secret (401 Unauthorized).";
      if (rawMsg === "api_secret mismatch") {
        msg = `Cloudinary returned 'api_secret mismatch'. Your Cloud Name ('${cleanCloud}') and API Key ('${cleanKey}') are valid, but the API Secret does not match. Please copy the full secret from Cloudinary Console (check that no character is missing).`;
      } else if (rawMsg === "unknown api_key") {
        msg = `Cloudinary returned 'unknown api_key'. The API Key ('${cleanKey}') was not found under cloud '${cleanCloud}'.`;
      }
      return {
        ok: false,
        message: msg,
        httpCode: 401,
      };
    }

    if (!response.ok) {
      const errBody = await response.text().catch(() => "");
      return {
        ok: false,
        message: `Cloudinary API returned HTTP ${response.status}: ${errBody || response.statusText}`,
        httpCode: response.status,
      };
    }

    const data = await response.json();
    const metrics = parseCloudinaryUsageData(data);

    return {
      ok: true,
      usage: metrics,
      credentials: {
        cloudName: cleanCloud,
        apiKey: cleanKey,
        apiSecret: cleanSecret,
      },
    };
  } catch (error) {
    return {
      ok: false,
      message: `Network error connecting to Cloudinary: ${error.message}`,
      httpCode: 500,
    };
  }
}

/**
 * Extracts normalized credit metrics from Cloudinary Usage API JSON response.
 */
export function parseCloudinaryUsageData(data) {
  const bandwidthBytes = data.bandwidth?.usage || 0;
  const storageBytes = data.storage?.usage || 0;
  const transformations = data.transformations?.usage || 0;

  // Primary: use official Cloudinary calculated credits if provided
  let totalCredits = data.credits?.limit || 25;
  let usedCredits = data.credits?.usage;
  let usagePercent = data.credits?.used_percent ?? data.credits?.percent_usage;

  // Fallback credit calculation if raw metrics only
  if (typeof usedCredits !== "number") {
    const bandwidthGB = bandwidthBytes / (1024 * 1024 * 1024);
    const storageGB = storageBytes / (1024 * 1024 * 1024);
    const transformCredits = transformations / 1000;
    usedCredits = Number((bandwidthGB + storageGB + transformCredits).toFixed(2));
  }

  if (typeof usagePercent !== "number") {
    usagePercent = totalCredits > 0 ? Number(((usedCredits / totalCredits) * 100).toFixed(1)) : 0;
  }

  const remainingCredits = Math.max(0, Number((totalCredits - usedCredits).toFixed(2)));

  return {
    totalCredits,
    usedCredits,
    remainingCredits,
    usagePercent: Number(Number(usagePercent).toFixed(1)),
    bandwidthBytes,
    storageBytes,
    transformations,
    lastSyncedAt: new Date(),
  };
}

/**
 * Syncs usage metrics for a specific database account or Master account.
 */
export async function syncAccountUsage(accountOrId) {
  let account = accountOrId;

  if (typeof accountOrId === "string") {
    if (accountOrId === "master_env_account") {
      account = getMasterAccount();
    } else {
      await dbConnect();
      account = await CloudinaryAccount.findById(accountOrId);
    }
  }

  if (!account) throw new Error("Account not found for sync.");

  const validation = await validateCredentials({
    cloudName: account.cloudName,
    apiKey: account.apiKey,
    apiSecret: account.apiSecret,
  });

  if (!validation.ok) {
    if (account._id && account._id !== "master_env_account") {
      await dbConnect();
      await CloudinaryAccount.findByIdAndUpdate(account._id, {
        status: "error",
        $push: {
          errorLogs: {
            $each: [
              {
                timestamp: new Date(),
                message: validation.message,
                httpCode: validation.httpCode,
              },
            ],
            $slice: -20, // Keep last 20 error logs
          },
        },
      });
    }
    return { success: false, error: validation.message };
  }

  const { usage } = validation;
  let newStatus = account.status === "paused" ? "paused" : "healthy";

  if (newStatus !== "paused") {
    if (usage.usagePercent >= 85) {
      newStatus = "exhausted";
    } else if (usage.usagePercent >= 70) {
      newStatus = "warning";
    }
  }

  if (account._id && account._id !== "master_env_account") {
    await dbConnect();
    await CloudinaryAccount.findByIdAndUpdate(account._id, {
      usage,
      status: newStatus,
    });
  }

  return { success: true, usage, status: newStatus };
}

/**
 * Best-Fit Selection Algorithm:
 * Returns the highest capacity active account currently in the pool.
 * Backed by L1/L2 Redis caching for ultra-fast sub-millisecond execution.
 * Falls back transparently to Master account under any failure scenario.
 */
export async function getOptimalAccount({ purpose = "general", forceRefresh = false } = {}) {
  // 1. Instant Cache Check (Sub-millisecond resolution)
  if (!forceRefresh) {
    try {
      const cached = await getCache(CACHE_KEY_OPTIMAL_ACCOUNT);
      if (cached && cached.cloudName && cached.apiKey && cached.apiSecret) {
        return cached;
      }
    } catch (err) {
      console.warn("⚠️ [CloudinaryPool] Cache getOptimalAccount notice:", err.message);
    }
  }

  try {
    await dbConnect();

    // Query active accounts that are not paused, exhausted, or errored
    const candidates = await CloudinaryAccount.find({
      isActive: true,
      status: { $in: ["healthy", "warning"] },
      "usage.usagePercent": { $lt: 88 },
    })
      .sort({ "usage.remainingCredits": -1, priority: -1 })
      .lean();

    if (candidates && candidates.length > 0) {
      const bestCandidate = candidates[0];
      const optimal = {
        accountId: bestCandidate._id.toString(),
        label: bestCandidate.label,
        cloudName: bestCandidate.cloudName,
        apiKey: bestCandidate.apiKey,
        apiSecret: bestCandidate.apiSecret,
        uploadPreset: bestCandidate.uploadPreset || "ml_default",
        isMaster: !!bestCandidate.isMaster,
        status: bestCandidate.status || "healthy",
        remainingCredits: bestCandidate.usage?.remainingCredits ?? 25,
      };

      // Cache optimal target for 10 minutes (auto-invalidated on any account change)
      setCache(CACHE_KEY_OPTIMAL_ACCOUNT, optimal, 600, ["cloudinary_pool"]).catch(() => {});
      return optimal;
    }
  } catch (err) {
    console.warn(
      `⚠️ [CloudinaryPoolArbiter] Database pool lookup failed (${err.message}). Safe secondary fallback.`
    );
  }

  // Safe Fallback Selection
  try {
    await dbConnect();
    // 1. Check if Root Master is in active 30-day cooldown
    const masterDb = await CloudinaryAccount.findOne({
      $or: [
        { isMaster: true },
        { cloudName: (process.env.CLOUDINARY_CLOUD_NAME || "").toLowerCase() }
      ]
    }).lean();

    const now = Date.now();
    const isMasterInCooldown = masterDb && masterDb.cooldownUntil && new Date(masterDb.cooldownUntil).getTime() > now;

    if (!isMasterInCooldown && masterDb && masterDb.cooldownUntil && new Date(masterDb.cooldownUntil).getTime() <= now) {
      // 30 days have elapsed: probe root account health before allowing uploads
      try {
        const probe = await validateCredentials({
          cloudName: masterDb.cloudName,
          apiKey: masterDb.apiKey,
          apiSecret: masterDb.apiSecret,
        });

        if (probe.ok && (probe.usage?.remainingCredits ?? 0) > 1) {
          // Healthy and has credits! Reactivate
          await CloudinaryAccount.updateOne(
            { _id: masterDb._id },
            { $set: { status: "healthy", isActive: true, cooldownUntil: null, "usage": probe.usage } }
          );
          const masterFallback = {
            accountId: masterDb._id.toString(),
            label: masterDb.label,
            cloudName: masterDb.cloudName,
            apiKey: masterDb.apiKey,
            apiSecret: masterDb.apiSecret,
            uploadPreset: masterDb.uploadPreset || "ml_default",
            isMaster: true,
            status: "healthy",
            remainingCredits: probe.usage?.remainingCredits ?? 25,
          };
          return masterFallback;
        } else {
          // Post-30-day check hit an error or no headroom: extend cooldown by 7 days and DO NOT send data
          const extended = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
          await CloudinaryAccount.updateOne(
            { _id: masterDb._id },
            { $set: { status: "paused", isActive: false, cooldownUntil: extended, notes: "Post-30-day probe failed: credit limit or error. Cooldown extended." } }
          );
        }
      } catch (probeErr) {
        console.warn(`⚠️ [CloudinaryPool] Post-30-day probe failed (${probeErr.message}). Master remains paused.`);
      }
    }

    // 2. If Master is in cooldown or errored, pick any active secondary account
    const secondaryFallback = await CloudinaryAccount.findOne({
      isActive: true,
      isMaster: { $ne: true },
      status: { $ne: "paused" }
    }).sort({ "usage.remainingCredits": -1 }).lean();

    if (secondaryFallback) {
      const fallbackObj = {
        accountId: secondaryFallback._id.toString(),
        label: secondaryFallback.label,
        cloudName: secondaryFallback.cloudName,
        apiKey: secondaryFallback.apiKey,
        apiSecret: secondaryFallback.apiSecret,
        uploadPreset: secondaryFallback.uploadPreset || "ml_default",
        isMaster: false,
        status: secondaryFallback.status || "healthy",
        remainingCredits: secondaryFallback.usage?.remainingCredits ?? 25,
      };
      setCache(CACHE_KEY_OPTIMAL_ACCOUNT, fallbackObj, 300, ["cloudinary_pool"]).catch(() => {});
      return fallbackObj;
    }
  } catch (err) {
    console.warn("⚠️ [CloudinaryPool] Fallback resolution warning:", err.message);
  }

  // Final emergency fallback
  const master = getMasterAccount();
  const fallback = {
    accountId: "master_env_account",
    label: master.label,
    cloudName: master.cloudName,
    apiKey: master.apiKey,
    apiSecret: master.apiSecret,
    uploadPreset: master.uploadPreset,
    isMaster: true,
    status: master.status || "healthy",
    remainingCredits: 25,
  };
  setCache(CACHE_KEY_OPTIMAL_ACCOUNT, fallback, 300, ["cloudinary_pool"]).catch(() => {});
  return fallback;
}

let cachedMasterUsage = null;

/**
 * Returns all pooled accounts with Master account included for Admin Dashboard.
 * Backed by Redis distributed caching for instant sub-millisecond page loads.
 */
export async function getAllPoolAccounts({ forceSync = false } = {}) {
  // 1. Instant Cache Return
  if (!forceSync) {
    try {
      const cached = await getCache(CACHE_KEY_POOL_ACCOUNTS);
      if (Array.isArray(cached) && cached.length > 0) {
        return cached;
      }
    } catch (err) {
      console.warn("⚠️ [CloudinaryPool] Redis accounts lookup notice:", err.message);
    }
  }

  const master = getMasterAccount();
  let dbAccounts = [];

  try {
    await dbConnect();
    dbAccounts = await CloudinaryAccount.find({}).sort({ isMaster: -1, createdAt: -1 }).lean();
  } catch (err) {
    console.warn("⚠️ [CloudinaryPool] Failed to fetch accounts from DB:", err.message);
  }

  // Auto-fetch real live usage from Cloudinary API
  const isStale =
    !cachedMasterUsage ||
    Date.now() - new Date(cachedMasterUsage.lastSyncedAt).getTime() > 10 * 60 * 1000;

  if (forceSync) {
    try {
      const val = await validateCredentials({
        cloudName: master.cloudName,
        apiKey: master.apiKey,
        apiSecret: master.apiSecret,
      });
      if (val.ok) {
        cachedMasterUsage = val.usage;
      }
    } catch (e) {
      console.warn("⚠️ [CloudinaryPool] Master live sync warning:", e.message);
    }
  } else if (isStale && !cachedMasterUsage) {
    // Non-blocking background sync: Does not delay website load
    setImmediate(async () => {
      try {
        const val = await validateCredentials({
          cloudName: master.cloudName,
          apiKey: master.apiKey,
          apiSecret: master.apiSecret,
        });
        if (val.ok) cachedMasterUsage = val.usage;
      } catch {}
    });
  }

  if (cachedMasterUsage) {
    master.usage = cachedMasterUsage;
  }

  // Check if Master is already persisted in DB
  const hasMasterInDb = dbAccounts.some(
    (a) => a.isMaster || a.cloudName.toLowerCase() === master.cloudName.toLowerCase()
  );

  const allAccounts = hasMasterInDb ? dbAccounts : [master, ...dbAccounts];

  // Attach asset summaries for each account
  const accountsWithSummaries = await Promise.all(
    allAccounts.map(async (acc) => {
      try {
        const { summary } = await getAssetsForCloudName(acc.cloudName, acc, { forceSync });
        return { ...acc, assetSummary: summary };
      } catch {
        return {
          ...acc,
          assetSummary: { blogs: 0, projects: 0, services: 0, heros: 0, direct: 0, total: 0 },
        };
      }
    })
  );

  // Store in Redis (15 minutes TTL)
  setCache(CACHE_KEY_POOL_ACCOUNTS, accountsWithSummaries, 900, ["cloudinary_pool"]).catch(() => {});

  return accountsWithSummaries;
}

/**
 * Queries MongoDB for all assets hosted under a specific Cloudinary cloudName.
 * Backed by Redis cache (1 hour TTL) so repeated opens load in ~1ms without DB or external API calls.
 */
export async function getAssetsForCloudName(cloudName, accountCreds = null, { forceSync = false } = {}) {
  if (!cloudName) {
    return {
      assets: [],
      summary: { blogs: 0, projects: 0, services: 0, heros: 0, direct: 0, total: 0 },
    };
  }

  const targetCloud = String(cloudName).trim().toLowerCase();
  const cacheKey = `${CACHE_KEY_ASSETS_PREFIX}${targetCloud}`;

  // 1. Instant Cache Return
  if (!forceSync) {
    try {
      const cached = await getCache(cacheKey);
      if (cached && Array.isArray(cached.assets)) {
        return cached;
      }
    } catch (err) {
      console.warn("⚠️ [CloudinaryPool] Redis asset cache lookup notice:", err.message);
    }
  }

  await dbConnect();
  const mongoose = (await import("mongoose")).default;
  const db = mongoose.connection.db;
  const cloudRegex = new RegExp(targetCloud, "i");

  const [blogs, projects, services, heros] = await Promise.all([
    db
      .collection("blogs")
      .find(
        {
          $or: [
            { image: cloudRegex },
            { "featuredImage.url": cloudRegex },
          ],
        },
        {
          projection: {
            title: 1,
            image: 1,
            featuredImage: 1,
            slug: 1,
            category: 1,
            createdAt: 1,
          },
        }
      )
      .toArray(),

    db
      .collection("projects")
      .find(
        {
          $or: [
            { thumbnail: cloudRegex },
            { gallery: cloudRegex },
          ],
        },
        {
          projection: {
            title: 1,
            thumbnail: 1,
            gallery: 1,
            slug: 1,
            createdAt: 1,
          },
        }
      )
      .toArray(),

    db
      .collection("services")
      .find(
        { heroImage: cloudRegex },
        { projection: { title: 1, heroImage: 1, slug: 1, createdAt: 1 } }
      )
      .toArray(),

    db
      .collection("heros")
      .find(
        { visualImage: cloudRegex },
        { projection: { visualImage: 1, title: 1, createdAt: 1 } }
      )
      .toArray(),
  ]);

  const assets = [];

  // 1. Blogs
  blogs.forEach((b) => {
    const url = b.image || b.featuredImage?.url;
    if (url && cloudRegex.test(url)) {
      assets.push({
        id: b._id.toString(),
        title: b.title || "Untitled Blog",
        entity: "Blog",
        field: "Cover Image",
        url,
        publicId: extractPublicIdFromUrl(url),
        slug: b.slug,
        category: b.category || "Architecture",
        createdAt: b.createdAt,
      });
    }
  });

  // 2. Projects
  projects.forEach((p) => {
    if (p.thumbnail && cloudRegex.test(p.thumbnail)) {
      assets.push({
        id: p._id.toString(),
        title: `${p.title} (Main Thumbnail)`,
        entity: "Project",
        field: "Thumbnail",
        url: p.thumbnail,
        publicId: extractPublicIdFromUrl(p.thumbnail),
        slug: p.slug,
        category: "Projects",
        createdAt: p.createdAt,
      });
    }
    if (Array.isArray(p.gallery)) {
      p.gallery.forEach((gUrl, idx) => {
        if (gUrl && cloudRegex.test(gUrl)) {
          assets.push({
            id: p._id.toString(),
            title: `${p.title} (Gallery #${idx + 1})`,
            entity: "Project",
            field: `Gallery #${idx + 1}`,
            url: gUrl,
            publicId: extractPublicIdFromUrl(gUrl),
            slug: p.slug,
            category: "Projects",
            createdAt: p.createdAt,
          });
        }
      });
    }
  });

  // 3. Services
  services.forEach((s) => {
    if (s.heroImage && cloudRegex.test(s.heroImage)) {
      assets.push({
        id: s._id.toString(),
        title: s.title || "Untitled Service",
        entity: "Service",
        field: "Hero Banner",
        url: s.heroImage,
        publicId: extractPublicIdFromUrl(s.heroImage),
        slug: s.slug,
        category: "Services",
        createdAt: s.createdAt,
      });
    }
  });

  // 4. Hero
  heros.forEach((h) => {
    if (h.visualImage && cloudRegex.test(h.visualImage)) {
      assets.push({
        id: h._id.toString(),
        title: h.title || "Home Page Main Hero Visual",
        entity: "Hero",
        field: "Visual Graphic",
        url: h.visualImage,
        publicId: extractPublicIdFromUrl(h.visualImage),
        slug: "home-hero",
        category: "Home",
        createdAt: h.createdAt,
      });
    }
  });

  // 5. Direct Cloudinary Uploads (Fetch from Cloudinary API if credentials provided)
  if (accountCreds && accountCreds.apiKey && accountCreds.apiSecret) {
    try {
      const { v2: cloudinary } = await import("cloudinary");
      cloudinary.config({
        cloud_name: targetCloud,
        api_key: accountCreds.apiKey,
        api_secret: accountCreds.apiSecret,
        secure: true,
      });

      const res = await cloudinary.api.resources({
        type: "upload",
        max_results: 50,
      });

      const existingUrls = new Set(assets.map((a) => a.url));

      if (res && Array.isArray(res.resources)) {
        res.resources.forEach((r) => {
          // Ignore default sample templates
          if (
            r.public_id.startsWith("samples/") ||
            r.public_id.startsWith("cld-sample") ||
            r.public_id === "main-sample"
          ) {
            return;
          }
          if (!existingUrls.has(r.secure_url)) {
            assets.unshift({
              id: r.public_id,
              title: r.public_id.split("/").pop() || "Direct Upload",
              entity: "Direct Upload",
              field: `Folder: ${r.public_id.includes("/") ? r.public_id.split("/").slice(0, -1).join("/") : "Root"}`,
              url: r.secure_url,
              publicId: r.public_id,
              slug: r.public_id,
              category: "Cloudinary Live Asset",
              createdAt: r.created_at || new Date(),
              fileSizeBytes: r.bytes,
              dimensions: `${r.width}x${r.height}`,
              format: r.format,
            });
            existingUrls.add(r.secure_url);
          }
        });
      }
    } catch (apiErr) {
      console.warn("Could not fetch direct Cloudinary resources:", apiErr.message);
    }
  }

  const result = {
    assets,
    summary: {
      blogs: blogs.length,
      projects: assets.filter((a) => a.entity === "Project").length,
      services: services.length,
      heros: heros.length,
      direct: assets.filter((a) => a.entity === "Direct Upload").length,
      total: assets.length,
    },
  };

  // Cache in Redis for 1 hour (purged instantly whenever an image is uploaded or deleted)
  setCache(cacheKey, result, 3600, ["cloudinary_assets"]).catch(() => {});

  return result;
}

/**
 * Extracts Cloudinary publicId from a secure Cloudinary URL.
 */
export function extractPublicIdFromUrl(url) {
  if (!url || typeof url !== "string") return null;
  const match = url.match(
    /\/upload\/(?:[a-zA-Z0-9_,]+(?:\/[a-zA-Z0-9_,]+)*\/)?(?:v\d+\/)?(.+?)(?:\.[a-zA-Z0-9]+)?$/
  );
  if (match && match[1]) {
    return decodeURIComponent(match[1]);
  }
  return null;
}

/**
 * Permanently deletes an asset from Cloudinary and cleans up MongoDB linkage if applicable.
 */
export async function deleteAssetFromCloudinaryAndDb({
  accountId,
  publicId: explicitPublicId,
  url,
  entity,
  documentId,
  field,
}) {
  let accountCreds;
  if (accountId === "master_env_account") {
    accountCreds = getMasterAccount();
  } else {
    await dbConnect();
    accountCreds = await CloudinaryAccount.findById(accountId);
  }

  if (!accountCreds) {
    throw new Error("Cloudinary account credentials not found.");
  }

  const publicId = explicitPublicId || extractPublicIdFromUrl(url);
  if (!publicId) {
    throw new Error("Could not determine Cloudinary publicId for deletion.");
  }

  // 1. Delete from Cloudinary
  const { v2: cloudinary } = await import("cloudinary");
  cloudinary.config({
    cloud_name: accountCreds.cloudName,
    api_key: accountCreds.apiKey,
    api_secret: accountCreds.apiSecret,
    secure: true,
  });

  let cloudinaryResult = null;
  try {
    cloudinaryResult = await cloudinary.uploader.destroy(publicId, {
      invalidate: true,
      resource_type: "image",
    });
  } catch (cldErr) {
    console.warn(`[deleteAsset] Cloudinary destroy failed:`, cldErr.message);
    throw new Error(`Cloudinary API error: ${cldErr.message}`);
  }

  // 2. Safely unbind from MongoDB if linked to an entity
  let dbUpdated = false;
  if (documentId && entity && documentId !== publicId) {
    await dbConnect();
    const mongoose = (await import("mongoose")).default;
    const db = mongoose.connection.db;

    try {
      const objId = new mongoose.Types.ObjectId(documentId);
      const entityLower = String(entity).toLowerCase();

      if (entityLower === "blog") {
        await db.collection("blogs").updateOne(
          { _id: objId },
          { $unset: { image: "", featuredImage: "" } }
        );
        dbUpdated = true;
      } else if (entityLower === "project") {
        if (field?.toLowerCase().includes("thumbnail")) {
          await db.collection("projects").updateOne(
            { _id: objId },
            { $unset: { thumbnail: "" } }
          );
          dbUpdated = true;
        } else if (url) {
          await db.collection("projects").updateOne(
            { _id: objId },
            { $pull: { gallery: url } }
          );
          dbUpdated = true;
        }
      } else if (entityLower === "service") {
        await db.collection("services").updateOne(
          { _id: objId },
          { $unset: { heroImage: "" } }
        );
        dbUpdated = true;
      } else if (entityLower === "hero") {
        await db.collection("heros").updateOne(
          { _id: objId },
          { $unset: { visualImage: "" } }
        );
        dbUpdated = true;
      }
    } catch (err) {
      console.warn("[deleteAsset] DB unbind warning:", err.message);
    }
  }

  // 3. Trigger account usage sync to update credits and metrics
  try {
    await syncAccountUsage(accountId);
  } catch (syncErr) {
    console.warn("[deleteAsset] syncAccountUsage warning:", syncErr.message);
  }

  // 4. Invalidate Redis caches so deleted asset vanishes immediately
  await invalidateCloudinaryCache(accountCreds.cloudName);

  // 5. Clean up from local safety vault if present
  try {
    const { deleteVaultAsset } = await import("./assetVault.js");
    await deleteVaultAsset({
      url,
      publicId,
      collection: entity ? `${entity.toLowerCase()}s` : undefined,
      documentId,
      field,
    });
  } catch (vaultErr) {
    console.warn("[deleteAsset] vault cleanup notice:", vaultErr.message);
  }

  return {
    success: true,
    publicId,
    cloudinaryResult,
    dbUpdated,
  };
}

/**
 * Automatically destroys an orphaned Cloudinary image when a new image replaces it in the Admin panel.
 * Prevents account credit leakage and keeps cloud storage completely clean.
 */
export async function cleanupOrphanCloudinaryAsset(oldUrl) {
  if (!oldUrl || typeof oldUrl !== "string" || !oldUrl.includes("cloudinary.com")) return;
  try {
    const publicId = extractPublicIdFromUrl(oldUrl);
    if (!publicId) return;

    // Detect target cloudName from URL: https://res.cloudinary.com/<cloudName>/image/upload/...
    const urlMatch = oldUrl.match(/cloudinary\.com\/([^\/]+)\/image/i);
    const targetCloud = urlMatch ? urlMatch[1].toLowerCase() : null;

    let targetCreds = null;
    if (targetCloud) {
      const allAccounts = await getAllPoolAccounts();
      targetCreds = allAccounts.find(
        (a) => a.cloudName?.toLowerCase() === targetCloud
      );
    }

    if (!targetCreds) {
      targetCreds = getMasterAccount();
    }

    const { v2: cloudinary } = await import("cloudinary");
    cloudinary.config({
      cloud_name: targetCreds.cloudName,
      api_key: targetCreds.apiKey,
      api_secret: targetCreds.apiSecret,
      secure: true,
    });

    await cloudinary.uploader.destroy(publicId, { invalidate: true, resource_type: "image" });
    await invalidateCloudinaryCache(targetCreds.cloudName);
  } catch (err) {
    console.warn("⚠️ [CloudinaryPool] Auto-cleanup of orphan image notice:", err.message);
  }
}


/**
 * Syncs all pool accounts in parallel.
 */
export async function syncAllPoolAccounts() {
  const accounts = await getAllPoolAccounts();
  const results = await Promise.allSettled(
    accounts.map((acc) => syncAccountUsage(acc._id || acc))
  );
  return results;
}

export default {
  getMasterAccount,
  validateCredentials,
  parseCloudinaryUsageData,
  syncAccountUsage,
  getOptimalAccount,
  getAllPoolAccounts,
  syncAllPoolAccounts,
  getAssetsForCloudName,
  extractPublicIdFromUrl,
  deleteAssetFromCloudinaryAndDb,
  invalidateCloudinaryCache,
  cleanupOrphanCloudinaryAsset,
};


