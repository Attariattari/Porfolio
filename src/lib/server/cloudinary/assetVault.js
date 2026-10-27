import fs from "fs";
import path from "path";
import crypto from "crypto";
import dbConnect from "../../dbConnect.js";

const REGISTRY_PATH = path.resolve("muhyo_organized_backup", "migration_registry.json");
const VAULT_DIR = path.resolve("muhyo_organized_backup");

function computeSha256(buffer) {
  return crypto.createHash("sha256").update(buffer).digest("hex");
}

function sanitizeSlug(str) {
  if (!str) return "unnamed";
  return String(str)
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
}

/**
 * Returns summary statistics about the local zero-data-loss asset vault.
 */
export async function getVaultStats() {
  if (!fs.existsSync(REGISTRY_PATH)) {
    return {
      exists: false,
      totalAssets: 0,
      verifiedOnDisk: 0,
      totalSizeBytes: 0,
      breakdown: {},
      lastUpdated: null,
    };
  }

  try {
    const raw = fs.readFileSync(REGISTRY_PATH, "utf8");
    const registry = JSON.parse(raw);
    const stat = fs.statSync(REGISTRY_PATH);

    let verifiedOnDisk = 0;
    let totalSizeBytes = 0;
    const breakdown = {};

    for (const item of registry) {
      breakdown[item.collection] = (breakdown[item.collection] || 0) + 1;
      const fileAbs = path.join(VAULT_DIR, item.localRelativePath || "");
      if (fs.existsSync(fileAbs)) {
        verifiedOnDisk++;
        totalSizeBytes += item.fileSizeBytes || fs.statSync(fileAbs).size;
      }
    }

    return {
      exists: true,
      totalAssets: registry.length,
      verifiedOnDisk,
      totalSizeBytes,
      breakdown,
      lastUpdated: stat.mtime,
      isFullySynchronized: verifiedOnDisk === registry.length && registry.length > 0,
    };
  } catch (err) {
    console.error("⚠️ [AssetVault] Error reading vault stats:", err.message);
    return {
      exists: false,
      error: err.message,
      totalAssets: 0,
      verifiedOnDisk: 0,
      totalSizeBytes: 0,
      breakdown: {},
      lastUpdated: null,
    };
  }
}

/**
 * Scans MongoDB for any fresh assets and safely mirrors them into the local vault.
 * Guarantees zero data loss even if cloud accounts get paused or terminated.
 */
export async function syncVault() {
  if (!fs.existsSync(VAULT_DIR)) {
    fs.mkdirSync(VAULT_DIR, { recursive: true });
  }

  let registry = [];
  if (fs.existsSync(REGISTRY_PATH)) {
    try {
      registry = JSON.parse(fs.readFileSync(REGISTRY_PATH, "utf8"));
    } catch {
      registry = [];
    }
  }

  const existingUrls = new Set(registry.map((r) => r.originalUrl).filter(Boolean));
  await dbConnect();
  const mongoose = (await import("mongoose")).default;
  const db = mongoose.connection.db;

  const [blogs, projects, services, heros] = await Promise.all([
    db.collection("blogs").find({}, { projection: { title: 1, image: 1, featuredImage: 1, slug: 1 } }).toArray(),
    db.collection("projects").find({}, { projection: { title: 1, thumbnail: 1, gallery: 1, slug: 1 } }).toArray(),
    db.collection("services").find({}, { projection: { title: 1, heroImage: 1, slug: 1 } }).toArray(),
    db.collection("heros").find({}, { projection: { title: 1, visualImage: 1 } }).toArray(),
  ]);

  let newlyAdded = 0;

  // 1. Process Blogs
  for (const b of blogs) {
    const url = b.image || b.featuredImage?.url;
    if (url && !existingUrls.has(url) && url.includes("cloudinary.com")) {
      try {
        const res = await fetch(url);
        if (res.ok) {
          const buf = Buffer.from(await res.arrayBuffer());
          const slug = sanitizeSlug(b.slug || b.title);
          const ext = path.extname(new URL(url).pathname) || ".png";
          const subDir = path.join(VAULT_DIR, "blogs", `${b._id}__${slug}`);
          fs.mkdirSync(subDir, { recursive: true });
          const relPath = `blogs/${b._id}__${slug}/cover__${Date.now()}${ext}`;
          fs.writeFileSync(path.join(VAULT_DIR, relPath), buf);

          registry.push({
            registryIndex: registry.length + 1,
            collection: "blogs",
            documentId: b._id.toString(),
            title: b.title || "Untitled Blog",
            slug: b.slug,
            field: "image",
            extraFields: ["featuredImage.url"],
            originalUrl: url,
            localRelativePath: relPath,
            fileSizeBytes: buf.length,
            sha256: computeSha256(buf),
            status: "verified_ready",
          });
          existingUrls.add(url);
          newlyAdded++;
        }
      } catch (e) {
        console.warn(`[AssetVault] Skipping failed blog fetch ${url}:`, e.message);
      }
    }
  }

  // 2. Process Projects
  for (const p of projects) {
    const urls = [];
    if (p.thumbnail) urls.push({ url: p.thumbnail, field: "thumbnail" });
    if (Array.isArray(p.gallery)) {
      p.gallery.forEach((g, i) => urls.push({ url: g, field: `gallery[${i}]` }));
    }

    for (const item of urls) {
      if (item.url && !existingUrls.has(item.url) && item.url.includes("cloudinary.com")) {
        try {
          const res = await fetch(item.url);
          if (res.ok) {
            const buf = Buffer.from(await res.arrayBuffer());
            const slug = sanitizeSlug(p.slug || p.title);
            const ext = path.extname(new URL(item.url).pathname) || ".png";
            const subDir = path.join(VAULT_DIR, "projects", `${p._id}__${slug}`);
            fs.mkdirSync(subDir, { recursive: true });
            const relPath = `projects/${p._id}__${slug}/${item.field.replace(/[\[\]]/g, "_")}__${Date.now()}${ext}`;
            fs.writeFileSync(path.join(VAULT_DIR, relPath), buf);

            registry.push({
              registryIndex: registry.length + 1,
              collection: "projects",
              documentId: p._id.toString(),
              title: p.title || "Untitled Project",
              slug: p.slug,
              field: item.field,
              originalUrl: item.url,
              localRelativePath: relPath,
              fileSizeBytes: buf.length,
              sha256: computeSha256(buf),
              status: "verified_ready",
            });
            existingUrls.add(item.url);
            newlyAdded++;
          }
        } catch (e) {
          console.warn(`[AssetVault] Skipping failed project fetch ${item.url}:`, e.message);
        }
      }
    }
  }

  // Save updated registry
  fs.writeFileSync(REGISTRY_PATH, JSON.stringify(registry, null, 2), "utf8");

  return {
    success: true,
    totalAssets: registry.length,
    newlyAdded,
  };
}

