"use client";

import { useState, useEffect } from "react";
import useAdminStore from "@/lib/store/adminStore";
import DataTable from "@/components/admin/DataTable";
import FormModal from "@/components/admin/FormModal";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { z } from "zod";
import { toast } from "sonner";
import { uploadPendingImages } from "@/lib/uploadHelper";
import ImageUploader from "@/components/admin/ImageUploader";
import { Controller } from "react-hook-form";
import { AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { Sparkles, CheckCircle2, Mail, RefreshCcw, Copy } from "lucide-react";
import AIBlogProgress from "@/components/admin/AIBlogProgress";

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
  const { blogs, fetchBlogs, addBlog, updateBlog, deleteBlog, reorderBlogs } =
    useAdminStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isAIProgressOpen, setIsAIProgressOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [autoGenerateImages, setAutoGenerateImages] = useState(false);

  // Sync entries on mount
  useEffect(() => {
    fetchBlogs();
  }, [fetchBlogs]);

  useEffect(() => {
    const saved = window.localStorage.getItem("admin:autoGenerateBlogImages");
    setAutoGenerateImages(saved === "true");
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
              <div className="w-2 h-2 rounded-full border border-slate-500" />
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter">
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
            <span className="text-slate-500">Template</span>
          ) : (
            <span
              className={
                item.publishStatus === "published"
                  ? "text-green-500"
                  : item.publishStatus === "pending"
                    ? "text-amber-500"
                    : "text-slate-400"
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
        <div className="w-16 h-10 rounded-lg overflow-hidden border border-white/10 shadow-lg bg-white/5 flex items-center justify-center">
          <img
            src={item.image || item.images?.[0]}
            alt={item.title}
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
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
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
          className={`px-2 py-1 rounded text-[8px] font-black uppercase ${item.featured ? "bg-amber-500/10 text-amber-500" : "bg-slate-500/10 text-slate-500"}`}
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
              className="px-3 py-1.5 bg-amber-500 text-black text-[9px] font-black uppercase tracking-tighter rounded-md hover:bg-amber-400 transition-all flex items-center gap-1 animate-pulse"
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
            <span className="text-[9px] text-slate-600 font-bold uppercase">
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
                      fetchBlogs();
                    } else {
                      toast.error(data.message || "Image regeneration failed.", {
                        id: toastId,
                      });
                    }
                  }}
                  className="p-1.5 rounded-md border border-white/10 text-slate-400 hover:text-white hover:bg-white/10"
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
                className="p-1.5 rounded-md border border-white/10 text-slate-400 hover:text-white hover:bg-white/10"
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
                  className="p-1.5 rounded-md border border-white/10 text-slate-400 hover:text-white hover:bg-white/10"
                  title="Copy image prompt"
                >
                  <Copy className="w-3 h-3" />
                </button>
              ) : null}
            </>
          ) : null}
        </div>
      ),
    },
  ];

  const [selectedBlogForImage, setSelectedBlogForImage] = useState(null);

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
    setIsModalOpen(true);
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
    setIsModalOpen(true);
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
      Number.isFinite(createdTime) && Date.now() - createdTime < 24 * 60 * 60 * 1000;

    return (
      b.aiGenerated &&
      isFreshAiBlog &&
      !hasImage &&
      b.publishStatus !== "published" &&
      canContinueImageStep
    );
  });
  const hasPendingImage = !!pendingImageBlog;

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-4">
        <div>
          <h1 className="text-2xl md:text-4xl font-black italic uppercase tracking-tighter text-white">
            Narrative{" "}
            <span className="text-accent underline decoration-accent/20 underline-offset-8">
              Forge
            </span>
          </h1>
          <p className="text-[10px] md:text-sm text-slate-500 mt-2 md:mt-4 font-medium tracking-tight uppercase tracking-widest">
            Publish and manage intellectual property across the network.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <label
            className={`flex h-10 cursor-pointer select-none items-center justify-between gap-3 rounded-lg border px-3 text-[10px] font-black uppercase tracking-widest transition-colors ${
              autoGenerateImages
                ? "border-accent/40 bg-accent/10 text-accent"
                : "border-white/10 bg-white/5 text-slate-400 hover:text-slate-200"
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
              Auto Image
            </span>
            <span
              className={`relative h-6 w-11 rounded-full p-0.5 transition-colors duration-200 ${
                autoGenerateImages ? "bg-accent" : "bg-slate-700"
              }`}
            >
              <span
                className={`block h-5 w-5 rounded-full bg-white shadow-lg transition-transform duration-200 ease-out ${
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
            className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest text-white shadow-lg transition-all hover:scale-105 active:scale-95 group ${
              hasPendingImage
                ? autoGenerateImages
                  ? "bg-gradient-to-r from-amber-500 to-orange-600 shadow-amber-500/20 hover:shadow-amber-500/40"
                  : "bg-gradient-to-r from-emerald-500 to-teal-600 shadow-emerald-500/20 hover:shadow-emerald-500/40"
                : "bg-gradient-to-r from-accent to-blue-600 shadow-accent/20 hover:shadow-accent/40"
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
              : "AI Start Blog Generate"}
          </button>
        </div>
      </div>

      <DataTable
        title="Administer Blogs"
        columns={columns}
        data={blogs}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onView={handleView}
        onDelete={handleDelete}
        onReorder={reorderBlogs}
        filters={[
          {
            key: "publishStatus",
            label: "All Publish Status",
            options: [
              { label: "Published", value: "published" },
              { label: "Pending", value: "pending" },
              { label: "Draft", value: "draft" },
            ],
          },
          {
            key: "featured",
            label: "All Featured",
            options: [
              { label: "Featured", value: "true" },
              { label: "Standard", value: "false" },
            ],
          },
        ]}
      />

      <AnimatePresence>
        {isModalOpen && (
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
            onComplete={() => fetchBlogs()}
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
    </div>
  );
}
