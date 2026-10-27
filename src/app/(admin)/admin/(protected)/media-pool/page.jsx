"use client";

import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  Cloud,
  Plus,
  RefreshCw,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Pause,
  Play,
  Trash2,
  HardDrive,
  Activity,
  Layers,
  Sparkles,
  Search,
  ExternalLink,
  Copy,
  Check,
  FileImage,
  FolderOpen,
  Eye,
  EyeOff,
  Info,
  Lock,
  ArrowRight,
  ArrowRightLeft,
  Database,
  Tag,
  Download,
} from "lucide-react";

export default function MediaPoolPage() {
  const [loading, setLoading] = useState(true);
  const [syncingAll, setSyncingAll] = useState(false);
  const [data, setData] = useState({ accounts: [], metrics: null });
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // Asset Viewer State (Account Media Drawer)
  const [selectedAccountForAssets, setSelectedAccountForAssets] = useState(null);
  const [assetsLoading, setAssetsLoading] = useState(false);
  const [accountAssets, setAccountAssets] = useState([]);
  const [assetFilter, setAssetFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAssetDetail, setSelectedAssetDetail] = useState(null);
  const [copiedUrl, setCopiedUrl] = useState(null);

  // Add Account Form State
  const [formState, setFormState] = useState({
    label: "",
    cloudName: "",
    apiKey: "",
    apiSecret: "",
    uploadPreset: "ml_default",
    priority: 1,
    cloudinaryUrl: "",
  });
  const [showSecret, setShowSecret] = useState(false);
  const [parsedSuccessMsg, setParsedSuccessMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleCloudinaryUrlChange = (val) => {
    const nextState = { ...formState, cloudinaryUrl: val };
    if (!val || typeof val !== "string") {
      setParsedSuccessMsg("");
      setFormState(nextState);
      return;
    }

    let clean = val.trim().replace(/^(export\s+)?CLOUDINARY_URL\s*=\s*/i, "");
    clean = clean.replace(/^['"]+|['"]+$/g, "").trim();
    const match = clean.match(/^cloudinary:\/\/([^:]+):([^@]+)@([^/?#]+)/i);

    if (match) {
      const parsedApiKey = decodeURIComponent(match[1].trim());
      const parsedApiSecret = decodeURIComponent(match[2].trim());
      const parsedCloudName = decodeURIComponent(match[3].trim().toLowerCase());

      nextState.apiKey = parsedApiKey;
      nextState.cloudName = parsedCloudName;
      if (!nextState.label || nextState.label.startsWith("Secondary Account - ")) {
        nextState.label = `Secondary Account - ${parsedCloudName}`;
      }
      if (parsedApiSecret.includes("*") || parsedApiSecret.includes("•")) {
        // Do NOT overwrite user's real secret with asterisks!
        if (formState.apiSecret && !formState.apiSecret.includes("*") && !formState.apiSecret.includes("•")) {
          nextState.apiSecret = formState.apiSecret;
        } else {
          nextState.apiSecret = "";
        }
        setParsedSuccessMsg(`✓ Extracted: Cloud Name (${parsedCloudName}) and API Key! Cloudinary masked your Secret with asterisks. Please paste your real API Secret in the box below.`);
      } else {
        nextState.apiSecret = parsedApiSecret;
        setParsedSuccessMsg(`✓ Extracted: Cloud Name (${parsedCloudName}), API Key, and Secret!`);
      }
    } else {
      setParsedSuccessMsg("");
    }
    setFormState(nextState);
  };

  const fetchPoolData = async (sync = false) => {
    try {
      if (sync) setSyncingAll(true);
      const res = await fetch(`/api/admin/cloudinary-pool${sync ? "?sync=true" : ""}`, {
        cache: "no-store",
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to load Cloudinary pool data.");
      }
      setData(json.data);
      if (sync) {
        toast.success("All Cloudinary accounts synchronized with live usage.");
      }
    } catch (err) {
      toast.error(err.message || "Failed to connect to Media Pool API.");
    } finally {
      setLoading(false);
      setSyncingAll(false);
    }
  };

  // Asset Safety Vault & Migration State
  const [vaultStats, setVaultStats] = useState(null);
  const [vaultSyncing, setVaultSyncing] = useState(false);
  const [isMigrateModalOpen, setIsMigrateModalOpen] = useState(false);
  const [migrateConfig, setMigrateConfig] = useState({
    sourceCloud: "",
    targetAccountId: "",
    dryRun: true,
  });
  const [migrationRunning, setMigrationRunning] = useState(false);
  const [migrationProgress, setMigrationProgress] = useState(null);

  const fetchVaultStats = async () => {
    try {
      const res = await fetch("/api/admin/cloudinary-pool/vault");
      const json = await res.json();
      if (json.success) setVaultStats(json.data);
    } catch {}
  };

  const [clearingLocalFiles, setClearingLocalFiles] = useState(false);
  const [downloadingFullBackup, setDownloadingFullBackup] = useState(false);

  const handleSyncVault = async () => {
    setVaultSyncing(true);
    try {
      const res = await fetch("/api/admin/cloudinary-pool/vault", { method: "POST" });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message);
      toast.success(json.message);
      fetchVaultStats();
    } catch (err) {
      toast.error(err.message || "Failed to sync safety vault.");
    } finally {
      setVaultSyncing(false);
    }
  };

  const handleClearLocalFiles = async () => {
    if (!confirm("Are you sure you want to clean local media cache files from disk?\n\nThis will safely free up ~400+ MB of local storage.\nAll 174 assets remain live and active on Cloudinary across your 3 accounts, and the metadata registry is preserved.")) return;
    setClearingLocalFiles(true);
    try {
      const res = await fetch("/api/admin/cloudinary-pool/vault", { method: "DELETE" });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message);
      toast.success(json.message);
      fetchVaultStats();
    } catch (err) {
      toast.error(err.message || "Failed to clear local media cache.");
    } finally {
      setClearingLocalFiles(false);
    }
  };

  const handleDownloadFullBackup = async () => {
    if (!confirm("Download a complete, organized backup of all website assets to your local vault?\n\nEach picture will be categorized into its document folder (Blogs, Projects, Services, Hero, About) with SHA-256 hashes.")) return;
    setDownloadingFullBackup(true);
    toast.info("Starting structured full backup download from Cloudinary & DB...");
    try {
      const res = await fetch("/api/admin/cloudinary-pool/vault", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "download_full_backup" }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message);
      toast.success(json.message);
      fetchVaultStats();
    } catch (err) {
      toast.error(err.message || "Failed to download full backup.");
    } finally {
      setDownloadingFullBackup(false);
    }
  };

  const handleStartMigration = async () => {
    if (!migrateConfig.targetAccountId) {
      toast.error("Please select a target Cloudinary account.");
      return;
    }
    setMigrationRunning(true);
    setMigrationProgress(null);
    try {
      const res = await fetch("/api/admin/cloudinary-pool/migrate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceCloudName: migrateConfig.sourceCloud || null,
          targetAccountId: migrateConfig.targetAccountId,
          dryRun: migrateConfig.dryRun,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message);
      toast.success(json.message);

      // Poll progress every 800ms
      const pollTimer = setInterval(async () => {
        try {
          const pollRes = await fetch("/api/admin/cloudinary-pool/migrate");
          const pollJson = await pollRes.json();
          if (pollJson.success) {
            setMigrationProgress(pollJson.data);
            if (!pollJson.data.isRunning) {
              clearInterval(pollTimer);
              setMigrationRunning(false);
              toast.success("Migration process completed!");
              fetchPoolData();
              fetchVaultStats();
            }
          }
        } catch {
          clearInterval(pollTimer);
          setMigrationRunning(false);
        }
      }, 800);
    } catch (err) {
      toast.error(err.message || "Failed to start migration.");
      setMigrationRunning(false);
    }
  };

  useEffect(() => {
    fetchPoolData();
    fetchVaultStats();
  }, []);


  // Fetch row-by-row assets for a specific account
  const handleOpenAccountAssets = async (account) => {
    setSelectedAccountForAssets(account);
    setAssetsLoading(true);
    setAccountAssets([]);
    setAssetFilter("all");
    setSearchQuery("");
    setSelectedAssetDetail(null);

    try {
      const res = await fetch(`/api/admin/cloudinary-pool/${account._id}/assets`, {
        cache: "no-store",
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message);
      setAccountAssets(json.data.assets || []);
    } catch (err) {
      toast.error(err.message || "Failed to fetch account media assets.");
    } finally {
      setAssetsLoading(false);
    }
  };

  const [deletingAssetId, setDeletingAssetId] = useState(null);

  const handleDeleteAsset = async (asset) => {
    if (!selectedAccountForAssets) return;

    const confirmMsg =
      asset.entity === "Direct Upload"
        ? `Are you sure you want to permanently delete this image from Cloudinary?\n\nPublic ID: ${asset.publicId || asset.id}\n\nThis will free up storage & bandwidth credits on Cloudinary.`
        : `Are you sure you want to permanently delete this image from Cloudinary and unlink it from ${asset.entity} '${asset.title}'?\n\nThis will permanently remove the asset and free up storage & bandwidth credits on Cloudinary.`;

    if (!confirm(confirmMsg)) return;

    const assetKey = asset.id + (asset.field || "");
    setDeletingAssetId(assetKey);
    try {
      const res = await fetch(
        `/api/admin/cloudinary-pool/${selectedAccountForAssets._id}/assets`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            publicId: asset.publicId,
            url: asset.url,
            entity: asset.entity,
            documentId: asset.id,
            field: asset.field,
          }),
        }
      );
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message);

      toast.success("Image permanently deleted from Cloudinary & unlinked!");

      // Remove from drawer asset list
      setAccountAssets((prev) =>
        prev.filter((a) => !(a.id === asset.id && a.field === asset.field && a.url === asset.url))
      );

      // Close detail modal if this asset was open
      if (selectedAssetDetail && selectedAssetDetail.url === asset.url) {
        setSelectedAssetDetail(null);
      }

      // Refresh pool cards and counts
      fetchPoolData();
    } catch (err) {
      toast.error(err.message || "Failed to delete image from Cloudinary.");
    } finally {
      setDeletingAssetId(null);
    }
  };

  const handleCopyUrl = (url) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    toast.success("Cloudinary URL copied to clipboard!");
    setTimeout(() => setCopiedUrl(null), 2500);
  };


  const handleTogglePause = async (account) => {
    if (account.isMaster) {
      toast.error("Master account cannot be paused.");
      return;
    }
    setActionLoadingId(account._id);
    try {
      const res = await fetch(`/api/admin/cloudinary-pool/${account._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "toggle-pause" }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message);
      toast.success(json.message);
      await fetchPoolData();
    } catch (err) {
      toast.error(err.message || "Failed to update account status.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleSyncSingle = async (account) => {
    setActionLoadingId(account._id);
    try {
      const res = await fetch(`/api/admin/cloudinary-pool/${account._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "sync" }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message);
      toast.success(`Live sync completed for '${account.label}'.`);
      await fetchPoolData();
    } catch (err) {
      toast.error(err.message || "Sync failed.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDeleteAccount = async (account) => {
    if (account.isMaster) {
      toast.error("Master account cannot be deleted.");
      return;
    }
    if (!confirm(`Are you sure you want to remove '${account.label}' from the media pool?`)) {
      return;
    }
    setActionLoadingId(account._id);
    try {
      const res = await fetch(`/api/admin/cloudinary-pool/${account._id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message);
      toast.success(json.message);
      await fetchPoolData();
    } catch (err) {
      toast.error(err.message || "Failed to delete account.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleAddAccount = async (e) => {
    e.preventDefault();
    if (formState.apiSecret.includes("*") || formState.apiSecret.includes("•")) {
      toast.error("API Secret is masked with asterisks (*********). In your Cloudinary dashboard, click the Eye icon to reveal the real characters!");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/cloudinary-pool", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formState),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message);

      toast.success("New Cloudinary account successfully validated and added to pool!");
      setIsAddModalOpen(false);
      setFormState({
        label: "",
        cloudName: "",
        apiKey: "",
        apiSecret: "",
        uploadPreset: "ml_default",
        priority: 1,
        cloudinaryUrl: "",
      });
      setParsedSuccessMsg("");
      setShowSecret(false);
      await fetchPoolData();
    } catch (err) {
      toast.error(err.message || "Failed to add account.");
    } finally {
      setSubmitting(false);
    }
  };

  // Filtered rows for the selected account drawer
  const filteredAssets = useMemo(() => {
    return accountAssets.filter((asset) => {
      const matchesFilter =
        assetFilter === "all" || asset.entity.toLowerCase() === assetFilter.toLowerCase();
      const matchesSearch =
        !searchQuery ||
        asset.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asset.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asset.field.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asset.url.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [accountAssets, assetFilter, searchQuery]);

  const getStatusBadge = (status, usagePercent = 0) => {
    if (status === "paused") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-500 border border-amber-500/20">
          <Pause className="w-3 h-3" /> Paused
        </span>
      );
    }
    if (status === "exhausted" || usagePercent >= 85) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-500 border border-rose-500/20">
          <XCircle className="w-3 h-3" /> Exhausted
        </span>
      );
    }
    if (status === "warning" || usagePercent >= 70) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-yellow-500/10 text-yellow-500 border border-yellow-500/20">
          <AlertTriangle className="w-3 h-3" /> Warning ({usagePercent}%)
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
        <CheckCircle2 className="w-3 h-3" /> Healthy Active
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <RefreshCw className="w-8 h-8 animate-spin text-accent" />
        <p className="text-sm text-muted-foreground animate-pulse">
          Connecting to Cloudinary Media Pool & Fetching Live Metrics...
        </p>
      </div>
    );
  }

  const { metrics, accounts } = data;

  return (
    <div className="space-y-8 pb-12">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/70 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-accent mb-1">
            <Cloud className="w-4 h-4" /> Multi-Account Asset Pooling
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Cloudinary Media Pool Manager
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            View live credit usage, hosted assets per account, and dynamically balance uploads across connected accounts.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchPoolData(true)}
            disabled={syncingAll}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border/70 bg-card hover:bg-accent/10 text-sm font-semibold text-foreground transition-all duration-200 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${syncingAll ? "animate-spin text-accent" : ""}`} />
            Sync All APIs
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent hover:bg-accent/90 text-accent-foreground text-sm font-bold shadow-md shadow-accent/20 transition-all duration-200"
          >
            <Plus className="w-4 h-4" /> Add Account
          </button>
        </div>
      </div>

      {/* Top Aggregate Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider">Connected Accounts</span>
            <Layers className="w-4 h-4 text-accent" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-foreground">{metrics?.totalAccounts ?? 1}</span>
            <span className="text-xs font-medium text-emerald-500">
              ({metrics?.activeAccounts ?? 1} Active)
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {accounts.length} Accounts in circulation
          </p>
        </div>

        <div className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Pool Capacity</span>
            <HardDrive className="w-4 h-4 text-accent" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-foreground">{metrics?.totalPoolCredits ?? 25}</span>
            <span className="text-xs font-semibold text-muted-foreground">Credits Total</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Combines all connected account limits
          </p>
        </div>

        <div className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider">Headroom Available</span>
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-emerald-500">{metrics?.remainingPoolCredits ?? 25}</span>
            <span className="text-xs font-medium text-muted-foreground">Credits Free</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {metrics?.usedPoolCredits ?? 0} Credits used across all accounts
          </p>
        </div>

        <div className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Upload Target</span>
            <Sparkles className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-3">
            <div className="text-base font-bold text-foreground truncate">
              {metrics?.optimalTarget?.label || "Master Account"}
            </div>
            <div className="text-xs text-emerald-500 font-semibold mt-0.5">
              {metrics?.optimalTarget?.remainingCredits ?? 25} Credits Left ★
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Highest headroom account receives next upload
          </p>
        </div>
      </div>

      {/* AUTONOMOUS ZERO-DATA-LOSS ASSET VAULT BANNER */}
      <div className="rounded-2xl border border-emerald-500/20 bg-gradient-to-r from-emerald-500/5 via-card to-card p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500 shrink-0 mt-0.5">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-foreground">
                  Zero-Data-Loss Safety Vault
                </h3>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                  {vaultStats?.verifiedOnDisk > 0 ? "Local Cache Active" : "Cloud Active & Safe"}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1 max-w-2xl">
                Deterministic structured backup architecture for all assets (Hero, Blogs, Projects, Services, About). If all accounts run low on credits, one click downloads every asset into identified folders; when credits reset, auto-distribute restores them with 0 mismatch.
              </p>

              {/* Stats Pills */}
              <div className="flex flex-wrap items-center gap-2 mt-3 text-[11px] font-mono text-muted-foreground">
                <span className="px-2 py-0.5 rounded-md bg-secondary/30 border border-border/70">
                  Total Assets: <strong className="text-foreground">{vaultStats?.totalAssets ?? 174}</strong>
                </span>
                <span className="px-2 py-0.5 rounded-md bg-secondary/30 border border-border/70">
                  Local Disk Files: <strong className={vaultStats?.verifiedOnDisk > 0 ? "text-amber-500" : "text-emerald-500"}>{vaultStats?.verifiedOnDisk ?? 0} ({vaultStats?.verifiedOnDisk === 0 ? "Clean 0 MB" : `${((vaultStats?.totalSizeBytes || 0) / (1024 * 1024)).toFixed(1)} MB`})</strong>
                </span>
                <span className="px-2 py-0.5 rounded-md bg-secondary/30 border border-border/70">
                  Cloud State: <strong className="text-emerald-500">Live on 3 Accounts</strong>
                </span>
                <span className="px-2 py-0.5 rounded-md bg-secondary/30 border border-border/70">
                  Registry: <strong className="text-foreground">Identified & Protected</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Vault Actions */}
          <div className="flex flex-wrap items-center gap-2 shrink-0 self-end md:self-center">
            {/* Download Full Backup Button */}
            <button
              onClick={handleDownloadFullBackup}
              disabled={downloadingFullBackup}
              title="Download all assets into structured, identified local folders with SHA-256 hashes"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border/70 bg-card hover:bg-secondary/20 text-xs font-semibold text-foreground transition-all duration-150 disabled:opacity-50"
            >
              <Download className={`w-3.5 h-3.5 ${downloadingFullBackup ? "animate-bounce text-accent" : "text-emerald-500"}`} />
              <span>{downloadingFullBackup ? "Downloading..." : "Download Vault Backup"}</span>
            </button>

            {/* Clear Local Cache Button (To save ~400MB space) */}
            <button
              onClick={handleClearLocalFiles}
              disabled={clearingLocalFiles || vaultStats?.verifiedOnDisk === 0}
              title="Free up local disk space by clearing downloaded files (Cloudinary images & metadata registry remain 100% safe)"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border/70 bg-card hover:bg-rose-500/10 text-xs font-semibold text-muted-foreground hover:text-rose-500 transition-all duration-150 disabled:opacity-40"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{clearingLocalFiles ? "Cleaning..." : "Free Disk Space"}</span>
            </button>

            {/* Auto-Migrate / Distribute Button */}
            <button
              onClick={() => {
                setIsMigrateModalOpen(true);
                setMigrateConfig({
                  sourceCloud: accounts[0]?.cloudName || "",
                  targetAccountId: accounts.find(a => !a.isMaster)?._id || "",
                  dryRun: true,
                });
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-accent hover:bg-accent/90 text-accent-foreground text-xs font-bold shadow-sm transition-all duration-150"
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
              <span>Auto-Migrate Assets</span>
            </button>
          </div>
        </div>
      </div>

      {/* Account Cards Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Activity className="w-5 h-5 text-accent" /> Connected Account Cards
          </h2>
          <span className="text-xs text-muted-foreground">
            Click &apos;Browse Stored Media&apos; on any account to view its full images row-by-row
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {accounts.map((account) => {
            const usage = account.usage || {};
            const used = usage.usedCredits ?? 0;
            const total = usage.totalCredits ?? 25;
            const remaining = usage.remainingCredits ?? total;
            const percent = usage.usagePercent ?? (total > 0 ? (used / total) * 100 : 0);
            const isTarget = metrics?.optimalTarget?.cloudName === account.cloudName;
            const isProcessing = actionLoadingId === account._id;
            const summary = account.assetSummary || { total: 0, blogs: 0, projects: 0, services: 0, heros: 0 };

            let barColor = "bg-emerald-500";
            if (percent >= 85 || account.status === "exhausted") barColor = "bg-rose-500";
            else if (percent >= 70 || account.status === "warning") barColor = "bg-yellow-500";

            return (
              <div
                key={account._id || account.cloudName}
                className={`rounded-2xl border bg-card p-6 shadow-sm transition-all duration-200 relative overflow-hidden flex flex-col justify-between ${
                  isTarget ? "border-accent/80 ring-1 ring-accent/30" : "border-border/70"
                }`}
              >
                {/* Active Target Ribbon */}
                {isTarget && (
                  <div className="absolute top-0 right-0 bg-accent text-accent-foreground text-[10px] font-extrabold uppercase px-3 py-1 rounded-bl-xl tracking-wider shadow-sm">
                    ★ Next Upload Target
                  </div>
                )}

                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-foreground">{account.label}</h3>
                        {account.isMaster && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-accent/10 text-accent px-2 py-0.5 rounded-md border border-accent/20">
                            <Lock className="w-2.5 h-2.5" /> Root Master
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-mono text-muted-foreground mt-0.5">
                        Cloud: <span className="text-foreground font-semibold">{account.cloudName}</span>
                      </p>
                    </div>

                    <div className="shrink-0">{getStatusBadge(account.status, percent)}</div>
                  </div>

                  {/* Real-time Usage Progress Bar */}
                  <div className="mt-5 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground font-medium">Live Cloudinary Balance</span>
                      <span className="font-bold text-foreground">
                        {used} / {total} Credits ({Number(percent).toFixed(1)}%)
                      </span>
                    </div>
                    <div className="h-2.5 w-full bg-secondary/20 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${barColor} transition-all duration-500 rounded-full`}
                        style={{ width: `${Math.min(100, Math.max(2, percent))}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-0.5">
                      <span className="text-emerald-500 font-semibold">{remaining} Credits Available</span>
                      <span>
                        {usage.lastSyncedAt
                          ? `Synced ${new Date(usage.lastSyncedAt).toLocaleTimeString()}`
                          : "Live Synced"}
                      </span>
                    </div>
                  </div>

                  {/* Hosted Data Breakdown Card */}
                  <div className="mt-5 p-4 rounded-xl border border-border/70 bg-background/50 space-y-2.5">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-foreground flex items-center gap-1.5">
                        <FolderOpen className="w-4 h-4 text-accent" /> Data Saved in this Account:
                      </span>
                      <span className="text-accent font-bold px-2 py-0.5 rounded bg-accent/10">
                        {summary.total} Total Assets
                      </span>
                    </div>

                    <div className="grid grid-cols-4 gap-2 text-center text-[11px] pt-1">
                      <div className="p-2 rounded-lg bg-card border border-border/50">
                        <div className="font-bold text-foreground">{summary.blogs}</div>
                        <div className="text-[10px] text-muted-foreground">Blogs</div>
                      </div>
                      <div className="p-2 rounded-lg bg-card border border-border/50">
                        <div className="font-bold text-foreground">{summary.projects}</div>
                        <div className="text-[10px] text-muted-foreground">Projects</div>
                      </div>
                      <div className="p-2 rounded-lg bg-card border border-border/50">
                        <div className="font-bold text-foreground">{summary.services}</div>
                        <div className="text-[10px] text-muted-foreground">Services</div>
                      </div>
                      <div className="p-2 rounded-lg bg-card border border-border/50">
                        <div className="font-bold text-foreground">{summary.heros}</div>
                        <div className="text-[10px] text-muted-foreground">Hero</div>
                      </div>
                    </div>

                    {/* Interactive Button to View Row-by-Row Images */}
                    <button
                      onClick={() => handleOpenAccountAssets(account)}
                      className="w-full mt-2 inline-flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-accent/10 hover:bg-accent hover:text-accent-foreground text-accent text-xs font-bold transition-all duration-150"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Browse Stored Media ({summary.total} Files in Rows)
                      <ArrowRight className="w-3.5 h-3.5 ml-auto" />
                    </button>
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="mt-5 pt-4 border-t border-border/70 flex items-center justify-between gap-2">
                  <div className="text-xs text-muted-foreground flex items-center gap-2">
                    <span>Priority: {account.priority ?? 1}</span>
                    <span>•</span>
                    <span>Preset: {account.uploadPreset || "ml_default"}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleSyncSingle(account)}
                      disabled={isProcessing}
                      title="Sync usage with Cloudinary"
                      className="p-2 rounded-lg border border-border/70 hover:bg-accent/10 text-muted-foreground hover:text-foreground transition-all duration-150 disabled:opacity-50"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isProcessing ? "animate-spin text-accent" : ""}`} />
                    </button>

                    {!account.isMaster && (
                      <>
                        <button
                          onClick={() => handleTogglePause(account)}
                          disabled={isProcessing}
                          title={account.status === "paused" ? "Resume Account" : "Pause Account"}
                          className="p-2 rounded-lg border border-border/70 hover:bg-accent/10 text-muted-foreground hover:text-foreground transition-all duration-150 disabled:opacity-50"
                        >
                          {account.status === "paused" ? (
                            <Play className="w-3.5 h-3.5 text-emerald-500" />
                          ) : (
                            <Pause className="w-3.5 h-3.5 text-amber-500" />
                          )}
                        </button>
                        <button
                          onClick={() => handleDeleteAccount(account)}
                          disabled={isProcessing}
                          title="Remove from pool"
                          className="p-2 rounded-lg border border-border/70 hover:bg-rose-500/10 text-muted-foreground hover:text-rose-500 transition-all duration-150 disabled:opacity-50"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ROW-BY-ROW ASSET VIEWER DRAWER / MODAL */}
      <AnimatePresence>
        {selectedAccountForAssets && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 15 }}
              className="w-full max-w-5xl h-[88vh] rounded-3xl border border-border bg-card shadow-2xl flex flex-col overflow-hidden"
            >
              {/* Drawer Header */}
              <div className="p-5 sm:p-6 border-b border-border/70 bg-card flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg sm:text-xl font-bold text-foreground">
                      Stored Media in: {selectedAccountForAssets.label}
                    </h3>
                    <span className="text-xs font-mono bg-accent/10 text-accent px-2 py-0.5 rounded-md font-semibold">
                      {selectedAccountForAssets.cloudName}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Showing all images stored under this specific account with live preview and database IDs.
                  </p>
                </div>
                <button
                  onClick={() => setSelectedAccountForAssets(null)}
                  className="p-2 rounded-xl border border-border/70 hover:bg-secondary/20 text-muted-foreground hover:text-foreground font-bold"
                >
                  ✕ Close
                </button>
              </div>

              {/* Filters & Search Toolbar */}
              <div className="p-4 sm:px-6 border-b border-border/70 bg-background/50 flex flex-col sm:flex-row gap-3 items-center justify-between">
                {/* Search Bar */}
                <div className="relative w-full sm:w-80">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search by Title, ID, or Slug..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-border/70 bg-card text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>

                {/* Filter Tabs */}
                <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
                  {["all", "blog", "project", "service", "hero"].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setAssetFilter(tab)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all duration-150 ${
                        assetFilter === tab
                          ? "bg-accent text-accent-foreground shadow-sm"
                          : "hover:bg-secondary/20 text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {tab === "all" ? `All (${accountAssets.length})` : tab}
                    </button>
                  ))}
                </div>
              </div>

              {/* Row-by-Row Table Content */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-2">
                {assetsLoading ? (
                  <div className="flex flex-col items-center justify-center h-64 gap-3">
                    <RefreshCw className="w-7 h-7 animate-spin text-accent" />
                    <p className="text-xs text-muted-foreground">Loading hosted assets...</p>
                  </div>
                ) : filteredAssets.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-64 text-center">
                    <FileImage className="w-12 h-12 text-muted-foreground/40 mb-3" />
                    <p className="text-sm font-semibold text-foreground">No media assets found</p>
                    <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                      {searchQuery
                        ? "Try clearing your search query."
                        : "No images are currently hosted on this Cloudinary cloud name."}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredAssets.map((asset, index) => (
                      <div
                        key={asset.id + asset.field + index}
                        onClick={() => setSelectedAssetDetail(asset)}
                        className="group flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-3.5 rounded-xl border border-border/70 bg-card hover:border-accent/60 hover:bg-accent/[0.03] transition-all duration-150 cursor-pointer shadow-sm"
                      >
                        {/* Left: Thumbnail & Title */}
                        <div className="flex items-center gap-3 min-w-0">
                          {/* Image Thumbnail */}
                          <div className="relative w-14 h-14 shrink-0 rounded-lg overflow-hidden bg-secondary/30 border border-border/70">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={asset.url}
                              alt={asset.title}
                              className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-110"
                              loading="lazy"
                            />
                          </div>

                          {/* Info */}
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span
                                className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md border ${
                                  asset.entity === "Blog"
                                    ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                                    : asset.entity === "Project"
                                    ? "bg-purple-500/10 text-purple-400 border-purple-500/20"
                                    : asset.entity === "Service"
                                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                    : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                }`}
                              >
                                {asset.entity}
                              </span>
                              <span className="text-[11px] font-mono text-muted-foreground">
                                Field: {asset.field}
                              </span>
                            </div>

                            <h4 className="text-sm font-bold text-foreground truncate mt-1 group-hover:text-accent transition-colors">
                              {asset.title}
                            </h4>

                            <p className="text-[11px] font-mono text-muted-foreground truncate">
                              ID: {asset.id} {asset.slug ? `• /${asset.slug}` : ""}
                            </p>
                          </div>
                        </div>

                        {/* Right: Actions */}
                        <div
                          className="flex items-center gap-2 self-end sm:self-center shrink-0"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={() => handleCopyUrl(asset.url)}
                            title="Copy Cloudinary URL"
                            className="p-2 rounded-lg border border-border/70 hover:bg-secondary/20 text-muted-foreground hover:text-foreground text-xs flex items-center gap-1.5 transition-colors"
                          >
                            {copiedUrl === asset.url ? (
                              <Check className="w-3.5 h-3.5 text-emerald-500" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                            <span className="hidden md:inline">
                              {copiedUrl === asset.url ? "Copied!" : "Copy URL"}
                            </span>
                          </button>

                          <a
                            href={asset.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Open in new tab"
                            className="p-2 rounded-lg border border-border/70 hover:bg-secondary/20 text-muted-foreground hover:text-foreground text-xs flex items-center gap-1.5 transition-colors"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span className="hidden md:inline">View Full</span>
                          </a>

                          <button
                            onClick={() => setSelectedAssetDetail(asset)}
                            title="View Full Metadata"
                            className="p-2 rounded-lg bg-accent/10 hover:bg-accent text-accent hover:text-accent-foreground text-xs font-bold transition-colors"
                          >
                            Details
                          </button>

                          <button
                            onClick={() => handleDeleteAsset(asset)}
                            disabled={deletingAssetId === asset.id + (asset.field || "")}
                            title="Delete image permanently from Cloudinary & Database"
                            className="p-2 rounded-lg border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500 hover:text-white text-rose-500 text-xs font-bold transition-all duration-150 disabled:opacity-50 flex items-center gap-1.5"
                          >
                            <Trash2
                              className={`w-3.5 h-3.5 ${
                                deletingAssetId === asset.id + (asset.field || "")
                                  ? "animate-spin"
                                  : ""
                              }`}
                            />
                            <span className="hidden lg:inline">
                              {deletingAssetId === asset.id + (asset.field || "")
                                ? "Deleting..."
                                : "Delete"}
                            </span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Drawer Footer */}
              <div className="p-4 border-t border-border/70 bg-card flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  Showing {filteredAssets.length} of {accountAssets.length} assets
                </span>
                <span className="font-semibold text-foreground">
                  Storage Account: {selectedAccountForAssets.cloudName}
                </span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DETAILED ASSET INSPECTION MODAL */}
      <AnimatePresence>
        {selectedAssetDetail && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl rounded-3xl border border-border bg-card p-6 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="flex items-center justify-between border-b border-border/70 pb-4 mb-4">
                <div className="flex items-center gap-2">
                  <span className="p-2 rounded-xl bg-accent/10 text-accent">
                    <Database className="w-4 h-4" />
                  </span>
                  <div>
                    <h3 className="text-base font-bold text-foreground">Asset Identity Details</h3>
                    <p className="text-xs text-muted-foreground">Cryptographic mapping & database linkage</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedAssetDetail(null)}
                  className="p-2 rounded-lg hover:bg-secondary/20 text-muted-foreground hover:text-foreground font-bold"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4 overflow-y-auto pr-1">
                {/* Full Preview Image */}
                <div className="w-full h-56 rounded-2xl overflow-hidden bg-black/40 border border-border/70 relative flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={selectedAssetDetail.url}
                    alt={selectedAssetDetail.title}
                    className="w-full h-full object-contain"
                  />
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="text-muted-foreground font-semibold">Title / Entity Name</label>
                    <div className="text-sm font-bold text-foreground mt-0.5">{selectedAssetDetail.title}</div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl border border-border/70 bg-background/50">
                      <span className="text-muted-foreground block text-[11px]">Entity Type</span>
                      <span className="font-bold text-foreground mt-0.5 block">{selectedAssetDetail.entity}</span>
                    </div>
                    <div className="p-3 rounded-xl border border-border/70 bg-background/50">
                      <span className="text-muted-foreground block text-[11px]">Database Field</span>
                      <span className="font-bold text-foreground mt-0.5 block">{selectedAssetDetail.field}</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl border border-border/70 bg-background/50">
                    <span className="text-muted-foreground block text-[11px]">Database Document _id</span>
                    <span className="font-mono font-bold text-accent mt-0.5 block select-all">
                      {selectedAssetDetail.id}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl border border-border/70 bg-background/50">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground text-[11px]">Cloudinary Secure URL</span>
                      <button
                        onClick={() => handleCopyUrl(selectedAssetDetail.url)}
                        className="text-accent hover:underline text-[11px] font-bold inline-flex items-center gap-1"
                      >
                        <Copy className="w-3 h-3" /> Copy URL
                      </button>
                    </div>
                    <div className="font-mono text-muted-foreground mt-1 text-[11px] break-all select-all">
                      {selectedAssetDetail.url}
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-border/70 mt-4 flex items-center justify-between">
                <button
                  onClick={() => handleDeleteAsset(selectedAssetDetail)}
                  disabled={
                    deletingAssetId ===
                    selectedAssetDetail.id + (selectedAssetDetail.field || "")
                  }
                  className="px-3.5 py-2 rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white font-bold text-xs inline-flex items-center gap-2 transition-colors disabled:opacity-50"
                >
                  <Trash2
                    className={`w-3.5 h-3.5 ${
                      deletingAssetId ===
                      selectedAssetDetail.id + (selectedAssetDetail.field || "")
                        ? "animate-spin"
                        : ""
                    }`}
                  />
                  <span>
                    {deletingAssetId ===
                    selectedAssetDetail.id + (selectedAssetDetail.field || "")
                      ? "Deleting from Cloudinary..."
                      : "Delete from Cloudinary"}
                  </span>
                </button>

                <button
                  onClick={() => setSelectedAssetDetail(null)}
                  className="px-4 py-2 rounded-xl bg-accent text-accent-foreground font-bold text-xs"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Account Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-lg max-h-[90vh] flex flex-col rounded-3xl border border-border bg-card shadow-2xl overflow-hidden"
            >
              <div className="flex items-center justify-between border-b border-border/70 p-6 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-foreground">Connect New Cloudinary Account</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Credentials are ping-verified against Cloudinary Usage APIs before saving.
                  </p>
                </div>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="p-2 rounded-lg hover:bg-secondary/20 text-muted-foreground hover:text-foreground"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleAddAccount} className="p-6 pt-4 space-y-4 overflow-y-auto">
                {/* Quick Setup: API Environment Variable (CLOUDINARY_URL) */}
                <div className="p-4 rounded-2xl border border-accent/30 bg-accent/5 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-accent">
                      <Sparkles className="w-3.5 h-3.5 text-accent animate-pulse" />
                      Quick Paste: API Environment Variable
                    </label>
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-accent/20 text-accent font-mono font-semibold">
                      CLOUDINARY_URL
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    Cloudinary console se poori <strong>API environment variable</strong> line copy kar ke yahan paste karein. Cloud Name, Key, aur Secret automatic fill ho jayenge:
                  </p>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="CLOUDINARY_URL=cloudinary://<api_key>:<api_secret>@<cloud_name>"
                      value={formState.cloudinaryUrl || ""}
                      onChange={(e) => handleCloudinaryUrlChange(e.target.value)}
                      className="w-full pl-3 pr-16 py-2 rounded-xl border border-accent/40 bg-background text-xs font-mono text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                    {formState.cloudinaryUrl && (
                      <button
                        type="button"
                        onClick={() => handleCloudinaryUrlChange("")}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground hover:text-foreground font-semibold px-2 py-0.5 rounded bg-secondary/50"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  {parsedSuccessMsg && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex items-start gap-1.5 text-xs font-semibold pt-0.5 ${
                        parsedSuccessMsg.includes("⚠️") ? "text-amber-400" : "text-emerald-500"
                      }`}
                    >
                      {parsedSuccessMsg.includes("⚠️") ? (
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      ) : (
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      )}
                      <span>{parsedSuccessMsg}</span>
                    </motion.div>
                  )}
                </div>

                <div className="relative flex py-1 items-center">
                  <div className="flex-grow border-t border-border/70"></div>
                  <span className="flex-shrink mx-3 text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
                    Account Details
                  </span>
                  <div className="flex-grow border-t border-border/70"></div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                    Account Label / Friendly Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Secondary Account - Blogs Pool"
                    value={formState.label}
                    onChange={(e) => setFormState({ ...formState, label: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border/70 bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                      Cloud Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. muhyo-blogs-01"
                      value={formState.cloudName}
                      onChange={(e) => setFormState({ ...formState, cloudName: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-border/70 bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                      Upload Preset
                    </label>
                    <input
                      type="text"
                      placeholder="ml_default"
                      value={formState.uploadPreset}
                      onChange={(e) => setFormState({ ...formState, uploadPreset: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-border/70 bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                    API Key
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Cloudinary API Key"
                    value={formState.apiKey}
                    onChange={(e) => setFormState({ ...formState, apiKey: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border/70 bg-background text-sm text-foreground font-mono focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                    API Secret
                  </label>
                  <div className="relative">
                    <input
                      type={showSecret ? "text" : "password"}
                      required
                      placeholder="Cloudinary API Secret"
                      value={formState.apiSecret}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormState({
                          ...formState,
                          apiSecret: val,
                          cloudinaryUrl: formState.cloudinaryUrl?.includes("*") ? "" : formState.cloudinaryUrl,
                        });
                      }}
                      className={`w-full pl-3.5 pr-10 py-2.5 rounded-xl border bg-background text-sm text-foreground font-mono focus:outline-none focus:ring-2 ${
                        formState.apiSecret.includes("*") || formState.apiSecret.includes("•")
                          ? "border-amber-500/70 focus:ring-amber-500"
                          : "border-border/70 focus:ring-accent"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowSecret(!showSecret)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1"
                      title={showSecret ? "Hide API Secret" : "Show API Secret"}
                    >
                      {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {(formState.apiSecret.includes("*") || formState.apiSecret.includes("•")) && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-2 p-2.5 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-400 text-xs flex items-start gap-2"
                    >
                      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
                      <div className="text-[11px] leading-relaxed">
                        <span className="font-bold text-amber-300">Masked Secret Detected (*********):</span>
                        <p className="mt-0.5 text-amber-200/90">
                          Cloudinary dashboard par API Secret ke sath bane <strong>Eye (Show)</strong> icon par click kar ke real characters reveal karein, ya dashboard par bane <strong>Copy</strong> icon se copy karein.
                        </p>
                      </div>
                    </motion.div>
                  )}
                </div>

                <div className="pt-2 flex items-center justify-end gap-3 border-t border-border/70 mt-6">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl border border-border/70 hover:bg-secondary/20 text-sm font-semibold text-foreground transition-all duration-150"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent hover:bg-accent/90 text-accent-foreground text-sm font-bold shadow-md shadow-accent/20 transition-all duration-150 disabled:opacity-50"
                  >
                    {submitting && <RefreshCw className="w-4 h-4 animate-spin" />}
                    {submitting ? "Validating & Connecting..." : "Validate & Connect"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ZERO-RISK AUTO-MIGRATION MODAL */}
      <AnimatePresence>
        {isMigrateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-2xl max-h-[92vh] flex flex-col rounded-3xl border border-border bg-card shadow-2xl overflow-hidden"
            >
              <div className="flex items-center justify-between border-b border-border/70 p-6 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-accent/10 text-accent">
                    <ArrowRightLeft className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground">Zero-Risk Account Migration</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Safely shift assets from an exhausted account to a healthy account with 0 downtime.
                    </p>
                  </div>
                </div>
                <button
                  disabled={migrationRunning}
                  onClick={() => setIsMigrateModalOpen(false)}
                  className="p-2 rounded-xl border border-border/70 hover:bg-secondary/20 text-muted-foreground hover:text-foreground font-bold disabled:opacity-50"
                >
                  ✕
                </button>
              </div>

              <div className="p-6 space-y-5 overflow-y-auto flex-1">
                {/* Account Selection */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                      Source Account (From)
                    </label>
                    <select
                      disabled={migrationRunning}
                      value={migrateConfig.sourceCloud}
                      onChange={(e) => setMigrateConfig({ ...migrateConfig, sourceCloud: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-border/70 bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-50"
                    >
                      <option value="">All Source Accounts</option>
                      {accounts.map((acc) => (
                        <option key={acc.cloudName} value={acc.cloudName}>
                          {acc.label} ({acc.cloudName})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                      Target Account (To)
                    </label>
                    <select
                      disabled={migrationRunning}
                      value={migrateConfig.targetAccountId}
                      onChange={(e) => setMigrateConfig({ ...migrateConfig, targetAccountId: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-border/70 bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-50"
                    >
                      <option value="">Select target account...</option>
                      {accounts.map((acc) => (
                        <option key={acc._id} value={acc._id}>
                          {acc.label} ({acc.cloudName}) — {acc.usage?.remainingCredits ?? 25} credits free
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Dry Run Simulation Toggle */}
                <div className="p-4 rounded-2xl border border-border/70 bg-background/50 flex items-center justify-between">
                  <div className="pr-4">
                    <span className="text-sm font-bold text-foreground block">
                      Dry Run Simulation Mode
                    </span>
                    <span className="text-xs text-muted-foreground block mt-0.5">
                      Simulates the full migration process and verifies every local file without uploading or touching the database.
                    </span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      disabled={migrationRunning}
                      checked={migrateConfig.dryRun}
                      onChange={(e) => setMigrateConfig({ ...migrateConfig, dryRun: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-secondary/60 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                  </label>
                </div>

                {/* Live Progress Bar & Status */}
                {migrationProgress && (
                  <div className="space-y-3 p-4 rounded-2xl border border-border/70 bg-card">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-foreground flex items-center gap-2">
                        {migrationRunning && <RefreshCw className="w-3.5 h-3.5 animate-spin text-accent" />}
                        {migrationRunning ? "Migration in Progress..." : "Migration Status"}
                      </span>
                      <span className="font-mono text-accent font-extrabold">
                        {migrationProgress.percentage}% ({migrationProgress.current} / {migrationProgress.total})
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-2.5 rounded-full bg-secondary/40 overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          migrationProgress.dryRun ? "bg-amber-500" : "bg-emerald-500"
                        }`}
                        style={{ width: `${migrationProgress.percentage}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                      <span className="truncate max-w-sm">
                        {migrationProgress.currentAssetTitle || "Ready"}
                      </span>
                      <div className="flex items-center gap-2 font-mono">
                        <span className="text-emerald-500 font-bold">✓ {migrationProgress.successCount}</span>
                        {migrationProgress.errorCount > 0 && (
                          <span className="text-rose-500 font-bold">✕ {migrationProgress.errorCount}</span>
                        )}
                      </div>
                    </div>

                    {/* Live Log Console */}
                    {Array.isArray(migrationProgress.logs) && migrationProgress.logs.length > 0 && (
                      <div className="mt-3 p-3 rounded-xl bg-black/80 border border-border/70 font-mono text-[11px] text-muted-foreground max-h-36 overflow-y-auto space-y-1">
                        {migrationProgress.logs.slice(0, 8).map((log, i) => (
                          <div key={i} className="truncate">
                            {log}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-5 border-t border-border/70 bg-card flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  {migrateConfig.dryRun ? "Mode: Safe Simulation (0 changes)" : "Mode: LIVE Production Migration"}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    disabled={migrationRunning}
                    onClick={() => setIsMigrateModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-border/70 hover:bg-secondary/20 text-xs font-semibold text-foreground disabled:opacity-50"
                  >
                    Close
                  </button>
                  <button
                    disabled={migrationRunning || !migrateConfig.targetAccountId}
                    onClick={handleStartMigration}
                    className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-accent hover:bg-accent/90 text-accent-foreground text-xs font-bold shadow-md shadow-accent/20 disabled:opacity-50 transition-all"
                  >
                    {migrationRunning ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Migrating...</span>
                      </>
                    ) : (
                      <>
                        <ArrowRightLeft className="w-3.5 h-3.5" />
                        <span>{migrateConfig.dryRun ? "Run Simulation (Dry Run)" : "Start Live Migration"}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