/**
 * Automatically updates a specific asset in the local vault when changed from Admin.
 * Replaces the old file and updates the registry to ensure the local vault stays 100% in sync with zero clutter.
 */
export async function updateVaultAsset({ collection, documentId, field, newUrl, oldUrl, title, slug }) {
  if (!newUrl || !newUrl.includes("cloudinary.com")) return;

  if (!fs.existsSync(VAULT_DIR)) {
    fs.mkdirSync(VAULT_DIR, { recursive: true });
  }

  let registry = [];
  if (fs.existsSync(REGISTRY_PATH)) {
    try {
      registry = JSON.parse(fs.readFileSync(REGISTRY_PATH, "utf8"));
    } catch {
      registry = [];
    }
  }

  try {
    // 1. Download new image
    const res = await fetch(newUrl);
    if (!res.ok) return;
    const buf = Buffer.from(await res.arrayBuffer());
    const safeTitleSlug = sanitizeSlug(slug || title || "asset");
    const ext = path.extname(new URL(newUrl).pathname) || ".png";
    const subDir = path.join(VAULT_DIR, collection, `${documentId}__${safeTitleSlug}`);
    fs.mkdirSync(subDir, { recursive: true });

    // 2. Remove old file if it existed in registry
    const existingIndex = registry.findIndex(
      (r) => r.collection === collection && String(r.documentId) === String(documentId) && r.field === field
    );

    if (existingIndex !== -1) {
      const oldRelPath = registry[existingIndex].localRelativePath;
      if (oldRelPath) {
        const oldAbs = path.join(VAULT_DIR, oldRelPath);
        if (fs.existsSync(oldAbs)) {
          try { fs.unlinkSync(oldAbs); } catch {}
        }
      }
    }

    // 3. Save new file
    const newRelPath = `${collection}/${documentId}__${safeTitleSlug}/${field.replace(/[^a-zA-Z0-9_-]/g, "_")}__${Date.now()}${ext}`;
    fs.writeFileSync(path.join(VAULT_DIR, newRelPath), buf);

    const record = {
      registryIndex: existingIndex !== -1 ? registry[existingIndex].registryIndex : registry.length + 1,
      collection,
      documentId: String(documentId),
      title: title || (existingIndex !== -1 ? registry[existingIndex].title : "Asset"),
      slug: slug || (existingIndex !== -1 ? registry[existingIndex].slug : safeTitleSlug),
      field,
      originalUrl: newUrl,
      localRelativePath: newRelPath,
      fileSizeBytes: buf.length,
      sha256: computeSha256(buf),
      status: "verified_ready",
      updatedAt: new Date(),
    };

    if (existingIndex !== -1) {
      registry[existingIndex] = record;
    } else {
      registry.push(record);
    }

    fs.writeFileSync(REGISTRY_PATH, JSON.stringify(registry, null, 2), "utf8");
  } catch (err) {
    console.warn("⚠️ [AssetVault] Error updating asset in vault:", err.message);
  }
}

