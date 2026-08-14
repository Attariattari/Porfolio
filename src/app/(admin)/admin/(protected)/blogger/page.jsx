"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Send,
  Trash2,
  Edit3,
  Eye,
  RefreshCcw,
  Newspaper,
  Layers,
  Search,
  Plus,
  Zap,
  ImageIcon,
} from "lucide-react";
import useAdminStore from "@/lib/store/adminStore";

export default function BloggerAdminPage() {
  const { blogs, fetchBlogs } = useAdminStore();

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [configStatus, setConfigStatus] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Modals state
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [selectedParentId, setSelectedParentId] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  // Edit fields inside modal
  const [editTitle, setEditTitle] = useState("");
  const [editSummary, setEditSummary] = useState("");
  const [editContent, setEditContent] = useState("");

  const fetchBloggerPosts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/blogger?status=${statusFilter}`);
      const json = await res.json();
      if (json.success) {
        setPosts(json.data || []);
        setConfigStatus(json.configStatus || null);
      } else {
        toast.error("Failed to load Blogger posts: " + json.error);
      }
    } catch (e) {
      toast.error("Network error fetching Blogger posts");
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchBloggerPosts();
    fetchBlogs();
  }, [fetchBloggerPosts, fetchBlogs]);

  const handleGenerate = async () => {
    if (!selectedParentId) {
      toast.error("Please select a parent blog first.");
      return;
    }

    setIsGenerating(true);
    toast.loading("Generating 900-1200 word supporting article with AI...", { id: "gen-toast" });

    try {
      const res = await fetch("/api/admin/blogger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ parentBlogId: selectedParentId }),
      });
      const json = await res.json();

      if (json.success) {
        toast.success("Supporting post generated & passed QC audit!", { id: "gen-toast" });
        setIsGenerateModalOpen(false);
        fetchBloggerPosts();
      } else {
        toast.error("Generation failed: " + json.error, { id: "gen-toast" });
      }
    } catch (e) {
      toast.error("Network error during generation", { id: "gen-toast" });
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePublish = async (postId, isDraft = false) => {
    const targetPost = posts.find((p) => p._id === postId);
    const hasImageInContent = targetPost?.content && targetPost.content.includes("<img");

    if (!hasImageInContent) {
      toast.error(
        "🖼️ Cover Picture Required: Please generate or upload a featured image for this blog first before publishing to Blogger.",
        { duration: 6000 }
      );
      return;
    }

    setIsPublishing(true);
    toast.loading(`Publishing to Google Blogger API v3 (${isDraft ? "Draft" : "Live"})...`, { id: "pub-toast" });

    try {
      const res = await fetch(`/api/admin/blogger/${postId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "publish", isDraft }),
      });
      const json = await res.json();

      if (json.success) {
        toast.success(`Successfully sent to Google Blogger as ${isDraft ? "Draft" : "Live Post"}!`, { id: "pub-toast" });
        if (selectedPost && selectedPost._id === postId) {
          setSelectedPost(json.data);
        }
        fetchBloggerPosts();
      } else {
        toast.error("Blogger Publish Failed: " + json.error, { id: "pub-toast" });
      }
    } catch (e) {
      toast.error("Network error while publishing", { id: "pub-toast" });
    } finally {
      setIsPublishing(false);
    }
  };

  const handleSaveEdits = async () => {
    if (!selectedPost) return;

    try {
      const res = await fetch(`/api/admin/blogger/${selectedPost._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editTitle,
          summary: editSummary,
          content: editContent,
        }),
      });
      const json = await res.json();

      if (json.success) {
        toast.success("Saved changes successfully!");
        setSelectedPost(json.data);
        fetchBloggerPosts();
      } else {
        toast.error("Failed to save edits: " + json.error);
      }
    } catch (e) {
      toast.error("Network error saving edits");
    }
  };

  const handleDelete = async (postId) => {
    if (!confirm("Are you sure you want to delete this Blogger supporting post?")) return;

    try {
      const res = await fetch(`/api/admin/blogger/${postId}`, {
        method: "DELETE",
      });
      const json = await res.json();

      if (json.success) {
        toast.success("Post deleted.");
        fetchBloggerPosts();
      } else {
        toast.error("Delete failed: " + json.error);
      }
    } catch (e) {
      toast.error("Network error deleting post");
    }
  };

  const openPreviewModal = (post) => {
    setSelectedPost(post);
    setEditTitle(post.title || "");
    setEditSummary(post.summary || "");
    setEditContent(post.content || "");
    setIsPreviewModalOpen(true);
  };

  const handleRunDripNow = async () => {
    toast.loading("Drip Engine: Processing 1 un-synced old blog...", { id: "drip-toast" });

    try {
      const res = await fetch("/api/admin/blogger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "process_drip" }),
      });
      const json = await res.json();

      if (json.success) {
        toast.success(json.message || "Processed 1 old blog!", { id: "drip-toast" });
        fetchBloggerPosts();
      } else {
        toast.error("Drip Engine Error: " + json.error, { id: "drip-toast" });
      }
    } catch (e) {
      toast.error("Network error running Drip Engine", { id: "drip-toast" });
    }
  };

  const filteredPosts = posts.filter(
    (p) =>
      p.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.parentBlogTitle?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: posts.length,
    published: posts.filter((p) => p.publishStatus === "published").length,
    pending: posts.filter((p) => p.publishStatus === "pending_review").length,
    avgScore:
      posts.length > 0
        ? (posts.reduce((acc, p) => acc + (p.qualityScore || 0), 0) / posts.length).toFixed(1)
        : "8.5",
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6 sm:space-y-8">
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-border/40 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shrink-0">
              <Newspaper className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Google Blogger Engine</h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                Generate & publish 900-1200 word supporting articles to Google Blogger to drive high-intent referral traffic.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 sm:gap-3 w-full lg:w-auto">
          <button
            onClick={() => fetchBloggerPosts()}
            className="p-2.5 rounded-lg border border-border bg-card/50 hover:bg-accent text-foreground transition-all shrink-0"
            title="Refresh list"
          >
            <RefreshCcw className="w-4 h-4" />
          </button>
          <button
            onClick={handleRunDripNow}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 font-medium transition-all text-xs sm:text-sm"
            title="Process 1 un-synced old blog today"
          >
            <Zap className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Run Daily Drip</span>
          </button>
          <button
            onClick={() => setIsGenerateModalOpen(true)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-medium shadow-lg shadow-cyan-500/25 transition-all text-xs sm:text-sm"
          >
            <Sparkles className="w-4 h-4 shrink-0" />
            <span>Generate Supporting Post</span>
          </button>
        </div>
      </div>

      {/* Config Banner */}
      {configStatus && !configStatus.configured && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-amber-200">Google Blogger API Not Fully Configured in .env.local</span>
            <p className="mt-1 text-amber-400/90 leading-relaxed">
              Add <code className="bg-amber-950/60 px-1 py-0.5 rounded">GOOGLE_BLOGGER_CLIENT_ID</code>, <code className="bg-amber-950/60 px-1 py-0.5 rounded">GOOGLE_BLOGGER_CLIENT_SECRET</code>, <code className="bg-amber-950/60 px-1 py-0.5 rounded">GOOGLE_BLOGGER_REFRESH_TOKEN</code>, and <code className="bg-amber-950/60 px-1 py-0.5 rounded">GOOGLE_BLOGGER_BLOG_ID</code> to enable automated 1-Click Publishing to Blogger. You can still generate, review, and edit supporting articles.
            </p>
          </div>
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-3.5 sm:p-4 rounded-xl border border-border/60 bg-card/40 backdrop-blur-md">
          <div className="text-[11px] sm:text-xs font-medium text-muted-foreground">Total Supporting Posts</div>
          <div className="text-xl sm:text-2xl font-bold mt-1">{stats.total}</div>
        </div>
        <div className="p-3.5 sm:p-4 rounded-xl border border-green-500/20 bg-green-500/5 backdrop-blur-md">
          <div className="text-[11px] sm:text-xs font-medium text-green-400">Published on Blogger</div>
          <div className="text-xl sm:text-2xl font-bold mt-1 text-green-400">{stats.published}</div>
        </div>
        <div className="p-3.5 sm:p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 backdrop-blur-md">
          <div className="text-[11px] sm:text-xs font-medium text-amber-400">Pending Review</div>
          <div className="text-xl sm:text-2xl font-bold mt-1 text-amber-400">{stats.pending}</div>
        </div>
        <div className="p-3.5 sm:p-4 rounded-xl border border-cyan-500/20 bg-cyan-500/5 backdrop-blur-md">
          <div className="text-[11px] sm:text-xs font-medium text-cyan-400">Avg QC Score</div>
          <div className="text-xl sm:text-2xl font-bold mt-1 text-cyan-400">{stats.avgScore} / 10</div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search supporting posts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm rounded-lg bg-card/60 border border-border/60 focus:outline-none focus:border-cyan-500 transition-colors"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs">
          <span className="text-muted-foreground font-medium mr-1">Filter:</span>
          {["all", "pending_review", "published", "failed"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg border capitalize text-xs transition-all ${
                statusFilter === st
                  ? "bg-cyan-500/20 border-cyan-500/40 text-cyan-300 font-semibold"
                  : "border-border/60 bg-card/40 text-muted-foreground hover:bg-accent"
              }`}
            >
              {st.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Main Data Container: Rich Visual Cards Grid */}
      <div>
        {loading ? (
          <div className="p-12 text-center text-xs text-muted-foreground bg-card/40 rounded-2xl border border-border/60">
            Loading supporting posts...
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="p-12 text-center text-xs text-muted-foreground bg-card/40 rounded-2xl border border-border/60">
            No supporting posts found. Click <strong>Generate Supporting Post</strong> to create one.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filteredPosts.map((item) => {
              const coverUrl =
                item.coverImage ||
                item.content?.match(/<img[^>]+src=["']([^"']+)["']/i)?.[1] ||
                item.parentBlogId?.featuredImage?.url ||
                item.parentBlogId?.image ||
                "/blog-preview.png";

              return (
                <div
                  key={item._id}
                  className="group relative flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-card/50 backdrop-blur-md transition-all duration-300 hover:border-cyan-500/40 hover:shadow-xl hover:shadow-cyan-500/5"
                >
                  {/* Top Cover Image Banner with Badges */}
                  <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-950">
                    <img
                      src={coverUrl}
                      alt={item.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                    {/* Top-Left Publish Status Badge */}
                    <div className="absolute left-3 top-3">
                      {item.publishStatus === "published" ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500 text-slate-950 shadow-md">
                          <CheckCircle2 className="w-3 h-3" /> Published
                        </span>
                      ) : item.publishStatus === "pending_review" ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500 text-slate-950 shadow-md">
                          Pending Review
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-500 text-white shadow-md">
                          Failed
                        </span>
                      )}
                    </div>

                    {/* Top-Right QC Score Badge */}
                    <div className="absolute right-3 top-3">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-black/70 text-cyan-300 border border-cyan-500/30 backdrop-blur-md shadow-md">
                        {item.qualityScore || 8.5}/10 QC
                      </span>
                    </div>
                  </div>

                  {/* Card Content Body */}
                  <div className="flex flex-1 flex-col p-5 space-y-4">
                    {/* Parent Blog Category / Master Link */}
                    <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-cyan-400">
                      <div className="flex items-center gap-1.5 truncate max-w-[200px]">
                        <Layers className="w-3.5 h-3.5 shrink-0 text-cyan-400" />
                        <span className="truncate">{item.parentBlogTitle || "Master Pillar Blog"}</span>
                      </div>
                      {item.parentBlogUrl && (
                        <a
                          href={item.parentBlogUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-muted-foreground hover:text-cyan-300 transition-colors inline-flex items-center gap-1 shrink-0"
                          title="View Master Blog"
                        >
                          Master <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>

                    {/* Title & Summary */}
                    <div className="space-y-1.5">
                      <h3 className="text-base font-bold leading-snug tracking-tight text-foreground line-clamp-2 group-hover:text-cyan-300 transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-xs leading-relaxed text-muted-foreground line-clamp-2">
                        {item.summary}
                      </p>
                    </div>

                    {/* Spacer */}
                    <div className="mt-auto pt-2" />

                    {/* Main Action Buttons */}
                    <div className="grid grid-cols-2 gap-2 pt-3 border-t border-border/40">
                      <button
                        onClick={() => openPreviewModal(item)}
                        className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-card border border-border/80 text-foreground hover:bg-accent hover:border-cyan-500/30 text-xs font-bold transition-all shadow-sm"
                      >
                        <Eye className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Edit Post</span>
                      </button>

                      <button
                        onClick={() => handlePublish(item._id, false)}
                        disabled={isPublishing || item.publishStatus === "published"}
                        className={`flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border text-xs font-bold transition-all ${
                          item.publishStatus === "published"
                            ? "opacity-50 cursor-not-allowed border-border text-muted-foreground bg-card/30"
                            : "bg-emerald-500/15 hover:bg-emerald-500/25 border-emerald-500/40 text-emerald-300 shadow-sm"
                        }`}
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>{item.publishStatus === "published" ? "Live" : "Blogger"}</span>
                      </button>
                    </div>

                    {/* Footer Row: Blogger Link & Delete */}
                    <div className="flex items-center justify-between pt-1">
                      {item.bloggerUrl ? (
                        <a
                          href={item.bloggerUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[10px] font-bold text-blue-400 hover:underline inline-flex items-center gap-1"
                        >
                          <ExternalLink className="w-3 h-3" /> View Live on Blogger
                        </a>
                      ) : (
                        <span className="text-[10px] text-muted-foreground/60 italic">Draft Article</span>
                      )}

                      <button
                        onClick={() => handleDelete(item._id)}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        title="Delete Supporting Post"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal 1: Generate Supporting Post */}
      <AnimatePresence>
        {isGenerateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg p-5 sm:p-6 rounded-2xl bg-card border border-border shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div className="flex items-center gap-2 text-cyan-400 font-semibold text-base sm:text-lg">
                  <Sparkles className="w-5 h-5 shrink-0" /> Generate Supporting Article
                </div>
                <button
                  onClick={() => setIsGenerateModalOpen(false)}
                  className="text-muted-foreground hover:text-foreground text-sm p-1"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="block font-medium mb-1.5 text-foreground">
                    Select Parent Blog (Pillar Article):
                  </label>
                  <select
                    value={selectedParentId}
                    onChange={(e) => setSelectedParentId(e.target.value)}
                    className="w-full p-2.5 rounded-lg bg-background border border-border focus:border-cyan-500 text-foreground"
                  >
                    <option value="">-- Choose Parent Blog --</option>
                    {blogs.map((b) => (
                      <option key={b._id} value={b._id}>
                        {b.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="p-3 rounded-lg bg-muted/40 border border-border/60 text-muted-foreground leading-relaxed">
                  💡 <strong>How it works:</strong> Gemini AI will analyze the selected parent blog and write a <strong>100% unique 900–1200 word standalone supporting post</strong> with open-loop attraction strategy and natural backlinks pointing to the parent blog. It will run through the existing Quality Control audit (Score ≥ 8.0).
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                <button
                  onClick={() => setIsGenerateModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-border text-xs hover:bg-accent"
                >
                  Cancel
                </button>
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating || !selectedParentId}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs font-semibold shadow-lg shadow-cyan-500/20 disabled:opacity-50"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCcw className="w-3.5 h-3.5 animate-spin" /> Generating...
                    </>
                  ) : (
                    <>
                      <Zap className="w-3.5 h-3.5" /> Start AI Generation
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal 2: Preview & Edit Modal */}
      <AnimatePresence>
        {isPreviewModalOpen && selectedPost && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl bg-card border border-border shadow-2xl overflow-hidden"
            >
              {/* Modal Top Header */}
              <div className="p-3.5 sm:p-4 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-muted/30">
                <div>
                  <div className="text-[11px] text-cyan-400 font-mono truncate">
                    Parent: {selectedPost.parentBlogTitle}
                  </div>
                  <h2 className="text-sm sm:text-base font-bold text-foreground mt-0.5 line-clamp-1">
                    {selectedPost.title}
                  </h2>
                </div>

                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                  <button
                    onClick={handleSaveEdits}
                    className="px-2.5 py-1.5 text-xs rounded-lg bg-accent border border-border text-foreground hover:bg-accent/80 font-medium"
                  >
                    Save Edits
                  </button>

                  <button
                    onClick={() => handlePublish(selectedPost._id, true)}
                    disabled={isPublishing}
                    className="flex items-center gap-1 px-2.5 py-1.5 text-xs rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 hover:bg-amber-500/30 disabled:opacity-50 font-medium"
                  >
                    <Send className="w-3 h-3" /> Draft
                  </button>

                  <button
                    onClick={() => handlePublish(selectedPost._id, false)}
                    disabled={isPublishing || selectedPost.publishStatus === "published"}
                    className="flex items-center gap-1 px-2.5 py-1.5 text-xs rounded-lg bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30 disabled:opacity-50 font-medium"
                  >
                    <Send className="w-3 h-3" />
                    {selectedPost.publishStatus === "published" ? "Live" : "Publish Live"}
                  </button>

                  <button
                    onClick={() => setIsPreviewModalOpen(false)}
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground text-sm"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Modal Content Body */}
              <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1 text-xs">
                {(() => {
                  const coverUrl =
                    selectedPost.coverImage ||
                    selectedPost.content?.match(/<img[^>]+src=["']([^"']+)["']/i)?.[1] ||
                    selectedPost.parentBlogId?.featuredImage?.url ||
                    selectedPost.parentBlogId?.image ||
                    null;

                  return coverUrl ? (
                    <div className="rounded-xl border border-cyan-500/30 bg-cyan-500/5 p-3 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                      <div className="relative w-full sm:w-24 h-20 sm:h-16 rounded-lg overflow-hidden border border-cyan-500/40 bg-slate-950 shrink-0">
                        <img src={coverUrl} alt="Cover Preview" className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-cyan-300 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-green-400 shrink-0" /> Cover Photo Attached & Ready
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                          This featured image is linked and will automatically be included at the top of the Google Blogger post.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-3 flex items-start gap-3">
                      <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shrink-0">
                        <ImageIcon className="w-4 h-4 text-amber-400" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-amber-300">
                          ⚠️ Cover Photo Missing / Waiting Resolution
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                          Image is being generated or waiting for manual upload via Super Admin email. Publishing will unlock as soon as the picture is uploaded.
                        </p>
                      </div>
                    </div>
                  );
                })()}

                <div>
                  <label className="block font-semibold mb-1">Title:</label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full p-2.5 rounded-lg bg-background border border-border text-foreground text-sm"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Summary:</label>
                  <textarea
                    value={editSummary}
                    onChange={(e) => setEditSummary(e.target.value)}
                    rows={2}
                    className="w-full p-2.5 rounded-lg bg-background border border-border text-foreground text-xs"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block font-semibold">HTML Content (900-1200 Words):</label>
                    <span className="text-[10px] text-cyan-400 font-mono">
                      QC Score: {selectedPost.qualityScore}/10
                    </span>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div>
                      <div className="text-[10px] text-muted-foreground mb-1">HTML Source Editor</div>
                      <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        rows={12}
                        className="w-full p-3 rounded-lg bg-background border border-border font-mono text-[11px] leading-relaxed text-foreground"
                      />
                    </div>
                    <div>
                      <div className="text-[10px] text-muted-foreground mb-1">Live Render Preview</div>
                      <div
                        className="p-4 rounded-lg bg-background border border-border max-h-[300px] overflow-y-auto prose prose-invert prose-sm text-xs leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: editContent }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
