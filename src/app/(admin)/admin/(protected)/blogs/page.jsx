"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import useAdminStore from "@/lib/store/adminStore";
import { getSafeImageSrc } from "@/lib/images/getSafeImageSrc";
import { getBlogImageAlt } from "@/lib/blogImageAlt";
import FormModal from "@/components/admin/FormModal";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { z } from "zod";
import { toast } from "sonner";
import { uploadPendingImages } from "@/lib/uploadHelper";
import ImageUploader from "@/components/admin/ImageUploader";
import { Controller } from "react-hook-form";
import { AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { Sparkles, CheckCircle2, Mail, RefreshCcw, Copy, BookOpen, Search, Pencil, Trash2, ExternalLink, Star, Plus, Download, Upload, Share2, Clock3, Save, X, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, BrainCircuit, Target } from "lucide-react";
import AIBlogProgress from "@/components/admin/AIBlogProgress";
import SocialShareKitModal from "@/components/admin/SocialShareKitModal";
import BloggerPostModal from "@/components/admin/BloggerPostModal";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ListChecks } from "lucide-react";
import AdminPageLoader from "@/components/admin/AdminPageLoader";

const blogSchema = z.object({
  title: z.string().min(10, "Title is too short for SEO"),
  slug: z.string().min(3, "Slug is required"),
  summary: z.string().min(20, "Summary must be descriptive"),
  content: z.string().min(50, "Content is required"),
  category: z.string().min(2, "Category is required"),
  tags: z
    .string()
    .transform((val) => (val ? val.split(",").map((s) => s.trim()) : [])),
  image: z.array(z.any()).min(1, "Feature image is required"),
  featured: z.boolean().default(false),
  readTime: z.string().default("5 min read"),
  publishStatus: z.enum(["draft", "pending", "published"]).default("draft"),
});