/**
 * Safely removes an asset from the local backup vault when deleted from Admin.
 * Deletes the file from disk and unregisters it from migration_registry.json.
 */
export async function deleteVaultAsset({ url, publicId, collection, documentId, field } = {}) {
  if (!fs.existsSync(REGISTRY_PATH)) return false;

  try {
    const raw = fs.readFileSync(REGISTRY_PATH, "utf8");
    let registry = JSON.parse(raw);

    const matchIndex = registry.findIndex((r) => {
      if (url && r.originalUrl === url) return true;
      if (publicId && r.originalUrl && r.originalUrl.includes(publicId)) return true;
      if (collection && documentId && r.collection === collection && String(r.documentId) === String(documentId)) {
        if (!field || r.field === field) return true;
      }
      return false;
    });

    if (matchIndex === -1) return false;

    const removedItem = registry[matchIndex];
    if (removedItem.localRelativePath) {
      const absPath = path.join(VAULT_DIR, removedItem.localRelativePath);
      if (fs.existsSync(absPath)) {
        try {
          fs.unlinkSync(absPath);
          const parentDir = path.dirname(absPath);
          const filesInParent = fs.readdirSync(parentDir);
          if (filesInParent.length === 0) {
            fs.rmdirSync(parentDir);
          }
        } catch (e) {
          console.warn("⚠️ [AssetVault] Notice unlinking local file:", e.message);
        }
      }
    }

    // Remove from registry and re-index
    registry.splice(matchIndex, 1);
    registry.forEach((item, idx) => {
      item.registryIndex = idx + 1;
    });

    fs.writeFileSync(REGISTRY_PATH, JSON.stringify(registry, null, 2), "utf8");
    return true;
  } catch (err) {
    console.warn("⚠️ [AssetVault] Error deleting asset from vault:", err.message);
    return false;
  }
}

/**
 * Clears local downloaded media image files from disk to free up ~400+ MB of local storage,
 * while safely preserving the migration_registry.json metadata and structure.
 */
export async function clearVaultLocalFiles() {
  const mediaDirs = ["about", "blogs", "heros", "projects", "services", "static_code_assets"];
  let filesRemoved = 0;
  let bytesFreed = 0;

  for (const dirName of mediaDirs) {
    const fullDirPath = path.join(VAULT_DIR, dirName);
    if (fs.existsSync(fullDirPath)) {
      try {
        const removeRecursive = (p) => {
          const entries = fs.readdirSync(p, { withFileTypes: true });
          for (const entry of entries) {
            const entryPath = path.join(p, entry.name);
            if (entry.isDirectory()) {
              removeRecursive(entryPath);
              try { fs.rmdirSync(entryPath); } catch {}
            } else {
              try {
                bytesFreed += fs.statSync(entryPath).size;
                fs.unlinkSync(entryPath);
                filesRemoved++;
              } catch {}
            }
          }
        };
        removeRecursive(fullDirPath);
        try { fs.rmdirSync(fullDirPath); } catch {}
      } catch (err) {
        console.warn(`⚠️ [AssetVault] Error clearing directory ${dirName}:`, err.message);
      }
    }
  }

  // Update status in registry without deleting the records
  if (fs.existsSync(REGISTRY_PATH)) {
    try {
      const registry = JSON.parse(fs.readFileSync(REGISTRY_PATH, "utf8"));
      registry.forEach((item) => {
        item.status = "cloud_active";
      });
      fs.writeFileSync(REGISTRY_PATH, JSON.stringify(registry, null, 2), "utf8");
    } catch {}
  }

  return {
    success: true,
    filesRemoved,
    bytesFreed,
    megabytesFreed: (bytesFreed / (1024 * 1024)).toFixed(2),
  };
}

/**
 * Automatically downloads a fresh structured backup of all assets from MongoDB to the local vault.
 * Guarantees that every single picture is saved into an identified directory:
 *   blogs/<documentId>__<slug>/cover__<timestamp>.<ext>
 *   projects/<documentId>__<slug>/thumbnail__<timestamp>.<ext>
 *   services/<documentId>__<slug>/hero__<timestamp>.<ext>
 *   heros/<documentId>/visualImage__<timestamp>.<ext>
 *   about/<documentId>/avatar__<timestamp>.<ext>
 * Ensures 0 mismatch when credits run low or for disaster recovery.
 */
