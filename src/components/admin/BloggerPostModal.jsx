"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Newspaper,
  ExternalLink,
  Send,
  Eye,
  Code,
  Edit3,
  Loader2,
  RefreshCcw,
  BookOpen,
} from "lucide-react";
import { toast } from "sonner";

export default function BloggerPostModal({ isOpen, onClose, parentBlog }) {
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [bloggerPost, setBloggerPost] = useState(null);
  const [activeTab, setActiveTab] = useState("preview"); // "preview" | "edit"
  const [publishing, setPublishing] = useState(false);

  // Editable fields
  const [editTitle, setEditTitle] = useState("");
  const [editSummary, setEditSummary] = useState("");
  const [editContent, setEditContent] = useState("");

  useEffect(() => {
    if (isOpen && parentBlog?._id) {
      fetchOrGeneratePost();
    }
  }, [isOpen, parentBlog]);

  const fetchOrGeneratePost = async () => {
    if (!parentBlog?._id) return;
    setLoading(true);
    setBloggerPost(null);

    try {
      // Check if supporting post already exists
      const res = await fetch(`/api/admin/blogger`);
      const json = await res.json();

      if (json.success && Array.isArray(json.data)) {
        const existing = json.data.find(
          (p) => p.parentBlogId?.toString() === parentBlog._id.toString()
        );

        if (existing) {
          setBloggerPost(existing);
          setEditTitle(existing.title || "");
          setEditSummary(existing.summary || "");
          setEditContent(existing.content || "");
          setLoading(false);
          return;
        }
      }

      // If not existing, trigger generation automatically
      await generateNewPost();
    } catch (err) {
      console.error(err);
      toast.error("Failed to load Blogger post state.");
      setLoading(false);
    }
  };

  const generateNewPost = async () => {
    setGenerating(true);
    setLoading(true);

    try {
      const res = await fetch("/api/admin/blogger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ parentBlogId: parentBlog._id }),
      });
      const json = await res.json();

      if (json.success) {
        setBloggerPost(json.data);
        setEditTitle(json.data.title || "");
        setEditSummary(json.data.summary || "");
        setEditContent(json.data.content || "");
        toast.success(`Supporting article created! (QC Score: ${json.data.qualityScore}/10)`);
      } else {
        toast.error("AI Generation Failed: " + json.error);
      }
    } catch (err) {
      toast.error("Network error during AI generation.");
    } finally {
      setGenerating(false);
      setLoading(false);
    }
  };

  const handlePublishToBlogger = async (isDraft = false) => {
    if (!bloggerPost?._id) return;

    // Strict Image Validation Check
    const hasImageInContent = editContent && editContent.includes("<img");
    const hasParentImage = parentBlog?.image || parentBlog?.featuredImage?.url;

    if (!hasImageInContent && !hasParentImage) {
      toast.error(
        "🖼️ Cover Picture Required: Please generate or upload a featured image for this blog first before publishing to Blogger.",
        { duration: 6000 }
      );
      return;
    }

    setPublishing(true);

    try {
      const res = await fetch(`/api/admin/blogger/${bloggerPost._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editTitle,
          summary: editSummary,
          content: editContent,
          action: isDraft ? "draft" : "publish",
        }),
      });
      const json = await res.json();

      if (json.success) {
        toast.success(
          isDraft
            ? "Saved as Draft on Google Blogger!"
            : "🚀 Published LIVE on Google Blogger!"
        );
        setBloggerPost(json.data);
      } else {
        toast.error("Publishing Failed: " + json.error);
      }
    } catch (err) {
      toast.error("Network error publishing to Blogger.");
    } finally {
      setPublishing(false);
    }
  };

  if (!isOpen || !parentBlog) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-4xl max-h-[90vh] flex flex-col rounded-3xl border border-white/10 bg-[#0b1329] text-white shadow-2xl overflow-hidden z-10"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 sm:p-6 border-b border-white/10 bg-slate-900/50">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <Newspaper className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-cyan-400">
                    Blogger Engine Assistant
                  </span>
                  {bloggerPost?.qualityScore && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      QC Score: {bloggerPost.qualityScore}/10 PASSED
                    </span>
                  )}
                </div>
                <h2 className="text-base sm:text-lg font-bold line-clamp-1 text-slate-100 mt-0.5">
                  Supporting Post for: "{parentBlog.title}"
                </h2>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
            {loading || generating ? (
              <div className="flex flex-col items-center justify-center py-16 text-center space-y-4">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full border-4 border-cyan-500/20 border-t-cyan-400 animate-spin" />
                  <Sparkles className="w-6 h-6 text-cyan-400 absolute inset-0 m-auto animate-pulse" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {generating
                      ? "Gemini AI is Drafting 900-1200 Word Article..."
                      : "Loading Blogger Supporting Article..."}
                  </h3>
                  <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
                    Applying 80/20 Open-Loop attraction strategy, short paragraphs, zero AI tropes, and Cloudinary cover banner embed.
                  </p>
                </div>
              </div>
            ) : bloggerPost ? (
              <>
                {/* Status Banner */}
                <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-md">
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        bloggerPost.publishStatus === "published"
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                          : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                      }`}
                    >
                      Status: {bloggerPost.publishStatus}
                    </span>
                    {bloggerPost.bloggerUrl && (
                      <a
                        href={bloggerPost.bloggerUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-semibold text-cyan-400 hover:underline"
                      >
                        View Live on Blogger <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setActiveTab("preview")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                        activeTab === "preview"
                          ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      <Eye className="w-3.5 h-3.5" /> Live Render Preview
                    </button>
                    <button
                      onClick={() => setActiveTab("edit")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                        activeTab === "edit"
                          ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      <Code className="w-3.5 h-3.5" /> Source Editor
                    </button>
                  </div>
                </div>

                {/* Main Tab Views */}
                {activeTab === "preview" ? (
                  <div className="space-y-4">
                    <div className="p-4 rounded-2xl border border-white/10 bg-slate-950/40">
                      <h3 className="text-xl font-bold text-white mb-2">{editTitle}</h3>
                      <p className="text-xs text-slate-400 mb-4">{editSummary}</p>

                      {/* Live HTML Render Container */}
                      <div className="prose prose-invert max-w-none text-slate-300 text-sm leading-relaxed p-4 rounded-xl bg-slate-900/80 border border-white/5 max-h-[400px] overflow-y-auto">
                        <div dangerouslySetInnerHTML={{ __html: editContent }} />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                        Post Title
                      </label>
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-slate-950/60 text-sm text-white focus:outline-none focus:border-cyan-500/50"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                        Summary
                      </label>
                      <textarea
                        rows={2}
                        value={editSummary}
                        onChange={(e) => setEditSummary(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-slate-950/60 text-sm text-white focus:outline-none focus:border-cyan-500/50"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                        HTML Content (900-1200 Words)
                      </label>
                      <textarea
                        rows={12}
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-slate-950/60 text-xs font-mono text-slate-300 focus:outline-none focus:border-cyan-500/50"
                      />
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <AlertCircle className="w-10 h-10 text-amber-400 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-300">No Blogger post found.</p>
                <button
                  onClick={generateNewPost}
                  className="mt-4 px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs"
                >
                  Generate Now
                </button>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          {bloggerPost && !loading && (
            <div className="flex items-center justify-between p-5 border-t border-white/10 bg-slate-900/80">
              <button
                onClick={generateNewPost}
                disabled={generating || publishing}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-white/10 border border-white/10 disabled:opacity-50"
              >
                <RefreshCcw className="w-3.5 h-3.5" /> Re-Generate AI Article
              </button>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => handlePublishToBlogger(true)}
                  disabled={publishing}
                  className="px-4 py-2.5 rounded-xl border border-white/10 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 disabled:opacity-50"
                >
                  Save Draft on Blogger
                </button>
                <button
                  onClick={() => handlePublishToBlogger(false)}
                  disabled={publishing}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-xs font-bold text-white shadow-lg shadow-cyan-500/25 disabled:opacity-50"
                >
                  {publishing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  Publish Live to Google Blogger
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