export default function BlogsPage() {
  const router = useRouter();
  const {
    blogs,
    blogsCacheHydrated,
    blogsLastFetchedAt,
    fetchBlogs,
    addBlog,
    updateBlog,
    deleteBlog,
    reorderBlogs,
  } = useAdminStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isAIProgressOpen, setIsAIProgressOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [autoGenerateImages, setAutoGenerateImages] = useState(false);
  const [blogSearch, setBlogSearch] = useState("");
  const [blogDateFilter, setBlogDateFilter] = useState("");
  const [blogFeaturedFilter, setBlogFeaturedFilter] = useState("all");
  const [blogStatusFilter, setBlogStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 21;
  const [openedSocialKitIds, setOpenedSocialKitIds] = useState(() => new Set());
  // Editorial wording follows the admin request: ascending = newest first.
  const [blogSortDirection, setBlogSortDirection] = useState("ascending");

  useEffect(() => {
    setCurrentPage(1);
  }, [blogSearch, blogDateFilter, blogFeaturedFilter, blogStatusFilter, blogSortDirection]);
  const [automationSettings, setAutomationSettings] = useState({ enabled: true, dailyQuantity: 1, intervalHours: 24 });
  const [automationSettingsLoading, setAutomationSettingsLoading] = useState(true);
  const [automationSettingsSaving, setAutomationSettingsSaving] = useState(false);
  const [importing, setImporting] = useState(false);

  const [selectedBloggerBlog, setSelectedBloggerBlog] = useState(null);
  const [isBloggerModalOpen, setIsBloggerModalOpen] = useState(false);
  const [inspectedBlog, setInspectedBlog] = useState(null);

  const isAnyFilterActive = Boolean(blogSearch || blogDateFilter || blogFeaturedFilter !== "all" || blogStatusFilter !== "all" || blogSortDirection !== "ascending");

  const handleClearFilters = () => {
    setBlogSearch("");
    setBlogDateFilter("");
    setBlogFeaturedFilter("all");
    setBlogStatusFilter("all");
    setBlogSortDirection("ascending");
  };

  // Sync entries on mount
  useEffect(() => {
    fetchBlogs();
  }, [fetchBlogs]);

  useEffect(() => {
    try {
      const savedIds = JSON.parse(window.localStorage.getItem("admin:openedSocialKits") || "[]");
      if (Array.isArray(savedIds)) setOpenedSocialKitIds(new Set(savedIds.map(String)));
    } catch {}
  }, []);

  const markSocialKitOpened = (blogId) => {
    const id = String(blogId);
    setOpenedSocialKitIds((current) => {
      const next = new Set(current);
      next.add(id);
      try {
        window.localStorage.setItem("admin:openedSocialKits", JSON.stringify([...next]));
      } catch {}
      return next;
    });
  };

  useEffect(() => {
    let active = true;
    fetch("/api/admin/blog-automation-settings", { cache: "no-store" })
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "Automation settings could not be loaded.");
        if (active) setAutomationSettings(result.data);
      })
      .catch((error) => toast.error(error.message))
      .finally(() => { if (active) setAutomationSettingsLoading(false); });
    return () => { active = false; };
  }, []);

  // Socket.IO provides the immediate update. While an emailed image is still
  // pending, this small polling fallback keeps Vercel/serverless deployments in
  // sync too, where a persistent socket server may be intentionally disabled.
  useEffect(() => {
    const hasPendingExternalUpload = blogs.some((blog) => {
      const hasImage = Boolean(blog.image || blog.featuredImage?.url);
      return (
        blog.aiGenerated &&
        !hasImage &&
        ["pending", "failed", "manual_required", "retry_pending"].includes(
          blog.imageStatus || "pending",
        )
      );
    });

    if (!hasPendingExternalUpload) return undefined;

    const intervalId = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        fetchBlogs({ force: true });
      }
    }, 5000);

    return () => window.clearInterval(intervalId);
  }, [blogs, fetchBlogs]);

  useEffect(() => {
    const saved = window.localStorage.getItem("admin:autoGenerateBlogImages");
    if (saved !== "true") return undefined;

    const frame = window.requestAnimationFrame(() => {
      setAutoGenerateImages(true);
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  const handleAutoImageToggle = () => {
    setAutoGenerateImages((current) => {
      const next = !current;
      window.localStorage.setItem("admin:autoGenerateBlogImages", String(next));
      toast.success(
        next
          ? "Auto image generation enabled."
          : "Auto image generation off. Prompt email will be sent instead.",
      );
      return next;
    });
  };

  const handleGenerateBloggerForBlog = (blog) => {
    if (!blog._id || blog._isFromDataJs) {
      toast.error("Template articles cannot be linked to Blogger. Save to database first.");
      return;
    }
    setSelectedBloggerBlog(blog);
    setIsBloggerModalOpen(true);
  };

  const columns = [
    {
      key: "status",
      label: "Status",
      render: (item) => (
        <div
          className="flex items-center gap-2"
          title={
            item._isFromDataJs
              ? "Template - Not yet uploaded to database"
              : "Uploaded to database"
          }
        >
          {!item._isFromDataJs && (
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-green-500 shadow-lg shadow-green-500/50" />
              <span className="text-[9px] font-black text-green-400 uppercase tracking-tighter">
                Uploaded
              </span>
            </div>
          )}
          {item._isFromDataJs && (
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full border border-border" />
              <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-tighter">
                Template
              </span>
            </div>
          )}
        </div>
      ),
    },
    {
      key: "publishStatus",
      label: "Publish Status",
      render: (item) => (
        <div className="flex flex-col gap-1 text-[10px] font-black uppercase tracking-widest">
          {item._isFromDataJs ? (
            <span className="text-muted-foreground">Template</span>
          ) : (
            <span
              className={
                item.publishStatus === "published"
                  ? "text-green-500"
                  : item.publishStatus === "pending"
                    ? "text-amber-500"
                    : "text-muted-foreground"
              }
            >
              {item.publishStatus || "draft"}
            </span>
          )}
        </div>
      ),
    },
    {
      key: "image",
      label: "Visual",
      render: (item) => (
        <div className="w-16 h-10 rounded-lg overflow-hidden border border-border shadow-lg bg-muted/50 flex items-center justify-center">
          <Image
            src={getSafeImageSrc(item.image || item.images?.[0])}
            alt={getBlogImageAlt(item)}
            width={64}
            height={40}
            sizes="64px"
            className="w-full h-full object-cover"
          />
        </div>
      ),
    },
    { key: "title", label: "Headline Info" },
    { key: "category", label: "Category" },
    {
      key: "createdAt",
      label: "Timeline",
      render: (item) => (
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
          {item.createdAt
            ? format(new Date(item.createdAt), "MMM d, yyyy")
            : "Draft"}
        </span>
      ),
    },
    {
      key: "featured",
      label: "Featured",
      render: (item) => (
        <span
          className={`px-2 py-1 rounded text-[8px] font-black uppercase ${item.featured ? "bg-amber-500/10 text-amber-500" : "bg-muted text-muted-foreground"}`}
        >
          {item.featured ? "Featured" : "Standard"}
        </span>
      ),
    },
    {
      key: "ai_actions",
      label: "AI Status",
      render: (item) => (
        <div className="w-full space-y-2">
          {/* Row 1: Image & Prompt Controls Toolbar (3 Equal Width Theme-Adaptive Unique Colored Buttons) */}
          <div className="grid grid-cols-3 gap-1.5 w-full rounded-xl border border-white/[0.08] bg-slate-950/50 p-1.5 shadow-inner">
            {/* Button 1: Send Prompt / Gen Image / Status (Amber Theme) */}
            {item.aiGenerated &&
            (!item.imageStatus ||
              item.imageStatus === "failed" ||
              item.imageStatus === "manual_required" ||
              item.imageStatus === "retry_pending" ||
              (!item.image && !item.featuredImage?.url)) ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedBlogForImage(item);
                  setIsAIProgressOpen(true);
                }}
                className="w-full h-8.5 rounded-xl border border-amber-400/50 bg-amber-500/20 hover:bg-amber-500/35 hover:border-amber-400/80 transition-all flex items-center justify-center gap-1 font-black text-[9px] uppercase tracking-wider shadow-sm backdrop-blur-md animate-pulse"
                style={{ color: "#fcd34d" }}
              >
                <Sparkles className="w-3 h-3 text-amber-300" />
                {autoGenerateImages ? "Gen Image" : "Send Prompt"}
              </button>
            ) : item.aiGenerated &&
              ["completed", "generated", "uploaded"].includes(item.imageStatus) &&
              (item.image || item.featuredImage?.url) ? (
              <div
                className="w-full h-8.5 flex items-center justify-center gap-1 rounded-xl border border-emerald-400/40 bg-emerald-500/20 text-[9px] font-black uppercase tracking-wider backdrop-blur-md"
                style={{ color: "#6ee7b7" }}
              >
                <CheckCircle2 className="w-3 h-3 text-emerald-400" /> {item.imageStatus}
              </div>
            ) : (
              <div className="w-full h-8.5 flex items-center justify-center rounded-xl border border-white/10 bg-white/5 text-[9px] text-slate-300 font-bold uppercase tracking-wider">
                Manual
              </div>
            )}

            {/* Button 2: Regenerate Prompt & Save DB (Emerald Theme) */}
            {!item._isFromDataJs && item._id ? (
              <button
                onClick={async (e) => {
                  e.stopPropagation();
                  const toastId = toast.loading("Generating new AI image prompt...");
                  try {
                    const res = await fetch(`/api/admin/blogs/${item._id}/image`, {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ action: "regenerate_prompt" }),
                    });
                    const data = await res.json();
                    if (data.success) {
                      toast.success("New image prompt saved to DB & copied!", { id: toastId });
                      if (data.imagePrompt) {
                        try {
                          await navigator.clipboard.writeText(data.imagePrompt);
                        } catch (_) {}
                      }
                      await fetchBlogs({ force: true });
                    } else {
                      toast.error(data.message || "Prompt generation failed.", { id: toastId });
                    }
                  } catch (error) {
                    toast.error(error.message || "Prompt generation failed.", { id: toastId });
                  }
                }}
                className="w-full h-8.5 rounded-xl border border-emerald-400/50 bg-emerald-500/20 hover:bg-emerald-500/35 hover:border-emerald-400/80 transition-all flex items-center justify-center gap-1 font-black text-[9px] uppercase tracking-wider shadow-sm backdrop-blur-md"
                style={{ color: "#6ee7b7" }}
                title="Generate / Regenerate Image Prompt & Save to DB"
              >
                <Sparkles className="w-3 h-3 text-emerald-300" />
                Regen Prompt
              </button>
            ) : (
              <div />
            )}

            {/* Button 3: Copy Prompt (Electric Cyan Theme) */}
            {!item._isFromDataJs && item._id ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (item.imagePrompt || item.image_prompt) {
                    navigator.clipboard.writeText(item.imagePrompt || item.image_prompt);
                    toast.success("Image prompt copied to clipboard.");
                  } else {
                    toast.error("No image prompt available. Click Regen Prompt first.");
                  }
                }}
                className="w-full h-8.5 rounded-xl border border-cyan-400/50 bg-cyan-500/20 hover:bg-cyan-500/35 hover:border-cyan-400/80 transition-all flex items-center justify-center gap-1 font-black text-[9px] uppercase tracking-wider shadow-sm backdrop-blur-md"
                style={{ color: "#67e8f9" }}
                title="Copy current image prompt"
              >
                <Copy className="w-3 h-3 text-cyan-300" />
                Copy Prompt
              </button>
            ) : (
              <div />
            )}
          </div>

          {/* Row 2: Social Kit Marketing Automation Strip */}
          {!item._isFromDataJs && item._id ? (
            <div className="flex items-center gap-1.5">
              <button
                onClick={(event) => {
                  event.stopPropagation();
                  markSocialKitOpened(item._id);
                  setSelectedSocialBlog(item);
                }}
                className={`inline-flex h-8 flex-1 items-center justify-center gap-1.5 rounded-xl border px-3 text-[9px] font-bold uppercase tracking-wider transition-all duration-200 shadow-sm ${
                  openedSocialKitIds.has(String(item._id))
                    ? "border-blue-500/40 bg-blue-500/15 text-blue-300 shadow-blue-500/10 hover:bg-blue-500/25"
                    : "border-emerald-500/40 bg-emerald-500/15 text-emerald-300 hover:border-emerald-400/60 hover:bg-emerald-500/25"
                }`}
                title={openedSocialKitIds.has(String(item._id)) ? "Social kit already opened/used" : "Open Social Share Kit"}
              >
                {openedSocialKitIds.has(String(item._id)) ? (
                  <CheckCircle2 className="h-3 w-3 text-blue-300" />
                ) : (
                  <Share2 className="h-3 w-3 text-emerald-300" />
                )}
                {openedSocialKitIds.has(String(item._id)) ? "Social kit (Opened)" : "Social kit"}
              </button>
              <button
                onClick={async (event) => {
                  event.stopPropagation();
                  const toastId = toast.loading("Regenerating all social posts...");
                  try {
                    const response = await fetch(`/api/admin/blogs/${item._id}/social-kit`, {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({}),
                    });
                    const result = await response.json();
                    if (!response.ok || !result.success) throw new Error(result.error || "Social regeneration failed.");
                    toast.success("LinkedIn, Facebook, X and WhatsApp posts regenerated.", { id: toastId });
                    await fetchBlogs({ force: true });
                  } catch (error) {
                    toast.error(error.message, { id: toastId });
                  }
                }}
                className="inline-flex h-8 items-center justify-center gap-1 rounded-xl border border-white/10 bg-slate-950/40 px-2.5 text-[9px] font-bold uppercase tracking-wider text-slate-400 transition-all hover:border-violet-400/30 hover:bg-violet-500/10 hover:text-violet-300"
                title="Regenerate LinkedIn, Facebook, X and WhatsApp posts"
              >
                <RefreshCcw className="h-3 w-3" />
                {item.socialKit?.status === "ready" ? "Regen Posts" : "Gen Posts"}
              </button>
            </div>
          ) : null}
        </div>
      ),
    },
  ];

  const [selectedBlogForImage, setSelectedBlogForImage] = useState(null);
  const [selectedSocialBlog, setSelectedSocialBlog] = useState(null);

  const fields = [
    {
      name: "title",
      label: "Article Headline",
      placeholder: "e.g. Next.js 15: The Future of Web Engineering",
      required: true,
    },
    {
      name: "slug",
      label: "URL Slug",
      placeholder: "e.g. next-js-15-future",
      required: true,
    },
    {
      name: "image",
      label: "Feature Image",
      type: "custom",
      fullWidth: true,
      render: ({ control }) => (
        <Controller
          name="image"
          control={control}
          render={({ field }) => (
            <ImageUploader
              images={field.value || []}
              onChange={field.onChange}
              maxImages={1}
            />
          )}
        />
      ),
    },
    {
      name: "category",
      label: "Topic Category",
      placeholder: "e.g. Engineering, Design, AI",
      required: true,
    },
    {
      name: "tags",
      label: "Meta Tags (comma separated)",
      placeholder: "nextjs, nodejs, architecture",
      fullWidth: true,
    },
    {
      name: "summary",
      label: "Article Summary",
      type: "textarea",
      fullWidth: true,
      required: true,
    },
    {
      name: "content",
      label: "Full Narrative Content (Markdown/HTML Support)",
      type: "textarea",
      fullWidth: true,
      required: true,
    },
    {
      name: "readTime",
      label: "Estimated Read Time",
      placeholder: "e.g. 10 min read",
    },
    {
      name: "publishStatus",
      label: "Publication Status",
      type: "select",
      options: [
        { label: "Draft - Hidden", value: "draft" },
        { label: "Pending Review", value: "pending" },
        { label: "Published - Live", value: "published" },
      ],
      required: true,
    },
    { name: "featured", label: "Mark as Featured Post", type: "checkbox" },
  ];

  const handleAdd = () => {
    setEditingBlog(null);
    router.push("/admin/blogs/new");
  };

  const handleMasterAutomationToggle = async () => {
    const newEnabled = !automationSettings.enabled;
    const newSettings = {
      ...automationSettings,
      enabled: newEnabled,
    };
    setAutomationSettings(newSettings);
    setAutomationSettingsSaving(true);
    try {
      const response = await fetch("/api/admin/blog-automation-settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSettings),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Failed to update AI Engine setting.");
      setAutomationSettings(result.data);
      if (newEnabled) {
        toast.success("🟢 AI Blog Automation is now ACTIVE across all pipelines & crons.");
      } else {
        toast.warning("🛑 AI Blog Automation is STOPPED in Database (All background AI generation paused).");
      }
    } catch (error) {
      setAutomationSettings(automationSettings);
      toast.error(error.message || "Failed to update AI Engine switch.");
    } finally {
      setAutomationSettingsSaving(false);
    }
  };

  const saveAutomationSettings = async (settings = automationSettings) => {
    setAutomationSettingsSaving(true);
    try {
      const response = await fetch("/api/admin/blog-automation-settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Automation settings could not be saved.");
      setAutomationSettings(result.data);
      toast.success(`Automation set to ${result.data.dailyQuantity} blog${result.data.dailyQuantity === 1 ? "" : "s"} per day, at least ${result.data.intervalHours} hour${result.data.intervalHours === 1 ? "" : "s"} apart.`);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setAutomationSettingsSaving(false);
    }
  };

  const resetAutomationSettings = () => {
    saveAutomationSettings({ enabled: true, dailyQuantity: 1, intervalHours: 24 });
  };

  const handleExport = () => {
    if (!blogs.length) {
      toast.error("There are no blogs to export.");
      return;
    }

    const exportedAt = new Date();
    const exportData = {
      exportType: "muhyo-tech-blog-content-audit",
      exportedAt: exportedAt.toISOString(),
      count: blogs.length,
      blogs: blogs.map((blog) => ({
        title: blog.title || "",
        slug: blog.slug || "",
        summary: blog.summary || "",
        content: blog.content || "",
        seoTitle: blog.seoTitle || "",
        seoDescription: blog.seoDescription || "",
        focusKeyword: blog.focusKeyword || "",
        searchIntent: blog.searchIntent || "",
        category: blog.category || "",
        tags: Array.isArray(blog.tags) ? blog.tags : [],
        relatedServiceSlugs: Array.isArray(blog.relatedServiceSlugs)
          ? blog.relatedServiceSlugs
          : [],
        publishStatus: blog.publishStatus || "draft",
        featured: Boolean(blog.featured),
        author: blog.author || "",
        readTime: blog.readTime || "",
        createdAt: blog.createdAt || null,
        updatedAt: blog.updatedAt || null,
      })),
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `muhyo-tech-blogs-${exportedAt.toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    toast.success(`${blogs.length} blogs exported for content audit.`);
  };

  const handleImportFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setImporting(true);
    try {
      const text = await file.text();
      let parsed;
      try {
        parsed = JSON.parse(text);
      } catch {
        throw new Error("Invalid JSON file. Please upload a valid JSON document.");
      }

      const response = await fetch("/api/admin/blogs/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Failed to import blogs.");

      toast.success(result.message || `Successfully imported ${result.count} blog(s).`);
      fetchBlogs({ force: true });
    } catch (err) {
      toast.error(err.message || "Failed to import JSON file.");
    } finally {
      setImporting(false);
      event.target.value = "";
    }
  };

  const handleView = (blog) => {
    if (!blog.slug) {
      toast.error("Entry has no identifier for indexing.");
      return;
    }
    window.open(`/blog/${blog.slug}`, "_blank");
  };

  const handleEdit = (blog) => {
    const formatted = {
      ...blog,
      tags: Array.isArray(blog.tags) ? blog.tags.join(", ") : blog.tags,
      image: blog.image
        ? Array.isArray(blog.image)
          ? blog.image
          : [blog.image]
        : [],
    };
    setEditingBlog(formatted);
    router.push(`/admin/blogs/${blog._id || blog.slug}`);
  };

  const handleDelete = (item) => {
    if (!item._id) {
      toast.error(
        "Static core data cannot be deleted. Initiate custom data first.",
      );
      return;
    }
    setDeletingId(item._id);
    setIsConfirmOpen(true);
  };

  const onConfirmDelete = async () => {
    setIsDeleting(true);
    const success = await deleteBlog(deletingId);
    setIsDeleting(false);
    if (success) setIsConfirmOpen(false);
  };

  const onSubmit = async (data) => {
    try {
      const hasNewImages =
        data.image &&
        data.image.some((img) => typeof img !== "string" || img.isPending);
      if (hasNewImages) {
        toast.loading("Encrypting and uploading media...");
      } else {
        toast.loading("Publishing to global index...");
      }

      const finalImageUrls = await uploadPendingImages(data.image);

      const submissionData = {
        ...data,
        image: finalImageUrls[0] || "",
      };

      let res;
      if (editingBlog && editingBlog._id) {
        res = await updateBlog(editingBlog._id, submissionData);
      } else {
        res = await addBlog(submissionData);
      }

      if (res.success) {
        setIsModalOpen(false);
      }
    } catch (error) {
      console.error("Submission error:", error);
      toast.error(error.message || "Entry failed: Shield active.");
    }
  };

  const pendingImageBlog = blogs.find((b) => {
    const hasImage = !!(b.image || b.featuredImage?.url);
    const imageStepStatus = b.imageStatus || "pending";
    const canContinueImageStep = [
      "pending",
      "failed",
      "retry_pending",
      "manual_required",
    ].includes(imageStepStatus);
    const createdTime = new Date(b.generatedAt || b.createdAt || 0).getTime();
    const isFreshAiBlog =
      Number.isFinite(createdTime) &&
      blogsLastFetchedAt > 0 &&
      blogsLastFetchedAt - createdTime < 24 * 60 * 60 * 1000;

    return (
      b.aiGenerated &&
      isFreshAiBlog &&
      !hasImage &&
      b.publishStatus !== "published" &&
      canContinueImageStep
    );
  });
  const hasPendingImage = !!pendingImageBlog;
  const visibleBlogs = [...blogs]
    .filter((blog) =>
      `${blog.title || ""} ${blog.category || ""} ${(blog.tags || []).join(" ")} ${blog.intelligence?.service?.primaryService?.title || ""} ${blog.intelligence?.topic?.topicTitle || ""}`
        .toLowerCase()
        .includes(blogSearch.toLowerCase()),
    )
    .filter((blog) => {
      if (!blogDateFilter) return true;
      const blogDate = new Date(blog.createdAt || blog.generatedAt || 0);
      return Number.isFinite(blogDate.getTime()) && format(blogDate, "yyyy-MM-dd") === blogDateFilter;
    })
    .filter((blog) => {
      if (blogFeaturedFilter === "featured") return Boolean(blog.featured);
      if (blogFeaturedFilter === "non-featured") return !blog.featured;
      return true;
    })
    .filter((blog) => {
      if (blogStatusFilter === "all") return true;
      const status = (blog.publishStatus || "draft").toLowerCase();
      if (blogStatusFilter === "published") return status === "published";
      if (blogStatusFilter === "pending") return status === "pending";
      if (blogStatusFilter === "draft") return status === "draft";
      return true;
    })
    .sort((first, second) => {
      const newestFirst = new Date(second.createdAt || second.generatedAt || 0) - new Date(first.createdAt || first.generatedAt || 0);
      if (newestFirst !== 0) return blogSortDirection === "ascending" ? newestFirst : -newestFirst;
      if (Boolean(first.featured) !== Boolean(second.featured)) return first.featured ? -1 : 1;
      if (first.featured && second.featured) {
        const firstOrder = Number(first.featuredOrder || 0);
        const secondOrder = Number(second.featuredOrder || 0);
        if (firstOrder !== secondOrder) return firstOrder - secondOrder;
      }
      return 0;
    });

  const totalItems = visibleBlogs.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE));
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = (safeCurrentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, totalItems);
  const paginatedBlogs = visibleBlogs.slice(startIndex, endIndex);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      document.getElementById("article-library-section")?.scrollIntoView({ behavior: "smooth" });
    }
  };

  const aiActionRenderer = columns.find((column) => column.key === "ai_actions")?.render;

  if (!blogsCacheHydrated && blogs.length === 0) {
    return (
      <AdminPageLoader
        title="Loading Article Workspace"
        message="Hydrating articles, E-E-A-T credentials, and publishing schedules..."
        badge="Editorial Workspace"
      />
    );
  }

  return (
    <div className="mx-auto max-w-[1500px] space-y-6 pb-20">
      <header className="relative overflow-hidden rounded-[28px] border border-white/[0.08] bg-[#0d1727] p-6 sm:p-8"><div className="pointer-events-none absolute -right-20 -top-24 size-72 rounded-full bg-violet-400/[0.07] blur-3xl" /><div className="relative flex flex-col justify-between gap-6 xl:flex-row xl:items-center"><div className="flex items-start gap-4"><span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-violet-400/10 text-violet-300 ring-1 ring-inset ring-violet-400/15"><BookOpen className="size-5" /></span><div><p className="text-[10px] font-bold uppercase tracking-[.24em] text-violet-300">Editorial workspace</p><h1 className="mt-2 text-2xl font-semibold tracking-[-.035em] text-white sm:text-3xl">Blog management</h1><p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">Create, review and publish articles across your portfolio.</p></div></div>

        <div className="grid items-stretch gap-2 sm:grid-cols-2 xl:flex xl:items-center">
          <Link href="/admin/blog-topics" className="group inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-border bg-background/45 px-4 text-xs font-semibold text-foreground shadow-sm transition hover:-translate-y-0.5 hover:border-accent/35 hover:bg-accent/5 hover:text-accent"><ListChecks className="size-4 transition group-hover:scale-105" />Editorial planner</Link><button onClick={handleExport} className="group inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-border bg-background/45 px-4 text-xs font-semibold text-muted-foreground shadow-sm transition hover:-translate-y-0.5 hover:border-accent/25 hover:bg-muted hover:text-foreground"><Download className="size-4 transition group-hover:-translate-y-0.5" />Export JSON</button><input type="file" id="import-blog-json" accept=".json" onChange={handleImportFileChange} className="hidden" /><button type="button" onClick={() => document.getElementById("import-blog-json")?.click()} disabled={importing} className="group inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-border bg-background/45 px-4 text-xs font-semibold text-muted-foreground shadow-sm transition hover:-translate-y-0.5 hover:border-accent/25 hover:bg-muted hover:text-foreground disabled:opacity-50"><Upload className="size-4 transition group-hover:-translate-y-0.5" />{importing ? "Importing..." : "Import JSON"}</button><button onClick={handleAdd} className="group inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-accent/25 bg-accent/10 px-4 text-xs font-semibold text-accent shadow-sm transition hover:-translate-y-0.5 hover:bg-accent/15"><Plus className="size-4 transition group-hover:rotate-90" />New article</button>
          <label
            className={`flex h-11 cursor-pointer select-none items-center justify-between gap-3 rounded-xl border px-3.5 text-xs font-semibold tracking-wide shadow-sm transition-all duration-200 ${
              autoGenerateImages
                ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-300 shadow-emerald-500/10"
                : "border-white/[0.08] bg-slate-950/40 text-slate-400 hover:border-violet-400/30 hover:text-slate-200"
            }`}
            title="Toggle automatic blog image generation"
          >
            <input
              type="checkbox"
              checked={autoGenerateImages}
              onChange={handleAutoImageToggle}
              className="sr-only"
              aria-label="Toggle automatic blog image generation"
            />
            <span className="flex items-center gap-2">
              {autoGenerateImages ? (
                <Sparkles className="size-4 text-emerald-300" />
              ) : (
                <Mail className="size-4 text-slate-500" />
              )}
              Auto image
            </span>
            <span
              className={`relative h-5 w-10 rounded-full p-0.5 transition-colors duration-200 ${
                autoGenerateImages ? "bg-emerald-500" : "bg-slate-800"
              }`}
            >
              <span
                className={`block size-4 rounded-full bg-white shadow-md transition-transform duration-200 ease-out ${
                  autoGenerateImages ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </span>
          </label>

          <button
            onClick={() => {
              if (hasPendingImage) {
                setSelectedBlogForImage(pendingImageBlog);
              } else {
                setSelectedBlogForImage(null);
              }
              setIsAIProgressOpen(true);
            }}
            className={`group flex h-11 items-center justify-center gap-2 rounded-xl border px-5 text-xs font-extrabold shadow-lg transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-50 ${
              hasPendingImage
                ? autoGenerateImages
                  ? "border-amber-300 bg-amber-400 text-slate-950 shadow-amber-500/20 hover:bg-amber-300 hover:text-black"
                  : "border-emerald-400 bg-emerald-500 text-slate-950 shadow-emerald-500/25 hover:bg-emerald-400 hover:text-black hover:border-emerald-300"
                : "border-violet-500 bg-violet-600 text-white font-extrabold shadow-violet-600/30 hover:bg-violet-500 hover:border-violet-400"
            }`}
          >
            {hasPendingImage && !autoGenerateImages ? (
              <Mail className="size-4" />
            ) : (
              <Sparkles
                className={`size-4 ${hasPendingImage ? "animate-bounce" : "group-hover:animate-spin"}`}
              />
            )}
            {hasPendingImage
              ? autoGenerateImages
                ? "Generate Blog Image"
                : "Send Image Prompt"
              : "Generate AI blog"}
          </button>
        </div></div></header>

      <section className="rounded-[24px] border border-white/[0.08] bg-[#0d1727] p-5 sm:p-6">
        <BlogPublishCountdown settings={automationSettings} />
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.2em] text-violet-300">
              <Clock3 className="size-4" />AI publishing schedule
            </div>
            <h2 className="mt-2 text-lg font-semibold text-white">Automated blog frequency</h2>
            <p className="mt-1 max-w-2xl text-xs leading-5 text-slate-500">
              The scheduler writes one safe article per eligible run until the daily quantity is complete. Topic Intelligence keeps a seven-day queue reserve based on this demand.
            </p>
          </div>
          <div className="flex flex-wrap items-end gap-3">
            <label className="w-full sm:w-28">
              <span className="mb-2 block text-[10px] font-semibold text-slate-400">Blogs per day</span>
              <input
                type="number"
                min="1"
                max="12"
                step="1"
                disabled={automationSettingsLoading || automationSettingsSaving}
                value={automationSettings.dailyQuantity}
                onChange={(event) =>
                  setAutomationSettings((current) => ({
                    ...current,
                    dailyQuantity: Number(event.target.value),
                  }))
                }
                className="h-11 w-full rounded-xl border border-white/[0.08] bg-slate-950/35 px-3 text-sm text-white outline-none focus:border-violet-400/40"
              />
            </label>
            <label className="w-full sm:w-32">
              <span className="mb-2 block text-[10px] font-semibold text-slate-400">Interval hours</span>
              <input
                type="number"
                min="1"
                max="168"
                step="1"
                disabled={automationSettingsLoading || automationSettingsSaving}
                value={automationSettings.intervalHours}
                onChange={(event) =>
                  setAutomationSettings((current) => ({
                    ...current,
                    intervalHours: Number(event.target.value),
                  }))
                }
                className="h-11 w-full rounded-xl border border-white/[0.08] bg-slate-950/35 px-3 text-sm text-white outline-none focus:border-violet-400/40"
              />
            </label>

            {/* Master AI Engine Persistence Kill-Switch Button */}
            <button
              type="button"
              disabled={automationSettingsLoading || automationSettingsSaving}
              onClick={handleMasterAutomationToggle}
              className={`group flex h-11 items-center justify-between gap-3 rounded-xl border px-4 text-xs font-bold tracking-wide shadow-sm transition-all duration-200 ${
                automationSettings.enabled
                  ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-300 shadow-emerald-500/10 hover:bg-emerald-500/25"
                  : "border-rose-500/40 bg-rose-500/15 text-rose-300 shadow-rose-500/10 hover:bg-rose-500/25"
              }`}
              title={
                automationSettings.enabled
                  ? "AI Engine is ACTIVE in Database. Click to STOP all automated generation."
                  : "AI Engine is PAUSED in Database. Click to START automated generation."
              }
            >
              <div className="flex items-center gap-2">
                <span className="relative flex size-2.5 items-center justify-center">
                  <span
                    className={`absolute inline-flex size-full rounded-full opacity-75 ${
                      automationSettings.enabled
                        ? "bg-emerald-400 animate-ping"
                        : "bg-rose-400"
                    }`}
                  />
                  <span
                    className={`relative inline-flex size-2 rounded-full ${
                      automationSettings.enabled ? "bg-emerald-400" : "bg-rose-400"
                    }`}
                  />
                </span>
                <BrainCircuit className="size-4" />
                <span>
                  AI Engine:{" "}
                  <strong className="uppercase">
                    {automationSettings.enabled ? "ACTIVE" : "PAUSED"}
                  </strong>
                </span>
              </div>
              <span
                className={`relative h-5 w-10 rounded-full p-0.5 transition-colors duration-200 ${
                  automationSettings.enabled ? "bg-emerald-500" : "bg-rose-600/70"
                }`}
              >
                <span
                  className={`block size-4 rounded-full bg-white shadow-md transition-transform duration-200 ease-out ${
                    automationSettings.enabled ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </span>
            </button>

            <button
              type="button"
              onClick={resetAutomationSettings}
              disabled={automationSettingsLoading || automationSettingsSaving}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-white/[0.1] bg-slate-950/35 px-4 text-xs font-bold text-slate-300 transition hover:border-violet-400/30 hover:text-violet-300 disabled:opacity-50"
            >
              <RefreshCcw className="size-4" />Reset default
            </button>
            <button
              type="button"
              onClick={() => saveAutomationSettings()}
              disabled={automationSettingsLoading || automationSettingsSaving}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-violet-400 px-4 text-xs font-bold text-slate-950 transition hover:bg-violet-300 disabled:opacity-50"
            >
              <Save className="size-4" />{automationSettingsSaving ? "Saving..." : "Save schedule"}
            </button>
          </div>
        </div>
      </section>

      <div className="grid overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0d1727] grid-cols-2 sm:grid-cols-5"><BlogMetric label="Total articles" value={blogs.length} /><BlogMetric label="Published" value={blogs.filter((item) => item.publishStatus === "published").length} /><BlogMetric label="Pending" value={blogs.filter((item) => item.publishStatus === "pending").length} /><BlogMetric label="Drafts" value={blogs.filter((item) => item.publishStatus === "draft" || !item.publishStatus).length} /><BlogMetric label="AI generated" value={blogs.filter((item) => item.aiGenerated).length} last /></div>

      <section id="article-library-section" data-columns={columns.length} data-reorder={Boolean(reorderBlogs)} className="overflow-hidden rounded-[24px] border border-white/[0.08] bg-[#0d1727]"><div className="flex flex-col justify-between gap-4 border-b border-white/[0.07] p-4 xl:flex-row xl:items-center sm:p-5"><div className="space-y-3"><div><p className="text-sm font-semibold text-slate-200">Article library</p><p className="mt-1 text-xs text-slate-600">Manage manual and AI-assisted content in one place (21 articles per page).</p></div><div className="flex items-center gap-1.5 flex-wrap pt-1"><button type="button" onClick={() => setBlogStatusFilter("all")} className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${blogStatusFilter === "all" ? "bg-violet-500/20 text-violet-300 border border-violet-500/40 shadow-sm" : "bg-slate-950/35 text-slate-400 border border-white/[0.08] hover:text-slate-200"}`}>All ({blogs.length})</button><button type="button" onClick={() => setBlogStatusFilter("published")} className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${blogStatusFilter === "published" ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm" : "bg-slate-950/35 text-slate-400 border border-white/[0.08] hover:text-emerald-300"}`}><span className="size-2 rounded-full bg-emerald-400 animate-pulse"></span>Published ({blogs.filter((b) => b.publishStatus === "published").length})</button><button type="button" onClick={() => setBlogStatusFilter("pending")} className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${blogStatusFilter === "pending" ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm" : "bg-slate-950/35 text-slate-400 border border-white/[0.08] hover:text-amber-300"}`}><span className="size-2 rounded-full bg-amber-400"></span>Pending ({blogs.filter((b) => b.publishStatus === "pending").length})</button><button type="button" onClick={() => setBlogStatusFilter("draft")} className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${blogStatusFilter === "draft" ? "bg-slate-700/50 text-slate-200 border border-slate-500/50 shadow-sm" : "bg-slate-950/35 text-slate-400 border border-white/[0.08] hover:text-slate-200"}`}><span className="size-2 rounded-full bg-slate-400"></span>Drafts ({blogs.filter((b) => (b.publishStatus || "draft") === "draft" && b.publishStatus !== "published" && b.publishStatus !== "pending").length})</button></div></div><div className="flex w-full flex-col gap-2 sm:flex-row sm:flex-wrap xl:w-auto"><label className="relative w-full sm:min-w-64"><Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-600" /><input value={blogSearch} onChange={(event) => setBlogSearch(event.target.value)} placeholder="Search articles..." className="w-full rounded-xl border border-white/[0.08] bg-slate-950/35 py-3 pl-10 pr-4 text-sm outline-none placeholder:text-slate-700 focus:border-violet-400/40" /></label><label><span className="sr-only">Filter by status</span><select value={blogStatusFilter} onChange={(event) => setBlogStatusFilter(event.target.value)} className="h-11 w-full rounded-xl border border-white/[0.08] bg-slate-950/35 px-3 text-sm text-slate-200 outline-none focus:border-violet-400/40"><option value="all">All Statuses</option><option value="published">Published 🟢</option><option value="pending">Pending 🟡</option><option value="draft">Draft ⚪</option></select></label><label><span className="sr-only">Filter by featured</span><select value={blogFeaturedFilter} onChange={(event) => setBlogFeaturedFilter(event.target.value)} className="h-11 w-full rounded-xl border border-white/[0.08] bg-slate-950/35 px-3 text-sm text-slate-200 outline-none focus:border-violet-400/40"><option value="all">All Articles</option><option value="featured">Featured ⭐</option><option value="non-featured">Non-Featured</option></select></label><label><span className="sr-only">Filter articles by date</span><input type="date" value={blogDateFilter} onChange={(event) => setBlogDateFilter(event.target.value)} className="h-11 w-full rounded-xl border border-white/[0.08] bg-slate-950/35 px-3 text-sm text-slate-200 outline-none focus:border-violet-400/40" title="Show blogs published on this date" /></label><label><span className="sr-only">Sort articles</span><select value={blogSortDirection} onChange={(event) => setBlogSortDirection(event.target.value)} className="h-11 w-full rounded-xl border border-white/[0.08] bg-slate-950/35 px-3 text-sm text-slate-200 outline-none focus:border-violet-400/40"><option value="ascending">Ascending (newest first)</option><option value="descending">Descending (oldest first)</option></select></label>{isAnyFilterActive && <button type="button" onClick={handleClearFilters} className="inline-flex h-11 items-center justify-center gap-1.5 rounded-xl border border-rose-400/30 bg-rose-500/10 px-3.5 text-xs font-semibold text-rose-300 transition hover:bg-rose-500/20" title="Clear all active filters"><X className="size-3.5" />Clear filters</button>}</div></div><div className="grid gap-4 p-4 sm:p-5 md:grid-cols-2 xl:grid-cols-3">{paginatedBlogs.map((blog) => <BlogCard key={blog._id || blog.slug || blog.title} blog={blog} aiActions={aiActionRenderer?.(blog)} onCreateBlogger={handleGenerateBloggerForBlog} onEdit={() => handleEdit(blog)} onView={() => handleView(blog)} onDelete={() => handleDelete(blog)} onInspect={() => setInspectedBlog(blog)} />)}</div>{visibleBlogs.length === 0 && <div className="grid min-h-72 place-items-center text-center"><div><BookOpen className="mx-auto size-9 text-slate-700" /><p className="mt-4 text-sm font-semibold text-slate-300">No matching articles</p><p className="mt-1 text-xs text-slate-600">Try another title, date, category or status filter.</p></div></div>}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/[0.07] px-6 py-4 bg-slate-950/20">
          <div className="text-xs font-semibold text-slate-400">
            Showing <span className="text-white font-bold">{totalItems > 0 ? startIndex + 1 : 0}</span> to <span className="text-white font-bold">{endIndex}</span> of <span className="text-white font-bold">{totalItems}</span> articles (Page {safeCurrentPage} of {totalPages})
          </div>
          <div className="flex items-center gap-1.5 flex-wrap justify-center">
            <button
              type="button"
              onClick={() => handlePageChange(1)}
              disabled={safeCurrentPage === 1}
              className="px-2.5 py-1.5 rounded-lg border border-white/[0.08] bg-slate-950/40 text-xs font-semibold text-slate-300 transition hover:border-violet-400/40 hover:text-white disabled:opacity-40 disabled:hover:border-white/[0.08]"
              title="First Page"
            >
              <ChevronsLeft className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => handlePageChange(safeCurrentPage - 1)}
              disabled={safeCurrentPage === 1}
              className="px-3 py-1.5 rounded-lg border border-white/[0.08] bg-slate-950/40 text-xs font-semibold text-slate-300 transition hover:border-violet-400/40 hover:text-white flex items-center gap-1 disabled:opacity-40 disabled:hover:border-white/[0.08]"
            >
              <ChevronLeft className="size-4" /> Prev
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, idx) => idx + 1)
                .filter((p) => p === 1 || p === totalPages || Math.abs(p - safeCurrentPage) <= 2)
                .map((p, i, arr) => {
                  const showEllipsis = i > 0 && p - arr[i - 1] > 1;
                  return (
                    <div key={p} className="flex items-center gap-1">
                      {showEllipsis && <span className="px-1 text-xs text-slate-600">...</span>}
                      <button
                        type="button"
                        onClick={() => handlePageChange(p)}
                        className={`size-8 rounded-lg text-xs font-bold transition-all ${
                          p === safeCurrentPage
                            ? "bg-violet-500 text-white shadow-md shadow-violet-500/25 ring-1 ring-violet-400/50"
                            : "border border-white/[0.08] bg-slate-950/40 text-slate-400 hover:border-violet-400/30 hover:text-slate-200"
                        }`}
                      >
                        {p}
                      </button>
                    </div>
                  );
                })}
            </div>
            <button
              type="button"
              onClick={() => handlePageChange(safeCurrentPage + 1)}
              disabled={safeCurrentPage === totalPages}
              className="px-3 py-1.5 rounded-lg border border-white/[0.08] bg-slate-950/40 text-xs font-semibold text-slate-300 transition hover:border-violet-400/40 hover:text-white flex items-center gap-1 disabled:opacity-40 disabled:hover:border-white/[0.08]"
            >
              Next <ChevronRight className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => handlePageChange(totalPages)}
              disabled={safeCurrentPage === totalPages}
              className="px-2.5 py-1.5 rounded-lg border border-white/[0.08] bg-slate-950/40 text-xs font-semibold text-slate-300 transition hover:border-violet-400/40 hover:text-white disabled:opacity-40 disabled:hover:border-white/[0.08]"
              title="Last Page"
            >
              <ChevronsRight className="size-4" />
            </button>
          </div>
        </div>
      )}
      </section>

      <AnimatePresence>
        {false && isModalOpen && (
          <FormModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            title={
              editingBlog ? "Edit Intellectual Property" : "Forge New Entry"
            }
            schema={blogSchema}
            defaultValues={editingBlog}
            onSubmit={onSubmit}
            fields={fields}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isAIProgressOpen && (
          <AIBlogProgress
            isOpen={isAIProgressOpen}
            onClose={() => {
              setIsAIProgressOpen(false);
              setSelectedBlogForImage(null);
            }}
            onComplete={() => fetchBlogs({ force: true })}
            mode={selectedBlogForImage || pendingImageBlog ? "image" : "text"}
            blogId={selectedBlogForImage?._id || pendingImageBlog?._id}
            autoGenerateImages={autoGenerateImages}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isConfirmOpen && (
          <ConfirmDialog
            isOpen={isConfirmOpen}
            onConfirm={onConfirmDelete}
            onCancel={() => setIsConfirmOpen(false)}
            title="Delete Blog Entry?"
            message="This will permanently delete the post and its associated metadata from the system. This action is irreversible."
            isDeleting={isDeleting}
          />
        )}
      </AnimatePresence>
      <SocialShareKitModal
        isOpen={Boolean(selectedSocialBlog)}
        blog={selectedSocialBlog}
        onClose={() => setSelectedSocialBlog(null)}
        onUpdated={() => fetchBlogs({ force: true })}
      />

      <BloggerPostModal
        isOpen={isBloggerModalOpen}
        onClose={() => {
          setIsBloggerModalOpen(false);
          setSelectedBloggerBlog(null);
        }}
        parentBlog={selectedBloggerBlog}
      />

      {inspectedBlog && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-md" role="dialog" aria-modal="true">
          <div className="relative w-full max-w-2xl overflow-hidden rounded-[24px] border border-white/[0.08] bg-[#0d1727] shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/[0.07] p-6">
              <div className="flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-xl bg-violet-400/10 text-violet-300">
                  <BrainCircuit className="size-5" />
                </span>
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-[.2em] text-violet-300">Blog Intelligence Inspection</p>
                  <h2 className="text-lg font-semibold text-white">{inspectedBlog.title}</h2>
                </div>
              </div>
              <button onClick={() => setInspectedBlog(null)} className="grid size-9 place-items-center rounded-xl text-slate-400 hover:bg-slate-900 hover:text-white">
                <X className="size-4" />
              </button>
            </div>
            <div className="max-h-[70vh] overflow-y-auto p-6 space-y-5 text-slate-300">
              <div className="rounded-xl border border-white/[0.08] bg-slate-950/40 p-4 space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-violet-300 flex items-center gap-2">
                  <Target className="size-3.5" /> Topic Intelligence
                </h4>
                <p className="text-xs"><strong className="text-white">Topic Connection:</strong> {inspectedBlog.intelligence?.topic?.linked ? `Linked (${inspectedBlog.intelligence.topic.topicTitle})` : "Standalone Article (No Plan Link)"}</p>
                <p className="text-xs"><strong className="text-white">Search Intent:</strong> <span className="uppercase text-violet-300 font-semibold">{inspectedBlog.searchIntent || inspectedBlog.intelligence?.topic?.searchIntent || "Informational"}</span></p>
                <p className="text-xs"><strong className="text-white">Topic Opportunity Score:</strong> <span className="font-bold text-emerald-400">{inspectedBlog.intelligence?.topic?.opportunityScore || inspectedBlog.qualityScore || 80}/100</span></p>
              </div>

              <div className="rounded-xl border border-white/[0.08] bg-slate-950/40 p-4 space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-violet-300 flex items-center gap-2">
                  <Sparkles className="size-3.5" /> Service Intelligence Match
                </h4>
                <p className="text-xs"><strong className="text-white">Primary Matched Service:</strong> {inspectedBlog.intelligence?.service?.primaryService ? `${inspectedBlog.intelligence.service.primaryService.title} (${inspectedBlog.intelligence.service.primaryService.relevanceScore}% Match)` : "No direct service match"}</p>
                {inspectedBlog.intelligence?.service?.secondaryServices?.length > 0 && (
                  <p className="text-xs"><strong className="text-white">Secondary Services:</strong> {inspectedBlog.intelligence.service.secondaryServices.map(s => `${s.title} (${s.relevanceScore}%)`).join(", ")}</p>
                )}
                <p className="text-xs"><strong className="text-white">Coverage Status:</strong> <span className="text-emerald-400 font-semibold">{inspectedBlog.intelligence?.service?.serviceCoverageStatus || "COVERED"}</span></p>
              </div>

              <div className="rounded-xl border border-white/[0.08] bg-slate-950/40 p-4 space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-violet-300 flex items-center gap-2">
                  <CheckCircle2 className="size-3.5" /> Conversion Intelligence
                </h4>
                <p className="text-xs"><strong className="text-white">Commercial Intent Level:</strong> <span className="rounded bg-emerald-500/20 px-2 py-0.5 font-bold text-emerald-300">{inspectedBlog.intelligence?.conversion?.conversionLevel || "SOFT"} INTENT</span></p>
                <p className="text-xs"><strong className="text-white">CTA Strategy:</strong> {inspectedBlog.intelligence?.conversion?.ctaStrategy || "Informational Service Bridge"}</p>
                <p className="text-xs"><strong className="text-white">Booking Action Route:</strong> <code className="text-violet-300 font-mono">{inspectedBlog.intelligence?.conversion?.bookingTarget || "/book-call"}</code></p>
              </div>

              <div className="rounded-xl border border-white/[0.08] bg-slate-950/40 p-4 space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-violet-300 flex items-center gap-2">
                  <BookOpen className="size-3.5" /> Content Authority & Quality
                </h4>
                <p className="text-xs"><strong className="text-white">Content Role:</strong> <span className="uppercase text-amber-300 font-semibold">{inspectedBlog.articleType || "PILLAR"}</span></p>
                <p className="text-xs"><strong className="text-white">Quality Score:</strong> {inspectedBlog.qualityScore || 85}/100</p>
                <p className="text-xs"><strong className="text-white">Focus Keyword:</strong> {inspectedBlog.focusKeyword || "N/A"}</p>
              </div>
            </div>
            <div className="flex justify-end border-t border-white/[0.07] bg-slate-950/40 px-6 py-4">
              <button onClick={() => setInspectedBlog(null)} className="rounded-xl bg-violet-400 px-5 py-2 text-xs font-bold text-slate-950 hover:bg-violet-300">
                Close Inspection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}const calculateTimeLeft = (settings) => {
  if (settings?.enabled === false) {
    return { hours: 0, minutes: 0, seconds: 0, isDue: false, isQuotaComplete: false };
  }
  const dailyQuantity = Math.max(1, Number(settings?.dailyQuantity || 1));
  const generatedTodayCount = Number(settings?.generatedTodayCount || 0);
  const now = Date.now();
  const targetTime = settings?.nextEligibleAt ? new Date(settings.nextEligibleAt).getTime() : 0;
  const isQuotaComplete = generatedTodayCount >= dailyQuantity;
  const diff = targetTime - now;

  if (isQuotaComplete) {
    return { hours: 0, minutes: 0, seconds: 0, isDue: false, isQuotaComplete: true };
  } else if (targetTime > 0 && diff <= 0) {
    return { hours: 0, minutes: 0, seconds: 0, isDue: true, isQuotaComplete: false };
  } else {
    const hours = Math.floor(Math.max(0, diff) / (1000 * 60 * 60));
    const minutes = Math.floor((Math.max(0, diff) % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((Math.max(0, diff) % (1000 * 60)) / 1000);
    return { hours, minutes, seconds, isDue: false, isQuotaComplete: false };
  }
};

function BlogPublishCountdown({ settings }) {
  const [timeLeft, setTimeLeft] = useState(() => calculateTimeLeft(settings));

  useEffect(() => {
    if (settings?.enabled === false) return;

    const interval = setInterval(() => {
      setTimeLeft(calculateTimeLeft(settings));
    }, 1000);
    return () => clearInterval(interval);
  }, [settings]);

  if (settings?.enabled === false) {
    return (
      <div className="mb-5 flex items-center justify-between rounded-2xl border border-amber-400/20 bg-amber-400/10 p-4 text-xs font-semibold text-amber-200">
        <div className="flex items-center gap-2">
          <span className="relative flex size-2.5">
            <span className="size-2.5 rounded-full bg-amber-400"></span>
          </span>
          AI Publishing Automation is currently disabled.
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300/70">Paused</span>
      </div>
    );
  }

  const targetDateFormatted = settings?.nextEligibleAt
    ? format(new Date(settings.nextEligibleAt), "h:mm:ss a (MMM d, yyyy)")
    : "Calculating schedule...";

  const pad = (num) => String(num).padStart(2, "0");

  return (
    <div className="mb-6 relative overflow-hidden rounded-[20px] border border-white/[0.08] bg-[#070d18] p-5 shadow-2xl">
      <div className="pointer-events-none absolute -right-20 -top-20 size-60 rounded-full bg-violet-400/[0.07] blur-3xl" />
      <div className="relative flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex items-center gap-4">
          <div className="relative grid size-12 shrink-0 place-items-center rounded-2xl bg-violet-400/10 text-violet-300 ring-1 ring-inset ring-violet-400/15 shadow-inner">
            <Clock3 className="size-5 animate-pulse text-violet-300" />
            <span className="absolute -right-1 -top-1 flex size-3">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex size-3 rounded-full bg-emerald-500"></span>
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.24em] text-violet-300">
              Next Publication Schedule
            </div>
            <p className="mt-1 text-xs text-slate-400">
              {timeLeft.isQuotaComplete ? (
                <span className="font-semibold text-emerald-300">✓ Today&apos;s daily quota ({settings.generatedTodayCount || 0}/{settings.dailyQuantity}) complete</span>
              ) : timeLeft.isDue ? (
                <span className="font-semibold text-emerald-300">⚡ Eligible for publication now (Will execute on next Vercel cron run)</span>
              ) : (
                <span>Next automated article will run at <span className="font-semibold text-white">{targetDateFormatted}</span></span>
              )}
            </p>
          </div>
        </div>

        {/* Animated Digital Flip-Clock Display */}
        <div className="flex items-center gap-2">
          {timeLeft.isQuotaComplete ? (
            <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2.5 text-xs font-bold text-emerald-400 shadow-md">
              <CheckCircle2 className="size-4 text-emerald-400" />
              Daily Quota Complete
            </div>
          ) : timeLeft.isDue ? (
            <div className="flex items-center gap-2 rounded-xl border border-emerald-400/40 bg-emerald-500/20 px-4 py-2.5 text-xs font-bold text-emerald-300 shadow-md shadow-emerald-500/10 animate-pulse">
              <Sparkles className="size-4 text-emerald-300" />
              Eligible Now (Vercel Cron)
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <div className="flex flex-col items-center">
                <div className="flex h-12 min-w-12 items-center justify-center rounded-xl border border-white/[0.08] bg-slate-950/60 px-2.5 font-mono text-xl font-bold tracking-tight text-white shadow-inner backdrop-blur-md">
                  {pad(timeLeft.hours)}
                </div>
                <span className="mt-1 text-[9px] font-bold uppercase tracking-[.18em] text-slate-500">Hours</span>
              </div>
              <span className="text-xl font-bold text-violet-400/70 animate-pulse">:</span>
              <div className="flex flex-col items-center">
                <div className="flex h-12 min-w-12 items-center justify-center rounded-xl border border-white/[0.08] bg-slate-950/60 px-2.5 font-mono text-xl font-bold tracking-tight text-white shadow-inner backdrop-blur-md">
                  {pad(timeLeft.minutes)}
                </div>
                <span className="mt-1 text-[9px] font-bold uppercase tracking-[.18em] text-slate-500">Mins</span>
              </div>
              <span className="text-xl font-bold text-violet-400/70 animate-pulse">:</span>
              <div className="flex flex-col items-center">
                <div className="flex h-12 min-w-12 items-center justify-center rounded-xl border border-violet-400/30 bg-slate-950/60 px-2.5 font-mono text-xl font-bold tracking-tight text-violet-300 shadow-inner backdrop-blur-md ring-1 ring-violet-400/25">
                  {pad(timeLeft.seconds)}
                </div>
                <span className="mt-1 text-[9px] font-bold uppercase tracking-[.18em] text-slate-500">Secs</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function BlogMetric({ label, value, last = false }) {
  return (
    <div className={`p-5 sm:p-6 ${last ? "" : "border-b border-white/[0.07] sm:border-b-0 sm:border-r"}`}>
      <p className="text-[9px] font-bold uppercase tracking-[.18em] text-slate-600">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-white">{value}</p>
    </div>
  );
}

  function BlogCard({ blog, aiActions, onCreateBlogger, onEdit, onView, onDelete, onInspect }) {
    const image = getSafeImageSrc(blog.image || blog.featuredImage?.url || blog.images?.[0]);
    const status = blog._isFromDataJs ? "template" : blog.publishStatus || "draft";
    const date = blog.createdAt ? format(new Date(blog.createdAt), "MMM d, yyyy") : "Not published";
    const intel = blog.intelligence;

    return (
      <article className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0d1727]/90 backdrop-blur-md transition-all duration-300 hover:border-violet-500/30 hover:shadow-xl hover:shadow-violet-500/5">
        <div>
          <div className="relative aspect-[16/9] overflow-hidden bg-slate-950/60">
            <Image
              src={image}
              alt={getBlogImageAlt(blog)}
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover transition duration-500 group-hover:scale-[1.03]"
            />
            <div className="absolute inset-x-0 top-0 flex items-start justify-between p-3">
              <span
                className={`rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-widest backdrop-blur-md shadow-lg transition-all ${
                  status === "published"
                    ? "border-emerald-400/60 bg-emerald-500/35 text-emerald-300 shadow-emerald-950/60"
                    : status === "pending"
                    ? "border-amber-400/70 bg-amber-500/35 text-amber-300 shadow-amber-950/60 ring-1 ring-amber-400/40"
                    : "border-slate-400/50 bg-slate-950/90 text-slate-200 shadow-slate-950/60"
                }`}
                style={{
                  color: status === "pending" ? "#fcd34d" : status === "published" ? "#6ee7b7" : "#e2e8f0",
                }}
              >
                {status}
              </span>
              {blog.featured && (
                <span className="grid size-7 place-items-center rounded-full bg-amber-400 text-slate-950 shadow-md">
                  <Star className="size-3.5 fill-current" />
                </span>
              )}
            </div>
          </div>

          <div className="p-5 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[9px] font-bold uppercase tracking-[.18em] text-violet-400">
                {blog.category || "Article"}
              </p>
              <p className="text-[9px] font-medium text-slate-500">{date}</p>
            </div>
            <h2 className="line-clamp-2 min-h-10 text-base font-bold leading-snug text-slate-100 group-hover:text-white transition-colors">
              {blog.title}
            </h2>
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              {intel?.service?.primaryService && (
                <span className="rounded-lg border border-white/[0.08] bg-slate-950/60 px-2 py-0.5 text-[8px] font-bold text-slate-300 truncate max-w-[200px]">
                  ⚡ {intel.service.primaryService.title} ({intel.service.primaryService.relevanceScore}%)
                </span>
              )}
              {intel?.topic?.linked && (
                <span className="rounded-lg bg-violet-500/15 border border-violet-400/20 px-2 py-0.5 text-[8px] font-bold text-violet-300">
                  📌 Topic Linked
                </span>
              )}
              <span className="rounded-lg bg-amber-500/10 border border-amber-400/20 px-2 py-0.5 text-[8px] font-bold text-amber-300 uppercase">
                👑 {blog.articleType || "pillar"}
              </span>
            </div>
            <p className="line-clamp-2 min-h-9 text-xs leading-5 text-slate-400">
              {blog.summary || "No article summary added yet."}
            </p>
          </div>
        </div>

        <div className="p-5 pt-0 space-y-3">
          {/* Middle Section: AI Actions Toolbar */}
          <div>{aiActions}</div>

          {/* Footer Section: Primary Management Buttons */}
          <div className="border-t border-white/[0.07] pt-3.5 space-y-2">
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                onClick={onEdit}
                className="inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-xl border border-violet-500/30 bg-violet-500/10 px-2.5 text-[10px] font-bold uppercase tracking-wider text-violet-300 hover:bg-violet-500/20 hover:border-violet-400/50 transition-all shadow-sm"
              >
                <Pencil className="size-3.5" />
                Edit
              </button>

              <button
                onClick={onInspect}
                className="inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-xl border border-purple-500/30 bg-purple-500/10 px-2.5 text-[10px] font-bold uppercase tracking-wider text-purple-300 hover:bg-purple-500/20 hover:border-purple-400/50 transition-all"
                title="Inspect Topic, Service & Conversion Intelligence"
              >
                <BrainCircuit className="size-3.5 text-purple-300" />
                Inspect
              </button>

              {!blog._isFromDataJs && (
                <button
                  onClick={() => onCreateBlogger(blog)}
                  className="inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-2.5 text-[10px] font-bold uppercase tracking-wider text-cyan-300 hover:bg-cyan-500/20 hover:border-cyan-400/50 transition-all"
                  title="Generate 900-1200 word supporting article for Google Blogger"
                >
                  <Sparkles className="size-3.5 text-cyan-400" />
                  Blogger
                </button>
              )}

              {!blog._isFromDataJs && (
                <button
                  onClick={onDelete}
                  className="grid size-9 shrink-0 place-items-center rounded-xl border border-rose-500/20 bg-rose-500/10 text-rose-300 hover:bg-rose-500/25 hover:border-rose-400/40 transition-all"
                  title="Delete Blog Entry"
                >
                  <Trash2 className="size-3.5" />
                </button>
              )}

              <button
                onClick={onView}
                className="grid size-9 shrink-0 place-items-center rounded-xl border border-white/10 bg-slate-950/40 text-slate-400 hover:border-white/20 hover:text-white transition-all"
                title="View Public Article"
              >
                <ExternalLink className="size-3.5" />
              </button>
            </div>
          </div>
        </div>
      </article>
    );
  }
