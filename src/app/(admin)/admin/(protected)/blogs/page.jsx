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
import { Sparkles, CheckCircle2, Mail, RefreshCcw, Copy, BookOpen, Search, Pencil, Trash2, ExternalLink, Star, Plus, Download, Share2, Clock3, Save } from "lucide-react";
import AIBlogProgress from "@/components/admin/AIBlogProgress";
import SocialShareKitModal from "@/components/admin/SocialShareKitModal";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ListChecks } from "lucide-react";

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
  const [openedSocialKitIds, setOpenedSocialKitIds] = useState(() => new Set());
  // Editorial wording follows the admin request: ascending = newest first.
  const [blogSortDirection, setBlogSortDirection] = useState("ascending");
  const [automationSettings, setAutomationSettings] = useState({ enabled: true, dailyQuantity: 1, intervalHours: 24 });
  const [automationSettingsLoading, setAutomationSettingsLoading] = useState(true);
  const [automationSettingsSaving, setAutomationSettingsSaving] = useState(false);

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
        <div className="flex flex-wrap items-center gap-2">
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
              className="px-3 py-1.5 bg-amber-500 text-accent-foreground text-[9px] font-black uppercase tracking-tighter rounded-md hover:bg-amber-400 transition-all flex items-center gap-1 animate-pulse"
            >
              <Sparkles className="w-3 h-3" />
              {autoGenerateImages ? "Gen Image" : "Send Prompt"}
            </button>
          ) : item.aiGenerated &&
            ["completed", "generated", "uploaded"].includes(item.imageStatus) &&
            (item.image || item.featuredImage?.url) ? (
            <div className="flex items-center gap-1 text-[9px] font-bold text-green-500 uppercase">
              <CheckCircle2 className="w-3 h-3" /> {item.imageStatus}
            </div>
          ) : (
            <span className="text-[9px] text-muted-foreground/80 font-bold uppercase">
              Manual
            </span>
          )}
          {item.aiGenerated && item._id ? (
            <>
              {autoGenerateImages ? (
                <button
                  onClick={async (e) => {
                    e.stopPropagation();
                    const toastId = toast.loading("Regenerating blog image...");
                    const res = await fetch(`/api/admin/blogs/${item._id}/image`, {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ action: "regenerate" }),
                    });
                    const data = await res.json();
                    if (data.success) {
                      toast.success(`Image workflow: ${data.status}`, {
                        id: toastId,
                      });
                      fetchBlogs({ force: true });
                    } else {
                      toast.error(data.message || "Image regeneration failed.", {
                        id: toastId,
                      });
                    }
                  }}
                  className="p-1.5 rounded-md border border-border text-muted-foreground hover:text-foreground hover:bg-muted"
                  title="Regenerate AI image"
                >
                  <RefreshCcw className="w-3 h-3" />
                </button>
              ) : null}
              <button
                onClick={async (e) => {
                  e.stopPropagation();
                  const toastId = toast.loading("Sending secure prompt email...");
                  const res = await fetch(`/api/admin/blogs/${item._id}/image`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ action: "send_prompt_email" }),
                  });
                  const data = await res.json();
                  if (data.success) {
                    toast.success(data.message, { id: toastId });
                  } else {
                    toast.error(data.message || "Prompt email failed.", {
                      id: toastId,
                    });
                  }
                }}
                className="p-1.5 rounded-md border border-border text-muted-foreground hover:text-foreground hover:bg-muted"
                title="Send prompt email"
              >
                <Mail className="w-3 h-3" />
              </button>
              {(item.imagePrompt || item.image_prompt) ? (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigator.clipboard.writeText(item.imagePrompt || item.image_prompt);
                    toast.success("Image prompt copied.");
                  }}
                  className="p-1.5 rounded-md border border-border text-muted-foreground hover:text-foreground hover:bg-muted"
                  title="Copy image prompt"
                >
                  <Copy className="w-3 h-3" />
                </button>
              ) : null}
            </>
          ) : null}
          {!item._isFromDataJs && item._id ? (
            <button
              onClick={(event) => {
                event.stopPropagation();
                markSocialKitOpened(item._id);
                setSelectedSocialBlog(item);
              }}
              className={`inline-flex h-8 min-w-[104px] flex-1 items-center justify-center gap-1.5 rounded-lg border px-3 text-[9px] font-bold uppercase tracking-wider transition ${item.socialKit?.status === "ready" || openedSocialKitIds.has(String(item._id)) ? "border-emerald-400/35 bg-emerald-400/15 text-emerald-300" : "border-border bg-background/40 text-muted-foreground hover:border-accent/25 hover:text-accent"}`}
              title="Open Social Share Kit"
            >
              <Share2 className="h-3 w-3" /> Social kit
            </button>
          ) : null}
          {!item._isFromDataJs && item._id ? (
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
              className="inline-flex h-8 min-w-[104px] flex-1 items-center justify-center gap-1.5 rounded-lg border border-border bg-background/40 px-3 text-[9px] font-bold uppercase tracking-wider text-muted-foreground transition hover:border-accent/30 hover:bg-accent/10 hover:text-accent"
              title="Regenerate LinkedIn, Facebook, X and WhatsApp posts"
            >
              <RefreshCcw className="h-3 w-3" /> {item.socialKit?.status === "ready" ? "Regenerate" : "Generate posts"}
            </button>
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

  const saveAutomationSettings = async () => {
    setAutomationSettingsSaving(true);
    try {
      const response = await fetch("/api/admin/blog-automation-settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(automationSettings),
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
      `${blog.title || ""} ${blog.category || ""} ${(blog.tags || []).join(" ")}`
        .toLowerCase()
        .includes(blogSearch.toLowerCase()),
    )
    .filter((blog) => {
      if (!blogDateFilter) return true;
      const blogDate = new Date(blog.createdAt || blog.generatedAt || 0);
      return Number.isFinite(blogDate.getTime()) && format(blogDate, "yyyy-MM-dd") === blogDateFilter;
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
  const aiActionRenderer = columns.find((column) => column.key === "ai_actions")?.render;

  return (
    <div className="mx-auto max-w-[1500px] space-y-6 pb-20">
      <header className="relative overflow-hidden rounded-[28px] border border-white/[0.08] bg-[#0d1727] p-6 sm:p-8"><div className="pointer-events-none absolute -right-20 -top-24 size-72 rounded-full bg-violet-400/[0.07] blur-3xl" /><div className="relative flex flex-col justify-between gap-6 xl:flex-row xl:items-center"><div className="flex items-start gap-4"><span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-violet-400/10 text-violet-300 ring-1 ring-inset ring-violet-400/15"><BookOpen className="size-5" /></span><div><p className="text-[10px] font-bold uppercase tracking-[.24em] text-violet-300">Editorial workspace</p><h1 className="mt-2 text-2xl font-semibold tracking-[-.035em] text-white sm:text-3xl">Blog management</h1><p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">Create, review and publish articles across your portfolio.</p></div></div>

        <div className="grid items-stretch gap-2 sm:grid-cols-2 xl:flex xl:items-center"><Link href="/admin/blog-topics" className="group inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-border bg-background/45 px-4 text-xs font-semibold text-foreground shadow-sm transition hover:-translate-y-0.5 hover:border-accent/35 hover:bg-accent/5 hover:text-accent"><ListChecks className="size-4 transition group-hover:scale-105" />Editorial planner</Link><button onClick={handleExport} className="group inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-border bg-background/45 px-4 text-xs font-semibold text-muted-foreground shadow-sm transition hover:-translate-y-0.5 hover:border-accent/25 hover:bg-muted hover:text-foreground"><Download className="size-4 transition group-hover:-translate-y-0.5" />Export JSON</button><button onClick={handleAdd} className="group inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-accent/25 bg-accent/10 px-4 text-xs font-semibold text-accent shadow-sm transition hover:-translate-y-0.5 hover:bg-accent/15"><Plus className="size-4 transition group-hover:rotate-90" />New article</button>
          <label
            className={`flex h-11 cursor-pointer select-none items-center justify-between gap-3 rounded-xl border px-3.5 text-[10px] font-semibold tracking-wide shadow-sm transition ${
              autoGenerateImages
                ? "border-status-success/30 bg-status-success/10 text-status-success"
                : "border-border bg-background/45 text-muted-foreground hover:border-accent/25 hover:text-foreground"
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
                <Sparkles className="w-4 h-4" />
              ) : (
                <Mail className="w-4 h-4" />
              )}
              Auto image
            </span>
            <span
              className={`relative h-6 w-11 rounded-full p-0.5 transition-colors duration-200 ${
                autoGenerateImages ? "bg-status-success" : "bg-muted"
              }`}
            >
              <span
                className={`block h-5 w-5 rounded-full bg-card shadow-lg transition-transform duration-200 ease-out ${
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
            className={`group flex h-11 items-center justify-center gap-2 rounded-xl border px-5 text-xs font-semibold shadow-lg transition hover:-translate-y-0.5 disabled:opacity-50 ${
              hasPendingImage
                ? autoGenerateImages
                  ? "border-status-warning/30 bg-status-warning text-white shadow-status-warning/20 hover:brightness-105"
                  : "border-status-success/30 bg-status-success text-white shadow-status-success/20 hover:brightness-105"
                : "border-accent/40 bg-accent text-accent-foreground shadow-accent/20 hover:bg-accent/90"
            }`}
          >
            {hasPendingImage && !autoGenerateImages ? (
              <Mail className="w-4 h-4" />
            ) : (
              <Sparkles
                className={`w-4 h-4 ${hasPendingImage ? "animate-bounce" : "group-hover:animate-spin"}`}
              />
            )}
            {hasPendingImage
              ? autoGenerateImages
                ? "Generate Blog Image"
                : "Send Image Prompt"
              : "Generate AI blog"}
          </button>
        </div></div></header>

      <section className="rounded-[24px] border border-white/[0.08] bg-[#0d1727] p-5 sm:p-6"><div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between"><div><div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.2em] text-violet-300"><Clock3 className="size-4" />AI publishing schedule</div><h2 className="mt-2 text-lg font-semibold text-white">Automated blog frequency</h2><p className="mt-1 max-w-2xl text-xs leading-5 text-slate-500">The scheduler writes one safe article per eligible run until the daily quantity is complete. Topic Intelligence keeps a seven-day queue reserve based on this demand.</p></div><div className="grid gap-3 sm:grid-cols-[140px_160px_auto_auto] sm:items-end"><label><span className="mb-2 block text-[10px] font-semibold text-slate-400">Blogs per day</span><input type="number" min="1" max="12" step="1" disabled={automationSettingsLoading || automationSettingsSaving} value={automationSettings.dailyQuantity} onChange={(event) => setAutomationSettings((current) => ({ ...current, dailyQuantity: Number(event.target.value) }))} className="h-11 w-full rounded-xl border border-white/[0.08] bg-slate-950/35 px-3 text-sm text-white outline-none focus:border-violet-400/40" /></label><label><span className="mb-2 block text-[10px] font-semibold text-slate-400">Interval hours</span><input type="number" min="1" max="168" step="1" disabled={automationSettingsLoading || automationSettingsSaving} value={automationSettings.intervalHours} onChange={(event) => setAutomationSettings((current) => ({ ...current, intervalHours: Number(event.target.value) }))} className="h-11 w-full rounded-xl border border-white/[0.08] bg-slate-950/35 px-3 text-sm text-white outline-none focus:border-violet-400/40" /></label><label className="flex h-11 cursor-pointer items-center gap-2 rounded-xl border border-white/[0.08] bg-slate-950/35 px-3 text-xs text-slate-300"><input type="checkbox" checked={automationSettings.enabled} disabled={automationSettingsLoading || automationSettingsSaving} onChange={(event) => setAutomationSettings((current) => ({ ...current, enabled: event.target.checked }))} className="size-4 accent-violet-400" />Enabled</label><button type="button" onClick={saveAutomationSettings} disabled={automationSettingsLoading || automationSettingsSaving} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-violet-400 px-4 text-xs font-bold text-slate-950 transition hover:bg-violet-300 disabled:opacity-50"><Save className="size-4" />{automationSettingsSaving ? "Saving..." : "Save schedule"}</button></div></div></section>

      <div className="grid overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0d1727] sm:grid-cols-4"><BlogMetric label="Total articles" value={blogs.length} /><BlogMetric label="Published" value={blogs.filter((item) => item.publishStatus === "published").length} /><BlogMetric label="Drafts" value={blogs.filter((item) => item.publishStatus === "draft").length} /><BlogMetric label="AI generated" value={blogs.filter((item) => item.aiGenerated).length} last /></div>

      <section data-columns={columns.length} data-reorder={Boolean(reorderBlogs)} className="overflow-hidden rounded-[24px] border border-white/[0.08] bg-[#0d1727]"><div className="flex flex-col justify-between gap-4 border-b border-white/[0.07] p-4 xl:flex-row xl:items-center sm:p-5"><div><p className="text-sm font-semibold text-slate-200">Article library</p><p className="mt-1 text-xs text-slate-600">Manage manual and AI-assisted content in one place.</p></div><div className="flex w-full flex-col gap-2 sm:flex-row xl:w-auto"><label className="relative w-full sm:min-w-64"><Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-600" /><input value={blogSearch} onChange={(event) => setBlogSearch(event.target.value)} placeholder="Search articles..." className="w-full rounded-xl border border-white/[0.08] bg-slate-950/35 py-3 pl-10 pr-4 text-sm outline-none placeholder:text-slate-700 focus:border-violet-400/40" /></label><label><span className="sr-only">Filter articles by date</span><input type="date" value={blogDateFilter} onChange={(event) => setBlogDateFilter(event.target.value)} className="h-11 w-full rounded-xl border border-white/[0.08] bg-slate-950/35 px-3 text-sm text-slate-200 outline-none focus:border-violet-400/40" title="Show blogs published on this date" /></label><label><span className="sr-only">Sort articles</span><select value={blogSortDirection} onChange={(event) => setBlogSortDirection(event.target.value)} className="h-11 w-full rounded-xl border border-white/[0.08] bg-slate-950/35 px-3 text-sm text-slate-200 outline-none focus:border-violet-400/40"><option value="ascending">Ascending (newest first)</option><option value="descending">Descending (oldest first)</option></select></label></div></div><div className="grid gap-4 p-4 sm:p-5 md:grid-cols-2 xl:grid-cols-3">{visibleBlogs.map((blog) => <BlogCard key={blog._id || blog.slug || blog.title} blog={blog} aiActions={aiActionRenderer?.(blog)} onEdit={() => handleEdit(blog)} onView={() => handleView(blog)} onDelete={() => handleDelete(blog)} />)}</div>{visibleBlogs.length === 0 && <div className="grid min-h-72 place-items-center text-center"><div><BookOpen className="mx-auto size-9 text-slate-700" /><p className="mt-4 text-sm font-semibold text-slate-300">No matching articles</p><p className="mt-1 text-xs text-slate-600">Try another title, date, category or tag.</p></div></div>}</section>

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
    </div>
  );
}

function BlogMetric({ label, value, last = false }) { return <div className={`p-5 sm:p-6 ${last ? "" : "border-b border-white/[0.07] sm:border-b-0 sm:border-r"}`}><p className="text-[9px] font-bold uppercase tracking-[.18em] text-slate-600">{label}</p><p className="mt-1 text-2xl font-semibold text-white">{value}</p></div>; }

function BlogCard({ blog, aiActions, onEdit, onView, onDelete }) {
  const image = getSafeImageSrc(blog.image || blog.featuredImage?.url || blog.images?.[0]);
  const status = blog._isFromDataJs ? "template" : blog.publishStatus || "draft";
  const date = blog.createdAt ? format(new Date(blog.createdAt), "MMM d, yyyy") : "Not published";
  return <article className="group overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.025] transition hover:border-violet-400/20 hover:bg-violet-400/[0.025]"><div className="relative aspect-[16/9] overflow-hidden bg-slate-950/50"><Image src={image} alt={getBlogImageAlt(blog)} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover transition duration-500 group-hover:scale-[1.03]" /><div className="absolute inset-x-0 top-0 flex items-start justify-between p-3"><span className={`rounded-full border px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider backdrop-blur-md ${status === "published" ? "border-emerald-300/20 bg-emerald-400/15 text-emerald-200" : status === "pending" ? "border-amber-300/20 bg-amber-400/15 text-amber-200" : "border-white/10 bg-slate-950/60 text-slate-400"}`}>{status}</span>{blog.featured && <span className="grid size-8 place-items-center rounded-full bg-amber-300 text-slate-950"><Star className="size-3.5 fill-current" /></span>}</div></div><div className="p-5"><div className="flex items-center justify-between gap-3"><p className="text-[9px] font-bold uppercase tracking-[.16em] text-violet-300/70">{blog.category || "Article"}</p><p className="text-[9px] text-slate-600">{date}</p></div><h2 className="mt-2 line-clamp-2 min-h-10 text-base font-semibold leading-5 text-slate-100">{blog.title}</h2><p className="mt-3 line-clamp-2 min-h-10 text-xs leading-5 text-slate-500">{blog.summary || "No article summary added yet."}</p><div className="mt-4 flex min-h-7 flex-wrap items-center gap-1.5">{aiActions}</div><div className="mt-5 flex items-center gap-2 border-t border-white/[0.06] pt-4"><button onClick={onEdit} className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-violet-400/10 py-2.5 text-[10px] font-bold uppercase tracking-wider text-violet-300 hover:bg-violet-400/15"><Pencil className="size-3.5" />Edit article</button>{!blog._isFromDataJs && <button onClick={onDelete} className="grid size-9 place-items-center rounded-lg text-slate-600 hover:bg-rose-400/10 hover:text-rose-300"><Trash2 className="size-3.5" /></button>}<button onClick={onView} className="grid size-9 place-items-center rounded-lg border border-white/[0.07] text-slate-500 hover:text-white"><ExternalLink className="size-3.5" /></button></div></div></article>;
}