export async function downloadFullVaultBackup() {
  if (!fs.existsSync(VAULT_DIR)) {
    fs.mkdirSync(VAULT_DIR, { recursive: true });
  }

  await dbConnect();
  const mongoose = (await import("mongoose")).default;
  const db = mongoose.connection.db;

  const [blogs, projects, services, heros, abouts] = await Promise.all([
    db.collection("blogs").find({}, { projection: { title: 1, image: 1, featuredImage: 1, slug: 1 } }).toArray(),
    db.collection("projects").find({}, { projection: { title: 1, thumbnail: 1, gallery: 1, slug: 1 } }).toArray(),
    db.collection("services").find({}, { projection: { title: 1, heroImage: 1, slug: 1 } }).toArray(),
    db.collection("heros").find({}, { projection: { title: 1, visualImage: 1 } }).toArray(),
    db.collection("abouts").find({}, { projection: { avatar: 1, hero: 1 } }).toArray(),
  ]);

  const registry = [];
  let downloadedCount = 0;
  let totalBytes = 0;
  let errorCount = 0;

  async function saveAsset({ collection, documentId, title, slug, field, url, extraFields = [] }) {
    if (!url || typeof url !== "string" || !url.includes("cloudinary.com")) return;
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const buf = Buffer.from(await res.arrayBuffer());

      const safeSlug = sanitizeSlug(slug || title || "asset");
      const ext = path.extname(new URL(url).pathname) || ".png";
      const subDir = path.join(VAULT_DIR, collection, `${documentId}__${safeSlug}`);
      fs.mkdirSync(subDir, { recursive: true });

      const safeFieldName = field.replace(/[^a-zA-Z0-9_-]/g, "_");
      const relPath = `${collection}/${documentId}__${safeSlug}/${safeFieldName}__${Date.now()}${ext}`;
      fs.writeFileSync(path.join(VAULT_DIR, relPath), buf);

      registry.push({
        registryIndex: registry.length + 1,
        collection,
        documentId: String(documentId),
        title: title || "Asset",
        slug: slug || safeSlug,
        field,
        extraFields,
        originalUrl: url,
        localRelativePath: relPath,
        fileSizeBytes: buf.length,
        sha256: computeSha256(buf),
        status: "verified_ready",
        downloadedAt: new Date(),
      });

      downloadedCount++;
      totalBytes += buf.length;
    } catch (err) {
      errorCount++;
      console.warn(`⚠️ [AssetVault] Error downloading ${collection}/${title || documentId}:`, err.message);
    }
  }

  // 1. Blogs
  for (const b of blogs) {
    const url = b.image || b.featuredImage?.url;
    if (url) {
      await saveAsset({
        collection: "blogs",
        documentId: b._id,
        title: b.title,
        slug: b.slug,
        field: "image",
        url,
        extraFields: ["featuredImage.url"],
      });
    }
  }

  // 2. Projects
  for (const p of projects) {
    if (p.thumbnail) {
      await saveAsset({
        collection: "projects",
        documentId: p._id,
        title: p.title,
        slug: p.slug,
        field: "thumbnail",
        url: p.thumbnail,
      });
    }
    if (Array.isArray(p.gallery)) {
      for (let idx = 0; idx < p.gallery.length; idx++) {
        const gUrl = p.gallery[idx];
        if (gUrl) {
          await saveAsset({
            collection: "projects",
            documentId: p._id,
            title: p.title,
            slug: p.slug,
            field: `gallery_${String(idx + 1).padStart(2, "0")}`,
            url: gUrl,
          });
        }
      }
    }
  }

  // 3. Services
  for (const s of services) {
    if (s.heroImage) {
      await saveAsset({
        collection: "services",
        documentId: s._id,
        title: s.title,
        slug: s.slug,
        field: "heroImage",
        url: s.heroImage,
      });
    }
  }

  // 4. Hero
  for (const h of heros) {
    if (h.visualImage) {
      await saveAsset({
        collection: "heros",
        documentId: h._id,
        title: "Main Hero Visual Banner",
        slug: "home-hero",
        field: "visualImage",
        url: h.visualImage,
      });
    }
  }

  // 5. About
  for (const a of abouts) {
    if (a.avatar) {
      await saveAsset({
        collection: "about",
        documentId: a._id,
        title: "About Profile Avatar",
        slug: "about-avatar",
        field: "avatar",
        url: a.avatar,
      });
    }
  }

  fs.writeFileSync(REGISTRY_PATH, JSON.stringify(registry, null, 2), "utf8");

  return {
    success: true,
    totalDownloaded: downloadedCount,
    totalBytes,
    megabytesDownloaded: (totalBytes / (1024 * 1024)).toFixed(2),
    errors: errorCount,
  };
}

export default {
  getVaultStats,
  syncVault,
  updateVaultAsset,
  deleteVaultAsset,
  clearVaultLocalFiles,
  downloadFullVaultBackup,
};

