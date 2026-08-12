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
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/40 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Newspaper className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Google Blogger Engine</h1>
              <p className="text-sm text-muted-foreground">
                Generate & publish 900-1200 word supporting articles to Google Blogger to drive high-intent referral traffic.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchBloggerPosts()}
            className="p-2.5 rounded-lg border border-border bg-card/50 hover:bg-accent text-foreground transition-all"
            title="Refresh list"
          >
            <RefreshCcw className="w-4 h-4" />
          </button>
          <button
            onClick={handleRunDripNow}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 font-medium transition-all text-sm"
            title="Process 1 un-synced old blog today"
          >
            <Zap className="w-4 h-4 text-amber-400" />
            Run Daily Drip (1 Old Blog)
          </button>
          <button
            onClick={() => setIsGenerateModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-medium shadow-lg shadow-cyan-500/25 transition-all text-sm"
          >
            <Sparkles className="w-4 h-4" />
            Generate Supporting Post
          </button>
        </div>
      </div>

      {/* Config Banner */}
      {configStatus && !configStatus.configured && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-amber-200">Google Blogger API Not Fully Configured in .env.local</span>
            <p className="mt-1 text-amber-400/90">
              Add <code className="bg-amber-950/60 px-1 py-0.5 rounded">GOOGLE_BLOGGER_CLIENT_ID</code>, <code className="bg-amber-950/60 px-1 py-0.5 rounded">GOOGLE_BLOGGER_CLIENT_SECRET</code>, <code className="bg-amber-950/60 px-1 py-0.5 rounded">GOOGLE_BLOGGER_REFRESH_TOKEN</code>, and <code className="bg-amber-950/60 px-1 py-0.5 rounded">GOOGLE_BLOGGER_BLOG_ID</code> to enable automated 1-Click Publishing to Blogger. You can still generate, review, and edit supporting articles.
            </p>
          </div>
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-border/60 bg-card/40 backdrop-blur-md">
          <div className="text-xs font-medium text-muted-foreground">Total Supporting Posts</div>
          <div className="text-2xl font-bold mt-1">{stats.total}</div>
        </div>
        <div className="p-4 rounded-xl border border-green-500/20 bg-green-500/5 backdrop-blur-md">
          <div className="text-xs font-medium text-green-400">Published on Blogger</div>
          <div className="text-2xl font-bold mt-1 text-green-400">{stats.published}</div>
        </div>
        <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 backdrop-blur-md">
          <div className="text-xs font-medium text-amber-400">Pending Review</div>
          <div className="text-2xl font-bold mt-1 text-amber-400">{stats.pending}</div>
        </div>
        <div className="p-4 rounded-xl border border-cyan-500/20 bg-cyan-500/5 backdrop-blur-md">
          <div className="text-xs font-medium text-cyan-400">Avg QC Score</div>
          <div className="text-2xl font-bold mt-1 text-cyan-400">{stats.avgScore} / 10</div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
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

        <div className="flex items-center gap-2 text-xs">
          <span className="text-muted-foreground">Filter:</span>
          {["all", "pending_review", "published", "failed"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg border capitalize transition-all ${
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

      {/* Main Data Table */}
      <div className="rounded-xl border border-border/60 bg-card/40 backdrop-blur-md overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/40 border-b border-border/60 text-muted-foreground font-semibold uppercase tracking-wider">
              <tr>
                <th className="p-4">Status</th>
                <th className="p-4">Cover Photo</th>
                <th className="p-4">Supporting Post Title</th>
                <th className="p-4">Parent Master Blog</th>
                <th className="p-4">QC Score</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40 text-foreground">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted-foreground">
                    Loading supporting posts...
                  </td>
                </tr>
              ) : filteredPosts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted-foreground">
                    No supporting posts found. Click <strong>Generate Supporting Post</strong> to create one.
                  </td>
                </tr>
              ) : (
                filteredPosts.map((item) => {
                  const coverUrl =
                    item.coverImage ||
                    item.content?.match(/<img[^>]+src=["']([^"']+)["']/i)?.[1] ||
                    item.parentBlogId?.featuredImage?.url ||
                    item.parentBlogId?.image ||
                    null;

                  return (
                    <tr key={item._id} className="hover:bg-accent/30 transition-colors">
                      <td className="p-4">
                        {item.publishStatus === "published" ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-green-500/10 text-green-400 border border-green-500/20">
                            <CheckCircle2 className="w-3 h-3" /> Published
                          </span>
                        ) : item.publishStatus === "pending_review" ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            Pending Review
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-500/10 text-red-400 border border-red-500/20">
                            Failed
                          </span>
                        )}
                      </td>

                      <td className="p-4">
                        {coverUrl ? (
                          <div className="flex items-center gap-2">
                            <div className="relative w-14 h-10 rounded-lg overflow-hidden border border-cyan-500/30 bg-slate-950 shrink-0 group">
                              <img
                                src={coverUrl}
                                alt={item.title}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                              />
                            </div>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-bold bg-green-500/10 text-green-400 border border-green-500/20">
                              <CheckCircle2 className="w-2.5 h-2.5" /> Ready
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <div className="w-14 h-10 rounded-lg border border-dashed border-amber-500/40 bg-amber-500/5 flex flex-col items-center justify-center shrink-0">
                              <ImageIcon className="w-4 h-4 text-amber-400/70" />
                            </div>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                              Waiting Pic
                            </span>
                          </div>
                        )}
                      </td>

                    <td className="p-4">
                      <div className="font-semibold text-sm line-clamp-1">{item.title}</div>
                      <div className="text-muted-foreground text-[11px] line-clamp-1 mt-0.5">
                        {item.summary}
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="text-cyan-400 font-medium line-clamp-1 flex items-center gap-1">
                        <Layers className="w-3 h-3 shrink-0" />
                        {item.parentBlogTitle}
                      </div>
                      <a
                        href={item.parentBlogUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] text-muted-foreground hover:underline flex items-center gap-1 mt-0.5"
                      >
                        Main Website Link <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </td>

                    <td className="p-4">
                      <span className="px-2 py-1 rounded bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 font-mono font-bold">
                        {item.qualityScore || 8.5}/10 QC
                      </span>
                    </td>

                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openPreviewModal(item)}
                          className="p-1.5 rounded-lg bg-card hover:bg-accent border border-border text-foreground transition-all"
                          title="Preview / Edit"
                        >
                          <Eye className="w-4 h-4 text-cyan-400" />
                        </button>

                        <button
                          onClick={() => handlePublish(item._id, false)}
                          disabled={isPublishing || item.publishStatus === "published"}
                          className={`p-1.5 rounded-lg border transition-all ${
                            item.publishStatus === "published"
                              ? "opacity-50 cursor-not-allowed border-border text-muted-foreground"
                              : "bg-green-500/10 hover:bg-green-500/20 border-green-500/30 text-green-400"
                          }`}
                          title="Publish Live to Google Blogger"
                        >
                          <Send className="w-4 h-4" />
                        </button>

                        {item.bloggerUrl && (
                          <a
                            href={item.bloggerUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-400"
                            title="View Live on Blogger"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}

                        <button
                          onClick={() => handleDelete(item._id)}
                          className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 transition-all"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal 1: Generate Supporting Post */}
      <AnimatePresence>
        {isGenerateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg p-6 rounded-2xl bg-card border border-border shadow-2xl space-y-6"
            >
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div className="flex items-center gap-2 text-cyan-400 font-semibold text-lg">
                  <Sparkles className="w-5 h-5" /> Generate Supporting Article
                </div>
                <button
                  onClick={() => setIsGenerateModalOpen(false)}
                  className="text-muted-foreground hover:text-foreground text-sm"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="block font-medium mb-1 text-foreground">
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl bg-card border border-border shadow-2xl overflow-hidden"
            >
              {/* Modal Top Header */}
              <div className="p-4 border-b border-border flex items-center justify-between bg-muted/30">
                <div>
                  <div className="text-xs text-cyan-400 font-mono">
                    Parent: {selectedPost.parentBlogTitle}
                  </div>
                  <h2 className="text-base font-bold text-foreground mt-0.5">
                    {selectedPost.title}
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSaveEdits}
                    className="px-3 py-1.5 text-xs rounded-lg bg-accent border border-border text-foreground hover:bg-accent/80"
                  >
                    Save Edits
                  </button>

                  <button
                    onClick={() => handlePublish(selectedPost._id, true)}
                    disabled={isPublishing}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 hover:bg-amber-500/30 disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" /> Send Draft to Blogger
                  </button>

                  <button
                    onClick={() => handlePublish(selectedPost._id, false)}
                    disabled={isPublishing || selectedPost.publishStatus === "published"}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30 disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    {selectedPost.publishStatus === "published" ? "Published Live" : "Publish Live"}
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
              <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
                {(() => {
                  const coverUrl =
                    selectedPost.coverImage ||
                    selectedPost.content?.match(/<img[^>]+src=["']([^"']+)["']/i)?.[1] ||
                    selectedPost.parentBlogId?.featuredImage?.url ||
                    selectedPost.parentBlogId?.image ||
                    null;

                  return coverUrl ? (
                    <div className="rounded-xl border border-cyan-500/30 bg-cyan-500/5 p-3 flex items-center gap-4">
                      <div className="relative w-24 h-16 rounded-lg overflow-hidden border border-cyan-500/40 bg-slate-950 shrink-0">
                        <img src={coverUrl} alt="Cover Preview" className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-cyan-300 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-green-400" /> Cover Photo Attached & Ready
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          This featured image is linked and will automatically be included at the top of the Google Blogger post.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-3 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shrink-0">
                        <ImageIcon className="w-5 h-5 text-amber-400" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-amber-300">
                          ⚠️ Cover Photo Missing / Waiting Resolution
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
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
                      Quality Score: {selectedPost.qualityScore}/10 QC
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="text-[10px] text-muted-foreground mb-1">HTML Source Editor</div>
                      <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        rows={16}
                        className="w-full p-3 rounded-lg bg-background border border-border font-mono text-[11px] leading-relaxed text-foreground"
                      />
                    </div>
                    <div>
                      <div className="text-[10px] text-muted-foreground mb-1">Live Render Preview</div>
                      <div
                        className="p-4 rounded-lg bg-background border border-border max-h-[350px] overflow-y-auto prose prose-invert prose-sm text-xs leading-relaxed"
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
